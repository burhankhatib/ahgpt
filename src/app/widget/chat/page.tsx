"use client";
import React, { useRef, useEffect, useState } from "react";
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { ExclamationTriangleIcon, DocumentDuplicateIcon, CheckIcon } from '@heroicons/react/24/outline';
import { trackChatEvent } from '@/utils/analytics';
import { useChat as useChatContext } from '@/contexts/ChatContext';
import { GuestChatProvider } from '@/contexts/ChatContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { Message } from '@/types/chat';
import { isSanityPermissionError } from '@/utils/sanity-permissions';
import Link from "next/link";

// Widget-specific message types
interface WidgetMessage {
    type: 'WIDGET_READY' | 'USER_SIGNED_IN' | 'USER_SIGNED_OUT' | 'RESIZE' | 'ERROR';
    payload?: Record<string, unknown>;
}

function formatTime(date: Date | string) {
    try {
        const d = typeof date === 'string' ? new Date(date) : date;
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
        return "00:00";
    }
}

// Simplified Welcome Component
function SimpleWelcome() {
    return (
        <div className="text-center">
            <h1 className="text-lg font-semibold text-blue-600 mb-2">
                Welcome to Al Hayat GPT
            </h1>
            <p className="text-sm text-gray-600">
                Ask me anything about Christianity, theology, or general questions
            </p>
        </div>
    );
}

// Fallback widget when contexts fail
function FallbackWidget() {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Array<{ role: string, content: string, timestamp: Date }>>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Load external CSS from alhayatgpt.com
    React.useEffect(() => {
        const loadExternalCSS = () => {
            const existingLink = document.querySelector('#alhayat-external-css');
            if (existingLink) return;

            try {
                const link = document.createElement('link');
                link.id = 'alhayat-external-css';
                link.rel = 'stylesheet';
                link.type = 'text/css';
                link.href = 'https://alhayatgpt.com/api/globals.css';
                link.crossOrigin = 'anonymous';

                link.onload = () => console.log('✅ External CSS loaded in fallback widget');
                link.onerror = () => console.warn('⚠️ Failed to load external CSS in fallback widget');

                document.head.appendChild(link);
            } catch (error) {
                console.error('Error loading external CSS in fallback:', error);
            }
        };

        loadExternalCSS();
    }, []);

    // Handle clickable questions in fallback widget
    React.useEffect(() => {
        const handleQuestionClick = (e: MouseEvent) => {
            const button = e.target as HTMLElement;
            if (button.dataset.question === "true") {
                const questionText = button.textContent;
                if (questionText && !isLoading) {
                    setInput(questionText);
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = {
            role: 'user',
            content: input.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMessage].map(msg => ({
                        role: msg.role,
                        content: msg.content
                    })),
                    isWidget: true,
                    isGuest: true
                })
            });

            if (response.ok) {
                const reader = response.body?.getReader();
                if (reader) {
                    let content = "";
                    const decoder = new TextDecoder();

                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        const chunk = decoder.decode(value);
                        const lines = chunk.split('\n');

                        for (const line of lines) {
                            if (line.startsWith('0:')) {
                                try {
                                    const data = JSON.parse(line.slice(2));
                                    if (typeof data === 'string') {
                                        content += data;
                                    }
                                } catch { }
                            }
                        }
                    }

                    setMessages(prev => [...prev, {
                        role: 'assistant',
                        content: content || 'Sorry, I encountered an issue. Please try again.',
                        timestamp: new Date()
                    }]);
                }
            } else {
                throw new Error('API call failed');
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col bg-gray-50" style={{ height: '100%', minHeight: '100vh' }}>
            <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 max-w-md text-center">
                            <div className="w-fit px-3 py-1 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                <Link href="https://alhayatgpt.com" target="_blank">
                                    <span className="text-white text-lg font-bold">Al Hayat GPT</span>
                                </Link>
                            </div>
                            <SimpleWelcome />
                        </div>
                    </div>
                )}

                {messages.map((m, index) => (
                    <div
                        key={`fallback_${index}_${m.timestamp.getTime()}`}
                        className={`flex items-start gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div className={`max-w-md ${m.role === "user"
                            ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                            : "bg-white text-gray-800 border border-gray-200"
                            } rounded-2xl px-4 py-3 shadow-lg`}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`text-xs font-medium ${m.role === "user" ? "text-blue-100" : "text-gray-500"}`}>
                                    {m.role === "user" ? "Guest" : "Assistant"}
                                </span>
                                <span className={`text-xs ${m.role === "user" ? "text-blue-200" : "text-gray-400"}`}>
                                    {formatTime(m.timestamp)}
                                </span>
                            </div>
                            <div className="text-sm">
                                {m.role === "assistant" ? (
                                    <div className="chat-message-content">
                                        <div
                                            className="prose-sm max-w-none"
                                            dangerouslySetInnerHTML={{ __html: m.content }}
                                        />
                                    </div>
                                ) : (
                                    <div className="whitespace-pre-line break-words">{m.content}</div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex items-start gap-3 justify-start">
                        <div className="bg-white rounded-2xl px-4 py-3 border border-gray-200 shadow-lg flex items-center gap-2">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                            </div>
                            <span className="text-xs text-gray-500">Thinking...</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex-shrink-0 p-4 bg-gray-50 border-t border-gray-200">
                <form onSubmit={handleSubmit}>
                    <div className="relative flex items-center gap-2">
                        <div className="flex-1 relative">
                            <input
                                className="w-full px-4 py-3 pr-12 rounded-xl bg-white border border-gray-200 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type your message..."
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

function WidgetChatPage() {
    const [contextError, setContextError] = useState<string | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    // Safe context hooks with error handling
    let currentChat: any = null;
    let addConversationTurn: any = null;
    let createNewChat: any = null;
    let getFontClass: any = null;
    let isRTL: boolean = false;
    let getPlaceholderText: any = null;

    try {
        ({ currentChat, addConversationTurn, createNewChat } = useChatContext());
        ({ getFontClass, isRTL, getPlaceholderText } = useLanguage());
    } catch (error) {
        console.error('Context hook error:', error);
        setContextError(error instanceof Error ? error.message : 'Context initialization failed');
        return <FallbackWidget />;
    }

    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [streamingMessage, setStreamingMessage] = useState("");
    const [displayMessages, setDisplayMessages] = useState<Message[]>([]);
    const [hasPermissionIssue, setHasPermissionIssue] = useState(false);
    const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

    const chatRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Simple guest user info
    const firstName = 'Guest';
    const lastName = 'User';
    const fullNameInitials = 'GU';
    const email = '';

    // Simple avatars
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

    // Load external CSS from alhayatgpt.com
    useEffect(() => {
        const loadExternalCSS = () => {
            // Check if CSS is already loaded
            const existingLink = document.querySelector('#alhayat-external-css');
            if (existingLink) return;

            try {
                const link = document.createElement('link');
                link.id = 'alhayat-external-css';
                link.rel = 'stylesheet';
                link.type = 'text/css';
                link.href = 'https://alhayatgpt.com/api/globals.css';
                link.crossOrigin = 'anonymous';

                link.onload = () => {
                    console.log('✅ External CSS loaded successfully from alhayatgpt.com');
                };

                link.onerror = () => {
                    console.warn('⚠️ Failed to load external CSS from alhayatgpt.com');
                };

                document.head.appendChild(link);
                console.log('🎨 Loading external CSS from alhayatgpt.com...');
            } catch (error) {
                console.error('Error loading external CSS:', error);
            }
        };

        loadExternalCSS();
    }, []);

    // Handle clicking on AI-generated messageButton elements (clickable questions)
    useEffect(() => {
        const handleQuestionClick = (e: MouseEvent) => {
            const button = e.target as HTMLElement;
            if (button.dataset.question === "true") {
                const questionText = button.textContent;
                if (questionText && !isLoading) {
                    console.log('🔵 Clicked on AI-generated question:', questionText);
                    setInput(questionText);

                    // Submit the form after a short delay
                    setTimeout(() => {
                        const form = document.querySelector('form');
                        if (form) {
                            const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
                            form.dispatchEvent(submitEvent);
                            console.log('✅ Auto-submitted question as user input');
                        }
                    }, 100);
                }
            }
        };

        document.addEventListener('click', handleQuestionClick);
        return () => document.removeEventListener('click', handleQuestionClick);
    }, [setInput, isLoading]);

    // Simplified initialization
    useEffect(() => {
        const initializeWidget = async () => {
            try {
                console.log('Widget initialization starting...');

                // Simple parent messaging
                if (window.parent && window.parent !== window) {
                    const urlParams = new URLSearchParams(window.location.search);
                    const parentOrigin = urlParams.get('parentOrigin') || '*';

                    // Send ready message
                    try {
                        window.parent.postMessage({ type: 'WIDGET_READY' }, parentOrigin);
                        window.parent.postMessage({ type: 'USER_SIGNED_OUT' }, parentOrigin);
                        console.log('Parent messages sent successfully');
                    } catch (error) {
                        console.warn('Could not send parent messages:', error);
                    }
                }

                // Create new chat if needed
                if (createNewChat && !currentChat) {
                    try {
                        await createNewChat();
                        console.log('New chat created successfully');
                    } catch (error) {
                        console.warn('Could not create new chat:', error);
                    }
                }

                setIsInitialized(true);
                console.log('Widget initialization completed');
            } catch (error) {
                console.error('Widget initialization error:', error);
                setContextError(error instanceof Error ? error.message : 'Initialization failed');
            }
        };

        initializeWidget();
    }, []); // Removed dependencies to prevent re-initialization

    // Load messages when currentChat changes
    useEffect(() => {
        if (!isInitialized) return;

        try {
            if (currentChat && currentChat.messages) {
                const messagesWithDates = currentChat.messages.map((msg: any, index: number) => ({
                    ...msg,
                    timestamp: typeof msg.timestamp === 'string' ? new Date(msg.timestamp) : msg.timestamp,
                    uniqueKey: msg.uniqueKey || `msg_${index}_${Date.now()}`,
                }));

                setDisplayMessages(messagesWithDates);
                setStreamingMessage("");
                setIsLoading(false);
                console.log('Messages loaded:', messagesWithDates.length);
            } else {
                setDisplayMessages([]);
                setStreamingMessage("");
                setIsLoading(false);
            }
        } catch (error) {
            console.error('Error loading messages:', error);
            setDisplayMessages([]);
        }
    }, [currentChat?._id, isInitialized]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [displayMessages, streamingMessage]);

    // If there's a context error, show fallback
    if (contextError) {
        console.log('Showing fallback widget due to context error:', contextError);
        return <FallbackWidget />;
    }

    // Handle form submission
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

        // Add user message to display
        setDisplayMessages(prev => [...prev, userMessage]);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...(currentChat?.messages || []), userMessage].map(msg => ({
                        role: msg.role,
                        content: msg.content,
                        firstName: msg.firstName || firstName,
                        lastName: msg.lastName || lastName,
                        email: msg.email || email,
                    })),
                    isWidget: true,
                    isGuest: true
                })
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

            // Simple streaming handling
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.trim() === '') continue;

                    if (line.startsWith('0:')) {
                        try {
                            const data = line.slice(2);
                            const content = JSON.parse(data);
                            if (typeof content === 'string') {
                                aiResponseContent += content;
                                setStreamingMessage(aiResponseContent);
                            }
                        } catch {
                            // Ignore parsing errors
                        }
                    }
                }
            }

            const aiMessage: Message = {
                role: 'assistant',
                content: aiResponseContent || 'I apologize, but I encountered an issue. Please try again.',
                timestamp: new Date(),
                uniqueKey: `msg_ai_${Date.now()}`
            };

            setDisplayMessages(prev => [...prev, aiMessage]);
            setStreamingMessage("");

            // Save conversation (optional, don't fail if it errors)
            if (addConversationTurn) {
                try {
                    await addConversationTurn(userMessage, aiMessage);
                } catch (error) {
                    console.error('Error saving conversation:', error);
                    if (isSanityPermissionError(error)) {
                        setHasPermissionIssue(true);
                    }
                }
            }

            try {
                trackChatEvent('RECEIVE_MESSAGE');
            } catch (error) {
                console.warn('Analytics tracking failed:', error);
            }

        } catch (error) {
            console.error('Chat error:', error);

            const errorMessage: Message = {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date(),
                uniqueKey: `msg_error_${Date.now()}`
            };

            setDisplayMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
            setStreamingMessage("");
        }
    };

    // Sanitize HTML content to protect against XSS
    const sanitizeHtml = (html: string) => {
        // Simple HTML sanitization - remove script tags and dangerous attributes
        return html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/on\w+="[^"]*"/g, '')
            .replace(/javascript:/gi, '');
    };

    // Process message content for proper styling and clickable questions
    const processMessageContent = (content: string) => {
        // Remove any markdown code blocks that might slip through
        let processedContent = content
            .replace(/```html\s*/g, '')
            .replace(/```\s*/g, '')
            .replace(/`{3,}/g, '');

        // Sanitize the HTML content
        processedContent = sanitizeHtml(processedContent);

        console.log('📝 Processed and sanitized AI message content');
        return processedContent;
    };

    // Simple copy function
    const copyMessage = async (messageContent: string, messageId: string) => {
        try {
            const textContent = messageContent.replace(/<[^>]*>/g, '');

            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(textContent);
            } else {
                // Fallback
                const textArea = document.createElement('textarea');
                textArea.value = textContent;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
            }

            setCopiedMessageId(messageId);
            setTimeout(() => setCopiedMessageId(null), 2000);

            try {
                trackChatEvent('SEND_MESSAGE', `Copy message - length: ${textContent.length}`);
            } catch (error) {
                console.warn('Analytics tracking failed:', error);
            }
        } catch (error) {
            console.error('Copy failed:', error);
        }
    };

    // Combine messages for display
    const allMessages = [...displayMessages];
    if (streamingMessage) {
        allMessages.push({
            role: 'assistant',
            content: streamingMessage,
            timestamp: new Date(),
            uniqueKey: `msg_streaming_${Date.now()}`
        });
    }

    // Show loading until initialized
    if (!isInitialized) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Loading chat...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col bg-gray-50" style={{ height: '100%', minHeight: '100vh' }}>
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
            <div ref={chatRef} className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
                {allMessages.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 max-w-md text-center">
                            <div className="w-fit px-3 py-1 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                <Link href="https://alhayatgpt.com" target="_blank">
                                    <span className="text-white text-lg font-bold">Al Hayat GPT</span>
                                </Link>
                            </div>
                            <SimpleWelcome />
                        </div>
                    </div>
                )}

                {allMessages.map((m) => {
                    const timestamp = formatTime(m.timestamp);
                    const isStreamingThisMessage = m.uniqueKey?.includes('streaming');

                    return (
                        <div
                            key={m.uniqueKey || `fallback_${m.role}_${m.timestamp.getTime()}`}
                            className={`flex items-start gap-3 ${m.role === "user"
                                ? (isRTL ? "justify-start" : "justify-end")
                                : (isRTL ? "justify-end" : "justify-start")
                                }`}
                        >
                            {m.role === "assistant" && !isRTL && AVATARS.ai}

                            <div
                                className={`${m.role === "user" ? "max-w-xs" : "max-w-md"} ${m.role === "user"
                                    ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                                    : "bg-white text-gray-800 border border-gray-200"
                                    } rounded-2xl px-4 py-3 shadow-lg`}
                            >
                                <div className={`flex items-center gap-2 mb-1 ${isRTL ? 'justify-end' : 'justify-start'}`}>
                                    <span className={`text-xs font-medium ${m.role === "user" ? "text-blue-100" : "text-gray-500"}`}>
                                        {m.role === "user" ? "Guest" : "Assistant"}
                                    </span>
                                    <span className={`text-xs ${m.role === "user" ? "text-blue-200" : "text-gray-400"}`}>
                                        {timestamp}
                                    </span>
                                    {m.role === "assistant" && m.content && !isStreamingThisMessage && (
                                        <button
                                            onClick={() => copyMessage(m.content, m.uniqueKey || `msg_${m.timestamp.getTime()}`)}
                                            className={`${isRTL ? 'mr-auto' : 'ml-auto'} p-1 rounded-lg hover:bg-gray-100 transition-colors`}
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

                                <div className={`text-sm ${getFontClass ? getFontClass() : ''}`}>
                                    {m.role === "assistant" ? (
                                        <div className="chat-message-content">
                                            {m.content ? (
                                                <div
                                                    className="prose-sm max-w-none"
                                                    dangerouslySetInnerHTML={{ __html: processMessageContent(m.content) }}
                                                />
                                            ) : (
                                                <div className="text-gray-500 italic">No response received</div>
                                            )}
                                            {isStreamingThisMessage && (
                                                <span className="inline-block w-1 h-4 bg-blue-500 rounded-sm animate-pulse ml-1"></span>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="whitespace-pre-line break-words">
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
                        <div className="bg-white rounded-2xl px-4 py-3 border border-gray-200 shadow-lg flex items-center gap-2">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                            </div>
                            <span className="text-xs text-gray-500">Thinking...</span>
                        </div>
                        {isRTL && AVATARS.ai}
                    </div>
                )}
            </div>

            {/* Input Form */}
            <div className="flex-shrink-0 p-4 bg-gray-50 border-t border-gray-200">
                <form onSubmit={handleSubmit}>
                    <div className="relative flex items-center gap-2">
                        <div className="flex-1 relative">
                            <input
                                ref={inputRef}
                                className={`w-full px-4 py-3 pr-12 rounded-xl bg-white border border-gray-200 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${getFontClass ? getFontClass() : ''}`}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={getPlaceholderText ? getPlaceholderText() : "Type your message..."}
                                disabled={isLoading}
                                dir={isRTL ? 'rtl' : 'ltr'}
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className={`absolute ${isRTL ? 'left-2' : 'right-2'} top-1/2 -translate-y-1/2 p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
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

// Error Boundary Component
interface ErrorBoundaryState {
    hasError: boolean;
    errorDetails?: string;
}

interface ErrorBoundaryProps {
    children: React.ReactNode;
}

class WidgetErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        console.error('Error boundary triggered:', error);
        return {
            hasError: true,
            errorDetails: error.message
        };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Widget error boundary caught an error:', error, errorInfo);
        console.error('Error stack:', error.stack);
        console.error('Component stack:', errorInfo.componentStack);
    }

    handleRefresh = () => {
        // For iframes, try to reload the iframe source, otherwise reload the page
        try {
            if (window.parent && window.parent !== window) {
                // We're in an iframe - try to reload just the iframe
                window.location.reload();
            } else {
                // We're in the main window
                window.location.reload();
            }
        } catch (error) {
            console.error('Refresh failed:', error);
            // Force a location reload as fallback
            window.location.href = window.location.href;
        }
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex items-center justify-center h-96 p-6">
                    <div className="text-center max-w-sm">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">⚠️</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            The chat widget encountered an error. Please refresh to try again.
                        </p>
                        {this.state.errorDetails && (
                            <p className="text-xs text-gray-500 mb-4 font-mono bg-gray-100 p-2 rounded">
                                Error: {this.state.errorDetails}
                            </p>
                        )}
                        <div className="space-y-2">
                            <button
                                onClick={this.handleRefresh}
                                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                Refresh Widget
                            </button>
                            <button
                                onClick={() => this.setState({ hasError: false })}
                                className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// Main widget export with error boundary
export default function WidgetPage() {
    const [isClient, setIsClient] = useState(false);
    const [initError, setInitError] = useState<string | null>(null);

    useEffect(() => {
        try {
            console.log('Widget page mounting...');
            setIsClient(true);
        } catch (error) {
            console.error('Error setting client state:', error);
            setInitError(error instanceof Error ? error.message : 'Client initialization failed');
        }
    }, []);

    if (initError) {
        return (
            <div className="flex items-center justify-center h-96 p-6">
                <div className="text-center max-w-sm">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">⚠️</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Initialization Failed</h3>
                    <p className="text-sm text-gray-600 mb-4">
                        {initError}
                    </p>
                    <FallbackWidget />
                </div>
            </div>
        );
    }

    if (!isClient) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <WidgetErrorBoundary>
            <LanguageProvider>
                <GuestChatProvider>
                    <WidgetChatPage />
                </GuestChatProvider>
            </LanguageProvider>
        </WidgetErrorBoundary>
    );
} 