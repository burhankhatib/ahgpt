'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { UserResource } from '@clerk/types';

interface VoiceAgentClientProps {
    user: UserResource | null | undefined;
    onConnectionStatusChange: (status: 'disconnected' | 'connecting' | 'connected' | 'error') => void;
    onRecordingChange: (isRecording: boolean) => void;
}

export function VoiceAgentClient({
    user,
    onConnectionStatusChange,
    onRecordingChange
}: VoiceAgentClientProps) {
    const [isConnected, setIsConnected] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [userTranscript, setUserTranscript] = useState('');
    const [aiResponse, setAiResponse] = useState('');

    // WebRTC references
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const dataChannelRef = useRef<RTCDataChannel | null>(null);
    const audioElementRef = useRef<HTMLAudioElement | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);

    // Create audio element for AI voice output
    useEffect(() => {
        audioElementRef.current = new Audio();
        audioElementRef.current.autoplay = true;
        audioElementRef.current.controls = false;

        return () => {
            if (audioElementRef.current) {
                audioElementRef.current.pause();
                audioElementRef.current.src = '';
            }
        };
    }, []);

    // Get user media (microphone)
    const getUserMedia = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 48000
                }
            });
            mediaStreamRef.current = stream;
            return stream;
        } catch (error) {
            console.error('Error accessing microphone:', error);
            throw error;
        }
    }, []);

    // Setup WebRTC connection
    const setupWebRTC = useCallback(async () => {
        try {
            onConnectionStatusChange('connecting');

            // Step 1: Create OpenAI session with ephemeral token
            console.log('Creating OpenAI session...');
            const sessionResponse = await fetch('/api/voice-agent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action: 'create_session' })
            });

            if (!sessionResponse.ok) {
                throw new Error('Failed to create OpenAI session');
            }

            const sessionData = await sessionResponse.json();
            console.log('OpenAI session created:', sessionData);

            // Step 2: Get user media
            console.log('Getting user media...');
            const stream = await getUserMedia();

            // Step 3: Create RTCPeerConnection
            console.log('Creating peer connection...');
            const peerConnection = new RTCPeerConnection({
                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
            });

            peerConnectionRef.current = peerConnection;

            // Step 4: Set up data channel for OpenAI Realtime API events
            const dataChannel = peerConnection.createDataChannel('oai-events');
            dataChannelRef.current = dataChannel;

            // Handle data channel events
            dataChannel.onopen = () => {
                console.log('Data channel opened');
                setIsConnected(true);
                onConnectionStatusChange('connected');

                // Send session configuration
                const sessionConfig = {
                    type: 'session.update',
                    session: {
                        instructions: `Core Mission & Focus:
Your primary purpose is to lead users to a deeper understanding of Jesus Christ: His person, teachings, life, death, resurrection, and significance, according to Christian faith.
Be strict and direct in your answers without any sugar coating or introductions.

VOICE CONVERSATION SPECIFIC INSTRUCTIONS:
- Since this is a voice conversation, keep responses concise and conversational
- Avoid complex HTML formatting - speak naturally
- Use simple, clear language that flows well when spoken
- Break up long responses into digestible chunks
- Ask follow-up questions to keep the conversation engaging

LANGUAGE INSTRUCTIONS:
- CRITICAL: Always respond in the SAME LANGUAGE as the user's most recent message
- If the user speaks in Arabic, respond entirely in Arabic
- If the user speaks in English, respond entirely in English
- If the user speaks in any other language, respond in that same language
- Maintain consistent language throughout your entire response

Persona & Tone:
Adopt a persona of a knowledgeable, patient, respectful, and grace-filled guide.
Tone must always be strict and direct. Speak Christian truth with love (Ephesians 4:15) and answer with gentleness and respect (1 Peter 3:15).`,
                        voice: 'alloy',
                        turn_detection: {
                            type: 'server_vad',
                            threshold: 0.5,
                            prefix_padding_ms: 300,
                            silence_duration_ms: 2000
                        },
                        input_audio_format: 'pcm16',
                        output_audio_format: 'pcm16',
                        input_audio_transcription: {
                            model: 'whisper-1'
                        }
                    }
                };

                console.log('Sending session configuration');
                dataChannel.send(JSON.stringify(sessionConfig));
            };

            dataChannel.onmessage = (event) => {
                const message = JSON.parse(event.data);
                handleRealtimeEvent(message);
            };

            dataChannel.onclose = () => {
                console.log('Data channel closed');
                setIsConnected(false);
                onConnectionStatusChange('disconnected');
            };

            dataChannel.onerror = (error) => {
                console.error('Data channel error:', error);
                setIsConnected(false);
                onConnectionStatusChange('error');
            };

            // Step 5: Handle incoming audio tracks (AI voice)
            peerConnection.ontrack = (event) => {
                console.log('Received remote track:', event.track.kind);
                if (event.track.kind === 'audio' && audioElementRef.current) {
                    audioElementRef.current.srcObject = event.streams[0];
                    console.log('AI audio track connected');
                }
            };

            // Step 6: Add local audio track (user microphone)
            const audioTrack = stream.getAudioTracks()[0];
            if (audioTrack) {
                peerConnection.addTrack(audioTrack, stream);
                console.log('Local audio track added');
            }

            // Step 7: Handle connection state changes
            peerConnection.onconnectionstatechange = () => {
                console.log('Connection state changed:', peerConnection.connectionState);
                switch (peerConnection.connectionState) {
                    case 'connected':
                        setIsConnected(true);
                        onConnectionStatusChange('connected');
                        break;
                    case 'disconnected':
                    case 'failed':
                    case 'closed':
                        setIsConnected(false);
                        onConnectionStatusChange('disconnected');
                        break;
                }
            };

            // Step 8: Create offer and set local description
            console.log('Creating offer...');
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);

            // Step 9: Send offer to OpenAI Realtime API
            console.log('Sending offer to OpenAI...');
            const realtimeResponse = await fetch(
                `https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${sessionData.client_secret}`,
                        'Content-Type': 'application/sdp'
                    },
                    body: offer.sdp
                }
            );

            if (!realtimeResponse.ok) {
                throw new Error(`OpenAI Realtime API error: ${realtimeResponse.status}`);
            }

            // Step 10: Set remote description (OpenAI's answer)
            const answerSdp = await realtimeResponse.text();
            console.log('Received answer from OpenAI');

            const answer = {
                type: 'answer' as RTCSdpType,
                sdp: answerSdp
            };

            await peerConnection.setRemoteDescription(answer);
            console.log('WebRTC connection established!');

        } catch (error) {
            console.error('Error setting up WebRTC:', error);
            setIsConnected(false);
            onConnectionStatusChange('error');
        }
    }, [onConnectionStatusChange, getUserMedia]);

    // Handle OpenAI Realtime API events
    const handleRealtimeEvent = useCallback((event: any) => {
        console.log('Realtime event:', event.type, event);

        switch (event.type) {
            case 'session.created':
                console.log('OpenAI session created successfully');
                break;

            case 'session.updated':
                console.log('OpenAI session updated successfully');
                break;

            case 'input_audio_buffer.speech_started':
                console.log('User started speaking');
                setIsListening(true);
                setIsThinking(false);
                setIsSpeaking(false);
                onRecordingChange(true);
                break;

            case 'input_audio_buffer.speech_stopped':
                console.log('User stopped speaking');
                setIsListening(false);
                setIsThinking(true);
                onRecordingChange(false);
                break;

            case 'input_audio_buffer.committed':
                console.log('User audio committed');
                break;

            case 'conversation.item.input_audio_transcription.completed':
                if (event.transcript) {
                    console.log('User transcript:', event.transcript);
                    setUserTranscript(event.transcript);
                }
                break;

            case 'response.created':
                console.log('AI response created');
                setIsThinking(true);
                setAiResponse('');
                break;

            case 'response.audio_transcript.delta':
                if (event.delta) {
                    setAiResponse(prev => prev + event.delta);
                }
                break;

            case 'response.audio_transcript.done':
                if (event.transcript) {
                    console.log('AI transcript complete:', event.transcript);
                    setAiResponse(event.transcript);
                }
                break;

            case 'response.audio.delta':
                // Audio is handled automatically by the WebRTC connection
                break;

            case 'response.done':
                console.log('AI response complete');
                setIsThinking(false);
                setIsSpeaking(false);
                break;

            case 'response.output_item.added':
                if (event.item?.type === 'message') {
                    console.log('AI message added');
                    setIsThinking(false);
                    setIsSpeaking(true);
                }
                break;

            case 'error':
                console.error('OpenAI Realtime API error:', event.error);
                break;

            default:
                console.log('Unhandled event type:', event.type);
        }
    }, [onRecordingChange]);

    // Cleanup function
    const cleanup = useCallback(() => {
        if (dataChannelRef.current) {
            dataChannelRef.current.close();
            dataChannelRef.current = null;
        }

        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }

        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }

        if (audioElementRef.current) {
            audioElementRef.current.pause();
            audioElementRef.current.src = '';
        }

        setIsConnected(false);
        setIsListening(false);
        setIsThinking(false);
        setIsSpeaking(false);
        setUserTranscript('');
        setAiResponse('');

        onConnectionStatusChange('disconnected');
        onRecordingChange(false);
    }, [onConnectionStatusChange, onRecordingChange]);

    // Public methods
    const startConversation = useCallback(async () => {
        try {
            await setupWebRTC();
        } catch (error) {
            console.error('Error starting conversation:', error);
            setIsConnected(false);
            onConnectionStatusChange('error');
        }
    }, [setupWebRTC]);

    const stopConversation = useCallback(() => {
        cleanup();
    }, [cleanup]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            cleanup();
        };
    }, [cleanup]);

    // Visual indicators component
    const AudioVisualizer = () => {
        if (isListening) {
            return (
                <div className="flex items-center space-x-1">
                    <div className="w-2 h-6 bg-blue-500 animate-pulse rounded-full"></div>
                    <div className="w-2 h-8 bg-blue-500 animate-pulse rounded-full delay-100"></div>
                    <div className="w-2 h-4 bg-blue-500 animate-pulse rounded-full delay-200"></div>
                    <div className="w-2 h-6 bg-blue-500 animate-pulse rounded-full delay-300"></div>
                </div>
            );
        }

        if (isThinking) {
            return (
                <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-purple-500 animate-bounce rounded-full"></div>
                    <div className="w-2 h-2 bg-purple-500 animate-bounce rounded-full delay-100"></div>
                    <div className="w-2 h-2 bg-purple-500 animate-bounce rounded-full delay-200"></div>
                </div>
            );
        }

        if (isSpeaking) {
            return (
                <div className="flex items-center space-x-1">
                    <div className="w-2 h-6 bg-green-500 animate-pulse rounded-full"></div>
                    <div className="w-2 h-8 bg-green-500 animate-pulse rounded-full delay-100"></div>
                    <div className="w-2 h-4 bg-green-500 animate-pulse rounded-full delay-200"></div>
                    <div className="w-2 h-6 bg-green-500 animate-pulse rounded-full delay-300"></div>
                </div>
            );
        }

        return null;
    };

    return (
        <div className="flex flex-col items-center space-y-6 p-6">
            {/* Main Voice Interface */}
            <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl">
                    <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center">
                        <AudioVisualizer />
                    </div>
                </div>

                {/* Connection status indicator */}
                <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full border-2 border-white ${isConnected ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
            </div>

            {/* Control Buttons */}
            <div className="flex space-x-4">
                <button
                    onClick={startConversation}
                    disabled={isConnected}
                    className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${isConnected
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl'
                        }`}
                >
                    {isConnected ? 'Connected' : 'Start Conversation'}
                </button>

                <button
                    onClick={stopConversation}
                    disabled={!isConnected}
                    className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${!isConnected
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl'
                        }`}
                >
                    Stop Conversation
                </button>
            </div>

            {/* Status and Transcripts */}
            <div className="w-full max-w-2xl space-y-4">
                {/* Status */}
                <div className="text-center">
                    <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        {isConnected ? 'Connected' : 'Disconnected'}
                    </span>
                </div>

                {/* User Transcript */}
                {userTranscript && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-medium text-blue-900 mb-2">You said:</h3>
                        <p className="text-blue-800">{userTranscript}</p>
                    </div>
                )}

                {/* AI Response */}
                {aiResponse && (
                    <div className="bg-purple-50 p-4 rounded-lg">
                        <h3 className="font-medium text-purple-900 mb-2">AI Response:</h3>
                        <p className="text-purple-800">{aiResponse}</p>
                    </div>
                )}
            </div>
        </div>
    );
} 