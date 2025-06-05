"use client";
import { useRef, useEffect, useState } from "react";
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { ExclamationTriangleIcon, InformationCircleIcon, DocumentDuplicateIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useUser, SignInButton } from '@clerk/nextjs';
import { trackChatEvent } from '@/utils/analytics';
import { useChat as useChatContext } from '@/contexts/ChatContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Message } from '@/types/chat';
import { isSanityPermissionError } from '@/utils/sanity-permissions';
import { Button } from "@/components/ui/button";
import { detectUserGeolocation, GeolocationData } from '@/utils/geolocationDetection';

function formatTime(date: Date | string) {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Multilingual Welcome Animation Component
function MultilingualWelcome() {
    const welcomeWords = [
        { text: "Welcome", lang: "English", size: "text-6xl", opacity: "opacity-90" },
        { text: "Bienvenido", lang: "Spanish", size: "text-5xl", opacity: "opacity-80" },
        { text: "Bienvenue", lang: "French", size: "text-7xl", opacity: "opacity-95" },
        { text: "Willkommen", lang: "German", size: "text-4xl", opacity: "opacity-75" },
        { text: "Benvenuto", lang: "Italian", size: "text-6xl", opacity: "opacity-85" },
        { text: "Bem-vindo", lang: "Portuguese", size: "text-5xl", opacity: "opacity-70" },
        { text: "Добро пожаловать", lang: "Russian", size: "text-4xl", opacity: "opacity-80" },
        { text: "欢迎", lang: "Chinese", size: "text-8xl", opacity: "opacity-90" },
        { text: "いらっしゃいませ", lang: "Japanese", size: "text-5xl", opacity: "opacity-75" },
        { text: "환영합니다", lang: "Korean", size: "text-6xl", opacity: "opacity-85" },
        { text: "أهلاً و سهلاً", lang: "Arabic", size: "text-7xl", opacity: "opacity-80" },
        { text: "स्वागत", lang: "Hindi", size: "text-6xl", opacity: "opacity-90" },
        { text: "Välkommen", lang: "Swedish", size: "text-5xl", opacity: "opacity-70" },
        { text: "Welkom", lang: "Dutch", size: "text-6xl", opacity: "opacity-85" },
        { text: "Καλώς ήρθατε", lang: "Greek", size: "text-4xl", opacity: "opacity-75" },
        { text: "Hoş geldiniz", lang: "Turkish", size: "text-5xl", opacity: "opacity-80" },
        { text: "Tervetuloa", lang: "Finnish", size: "text-6xl", opacity: "opacity-90" },
        { text: "Velkommen", lang: "Norwegian", size: "text-5xl", opacity: "opacity-75" },
        { text: "Witamy", lang: "Polish", size: "text-7xl", opacity: "opacity-85" },
        { text: "Vítejte", lang: "Czech", size: "text-6xl", opacity: "opacity-80" },
        { text: "שלום", lang: "Hebrew", size: "text-7xl", opacity: "opacity-80" },
        { text: "Selamat Datang", lang: "Malay", size: "text-5xl", opacity: "opacity-80" },
    ];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsVisible(false);
            setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % welcomeWords.length);
                setIsVisible(true);
            }, 200);
        }, 1500);

        return () => clearInterval(interval);
    }, [welcomeWords.length]);

    const currentWord = welcomeWords[currentIndex];

    return (
        <div className="multilingual-welcome">
            <div
                className={`welcome-word ${isVisible ? 'visible' : 'hidden'}`}
            >
                <h1
                    className={`font-bold text-black ${currentWord.size} ${currentWord.opacity} transition-all duration-500 ease-in-out text-center leading-tight`}
                    style={{
                        fontFamily: currentWord.lang === 'Arabic' ? 'system-ui, -apple-system' :
                            currentWord.lang === 'Chinese' || currentWord.lang === 'Japanese' || currentWord.lang === 'Korean' ?
                                'system-ui, -apple-system' : 'inherit'
                    }}
                >
                    {currentWord.text}
                </h1>
            </div>

            {/* Subtle background animation */}
            <div className="background-animation"></div>
        </div>
    );
}

export default function ChatPage() {
    const { user } = useUser();
    const { currentChat, addConversationTurn, createNewChat } = useChatContext();
    const { detectConversationLanguage, getFontClass, isRTL, getPlaceholderText, detectInputLanguageChange, autoDetect } = useLanguage();
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [streamingMessage, setStreamingMessage] = useState("");
    const [displayMessages, setDisplayMessages] = useState<Message[]>([]);
    const [hasPermissionIssue, setHasPermissionIssue] = useState(false);
    const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

    const chatRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [userLocationDetected, setUserLocationDetected] = useState(false);

    // Get user info from current chat context (which has proper Clerk data)
    const firstName = currentChat?.user?.firstName || 'User';
    const lastName = currentChat?.user?.lastName || '';
    const fullNameInitials = `${firstName[0] || 'U'}${lastName[0] || ''}`;
    const email = currentChat?.user?.email || '';

    // Detect and store user location using HTML5 Geolocation API
    useEffect(() => {
        const detectAndStoreUserLocation = async () => {
            if (!user?.id || userLocationDetected) return;

            const userKey = user.id;
            const existingLocation = localStorage.getItem(`userLocation_${userKey}`);

            // Only detect if we don't have recent GEOLOCATION data (or it's older than 24 hours)
            // Force re-detection for old data that wasn't from geolocation
            let shouldDetect = true;
            if (existingLocation) {
                try {
                    const parsed = JSON.parse(existingLocation);
                    const detectedAt = new Date(parsed.detectedAt);
                    const now = new Date();
                    const hoursSinceDetection = (now.getTime() - detectedAt.getTime()) / (1000 * 60 * 60);

                    // Only skip if we have recent geolocation data (not old language-based detection)
                    if (hoursSinceDetection < 24 &&
                        parsed.country !== 'Unknown' &&
                        parsed.detectionMethod === 'geolocation') {
                        shouldDetect = false;
                        setUserLocationDetected(true);
                        console.log(`📋 User ${userKey} has recent geolocation data:`, parsed);
                    } else {
                        // Clear old non-geolocation data to force new detection
                        localStorage.removeItem(`userLocation_${userKey}`);
                        console.log(`🔄 Clearing old location data for user ${userKey} to force geolocation`);
                    }
                } catch (error) {
                    console.error('Error parsing existing location data:', error);
                    localStorage.removeItem(`userLocation_${userKey}`);
                }
            }

            if (shouldDetect) {
                try {
                    console.log(`🌍 Requesting geolocation for user ${userKey}...`);

                    // Check if permission is already granted, otherwise ask user
                    let shouldRequest = true;
                    try {
                        if ('permissions' in navigator) {
                            const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
                            if (permissionStatus.state === 'granted') {
                                shouldRequest = true;
                                console.log(`✅ Geolocation permission already granted for user ${userKey}`);
                            } else if (permissionStatus.state === 'denied') {
                                shouldRequest = false;
                                console.log(`❌ Geolocation permission denied for user ${userKey}`);
                            } else {
                                // Ask for permission
                                shouldRequest = window.confirm(
                                    "🌍 Al Hayat GPT would like to know your location to show your country in the admin dashboard. This is completely optional and stored locally on your device. Allow GPS location access?"
                                );
                            }
                        } else {
                            // Fallback for browsers without permissions API
                            shouldRequest = window.confirm(
                                "🌍 Al Hayat GPT would like to know your location to show your country in the admin dashboard. This is completely optional and stored locally on your device. Allow GPS location access?"
                            );
                        }
                    } catch (error) {
                        // Fallback if permissions API fails
                        shouldRequest = window.confirm(
                            "🌍 Al Hayat GPT would like to know your location to show your country in the admin dashboard. This is completely optional and stored locally on your device. Allow GPS location access?"
                        );
                    }

                    if (!shouldRequest) {
                        console.log(`❌ User ${userKey} denied location permission`);
                        setUserLocationDetected(true);
                        return;
                    }

                    const locationData: GeolocationData | null = await detectUserGeolocation();

                    if (locationData && locationData.country !== 'Unknown') {
                        const locationToStore = {
                            ...locationData,
                            detectedAt: new Date().toISOString(),
                            userKey: userKey
                        };

                        localStorage.setItem(`userLocation_${userKey}`, JSON.stringify(locationToStore));
                        console.log(`✅ Geolocation stored for user ${userKey}:`, locationData);

                        // Show success message to user
                        setTimeout(() => {
                            alert(`✅ Location detected: ${locationData.city ? `${locationData.city}, ` : ''}${locationData.country}`);
                        }, 1000);

                        setUserLocationDetected(true);
                    } else {
                        console.log(`❌ Could not detect location for user ${userKey}`);
                        setUserLocationDetected(true);
                    }
                } catch (error) {
                    console.error(`🚨 Error detecting location for user ${userKey}:`, error);
                    setUserLocationDetected(true);
                }
            }
        };

        // Delay the location request slightly so the user sees the chat interface first
        const timer = setTimeout(detectAndStoreUserLocation, 1000);
        return () => clearTimeout(timer);
    }, [user?.id, userLocationDetected]);

    // CSS styles for clickable questions and rich HTML content
    const questionStyles = `
        /* Additional overrides for messageButton to ensure styling works */
        a.messageButton,
        .suggested-questions a[data-question="true"] {
            display: block !important;
            text-decoration: none !important;
        }
        
        a.messageButton:hover,
        .suggested-questions a[data-question="true"]:hover {
            text-decoration: none !important;
        }

        /* Dynamic height adaptation for embedded contexts */
        .chat-page-container {
            min-height: 400px;
            height: 100%;
            display: flex;
            flex-direction: column;
        }
        
        /* Use CSS custom property for dynamic height calculation */
        :root {
            --available-height: 100vh;
            --header-footer-offset: 0px;
        }
        
        /* Main container adapts to available space */
        .chat-main {
            height: calc(var(--available-height) - var(--header-footer-offset));
            min-height: 400px;
            max-height: calc(100vh - var(--header-footer-offset));
            display: flex;
            flex-direction: column;
        }
        
        /* Ensure proper scrolling behavior for chat messages */
        .chat-messages-container {
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
            scrollbar-width: thin;
            scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
            /* Ensure minimum height so input is always visible */
            min-height: 200px;
        }
        
        .chat-messages-container::-webkit-scrollbar {
            width: 6px;
        }
        
        .chat-messages-container::-webkit-scrollbar-track {
            background: transparent;
        }
        
        .chat-messages-container::-webkit-scrollbar-thumb {
            background-color: rgba(156, 163, 175, 0.5);
            border-radius: 3px;
        }
        
        .chat-messages-container::-webkit-scrollbar-thumb:hover {
            background-color: rgba(156, 163, 175, 0.7);
        }
        
        /* Input form stays at bottom */
        .chat-input-container {
            flex-shrink: 0;
            position: sticky;
            bottom: 0;
            z-index: 10;
        }
        
        /* Responsive adjustments for small heights */
        @media (max-height: 500px) {
            .notification-banner {
                padding: 0.5rem 1rem;
                margin: 0.5rem 1rem;
            }
            
            .chat-messages-container {
                min-height: 150px;
                padding: 1rem;
            }
            
            .chat-input-container {
                padding: 1rem;
            }
        }
        
        /* Very small height adjustments */
        @media (max-height: 350px) {
            .notification-banner {
                padding: 0.25rem 0.5rem;
                margin: 0.25rem 0.5rem;
            }
            
            .chat-messages-container {
                min-height: 100px;
                padding: 0.5rem;
            }
            
            .chat-input-container {
                padding: 0.5rem;
            }
            
            .welcome-container {
                padding: 1rem;
            }
        }
    `;

    // Handle clicking on messageButton elements
    useEffect(() => {
        const handleQuestionClick = (e: MouseEvent) => {
            const button = e.target as HTMLElement;
            if (button.dataset.question === "true") {
                const questionText = button.textContent;
                if (questionText && !isLoading) {
                    setInput(questionText);

                    // Submit the form after a short delay
                    setTimeout(() => {
                        const form = document.querySelector('form');
                        if (form) {
                            const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
                            form.dispatchEvent(submitEvent);
                        }
                    }, 100);
                }
            }
        };

        document.addEventListener('click', handleQuestionClick);
        return () => document.removeEventListener('click', handleQuestionClick);
    }, [setInput, isLoading]);

    // Sanitize HTML content to protect against XSS
    const sanitizeHtml = (html: string) => {
        // Simple HTML sanitization - remove script tags and dangerous attributes
        return html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/on\w+="[^"]*"/g, '')
            .replace(/javascript:/gi, '');
    };

    // Process message content - now just sanitizes HTML since AI generates proper messageButton format
    const processMessageContent = (content: string) => {
        // Remove any markdown code blocks that might slip through
        let processedContent = content
            .replace(/```html\s*/g, '')
            .replace(/```\s*/g, '')
            .replace(/`{3,}/g, '');

        // Sanitize the HTML content
        processedContent = sanitizeHtml(processedContent);

        console.log('Processed and sanitized message content');
        return processedContent;
    };

    // Detect conversation language when messages change
    useEffect(() => {
        if (displayMessages.length > 0) {
            detectConversationLanguage(displayMessages.map(msg => ({
                content: msg.content,
                role: msg.role
            })));
        }
    }, [displayMessages, detectConversationLanguage]);

    const AVATARS = {
        user: (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium shadow-lg">
                <span className="text-sm">{fullNameInitials}</span>
            </div>
        ),
        ai: (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-700 font-medium shadow-lg border border-gray-200">
                <span className="text-sm">AI</span>
            </div>
        ),
    };

    // Create a new chat if none exists
    useEffect(() => {
        if (!currentChat) {
            console.log('No current chat, creating new one');
            createNewChat();
        }
    }, [currentChat, createNewChat]);

    // Load messages when currentChat changes (including when switching chats)
    useEffect(() => {
        if (currentChat) {
            // Load messages from the current chat
            const messagesWithDates = currentChat.messages.map((msg, index) => ({
                ...msg,
                timestamp: typeof msg.timestamp === 'string' ? new Date(msg.timestamp) : msg.timestamp,
                uniqueKey: msg.uniqueKey || `msg_${index}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
            }));

            console.log('Loading messages from currentChat:', messagesWithDates);
            setDisplayMessages(messagesWithDates);

            // Clear any streaming state when switching chats
            setStreamingMessage("");
            setIsLoading(false);
        } else {
            // No current chat, clear display messages
            setDisplayMessages([]);
            setStreamingMessage("");
            setIsLoading(false);
        }
    }, [currentChat?._id]); // Use currentChat._id as dependency to trigger when switching chats

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [displayMessages, streamingMessage, isLoading]);

    // Focus input after messages change
    useEffect(() => {
        if (inputRef.current && !isLoading) {
            inputRef.current.focus();
        }
    }, [displayMessages, isLoading]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        // Enhanced language detection from user input with context
        if (autoDetect) {
            const recentMessages = displayMessages.slice(-3).map(msg => ({
                content: msg.content,
                role: msg.role
            }));
            detectInputLanguageChange(input.trim(), recentMessages);
        }

        const userMessage: Message = {
            role: 'user',
            content: input.trim(),
            timestamp: new Date(),
            uniqueKey: `msg_user_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
            firstName,
            lastName,
            email,
        };

        // Clear input immediately
        const currentInput = input.trim();
        setInput("");
        setIsLoading(true);
        setStreamingMessage("");

        // Add user message to display immediately
        setDisplayMessages(prev => {
            console.log('Adding user message to display:', userMessage);
            console.log('Previous messages:', prev);
            const newMessages = [...prev, userMessage];
            console.log('New messages array:', newMessages);
            return newMessages;
        });

        // Track the event
        trackChatEvent('SEND_MESSAGE', `Message length: ${currentInput.length}`);

        try {
            // Call the AI API using the AI SDK's readDataStream
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
                    }))
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

            // Read the streaming response
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.trim() === '') continue;

                    console.log('Streaming line:', line);

                    if (line.startsWith('0:')) {
                        // Text content from AI SDK
                        const data = line.slice(2);
                        console.log('Raw text data:', data);
                        try {
                            const content = JSON.parse(data);
                            console.log('Parsed text content:', content);
                            if (typeof content === 'string') {
                                aiResponseContent += content;
                                setStreamingMessage(aiResponseContent);
                            }
                        } catch (e) {
                            console.log('Failed to parse as JSON, trying as plain text:', e);
                            // Sometimes the content might not be JSON, try as plain text
                            if (data) {
                                aiResponseContent += data;
                                setStreamingMessage(aiResponseContent);
                            }
                        }
                    } else if (line.startsWith('1:')) {
                        // Alternative text format
                        const data = line.slice(2);
                        console.log('Alternative text format:', data);
                        try {
                            const content = JSON.parse(data);
                            if (typeof content === 'string') {
                                aiResponseContent += content;
                                setStreamingMessage(aiResponseContent);
                            }
                        } catch {
                            if (data) {
                                aiResponseContent += data;
                                setStreamingMessage(aiResponseContent);
                            }
                        }
                    } else if (line.startsWith('d:')) {
                        // Final data - log for debugging
                        console.log('Final stream data:', line);
                    } else {
                        // Log any other format we might be missing
                        console.log('Unknown streaming format:', line);
                    }
                }
            }

            // Create the final AI message
            const aiMessage: Message = {
                role: 'assistant',
                content: aiResponseContent || 'I apologize, but I encountered an issue generating a response. Please try asking your question again.',
                timestamp: new Date(),
                uniqueKey: `msg_ai_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
            };

            console.log('Final AI response content:', aiResponseContent);
            console.log('Final AI message:', aiMessage);

            // Add AI message to display (but first remove any streaming message)
            setDisplayMessages(prev => {
                // Remove the streaming message if it exists, then add the final message
                const withoutStreaming = prev.filter(msg => !msg.uniqueKey?.includes('streaming'));
                return [...withoutStreaming, aiMessage];
            });
            setStreamingMessage("");

            // Save both user and assistant messages as a conversation turn to context/Sanity
            try {
                console.log('Saving conversation turn to context:', {
                    currentChatId: currentChat?._id,
                    currentChatUniqueKey: currentChat?.uniqueKey,
                    currentChatMessageCount: currentChat?.messages.length || 0,
                    userMessage: {
                        role: userMessage.role,
                        content: userMessage.content.slice(0, 50) + '...',
                        uniqueKey: userMessage.uniqueKey
                    },
                    aiMessage: {
                        role: aiMessage.role,
                        content: aiMessage.content.slice(0, 50) + '...',
                        uniqueKey: aiMessage.uniqueKey
                    }
                });
                await addConversationTurn(userMessage, aiMessage);
                console.log('Conversation turn saved to context successfully');
            } catch (error) {
                console.error('Error saving conversation turn to context:', error);
                if (isSanityPermissionError(error)) {
                    setHasPermissionIssue(true);
                }
            }

            // Track the event
            trackChatEvent('RECEIVE_MESSAGE', `Message length: ${aiResponseContent.length}`);

        } catch (error) {
            console.error('Error in chat:', error);

            // Add error message to display
            const errorMessage: Message = {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date(),
                uniqueKey: `msg_error_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
            };

            setDisplayMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
            setStreamingMessage("");
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInput(newValue);

        // Real-time language detection with debouncing
        if (autoDetect && newValue.trim().length > 8) {
            // Clear previous timeout
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }

            // Set new timeout for debounced language detection
            debounceTimeoutRef.current = setTimeout(() => {
                const recentMessages = displayMessages.slice(-3).map(msg => ({
                    content: msg.content,
                    role: msg.role
                }));

                detectInputLanguageChange(newValue, recentMessages);
            }, 800); // 800ms debounce delay
        }
    };

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, []);

    // Handle dynamic height adjustments for embedded contexts
    useEffect(() => {
        const calculateAvailableHeight = () => {
            // Check if we're in an embedded context
            const isEmbedded = window.self !== window.top;

            let availableHeight = window.innerHeight;
            let headerFooterOffset = 0;

            if (isEmbedded) {
                // Try to detect if there are headers/footers by checking the container
                const container = document.querySelector('main')?.parentElement;
                if (container) {
                    const containerRect = container.getBoundingClientRect();
                    const windowHeight = window.innerHeight;

                    // Calculate offset based on container position
                    headerFooterOffset = windowHeight - containerRect.height;
                    availableHeight = containerRect.height;
                }
            }

            // Ensure minimum height
            availableHeight = Math.max(availableHeight, 400);

            // Update CSS custom properties
            document.documentElement.style.setProperty('--available-height', `${availableHeight}px`);
            document.documentElement.style.setProperty('--header-footer-offset', `${headerFooterOffset}px`);

            console.log('Height calculation:', {
                isEmbedded,
                availableHeight,
                headerFooterOffset,
                windowHeight: window.innerHeight
            });
        };

        // Initial calculation
        calculateAvailableHeight();

        // Create a ResizeObserver to watch for container size changes
        let resizeObserver: ResizeObserver | null = null;

        if (typeof ResizeObserver !== 'undefined') {
            resizeObserver = new ResizeObserver(() => {
                // Debounce the calculation
                setTimeout(calculateAvailableHeight, 100);
            });

            // Observe the main container and its parent
            const mainElement = document.querySelector('main');
            if (mainElement) {
                resizeObserver.observe(mainElement);
                if (mainElement.parentElement) {
                    resizeObserver.observe(mainElement.parentElement);
                }
            }
        }

        // Listen for window resize events
        const handleResize = () => {
            setTimeout(calculateAvailableHeight, 100);
        };

        window.addEventListener('resize', handleResize);

        // Listen for orientation changes on mobile
        const handleOrientationChange = () => {
            setTimeout(calculateAvailableHeight, 300);
        };

        window.addEventListener('orientationchange', handleOrientationChange);

        // Also listen for scroll events on parent windows (for embedded contexts)
        const handleParentScroll = () => {
            if (window.self !== window.top) {
                setTimeout(calculateAvailableHeight, 50);
            }
        };

        window.addEventListener('scroll', handleParentScroll, { passive: true });

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('orientationchange', handleOrientationChange);
            window.removeEventListener('scroll', handleParentScroll);
            if (resizeObserver) {
                resizeObserver.disconnect();
            }
        };
    }, []);

    // Copy message function
    const copyMessage = async (messageContent: string, messageId: string) => {
        try {
            // Strip HTML tags from content for clean copying
            const textContent = messageContent.replace(/<[^>]*>/g, '');
            await navigator.clipboard.writeText(textContent);
            setCopiedMessageId(messageId);

            // Reset copied state after 2 seconds
            setTimeout(() => {
                setCopiedMessageId(null);
            }, 2000);

            // Track the copy event
            trackChatEvent('SEND_MESSAGE', `Copy message - length: ${textContent.length}`);
        } catch (error) {
            console.error('Failed to copy message:', error);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = messageContent.replace(/<[^>]*>/g, '');
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopiedMessageId(messageId);
            setTimeout(() => {
                setCopiedMessageId(null);
            }, 2000);
        }
    };

    // Combine display messages with streaming message for rendering
    const allMessages = [...displayMessages];
    if (streamingMessage) {
        allMessages.push({
            role: 'assistant',
            content: streamingMessage,
            timestamp: new Date(),
            uniqueKey: `msg_streaming_${Date.now()}`
        });
    }

    console.log('Display messages:', displayMessages);
    console.log('All messages for rendering:', allMessages);
    console.log('Streaming message:', streamingMessage);

    return (
        <main className={`chat-main bg-gray-50/30 pt-16 ${getFontClass()}`}>
            {/* Inject CSS styles for clickable questions */}
            <style dangerouslySetInnerHTML={{ __html: questionStyles }} />

            {/* Notification Banners */}
            {hasPermissionIssue && (
                <div className="notification-banner">
                    <div className="mx-4 mt-4 bg-white/80 backdrop-blur-sm border border-amber-200 rounded-2xl p-4 shadow-sm">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                                <ExclamationTriangleIcon className="h-5 w-5 text-amber-500" aria-hidden="true" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-amber-800">
                                    Limited Functionality
                                </p>
                                <p className="text-sm text-amber-700 mt-1">
                                    Your conversation will continue but won&apos;t be saved to history due to permissions.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {!user && (
                <div className="notification-banner">
                    <div className="mx-4 mt-4 bg-white/80 backdrop-blur-sm border border-blue-200 rounded-2xl p-4 shadow-sm">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                                <InformationCircleIcon className="h-5 w-5 text-blue-500" aria-hidden="true" />
                            </div>
                            <div className="flex flex-col md:flex-row justify-between w-full gap-2">
                                <div>

                                    <p className="text-sm font-medium text-blue-800">
                                        Guest Mode - Chat History Not Saved
                                    </p>
                                    <p className="text-sm text-blue-700 mt-1">
                                        You&apos;re chatting as a guest. Sign in with Clerk to save your conversation history and access all features.
                                    </p>
                                </div>
                                <SignInButton mode="modal">
                                    <Button
                                        type="button"
                                        className="px-6 py-4 rounded-lg bg-gradient-to-br from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-sm whitespace-nowrap"
                                        title="Sign in to save your chat history"
                                    >
                                        Sign In
                                    </Button>
                                </SignInButton>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Chat Messages Container */}
            <div
                ref={chatRef}
                className="chat-messages-container px-4 py-8 space-y-6"
            >
                {allMessages.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 welcome-container">
                        <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-12 shadow-lg border border-gray-200/50 max-w-md text-center">
                            <div className="w-fit px-4 py-2 h-fit bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                                <span className="text-white text-2xl font-bold">Al Hayat GPT</span>
                            </div>
                            <div className="mb-6">
                                <MultilingualWelcome />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-3">
                                The first and most advanced Christian AI chatbot that can debate with you in Islam and Christianity.
                            </h2>
                            <p className="text-gray-600 leading-relaxed">
                                Start a conversation by typing your message below. I&apos;m here to help with all your questions.
                            </p>
                        </div>
                    </div>
                )}

                {allMessages.map((m) => {
                    const timestamp = formatTime(m.timestamp);
                    const isStreaming = m.uniqueKey?.includes('streaming') && streamingMessage && m.role === 'assistant';

                    return (
                        <div
                            key={m.uniqueKey || `fallback_${m.role}_${m.timestamp.getTime()}`}
                            className={`flex items-start gap-4 ${m.role === "user"
                                ? isRTL ? "justify-start" : "justify-end"
                                : isRTL ? "justify-end" : "justify-start"
                                }`}
                        >
                            {m.role === "assistant" && !isRTL && (
                                <div className="hidden md:flex flex-shrink-0">
                                    {AVATARS.ai}
                                </div>
                            )}

                            <div
                                className={`max-w-2xl ${m.role === "user"
                                    ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg"
                                    : "bg-white/80 backdrop-blur-sm text-gray-800 shadow-lg border border-gray-200/50"
                                    } rounded-3xl px-6 py-4 transition-all duration-300 hover:shadow-xl`}
                            >
                                <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'justify-end' : 'justify-start'}`}>
                                    <span className={`text-xs font-medium ${m.role === "user" ? "text-blue-100" : "text-gray-500"
                                        }`}>
                                        {m.role === "user" ? "You" : "Assistant"}
                                    </span>
                                    <span className={`text-xs ${m.role === "user" ? "text-blue-200" : "text-gray-400"
                                        }`}>
                                        {timestamp}
                                    </span>
                                    {/* Copy button for assistant messages */}
                                    {m.role === "assistant" && m.content && !isStreaming && (
                                        <button
                                            onClick={() => copyMessage(m.content, m.uniqueKey || `msg_${m.timestamp.getTime()}`)}
                                            className={`${isRTL ? 'mr-auto' : 'ml-auto'} p-1.5 rounded-lg hover:bg-gray-100 transition-all duration-200 group`}
                                            title="Copy message"
                                        >
                                            {copiedMessageId === (m.uniqueKey || `msg_${m.timestamp.getTime()}`) ? (
                                                <CheckIcon className="w-4 h-4 text-green-500" />
                                            ) : (
                                                <DocumentDuplicateIcon className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                                            )}
                                        </button>
                                    )}
                                </div>

                                {m.role === "assistant" ? (
                                    <div className={`chat-message-content prose-sm max-w-none text-gray-800 ${getFontClass()}`}>
                                        {m.content ? (
                                            <div className="flex flex-col gap-2">
                                                <div
                                                    dangerouslySetInnerHTML={{ __html: processMessageContent(m.content) }}
                                                />
                                            </div>
                                        ) : (
                                            <div className="text-gray-500 italic">No response received</div>
                                        )}
                                        {isStreaming && (
                                            <span className={`inline-block w-2 h-5 bg-blue-500 rounded-sm animate-pulse ${isRTL ? 'mr-1' : 'ml-1'}`}></span>
                                        )}
                                    </div>
                                ) : (
                                    <div className={`whitespace-pre-line break-words leading-relaxed ${getFontClass()}`}>
                                        {m.content}
                                    </div>
                                )}
                            </div>

                            {m.role === "user" && !isRTL && (
                                <div className="hidden md:flex-shrink-0">
                                    {AVATARS.user}
                                </div>
                            )}

                            {m.role === "assistant" && isRTL && (
                                <div className="hidden md:flex-shrink-0">
                                    {AVATARS.ai}
                                </div>
                            )}

                            {m.role === "user" && isRTL && (
                                <div className="hidden md:flex-shrink-0">
                                    {AVATARS.user}
                                </div>
                            )}
                        </div>
                    );
                })}

                {isLoading && streamingMessage && (
                    <div className={`flex items-start gap-4 ${isRTL ? 'justify-end' : 'justify-start'}`}>
                        {!isRTL && (
                            <div className="flex-shrink-0">
                                {AVATARS.ai}
                            </div>
                        )}
                        <div className="bg-white/80 backdrop-blur-sm rounded-3xl px-6 py-4 shadow-lg border border-gray-200/50 flex items-center gap-3">
                            <div className="flex items-center gap-1">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                            </div>
                            <span className="text-sm text-gray-500">Assistant is thinking...</span>
                        </div>
                        {isRTL && (
                            <div className="flex-shrink-0">
                                {AVATARS.ai}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Input Form */}
            <div className="chat-input-container p-6 bg-white/50 backdrop-blur-sm border-t border-gray-200/50">
                <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
                    <div className="relative flex items-center gap-3">
                        <div className="flex-1 relative">
                            <input
                                ref={inputRef}
                                className={`w-full px-6 py-4 pr-14 rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200/50 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 shadow-lg hover:shadow-xl ${getFontClass()}`}
                                value={input}
                                onChange={handleInputChange}
                                placeholder={getPlaceholderText()}
                                disabled={isLoading}
                                dir={isRTL ? 'rtl' : 'ltr'}
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className={`absolute ${isRTL ? 'left-2' : 'right-2'} top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl`}
                                title="Send Message"
                            >
                                <PaperAirplaneIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Sign In Button - only show when user is not signed in */}
                        {!user && (
                            <SignInButton mode="modal">
                                <button
                                    type="button"
                                    className="px-6 py-4 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-sm whitespace-nowrap"
                                    title="Sign in to save your chat history"
                                >
                                    Sign In
                                </button>
                            </SignInButton>
                        )}
                    </div>
                </form>
            </div>
        </main>
    );
} 