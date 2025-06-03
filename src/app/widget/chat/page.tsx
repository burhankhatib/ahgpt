"use client";
import { useRef, useEffect, useState } from "react";
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { ExclamationTriangleIcon, InformationCircleIcon, DocumentDuplicateIcon, CheckIcon } from '@heroicons/react/24/outline';
import { ClerkProvider, SignInButton, useUser } from '@clerk/nextjs';
import { trackChatEvent } from '@/utils/analytics';
import { useChat as useChatContext } from '@/contexts/ChatContext';
import { ChatProvider } from '@/contexts/ChatContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { Message } from '@/types/chat';
import { isSanityPermissionError } from '@/utils/sanity-permissions';
import { Button } from "@/components/ui/button";
import { redirectToProperDomain, isValidDomain, getApiEndpoint, getClerkConfig } from '@/utils/domain-config';

// Widget-specific message types
interface WidgetMessage {
    type: 'WIDGET_READY' | 'USER_SIGNED_IN' | 'USER_SIGNED_OUT' | 'RESIZE' | 'ERROR' | 'UPDATE_CONFIG' | 'AUTH_SUCCESS';
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

// Centralized Auth Helper
function getToken() {
    const urlToken = new URLSearchParams(window.location.search).get('token');
    if (urlToken) {
        localStorage.setItem('ahgpt_token', urlToken);
        // Remove token from URL for cleanliness
        const url = new URL(window.location.href);
        url.searchParams.delete('token');
        window.history.replaceState({}, document.title, url.toString());
        return urlToken;
    }
    return localStorage.getItem('ahgpt_token');
}

function showSignInButton(containerId: string, signInText = 'Sign in to save your chats') {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Create a more complete sign-in interface
    const signInDiv = document.createElement('div');
    signInDiv.className = 'flex flex-col items-center justify-center p-6 bg-blue-50 rounded-lg border border-blue-200';
    signInDiv.innerHTML = `
        <div class="text-center mb-4">
            <h3 class="text-lg font-semibold text-gray-800 mb-2">Sign In to Al Hayat GPT</h3>
            <p class="text-sm text-gray-600">${signInText}</p>
        </div>
        <button id="widget-signin-btn" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Sign In
        </button>
    `;

    const signInBtn = signInDiv.querySelector('#widget-signin-btn') as HTMLButtonElement;
    if (signInBtn) {
        signInBtn.onclick = () => {
            // Open authentication in a popup instead of redirect
            const authUrl = `${window.location.origin}/sign-in?widget=true&return_to=${encodeURIComponent(window.location.href)}`;
            const popup = window.open(authUrl, 'auth-popup', 'width=500,height=600,scrollbars=yes,resizable=yes');

            if (!popup) return;

            // Listen for auth completion
            const messageHandler = (event: MessageEvent) => {
                if (event.origin !== window.location.origin) return;

                if (event.data.type === 'AUTH_SUCCESS' && event.data.token) {
                    localStorage.setItem('ahgpt_token', event.data.token);
                    popup.close();
                    window.location.reload(); // Refresh to show authenticated state
                    window.removeEventListener('message', messageHandler);
                }
            };

            window.addEventListener('message', messageHandler);

            // Clean up if popup is closed manually
            const checkClosed = setInterval(() => {
                if (popup && popup.closed) {
                    clearInterval(checkClosed);
                    window.removeEventListener('message', messageHandler);
                }
            }, 1000);
        };
    }

    container.appendChild(signInDiv);
}

function WidgetChatPage({ user }: { user?: ReturnType<typeof useUser>['user'] }) {
    const { currentChat, addConversationTurn, createNewChat } = useChatContext();
    const { getFontClass, isRTL, getPlaceholderText, detectInputLanguageChange, autoDetect } = useLanguage();
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
    const [isGuestMode, setIsGuestMode] = useState(false);

    const chatRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Get user info from current chat context
    const firstName = currentChat?.user?.firstName || user?.firstName || 'Guest';
    const lastName = currentChat?.user?.lastName || user?.lastName || '';
    const fullNameInitials = `${firstName[0] || 'G'}${lastName[0] || ''}`;
    const email = currentChat?.user?.email || user?.emailAddresses?.[0]?.emailAddress || '';

    // Widget communication setup
    useEffect(() => {
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

        // Send ready message to parent
        const sendMessage = (message: WidgetMessage) => {
            if (window.parent && window.parent !== window) {
                window.parent.postMessage(message, origin || '*');
            }
        };

        // Listen for messages from parent and authentication updates
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
                case 'AUTH_SUCCESS':
                    // Handle authentication success from popup
                    if (message.payload?.token && typeof message.payload.token === 'string') {
                        localStorage.setItem('ahgpt_token', message.payload.token);
                        window.location.reload(); // Refresh to update authentication state
                    }
                    break;
            }
        };

        // Also listen for authentication messages from popup windows
        const handleAuthMessage = (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return;

            if (event.data.type === 'AUTH_SUCCESS' && event.data.token) {
                localStorage.setItem('ahgpt_token', event.data.token);
                setIsGuestMode(false);
                // Force re-render without full page reload
                window.location.reload();
            }
        };

        window.addEventListener('message', handleMessage);
        window.addEventListener('message', handleAuthMessage);

        // Send ready message
        sendMessage({ type: 'WIDGET_READY' });

        return () => {
            window.removeEventListener('message', handleMessage);
            window.removeEventListener('message', handleAuthMessage);
        };
    }, []);

    // Send user authentication status to parent
    useEffect(() => {
        const sendMessage = (message: WidgetMessage) => {
            if (window.parent && window.parent !== window) {
                window.parent.postMessage(message, parentOrigin);
            }
        };

        const token = getToken();
        const isAuthenticated = !!token || !!user;

        if (user || token) {
            sendMessage({
                type: 'USER_SIGNED_IN',
                payload: {
                    id: user?.id || 'token-user',
                    firstName: user?.firstName || 'User',
                    lastName: user?.lastName || '',
                    email: user?.emailAddresses?.[0]?.emailAddress || ''
                }
            });
            setIsGuestMode(false);
        } else {
            sendMessage({ type: 'USER_SIGNED_OUT' });
            setIsGuestMode(true);
        }
    }, [user, parentOrigin]);

    // Send resize messages to parent when content changes
    useEffect(() => {
        const sendResize = () => {
            if (window.parent && window.parent !== window) {
                // Use full viewport height for the widget
                const height = window.innerHeight;
                window.parent.postMessage({
                    type: 'RESIZE',
                    payload: { height }
                }, parentOrigin);
            }
        };

        const resizeObserver = new ResizeObserver(sendResize);
        if (chatRef.current) {
            resizeObserver.observe(chatRef.current);
        }

        // Also listen for window resize events
        window.addEventListener('resize', sendResize);

        // Send initial size
        sendResize();

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('resize', sendResize);
        };
    }, [parentOrigin, displayMessages]);

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
                uniqueKey: msg.uniqueKey || `msg_${index}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
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
                        uniqueKey: `msg_user_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
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
                        const token = getToken();
                        const response = await fetch('/api/chat', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                ...(token && { Authorization: `Bearer ${token}` }),
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
                            uniqueKey: `msg_ai_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
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
                            content: 'Sorry, I encountered an error. Please try again.',
                            timestamp: new Date(),
                            uniqueKey: `msg_error_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
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
            uniqueKey: `msg_user_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
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

        try {
            const token = getToken();
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { Authorization: `Bearer ${token}` }),
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
                uniqueKey: `msg_ai_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
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
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date(),
                uniqueKey: `msg_error_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
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

                detectInputLanguageChange(newValue, recentMessages);
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

    const token = getToken();
    const isAuthenticated = !!token || !!user;

    // Update guest mode based on authentication status
    useEffect(() => {
        setIsGuestMode(!isAuthenticated);
    }, [isAuthenticated]);

    // Show full chat interface for both authenticated and guest users
    return (
        <div className={`flex flex-col h-screen bg-gray-50/30 ${getFontClass()}`}>
            {/* Authentication Status Banner - Hidden for widget users */}
            {false && isGuestMode && widgetConfig.allowGuests && (
                <div className="mx-2 mt-2">
                    <div className="bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded-xl p-3 shadow-sm">
                        <div className="flex items-start gap-2">
                            <InformationCircleIcon className="h-4 w-4 text-blue-500 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-xs font-medium text-blue-800">Guest Mode</p>
                                <p className="text-xs text-blue-700">Your conversation won&apos;t be saved.
                                    <button
                                        onClick={() => showSignInButton('temp-signin', 'Sign in to save your chats')}
                                        className="ml-1 underline hover:no-underline"
                                    >
                                        Sign in to save chats
                                    </button>
                                </p>
                            </div>
                        </div>
                    </div>
                    <div id="temp-signin"></div>
                </div>
            )}

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
                className="flex-1 overflow-y-auto px-3 md:px-6 lg:px-8 py-4 space-y-4 min-h-0"
            >
                {allMessages.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 max-w-sm md:max-w-md lg:max-w-lg text-center">
                            <div className="w-fit px-3 py-1 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                <span className="text-white text-lg font-bold">Al Hayat GPT</span>
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
                            {false && isGuestMode && (
                                <p className="text-xs text-blue-600 mt-2 italic">
                                    Currently in guest mode - conversations won&apos;t be saved.
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {allMessages.map((m) => {
                    const timestamp = formatTime(m.timestamp);
                    const isStreaming = m.uniqueKey?.includes('streaming') && streamingMessage && m.role === 'assistant';

                    return (
                        <div
                            key={m.uniqueKey || `fallback_${m.role}_${m.timestamp.getTime()}`}
                            className={`flex items-start gap-3 ${m.role === "user"
                                ? isRTL ? "justify-start" : "justify-end"
                                : isRTL ? "justify-end" : "justify-start"
                                }`}
                        >
                            {m.role === "assistant" && !isRTL && AVATARS.ai}

                            <div
                                className={`max-w-xs md:max-w-md lg:max-w-lg ${m.role === "user"
                                    ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg"
                                    : "bg-white/80 backdrop-blur-sm text-gray-800 shadow-lg border border-gray-200/50"
                                    } rounded-2xl px-4 py-3 transition-all duration-300`}
                            >
                                <div className={`flex items-center gap-2 mb-1 ${isRTL ? 'justify-end' : 'justify-start'}`}>
                                    <span className={`text-xs font-medium ${m.role === "user" ? "text-blue-100" : "text-gray-500"}`}>
                                        {m.role === "user" ? (isGuestMode ? "Guest" : "You") : "Assistant"}
                                    </span>
                                    <span className={`text-xs ${m.role === "user" ? "text-blue-200" : "text-gray-400"}`}>
                                        {timestamp}
                                    </span>
                                    {m.role === "assistant" && m.content && !isStreaming && (
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
                                                    dangerouslySetInnerHTML={{ __html: m.content }}
                                                    className="widget-assistant-content"
                                                />
                                            ) : (
                                                <div className="text-gray-500 italic">No response received</div>
                                            )}
                                            {isStreaming && (
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

                            {m.role === "user" && !isRTL && AVATARS.user}
                            {m.role === "assistant" && isRTL && AVATARS.ai}
                            {m.role === "user" && isRTL && AVATARS.user}
                        </div>
                    );
                })}

                {isLoading && !streamingMessage && (
                    <div className={`flex items-start gap-3 ${isRTL ? 'justify-end' : 'justify-start'}`}>
                        {!isRTL && AVATARS.ai}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg border border-gray-200/50 flex items-center gap-2">
                            <div className="flex items-center gap-1">
                                <span className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"></span>
                                <span className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                                <span className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                            </div>
                            <span className="text-xs text-gray-500">Thinking...</span>
                        </div>
                        {isRTL && AVATARS.ai}
                    </div>
                )}
            </div>

            {/* Input Form */}
            <div className="flex-shrink-0 p-3 md:p-4 lg:p-6 bg-white/50 backdrop-blur-sm border-t border-gray-200/50">
                <form onSubmit={handleSubmit}>
                    <div className="relative flex items-center gap-2">
                        <div className="flex-1 relative">
                            <input
                                ref={inputRef}
                                className={`w-full px-4 py-3 pr-12 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-200/50 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 shadow-lg text-sm ${getFontClass()}`}
                                value={input}
                                onChange={handleInputChange}
                                placeholder={getPlaceholderText()}
                                disabled={isLoading}
                                dir={isRTL ? 'rtl' : 'ltr'}
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className={`absolute ${isRTL ? 'left-2' : 'right-2'} top-1/2 -translate-y-1/2 p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg`}
                                title="Send Message"
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