'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { VoiceAgentClient } from '@/components/VoiceAgentClient';

export default function VoiceAgentPage() {
    const { user } = useUser();
    const [isConnected, setIsConnected] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Al Hayat Voice Agent
                    </h1>
                    <p className="text-lg text-gray-600">
                        Have a real-time conversation with the AI using your voice
                    </p>
                </div>

                {/* Connection Status */}
                <div className="mb-6">
                    <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${connectionStatus === 'connected'
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : connectionStatus === 'connecting'
                                ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                : connectionStatus === 'error'
                                    ? 'bg-red-100 text-red-800 border border-red-200'
                                    : 'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${connectionStatus === 'connected'
                                ? 'bg-green-500'
                                : connectionStatus === 'connecting'
                                    ? 'bg-yellow-500 animate-pulse'
                                    : connectionStatus === 'error'
                                        ? 'bg-red-500'
                                        : 'bg-gray-500'
                            }`}></div>
                        {connectionStatus === 'connected' && 'Connected'}
                        {connectionStatus === 'connecting' && 'Connecting...'}
                        {connectionStatus === 'error' && 'Connection Error'}
                        {connectionStatus === 'disconnected' && 'Disconnected'}
                    </div>
                </div>

                {/* Voice Agent Client */}
                <VoiceAgentClient
                    user={user}
                    onConnectionStatusChange={setConnectionStatus}
                    onRecordingChange={setIsRecording}
                />

                {/* Recording Status */}
                {isRecording && (
                    <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full shadow-lg animate-pulse">
                        <div className="flex items-center">
                            <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
                            Recording...
                        </div>
                    </div>
                )}

                {/* Instructions */}
                <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">How to use the Voice Agent</h3>
                    <div className="space-y-2 text-gray-600">
                        <p>• Click &quot;Start Conversation&quot; to begin</p>
                        <p>• Speak clearly into your microphone</p>
                        <p>• The AI will respond with voice and text</p>
                        <p>• You can interrupt the AI at any time by speaking</p>
                        <p>• Click &quot;End Conversation&quot; when finished</p>
                    </div>
                </div>
            </div>
        </div>
    );
} 