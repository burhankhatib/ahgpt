"use client";
import { useRef, useEffect, useState } from "react";
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { ExclamationTriangleIcon, InformationCircleIcon, DocumentDuplicateIcon, CheckIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { ClerkProvider, useUser } from '@clerk/nextjs';
import { trackChatEvent } from '@/utils/analytics';
import { useChat as useChatContext } from '@/contexts/ChatContext';
import { ChatProvider } from '@/contexts/ChatContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { Message } from '@/types/chat';
import { isSanityPermissionError } from '@/utils/sanity-permissions';
import { Button } from "@/components/ui/button";
import { redirectToProperDomain, isValidDomain, getApiEndpoint, getClerkConfig } from '@/utils/domain-config';
import { useUserLocation } from '@/hooks/useUserLocation';
import { detectUserLocation, VisitorApiData, getCountryFlag } from '@/utils/visitorApiDetection';
import Link from "next/link";
import { useChat, Message as VercelMessage } from 'ai/react';

// Removed broken streaming component - using simple HTML rendering instead

// Widget-specific message types
interface WidgetMessage {
    type: 'WIDGET_READY' | 'USER_SIGNED_IN' | 'USER_SIGNED_OUT' | 'RESIZE' | 'ERROR' | 'UPDATE_CONFIG';
    payload?: Record<string, unknown>;
}

function formatTime(date: Date | string) {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Multilingual Welcome Animation Component
function MultilingualWelcome() {
    const welcomeTexts = [
        { text: "Welcome! أهلاً وسهلاً!", lang: 'mixed' },
        { text: "Peace be with you!", lang: 'en' },
        { text: "السلام عليكم", lang: 'ar' },
        { text: "Blessings to you!", lang: 'en' },
        { text: "نعمة وسلام", lang: 'ar' },
        { text: "Grace and Peace!", lang: 'en' },
        { text: "بركة ونعمة", lang: 'ar' },
        { text: "Shalom!", lang: 'he' },
        { text: "Pax vobiscum", lang: 'la' }
    ];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsVisible(false);
            setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % welcomeTexts.length);
                setIsVisible(true);
            }, 300);
        }, 2500);

        return () => clearInterval(interval);
    }, [welcomeTexts.length]);

    const currentWord = welcomeTexts[currentIndex];

    return (
        <div className="text-center">
            <div className="min-h-[2rem] flex items-center justify-center">
                <h1
                    className={`text-lg font-semibold text-blue-600 transition-all duration-300 ${isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-2'
                        } ${currentWord.lang === 'ar' ? 'font-arabic' : ''}`}
                    dir={currentWord.lang === 'ar' ? 'rtl' : 'ltr'}
                >
                    {currentWord.text}
                </h1>
            </div>
        </div>
    );
}

// All authentication functionality removed - widgets operate in guest-only mode

// Global singleton guard to prevent multiple widget instances across the entire page
let globalWidgetInstance: string | null = null;
let globalWidgetInitialized = false;

// Prevent widget nesting inside iframes
const isEmbeddedWidget = typeof window !== 'undefined' && window.parent !== window;

function WidgetChatPage({ user }: { user?: ReturnType<typeof useUser>['user'] }) {
    // Prevent infinite nesting if widget is loaded inside another widget
    const [isNested, setIsNested] = useState(false);

    // Unique instance ID for this widget
    const instanceId = useRef<string>(`widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    const isActiveInstance = useRef<boolean>(false);

    // Component mounting guard to prevent multiple instances
    const [isMounted, setIsMounted] = useState(false);
    const [isWidgetReady, setIsWidgetReady] = useState(false);

    const { currentChat, addConversationTurn, createNewChat } = useChatContext();
    const { getFontClass, isRTL, getPlaceholderText, detectInputLanguageChange, autoDetect, checkLanguageSwitch } = useLanguage();
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [streamingMessage, setStreamingMessage] = useState("");
    const [displayMessages, setDisplayMessages] = useState<Message[]>([]);
    const [hasPermissionIssue, setHasPermissionIssue] = useState(false);
    const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
    const [parentOrigin, setParentOrigin] = useState<string>('*');
    const [widgetConfig, setWidgetConfig] = useState({
        theme: 'auto',
        allowGuests: true
    });
    const [isGuestMode, setIsGuestMode] = useState(true); // Always guest mode for external widgets

    // Check for infinite nesting - prevent widget from loading inside itself
    useEffect(() => {
        const checkNesting = () => {
            if (typeof window === 'undefined') return false;

            try {
                // Check if we're in an iframe that contains a widget
                let currentWindow: Window = window;
                let depth = 0;
                const maxDepth = 5; // Prevent infinite loops

                while (currentWindow !== currentWindow.parent && depth < maxDepth) {
                    currentWindow = currentWindow.parent as Window;
                    depth++;

                    // Check if parent window has Al Hayat GPT widget elements
                    try {
                        const hasWidget = currentWindow.document.querySelector('[id*="chat-widget"], [id*="ahgpt-widget"], iframe[src*="widget/chat"]');
                        if (hasWidget) {
                            console.warn('[Widget] Detected widget nesting - preventing infinite loop');
                            return true;
                        }
                    } catch (e) {
                        // Cross-origin access blocked - this is normal for embedded widgets
                        break;
                    }
                }

                return false;
            } catch (error) {
                console.warn('[Widget] Error checking for nesting:', error);
                return false;
            }
        };

        if (checkNesting()) {
            setIsNested(true);
            return;
        }

        // Global singleton mounting guard - ensures only ONE widget exists across the entire page
        // Check if another widget instance is already active
        if (globalWidgetInitialized && globalWidgetInstance && globalWidgetInstance !== instanceId.current) {
            console.log(`[Widget ${instanceId.current}] Another widget instance is already active (${globalWidgetInstance}). Preventing duplicate.`);
            return; // Don't mount this instance
        }

        // Claim this instance as the active one
        if (!globalWidgetInitialized) {
            globalWidgetInstance = instanceId.current;
            globalWidgetInitialized = true;
            isActiveInstance.current = true;

            console.log(`[Widget ${instanceId.current}] Claimed as the active widget instance.`);

            setIsMounted(true);
            setIsWidgetReady(true);
        }

        return () => {
            // Only cleanup if this was the active instance
            if (isActiveInstance.current && globalWidgetInstance === instanceId.current) {
                globalWidgetInstance = null;
                globalWidgetInitialized = false;
                isActiveInstance.current = false;
                console.log(`[Widget ${instanceId.current}] Released as the active widget instance.`);
            }
            setIsMounted(false);
            setIsWidgetReady(false);
        };
    }, []); // No dependencies - run only once

    // Location detection for SDK
    const { location, isLoading: locationLoading } = useUserLocation();
    const [userLocationDetected, setUserLocationDetected] = useState(false);

    const chatRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Always use guest info for external widgets
    // Use source website as lastName for tracking
    const urlParams = new URLSearchParams(window.location.search);
    const sourceWebsite = urlParams.get('source') || 'unknown-source';
    const firstName = 'Guest';
    const lastName = sourceWebsite; // Track source website
    const fullNameInitials = 'G';
    const email = '';

    // Detect and store user location using HTML5 Geolocation API (Widget)
    useEffect(() => {
        const detectAndStoreUserLocation = async () => {
            if (userLocationDetected) return;

            // For external widget users, always use session-based guest ID
            const userKey = `guest_${Date.now()}`;
            const existingLocation = localStorage.getItem(`userLocation_${userKey}`);

            // Only detect if we don't have recent VisitorAPI data (or it's older than 24 hours)
            // Force re-detection for old data that wasn't from VisitorAPI
            let shouldDetect = true;
            if (existingLocation) {
                try {
                    const parsed = JSON.parse(existingLocation);
                    const detectedAt = new Date(parsed.detectedAt);
                    const now = new Date();
                    const hoursSinceDetection = (now.getTime() - detectedAt.getTime()) / (1000 * 60 * 60);

                    // Only skip if we have recent VisitorAPI data (not old detection methods)
                    if (hoursSinceDetection < 24 &&
                        parsed.country !== 'Unknown' &&
                        parsed.detectionMethod === 'visitorapi') {
                        shouldDetect = false;
                        setUserLocationDetected(true);
                        console.log(`📋 [Widget] User ${userKey} has recent VisitorAPI data:`, parsed);
                    } else {
                        // Clear old non-VisitorAPI data to force new detection
                        localStorage.removeItem(`userLocation_${userKey}`);
                        console.log(`🔄 [Widget] Clearing old location data for user ${userKey} to force VisitorAPI detection`);
                    }
                } catch (error) {
                    console.error('[Widget] Error parsing existing location data:', error);
                    localStorage.removeItem(`userLocation_${userKey}`);
                }
            }

            if (shouldDetect) {
                try {
                    console.log(`🌍 [Widget] Detecting location with VisitorAPI for user ${userKey}...`);

                    // VisitorAPI doesn't require user permission - works with IP address
                    const locationData: VisitorApiData | null = await detectUserLocation();

                    if (locationData && locationData.country !== 'Unknown') {
                        const locationToStore = {
                            ...locationData,
                            detectedAt: new Date().toISOString(),
                            userKey: userKey,
                            source: 'widget'
                        };

                        localStorage.setItem(`userLocation_${userKey}`, JSON.stringify(locationToStore));
                        console.log(`✅ [Widget] VisitorAPI location stored for user ${userKey}:`, locationData);
                        setUserLocationDetected(true);

                        // Also notify parent frame about user location if in widget mode
                        if (window.parent && window.parent !== window) {
                            try {
                                window.parent.postMessage({
                                    type: 'USER_LOCATION_DETECTED',
                                    payload: {
                                        userKey,
                                        location: locationData
                                    }
                                }, parentOrigin);
                            } catch (error) {
                                console.log('Could not notify parent about location:', error);
                            }
                        }
                    } else {
                        console.log(`❌ [Widget] Could not detect location for user ${userKey}`);
                        setUserLocationDetected(true);
                    }
                } catch (error) {
                    console.error(`🚨 [Widget] Error detecting location for user ${userKey}:`, error);
                    setUserLocationDetected(true);
                }
            }
        };

        // Delay the location request slightly so the widget loads first
        const timer = setTimeout(detectAndStoreUserLocation, 1000);
        return () => clearTimeout(timer);
    }, [userLocationDetected, parentOrigin]);

    // Consolidated widget initialization - SINGLE useEffect to prevent multiple mounting
    useEffect(() => {
        // Only run if this is the active instance and properly mounted
        if (!isMounted || !isWidgetReady || !isActiveInstance.current) {
            return;
        }

        // Additional check to ensure we're still the active instance
        if (globalWidgetInstance !== instanceId.current) {
            console.log(`[Widget ${instanceId.current}] No longer the active instance. Skipping initialization.`);
            return;
        }

        // Prevent multiple initialization attempts
        let isInitialized = false;

        const initializeWidget = () => {
            if (isInitialized) return;
            isInitialized = true;

            // Check domain validity and redirect if necessary
            if (!isValidDomain()) {
                redirectToProperDomain();
                return;
            }

            // Get configuration from URL parameters
            const urlParams = new URLSearchParams(window.location.search);
            const theme = urlParams.get('theme') || 'auto';
            const allowGuests = urlParams.get('allowGuests') !== 'false';
            const origin = urlParams.get('parentOrigin');

            if (origin) {
                setParentOrigin(origin);
            }

            setWidgetConfig({ theme, allowGuests });

            // Send messages to parent
            const sendMessage = (message: WidgetMessage) => {
                if (window.parent && window.parent !== window) {
                    window.parent.postMessage(message, origin || '*');
                }
            };

            // Send ready message
            sendMessage({ type: 'WIDGET_READY' });

            // Always operate in guest mode for external widgets
            sendMessage({ type: 'USER_SIGNED_OUT' });
            setIsGuestMode(true);

            // Listen for messages from parent (only once)
            const handleMessage = (event: MessageEvent) => {
                if (origin && event.origin !== origin) {
                    return; // Security check
                }

                const message: WidgetMessage = event.data;

                switch (message.type) {
                    case 'UPDATE_CONFIG':
                        if (message.payload) {
                            setWidgetConfig(prev => ({ ...prev, ...message.payload }));
                        }
                        break;
                }
            };

            window.addEventListener('message', handleMessage);

            // Return cleanup function
            return () => {
                window.removeEventListener('message', handleMessage);
            };
        };

        const cleanup = initializeWidget();

        return cleanup;
    }, [isMounted, isWidgetReady]); // Only depend on mounting and ready state

    // Height-related effects removed as requested

    // Rest of the chat functionality (similar to main chat page but simplified)
    const AVATARS = {
        user: (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium shadow-lg">
                <span className="text-xs">{fullNameInitials}</span>
            </div>
        ),
        ai: (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-700 font-medium shadow-lg border border-gray-200">
                <span className="text-xs">AI</span>
            </div>
        ),
    };

    // Create a new chat if none exists
    useEffect(() => {
        if (!currentChat) {
            createNewChat();
        }
    }, [currentChat, createNewChat]);

    // Load messages when currentChat changes
    useEffect(() => {
        if (currentChat) {
            const messagesWithDates = currentChat.messages.map((msg, index) => ({
                ...msg,
                timestamp: typeof msg.timestamp === 'string' ? new Date(msg.timestamp) : msg.timestamp,
                uniqueKey: msg.uniqueKey || `msg_${currentChat._id}_${index}`,
            }));

            setDisplayMessages(messagesWithDates);
            setStreamingMessage("");
            setIsLoading(false);
        } else {
            setDisplayMessages([]);
            setStreamingMessage("");
            setIsLoading(false);
        }
    }, [currentChat?._id]);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [displayMessages, streamingMessage, isLoading]);

    // Add click handlers for suggested questions
    useEffect(() => {
        if (!chatRef.current) return;

        const handleQuestionClick = async (event: Event) => {
            const target = event.target as HTMLElement;

            // Check if clicked element is a question button
            if (target.tagName === 'A' && target.getAttribute('data-question') === 'true') {
                event.preventDefault();
                const questionText = target.textContent?.trim();

                if (questionText && !isLoading) {
                    // Track the click event
                    trackChatEvent('CLICK', `Suggested Question: ${questionText.substring(0, 50)}...`);

                    // Create user message
                    const userMessage: Message = {
                        role: 'user',
                        content: questionText,
                        timestamp: new Date(),
                        uniqueKey: `msg_user_question_${Date.now()}`,
                        firstName,
                        lastName,
                        email,
                    };

                    // Clear input and start loading
                    setInput("");
                    setIsLoading(true);
                    setStreamingMessage("");

                    // Add user message to display
                    setDisplayMessages(prev => [...prev, userMessage]);

                    // Submit the question automatically
                    try {
                        const response = await fetch('/api/chat', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                messages: [...(currentChat?.messages || []), userMessage].map(msg => ({
                                    role: msg.role,
                                    content: msg.content,
                                    firstName: msg.firstName || firstName,
                                    lastName: msg.lastName || lastName,
                                    email: msg.email || email,
                                })),
                                isWidget: true,
                                isGuest: isGuestMode
                            }),
                        });

                        if (!response.ok) {
                            throw new Error('Failed to get AI response');
                        }

                        const reader = response.body?.getReader();
                        if (!reader) {
                            throw new Error('No response body');
                        }

                        let aiResponseContent = "";
                        const decoder = new TextDecoder();

                        while (true) {
                            const { done, value } = await reader.read();
                            if (done) break;

                            const chunk = decoder.decode(value, { stream: true });
                            const lines = chunk.split('\n');

                            for (const line of lines) {
                                // Handle AI SDK streaming format: 0:"content"
                                if (line.startsWith('0:"')) {
                                    try {
                                        // Extract content from 0:"content" format
                                        const content = JSON.parse(line.slice(2));
                                        if (typeof content === 'string') {
                                            aiResponseContent += content;
                                            setStreamingMessage(aiResponseContent);
                                        }
                                    } catch (e) {
                                        // If JSON parsing fails, try to extract content manually
                                        const match = line.match(/^0:"(.+)"$/);
                                        if (match) {
                                            const content = match[1].replace(/\\"/g, '"').replace(/\\n/g, '\n');
                                            aiResponseContent += content;
                                            setStreamingMessage(aiResponseContent);
                                        }
                                    }
                                }
                                // Also handle standard SSE format as fallback
                                else if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                                    try {
                                        const data = JSON.parse(line.slice(6));
                                        if (data.content) {
                                            aiResponseContent += data.content;
                                            setStreamingMessage(aiResponseContent);
                                        }
                                    } catch (e) {
                                        console.error('Error parsing SSE data:', e);
                                    }
                                }
                            }
                        }

                        const aiMessage: Message = {
                            role: 'assistant',
                            content: aiResponseContent,
                            timestamp: new Date(),
                            uniqueKey: `msg_ai_question_${Date.now()}`
                        };

                        setDisplayMessages(prev => [...prev, aiMessage]);
                        setStreamingMessage("");

                        // Save conversation to Sanity for tracking purposes
                        try {
                            await addConversationTurn(userMessage, aiMessage);
                        } catch (error) {
                            console.error('Error saving conversation turn:', error);
                            if (isSanityPermissionError(error)) {
                                setHasPermissionIssue(true);
                            }
                        }

                        trackChatEvent('RECEIVE_MESSAGE', `Widget suggested question response length: ${aiResponseContent.length}`);

                    } catch (error) {
                        console.error('Error in suggested question submission:', error);

                        const errorMessage: Message = {
                            role: 'assistant',
                            content: 'Sorry, I encountered an error. Please try again. If you are an Admin then please contact alhayatgpt.com to white-list your domain.',
                            timestamp: new Date(),
                            uniqueKey: `msg_error_question_${Date.now()}`
                        };

                        setDisplayMessages(prev => [...prev, errorMessage]);

                        // Send error to parent
                        if (window.parent && window.parent !== window) {
                            window.parent.postMessage({
                                type: 'ERROR',
                                payload: { message: 'Chat error occurred' }
                            }, parentOrigin);
                        }
                    } finally {
                        setIsLoading(false);
                        setStreamingMessage("");
                    }
                }
            }
        };

        // Add event listener to chat container for event delegation
        chatRef.current.addEventListener('click', handleQuestionClick);

        return () => {
            if (chatRef.current) {
                chatRef.current.removeEventListener('click', handleQuestionClick);
            }
        };
    }, [displayMessages, isLoading, firstName, lastName, email, currentChat, isGuestMode, parentOrigin, addConversationTurn]); // Re-run when messages change to ensure new questions get handlers

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            role: 'user',
            content: input.trim(),
            timestamp: new Date(),
            uniqueKey: `msg_user_${Date.now()}`,
            firstName,
            lastName,
            email,
        };

        const currentInput = input.trim();
        setInput("");
        setIsLoading(true);
        setStreamingMessage("");

        setDisplayMessages(prev => [...prev, userMessage]);

        trackChatEvent('SEND_MESSAGE', `Widget message length: ${currentInput.length}`);

        // Notify parent SDK about message being sent
        if (window.parent && window.parent !== window) {
            try {
                window.parent.postMessage({
                    type: 'MESSAGE_SENT',
                    payload: {
                        content: currentInput,
                        source: sourceWebsite
                    }
                }, parentOrigin);
            } catch (error) {
                console.log('Could not notify parent about message sent:', error);
            }
        }

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [...(currentChat?.messages || []), userMessage].map(msg => ({
                        role: msg.role,
                        content: msg.content,
                        firstName: msg.firstName || firstName,
                        lastName: msg.lastName || lastName,
                        email: msg.email || email,
                    })),
                    isWidget: true,
                    isGuest: isGuestMode,
                    parentOrigin: parentOrigin !== '*' ? parentOrigin : undefined,
                    userLocation: location ? {
                        country: location.country,
                        countryCode: location.countryCode,
                        city: location.city,
                        region: location.region,
                        detectionMethod: location.detectionMethod,
                        confidence: location.confidence
                    } : undefined
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to get AI response');
            }

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error('No response body');
            }

            let aiResponseContent = "";
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    // Handle AI SDK streaming format: 0:"content"
                    if (line.startsWith('0:"')) {
                        try {
                            // Extract content from 0:"content" format
                            const content = JSON.parse(line.slice(2));
                            if (typeof content === 'string') {
                                aiResponseContent += content;
                                setStreamingMessage(aiResponseContent);
                            }
                        } catch (e) {
                            // If JSON parsing fails, try to extract content manually
                            const match = line.match(/^0:"(.+)"$/);
                            if (match) {
                                const content = match[1].replace(/\\"/g, '"').replace(/\\n/g, '\n');
                                aiResponseContent += content;
                                setStreamingMessage(aiResponseContent);
                            }
                        }
                    }
                    // Also handle standard SSE format as fallback
                    else if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                        try {
                            const data = JSON.parse(line.slice(6));
                            if (data.content) {
                                aiResponseContent += data.content;
                                setStreamingMessage(aiResponseContent);
                            }
                        } catch (e) {
                            console.error('Error parsing SSE data:', e);
                        }
                    }
                }
            }

            const aiMessage: Message = {
                role: 'assistant',
                content: aiResponseContent,
                timestamp: new Date(),
                uniqueKey: `msg_ai_${Date.now()}`
            };

            setDisplayMessages(prev => [...prev, aiMessage]);
            setStreamingMessage("");

            // Always save conversation to Sanity for tracking purposes
            try {
                await addConversationTurn(userMessage, aiMessage);
            } catch (error) {
                console.error('Error saving conversation turn:', error);
                if (isSanityPermissionError(error)) {
                    setHasPermissionIssue(true);
                }
                // Continue even if saving fails - don't block the user experience
            }

            trackChatEvent('RECEIVE_MESSAGE', `Widget response length: ${aiResponseContent.length}`);

        } catch (error) {
            console.error('Error in widget chat:', error);

            const errorMessage: Message = {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again. If you are an Admin then please contact alhayatgpt.com to white-list your domain.',
                timestamp: new Date(),
                uniqueKey: `msg_error_${Date.now()}`
            };

            setDisplayMessages(prev => [...prev, errorMessage]);

            // Send error to parent
            if (window.parent && window.parent !== window) {
                window.parent.postMessage({
                    type: 'ERROR',
                    payload: { message: 'Chat error occurred' }
                }, parentOrigin);
            }
        } finally {
            setIsLoading(false);
            setStreamingMessage("");
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInput(newValue);

        if (autoDetect && newValue.trim().length > 8) {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }

            debounceTimeoutRef.current = setTimeout(() => {
                const recentMessages = displayMessages.slice(-3).map(msg => ({
                    content: msg.content,
                    role: msg.role
                }));

                // Detect language and notify parent
                detectInputLanguageChange(newValue, recentMessages);

                // Check for language switch to notify parent SDK
                const languageSwitchResult = checkLanguageSwitch(newValue, recentMessages);
                if (languageSwitchResult.shouldSwitch && window.parent && window.parent !== window) {
                    try {
                        window.parent.postMessage({
                            type: 'LANGUAGE_DETECTED',
                            payload: {
                                language: languageSwitchResult.newLanguage || 'en',
                                direction: isRTL ? 'rtl' : 'ltr',
                                confidence: languageSwitchResult.confidence
                            }
                        }, parentOrigin);
                    } catch (error) {
                        console.log('Could not notify parent about language detection:', error);
                    }
                }
            }, 800);
        }
    };

    const copyMessage = async (messageContent: string, messageId: string) => {
        try {
            const textContent = messageContent.replace(/<[^>]*>/g, '');
            await navigator.clipboard.writeText(textContent);
            setCopiedMessageId(messageId);

            setTimeout(() => {
                setCopiedMessageId(null);
            }, 2000);

            trackChatEvent('SEND_MESSAGE', `Widget copy - length: ${textContent.length}`);
        } catch (error) {
            console.error('Failed to copy message:', error);
        }
    };

    const allMessages = [...displayMessages];
    if (streamingMessage) {
        allMessages.push({
            role: 'assistant',
            content: streamingMessage,
            timestamp: new Date(),
            uniqueKey: `msg_streaming_${Date.now()}`
        });
    }

    // Always remain in guest mode for external widgets
    useEffect(() => {
        setIsGuestMode(true);
    }, []);

    // Handle nested widget detection
    if (isNested) {
        return (
            <div className="flex items-center justify-center h-96 p-6">
                <div className="text-center max-w-sm">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">⚠️</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Widget Nesting Detected</h3>
                    <p className="text-sm text-gray-600 mb-4">
                        This widget is already embedded on this page. Multiple instances have been prevented to avoid conflicts.
                    </p>
                    <p className="text-xs text-gray-500">
                        If you need help with widget integration, contact support at alhayatgpt.com
                    </p>
                </div>
            </div>
        );
    }

    // Don't render until component is properly mounted AND this is the active instance
    if (!isMounted || !isWidgetReady || !isActiveInstance.current) {
        return <div className="flex items-center justify-center h-96">Loading...</div>;
    }

    // Final check to ensure we're still the active instance
    if (globalWidgetInstance !== instanceId.current) {
        return null; // Don't render anything if another instance is active
    }

    // Show full chat interface for both authenticated and guest users
    return (
        <div className="flex flex-col bg-gray-50 widget-chat-container" style={{ minHeight: '100vh', position: 'relative' }}>
            {/* Authentication Status Banner - Completely hidden for widget users */}

            {/* Permission Issues Banner */}
            {hasPermissionIssue && (
                <div className="mx-2 mt-2">
                    <div className="bg-white/80 backdrop-blur-sm border border-amber-200 rounded-xl p-3 shadow-sm">
                        <div className="flex items-start gap-2">
                            <ExclamationTriangleIcon className="h-4 w-4 text-amber-500 mt-0.5" />
                            <div>
                                <p className="text-xs font-medium text-amber-800">Limited Functionality</p>
                                <p className="text-xs text-amber-700">Conversation won&apos;t be saved due to permissions.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Chat Messages Container */}
            <div
                ref={chatRef}
                className="flex-1 px-3 md:px-6 lg:px-8 py-4 space-y-4 widget-messages-container"
            >
                {allMessages.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 max-w-sm md:max-w-md lg:max-w-lg text-center">
                            <div className="w-fit px-3 py-1 bg-gradient-to-br from-blue-500 to-purple-600 hover:from-purple-600 hover:to-blue-500 hover:shadow-md transition-all duration-200 hover:scale-105 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                <Link href={`https://alhayatgpt.com`} target="_blank">
                                    <span className="text-white text-lg font-bold">Al Hayat GPT</span>
                                </Link>
                            </div>
                            <div className="mb-4">
                                <MultilingualWelcome />
                            </div>
                            <h2 className="text-sm font-semibold text-gray-800 mb-2">
                                Advanced Christian AI chatbot for theological discussions.
                            </h2>
                            <p className="text-xs text-gray-600 leading-relaxed">
                                Start a conversation by typing your message below.
                            </p>
                        </div>
                    </div>
                )}

                {allMessages.map((m, index) => {
                    const timestamp = formatTime(m.timestamp);
                    const isStreamingThisMessage = m.uniqueKey?.includes('streaming') && streamingMessage && m.role === 'assistant';

                    return (
                        <div
                            key={m.uniqueKey || `fallback_${m.role}_${m.timestamp.getTime()}`}
                            className={`widget-message flex items-start gap-3 ${m.role === "user"
                                ? isRTL ? "justify-start" : "justify-end"
                                : isRTL ? "justify-end" : "justify-start"
                                }`}
                        >
                            {m.role === "assistant" && !isRTL && AVATARS.ai}

                            <div
                                className={`${m.role === "user" ? "max-w-xs md:max-w-md lg:max-w-lg chat-bubble-user" : "max-w-sm md:max-w-4xl lg:max-w-6xl chat-bubble-assistant"} ${m.role === "user"
                                    ? "text-white"
                                    : "text-gray-800"
                                    } rounded-2xl px-4 py-3 transition-all duration-300 widget-message-hover`}
                            >
                                <div className={`flex items-center gap-2 mb-1 ${isRTL ? 'justify-end' : 'justify-start'}`}>
                                    <span className={`text-xs font-medium ${m.role === "user" ? "text-blue-100" : "text-gray-500"}`}>
                                        {m.role === "user" ? "Guest" : "Assistant"}
                                    </span>
                                    {m.role === "user" && location && location.country !== 'Unknown' && location.countryCode && (
                                        <span className="text-xs" title={`From ${location.country}`}>
                                            {getCountryFlag(location.countryCode)}
                                        </span>
                                    )}
                                    <span className={`text-xs ${m.role === "user" ? "text-blue-200" : "text-gray-400"}`}>
                                        {timestamp}
                                    </span>
                                    {m.role === "assistant" && m.content && !isStreamingThisMessage && (
                                        <button
                                            onClick={() => copyMessage(m.content, m.uniqueKey || `msg_${m.timestamp.getTime()}`)}
                                            className={`${isRTL ? 'mr-auto' : 'ml-auto'} p-1 rounded-lg hover:bg-gray-100 transition-all duration-200`}
                                            title="Copy message"
                                        >
                                            {copiedMessageId === (m.uniqueKey || `msg_${m.timestamp.getTime()}`) ? (
                                                <CheckIcon className="w-3 h-3 text-green-500" />
                                            ) : (
                                                <DocumentDuplicateIcon className="w-3 h-3 text-gray-400" />
                                            )}
                                        </button>
                                    )}
                                </div>

                                <div className={`text-sm ${getFontClass()}`}>
                                    {m.role === "assistant" ? (
                                        <div>
                                            {m.content ? (
                                                <div
                                                    className="assistant-content prose prose-sm max-w-none prose-headings:font-semibold prose-headings:text-gray-800 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800 prose-strong:text-gray-800 prose-em:text-gray-700 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-gray-800 prose-pre:bg-gray-100 prose-pre:p-3 prose-pre:rounded-lg prose-ul:list-disc prose-ol:list-decimal prose-li:text-gray-700 prose-blockquote:border-l-4 prose-blockquote:border-blue-200 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600 prose-table:border-collapse prose-table:table-auto prose-table:w-full prose-table:text-sm prose-thead:bg-gray-50 prose-th:border prose-th:border-gray-300 prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:font-semibold prose-th:text-gray-900 prose-tbody:divide-y prose-tbody:divide-gray-200 prose-tr:border-b prose-tr:border-gray-200 prose-td:border prose-td:border-gray-300 prose-td:px-4 prose-td:py-2 prose-td:text-gray-700 prose-tr:hover:bg-gray-50"
                                                    dangerouslySetInnerHTML={{ __html: m.content }}
                                                />
                                            ) : (
                                                <div className="text-gray-500 italic">No response received</div>
                                            )}
                                            {isStreamingThisMessage && (
                                                <span className={`inline-block w-1 h-4 bg-blue-500 rounded-sm animate-pulse ${isRTL ? 'mr-1' : 'ml-1'}`}></span>
                                            )}
                                        </div>
                                    ) : (
                                        <div className={`whitespace-pre-line break-words ${getFontClass()}`}>
                                            {m.content}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Link href={`https://alhayatgpt.com`} target="_blank" className="flex items-center gap-2">
                                {m.role === "user" && !isRTL && AVATARS.user}
                                {m.role === "assistant" && isRTL && AVATARS.ai}
                                {m.role === "user" && isRTL && AVATARS.user}
                            </Link>

                        </div>
                    );
                })}

                {isLoading && !streamingMessage && (
                    <div className={`widget-message flex items-start gap-3 ${isRTL ? 'justify-end' : 'justify-start'}`}>
                        {!isRTL && AVATARS.ai}
                        <div className="chat-bubble-assistant rounded-2xl px-4 py-3 flex items-center gap-2">
                            <div className="widget-typing">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                            <span className="text-xs text-gray-500">Thinking...</span>
                        </div>
                        {isRTL && AVATARS.ai}
                    </div>
                )}
            </div>

            {/* Input Form */}
            <div className="widget-footer flex-shrink-0 p-3 md:p-4 lg:p-6" style={{ position: 'sticky', bottom: 0, zIndex: 1000, backgroundColor: 'rgb(249 250 251)' }}>
                <form onSubmit={handleSubmit}>
                    <div className="relative flex items-center gap-2">
                        <div className="flex-1 relative">
                            <input
                                ref={inputRef}
                                className={`widget-input w-full pr-12 text-sm ${getFontClass()}`}
                                value={input}
                                onChange={handleInputChange}
                                placeholder={getPlaceholderText()}
                                disabled={isLoading}
                                dir={isRTL ? 'rtl' : 'ltr'}
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className={`absolute ${isRTL ? 'left-2' : 'right-2'} top-1/2 -translate-y-1/2 p-2 rounded-lg widget-button disabled:opacity-50 disabled:cursor-not-allowed`}
                                title="Send Message"
                                style={{ padding: '8px', minWidth: 'auto', width: 'auto', height: 'auto' }}
                            >
                                <PaperAirplaneIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Clerk-wrapped version that uses useUser hook
function ClerkWrappedChatPage() {
    const { user } = useUser();
    return (
        <LanguageProvider>
            <ChatProvider>
                <WidgetChatPage user={user} />
            </ChatProvider>
        </LanguageProvider>
    );
}

// Widget wrapper with Clerk provider
export default function WidgetPage() {
    const [clerkKey, setClerkKey] = useState<string | null>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const urlParams = new URLSearchParams(window.location.search);
        const key = urlParams.get('clerkKey');
        // Use provided key or fall back to default environment key
        setClerkKey(key || process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || null);
    }, []);

    // Don't render anything during SSR to avoid hydration issues
    if (!isClient) {
        return <div className="flex items-center justify-center h-96">Loading...</div>;
    }

    // Always use ClerkProvider since ChatProvider depends on useUser hook
    const finalClerkKey = clerkKey || process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

    if (!finalClerkKey) {
        return <div className="text-red-500 p-4">Error: No Clerk publishable key available</div>;
    }

    const clerkConfig = getClerkConfig();
    return (
        <ClerkProvider
            publishableKey={finalClerkKey}
            appearance={{
                baseTheme: undefined,
                variables: {
                    colorPrimary: '#3b82f6',
                },
            }}
            signInUrl={clerkConfig.signInUrl}
            signUpUrl={clerkConfig.signUpUrl}
            afterSignInUrl={clerkConfig.afterSignInUrl}
            afterSignUpUrl={clerkConfig.afterSignUpUrl}
        >
            <ClerkWrappedChatPage />
        </ClerkProvider>
    );
} 