"use client";

import React from 'react';
import { format } from 'date-fns';
import { Chat } from '@/types/chat';
import {
    XMarkIcon,
    UserIcon,
    ComputerDesktopIcon,
    ClockIcon,
    MapPinIcon,
    LanguageIcon,
    DocumentDuplicateIcon,
    CheckIcon,
    TrashIcon
} from '@heroicons/react/24/outline';

interface ChatDetailModalProps {
    chat: Chat | null;
    isOpen: boolean;
    onClose: () => void;
    onDelete?: (chatId: string) => void;
}

export default function ChatDetailModal({ chat, isOpen, onClose, onDelete }: ChatDetailModalProps) {
    const [copiedMessageId, setCopiedMessageId] = React.useState<string | null>(null);

    if (!isOpen || !chat) return null;

    // Sanitize HTML content to protect against XSS (same as chat page)
    const sanitizeHtml = (html: string) => {
        // Simple HTML sanitization - remove script tags and dangerous attributes
        return html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/on\w+="[^"]*"/g, '')
            .replace(/javascript:/gi, '');
    };

    // Process message content - sanitizes HTML for safe rendering
    const processMessageContent = (content: string) => {
        // Remove any markdown code blocks that might slip through
        let processedContent = content
            .replace(/```html\s*/g, '')
            .replace(/```\s*/g, '')
            .replace(/`{3,}/g, '');

        // Sanitize the HTML content
        processedContent = sanitizeHtml(processedContent);

        return processedContent;
    };

    const isGuest = chat.user.clerkId.startsWith('guest_');
    const source = isGuest ? 'SDK Widget' : 'Website';

    // Helper function to get country flag from country name
    const getCountryFlag = (countryName: string): string => {
        const countryFlags: Record<string, string> = {
            'United States': '🇺🇸', 'USA': '🇺🇸', 'US': '🇺🇸',
            'United Kingdom': '🇬🇧', 'UK': '🇬🇧', 'England': '🇬🇧', 'Britain': '🇬🇧',
            'Canada': '🇨🇦', 'Germany': '🇩🇪', 'France': '🇫🇷', 'Italy': '🇮🇹',
            'Spain': '🇪🇸', 'Netherlands': '🇳🇱', 'Belgium': '🇧🇪', 'Sweden': '🇸🇪',
            'Norway': '🇳🇴', 'Denmark': '🇩🇰', 'Finland': '🇫🇮', 'Poland': '🇵🇱',
            'Russia': '🇷🇺', 'China': '🇨🇳', 'Japan': '🇯🇵', 'South Korea': '🇰🇷',
            'India': '🇮🇳', 'Australia': '🇦🇺', 'Brazil': '🇧🇷', 'Mexico': '🇲🇽',
            'Argentina': '🇦🇷', 'Chile': '🇨🇱', 'Egypt': '🇪🇬', 'Saudi Arabia': '🇸🇦',
            'Israel': '🇮🇱', 'Turkey': '🇹🇷', 'Pakistan': '🇵🇰', 'Bangladesh': '🇧🇩',
            'Indonesia': '🇮🇩', 'Thailand': '🇹🇭', 'Vietnam': '🇻🇳', 'Philippines': '🇵🇭',
            'Malaysia': '🇲🇾', 'Singapore': '🇸🇬', 'United Arab Emirates': '🇦🇪',
            'South Africa': '🇿🇦', 'Nigeria': '🇳🇬', 'Kenya': '🇰🇪', 'Morocco': '🇲🇦',
        };
        return countryFlags[countryName] || '🌍';
    };

    // Helper function to get language display name
    const getLanguageName = (code: string): string => {
        const languages: Record<string, { name: string; flag: string }> = {
            'en': { name: 'English', flag: '🇺🇸' },
            'ar': { name: 'Arabic', flag: '🇸🇦' },
            'he': { name: 'Hebrew', flag: '🇮🇱' },
            'zh': { name: 'Chinese', flag: '🇨🇳' },
            'hi': { name: 'Hindi', flag: '🇮🇳' },
            'es': { name: 'Spanish', flag: '🇪🇸' },
            'fr': { name: 'French', flag: '🇫🇷' },
            'de': { name: 'German', flag: '🇩🇪' },
            'ru': { name: 'Russian', flag: '🇷🇺' },
            'ja': { name: 'Japanese', flag: '🇯🇵' },
            'pt': { name: 'Portuguese', flag: '🇧🇷' },
            'ko': { name: 'Korean', flag: '🇰🇷' },
            'tr': { name: 'Turkish', flag: '🇹🇷' },
            'ur': { name: 'Urdu', flag: '🇵🇰' },
            'bn': { name: 'Bengali', flag: '🇧🇩' },
            'id': { name: 'Indonesian', flag: '🇮🇩' },
            'vi': { name: 'Vietnamese', flag: '🇻🇳' },
            'th': { name: 'Thai', flag: '🇹🇭' },
            'fi': { name: 'Finnish', flag: '🇫🇮' },
            'sv': { name: 'Swedish', flag: '🇸🇪' },
            'no': { name: 'Norwegian', flag: '🇳🇴' },
            'da': { name: 'Danish', flag: '🇩🇰' },
            'ms': { name: 'Malay', flag: '🇲🇾' },
            'te': { name: 'Telugu', flag: '🇮🇳' },
            'mr': { name: 'Marathi', flag: '🇮🇳' },
            'ta': { name: 'Tamil', flag: '🇮🇳' },
            'bal': { name: 'Balochi', flag: '🇵🇰' },
        };
        const lang = languages[code];
        return lang ? `${lang.flag} ${lang.name}` : code.toUpperCase();
    };

    const copyMessage = async (messageContent: string, messageId: string) => {
        try {
            await navigator.clipboard.writeText(messageContent);
            setCopiedMessageId(messageId);
            setTimeout(() => setCopiedMessageId(null), 2000);
        } catch (error) {
            console.error('Failed to copy message:', error);
        }
    };

    // Calculate user behavior metrics
    const userMessages = chat.messages.filter(m => m.role === 'user');
    const assistantMessages = chat.messages.filter(m => m.role === 'assistant');
    const avgUserMessageLength = userMessages.reduce((sum, m) => sum + m.content.length, 0) / userMessages.length;
    const avgAssistantMessageLength = assistantMessages.reduce((sum, m) => sum + m.content.length, 0) / assistantMessages.length;

    const conversationDuration = chat.messages.length > 1
        ? new Date(chat.messages[chat.messages.length - 1].timestamp).getTime() - new Date(chat.messages[0].timestamp).getTime()
        : 0;
    const durationMinutes = Math.round(conversationDuration / (1000 * 60));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            {/* CSS styles for proper HTML rendering in modal */}
            <style dangerouslySetInnerHTML={{
                __html: `
                /* Clickable questions styling */
                .chat-message-content a.messageButton,
                .chat-message-content .suggested-questions a[data-question="true"] {
                    display: block !important;
                    text-decoration: none !important;
                    cursor: pointer !important;
                }
                
                .chat-message-content a.messageButton:hover,
                .chat-message-content .suggested-questions a[data-question="true"]:hover {
                    text-decoration: none !important;
                }

                /* Enhanced table styling for modal chat content */
                .chat-message-content table {
                    margin: 1.5rem 0 !important;
                    border-radius: 12px !important;
                    overflow: hidden !important;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
                    border: 1px solid #e5e7eb !important;
                    background: white !important;
                    width: 100% !important;
                }

                .chat-message-content th {
                    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
                    padding: 12px 16px !important;
                    border-bottom: 2px solid #d1d5db !important;
                    font-weight: 600 !important;
                    font-size: 13px !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.5px !important;
                    color: #374151 !important;
                    min-width: 100px !important;
                    white-space: nowrap !important;
                }

                .chat-message-content td {
                    padding: 12px 16px !important;
                    border-bottom: 1px solid #f3f4f6 !important;
                    color: #4b5563 !important;
                    line-height: 1.6 !important;
                    min-width: 100px !important;
                    word-wrap: break-word !important;
                    max-width: 250px !important;
                    vertical-align: top !important;
                }

                .chat-message-content tr:hover {
                    background-color: rgba(248, 250, 252, 0.7) !important;
                    transition: background-color 0.15s ease-in-out !important;
                }

                .chat-message-content tbody tr:nth-child(even) {
                    background-color: rgba(248, 250, 252, 0.3) !important;
                }

                .chat-message-content tr:last-child td {
                    border-bottom: none !important;
                }

                /* Responsive adjustments for modal */
                .chat-message-content table {
                    font-size: 13px !important;
                }
                
                .chat-message-content th,
                .chat-message-content td {
                    padding: 10px 12px !important;
                    min-width: 80px !important;
                    max-width: 200px !important;
                }

                /* General prose styling improvements for modal */
                .chat-message-content {
                    line-height: 1.6 !important;
                }

                .chat-message-content h1, .chat-message-content h2, .chat-message-content h3 {
                    margin-top: 1.5rem !important;
                    margin-bottom: 0.75rem !important;
                    font-weight: 600 !important;
                }

                .chat-message-content p {
                    margin-bottom: 1rem !important;
                }

                .chat-message-content ul, .chat-message-content ol {
                    margin: 1rem 0 !important;
                    padding-left: 1.5rem !important;
                }

                .chat-message-content li {
                    margin-bottom: 0.5rem !important;
                }

                .chat-message-content blockquote {
                    border-left: 4px solid #e5e7eb !important;
                    padding-left: 1rem !important;
                    margin: 1rem 0 !important;
                    font-style: italic !important;
                    color: #6b7280 !important;
                }

                .chat-message-content code {
                    background-color: #f3f4f6 !important;
                    padding: 0.2rem 0.4rem !important;
                    border-radius: 0.25rem !important;
                    font-size: 0.875em !important;
                }

                .chat-message-content pre {
                    background-color: #f3f4f6 !important;
                    padding: 1rem !important;
                    border-radius: 0.5rem !important;
                    overflow-x: auto !important;
                    margin: 1rem 0 !important;
                }

                .chat-message-content strong {
                    font-weight: 600 !important;
                }

                .chat-message-content em {
                    font-style: italic !important;
                }
                `
            }} />
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-gray-900 truncate pr-4">
                            {chat.title}
                        </h2>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                                <UserIcon className="h-4 w-4" />
                                <span>{chat.user.firstName} {chat.user.lastName}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <ComputerDesktopIcon className="h-4 w-4" />
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${isGuest
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-blue-100 text-blue-800'
                                    }`}>
                                    {source}
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                <ClockIcon className="h-4 w-4" />
                                <span>{format(chat.updatedAt, 'MMM d, yyyy HH:mm')}</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>

                {/* Chat Metadata */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        {/* Language */}
                        {chat.detectedLanguage && (
                            <div className="flex items-center gap-2">
                                <LanguageIcon className="h-4 w-4 text-purple-600" />
                                <span>{getLanguageName(chat.detectedLanguage)}</span>
                            </div>
                        )}

                        {/* Location */}
                        {chat.location?.country && (
                            <div className="flex items-center gap-2">
                                <MapPinIcon className="h-4 w-4 text-orange-600" />
                                <span>
                                    {getCountryFlag(chat.location.country)} {chat.location.country}
                                    {chat.location.city && `, ${chat.location.city}`}
                                </span>
                            </div>
                        )}

                        {/* Message Count */}
                        <div className="flex items-center gap-2">
                            <span className="text-blue-600">💬</span>
                            <span>{chat.messages.length} messages</span>
                        </div>

                        {/* Duration */}
                        {durationMinutes > 0 && (
                            <div className="flex items-center gap-2">
                                <ClockIcon className="h-4 w-4 text-green-600" />
                                <span>{durationMinutes} min duration</span>
                            </div>
                        )}
                    </div>

                    {/* Behavior Analysis */}
                    <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">User Behavior Analysis</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-600">
                            <div>
                                <span className="font-medium">Avg. User Message:</span> {Math.round(avgUserMessageLength)} chars
                            </div>
                            <div>
                                <span className="font-medium">Avg. AI Response:</span> {Math.round(avgAssistantMessageLength)} chars
                            </div>
                            <div>
                                <span className="font-medium">Engagement Level:</span> {
                                    userMessages.length > 10 ? 'High' : userMessages.length > 5 ? 'Medium' : 'Low'
                                }
                            </div>
                        </div>
                    </div>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {chat.messages.map((message, index) => (
                        <div
                            key={message.uniqueKey || `msg-${index}`}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-xs md:max-w-sm lg:max-w-md xl:max-w-lg rounded-2xl px-4 py-3 ${message.role === 'user'
                                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-800 border border-gray-200'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className={`text-xs font-medium ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                                        }`}>
                                        {message.role === 'user' ? 'User' : 'Assistant'}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs ${message.role === 'user' ? 'text-blue-200' : 'text-gray-400'
                                            }`}>
                                            {format(message.timestamp, 'HH:mm')}
                                        </span>
                                        <button
                                            onClick={() => copyMessage(message.content, message.uniqueKey || `msg-${index}`)}
                                            className={`p-1 rounded hover:bg-black hover:bg-opacity-10 transition-colors ${message.role === 'user' ? 'text-blue-100 hover:text-white' : 'text-gray-400 hover:text-gray-600'
                                                }`}
                                            title="Copy message"
                                        >
                                            {copiedMessageId === (message.uniqueKey || `msg-${index}`) ? (
                                                <CheckIcon className="h-3 w-3" />
                                            ) : (
                                                <DocumentDuplicateIcon className="h-3 w-3" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                                    {message.role === 'assistant' ? (
                                        <div
                                            className="chat-message-content prose prose-sm max-w-none text-gray-800"
                                            dangerouslySetInnerHTML={{ __html: processMessageContent(message.content) }}
                                        />
                                    ) : (
                                        message.content
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            <span className="font-medium">Chat ID:</span> {chat._id}
                        </div>
                        <div className="flex items-center gap-3">
                            {onDelete && (
                                <button
                                    onClick={() => {
                                        if (confirm('Are you sure you want to delete this chat? This action cannot be undone.')) {
                                            onDelete(chat._id!);
                                            onClose();
                                        }
                                    }}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                                >
                                    <TrashIcon className="h-4 w-4" />
                                    Delete Chat
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 