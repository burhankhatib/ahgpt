"use client";

import { useState } from 'react';
import { format } from 'date-fns';
import {
    ClockIcon,
    TrashIcon,
    PlusIcon,
    XMarkIcon,
    ExclamationTriangleIcon,
    EyeSlashIcon,
    EyeIcon
} from '@heroicons/react/24/outline';
import { useChat } from '@/contexts/ChatContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { trackChatEvent } from '@/utils/analytics';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const { isRTL } = useLanguage();
    const { chats, currentChat, switchChat, hideChat, hideAllChats, refreshChats, createNewChat, isInvisibleMode, toggleInvisibleMode } = useChat();
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleNewChat = () => {
        console.log('Sidebar: Creating new chat');
        trackChatEvent('CREATE_CHAT', 'New chat from sidebar');
        createNewChat();
        onClose();
    };

    const handleChatClick = (chatId: string) => {
        switchChat(chatId);
        onClose();
    };

    const handleHideChat = async (e: React.MouseEvent, chatId: string) => {
        e.stopPropagation();

        if (window.confirm('Are you sure you want to delete this chat?')) {
            try {
                await hideChat(chatId);
                trackChatEvent('DELETE_CHAT', `Chat deleted: ${chatId}`);
            } catch (error) {
                console.error('Failed to delete chat:', error);
            }
        }
    };

    const handleHideAllChats = async () => {
        if (window.confirm('Are you sure you want to delete ALL chats?')) {
            try {
                await hideAllChats();
                trackChatEvent('DELETE_CHAT', 'All chats deleted');
            } catch (error) {
                console.error('Failed to delete all chats:', error);
            }
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await refreshChats();
            trackChatEvent('SWITCH_CHAT', 'Manual refresh');
        } catch (error) {
            console.error('Failed to refresh chats:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed top-0 ${isRTL ? 'right-0' : 'left-0'} h-full w-80 bg-white/95 backdrop-blur-md border-r border-gray-200/50 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : isRTL ? 'translate-x-full' : '-translate-x-full'
                }`}>

                {/* Header */}
                <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-gray-200/50">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm font-bold">AH</span>
                        </div>
                        <h2 className="text-lg font-semibold text-gray-800">Chat History</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-100/80 transition-colors duration-200"
                    >
                        <XMarkIcon className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                {/* New Chat Button */}
                <div className="flex-shrink-0 p-4 border-b border-gray-200/30">
                    <button
                        onClick={handleNewChat}
                        className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                        <PlusIcon className="w-5 h-5" />
                        <span className="font-medium">New Chat</span>
                    </button>
                </div>

                {/* Header Actions */}
                <div className="flex-shrink-0 flex flex-col justify-evenly gap-2 px-4 py-2 border-t border-gray-200/30">
                    {/* Invisible Mode Toggle */}
                    <button
                        onClick={toggleInvisibleMode}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${isInvisibleMode
                            ? 'bg-purple-100/80 text-purple-700 hover:bg-purple-200/80'
                            : 'bg-gray-100/80 text-gray-700 hover:bg-gray-200/80'
                            }`}
                    >
                        {isInvisibleMode ? <EyeSlashIcon className="w-6 h-6" /> : <EyeIcon className="w-4 h-4" />}
                        {isInvisibleMode ? 'Invisible Mode: ON' : 'Invisible Mode: OFF'}
                    </button>

                    {/* Hide All Chats */}
                    {chats.length > 0 && (
                        <button
                            onClick={handleHideAllChats}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50/80 rounded-xl transition-all duration-200 text-sm font-medium"
                        >
                            <TrashIcon className="w-6 h-6" />
                            Delete All Chats
                        </button>
                    )}
                </div>

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto p-4 min-h-0">
                    <div className="space-y-4">
                        {/* Header with refresh button */}
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                Recent Conversations
                            </h3>
                            <button
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                className="p-1.5 rounded-lg hover:bg-gray-100/80 transition-colors duration-200 disabled:opacity-50"
                                title="Refresh chats"
                            >
                                <ClockIcon className={`w-4 h-4 text-gray-500 ${isRefreshing ? 'animate-spin' : ''}`} />
                            </button>
                        </div>

                        {/* Chat List */}
                        <div className="space-y-2">
                            {chats.length > 0 ? (
                                chats.map((chat, index) => (
                                    <div
                                        key={chat._id || chat.uniqueKey || `chat-${index}-${chat.createdAt.getTime()}`}
                                        onClick={() => handleChatClick(chat._id || '')}
                                        className={`group p-4 rounded-2xl border transition-all duration-200 cursor-pointer backdrop-blur-sm ${currentChat?._id === chat._id
                                            ? 'bg-blue-50/80 border-blue-200/50 shadow-lg'
                                            : 'bg-white/60 border-gray-200/30 hover:bg-white/80 hover:border-gray-300/50 hover:shadow-lg'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-semibold text-gray-900 truncate mb-1">
                                                    {chat.title}
                                                </h3>
                                                <p className="text-xs text-gray-500 mb-2">
                                                    {format(new Date(chat.updatedAt), 'MMM d, h:mm a')}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-gray-400">
                                                        {chat.messages.length} message{chat.messages.length !== 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                <button
                                                    onClick={(e) => handleHideChat(e, chat._id || '')}
                                                    className="p-2 rounded-lg hover:bg-red-100/80 transition-colors duration-200"
                                                    title="Hide Chat"
                                                >
                                                    <TrashIcon className="w-4 h-4 text-red-600" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12">
                                    <ClockIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500 text-sm">No conversations yet</p>
                                    <p className="text-gray-400 text-xs mt-1">Start a new chat to see it here</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>


            </div>
        </>
    );
} 