"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { Chat, Message } from '@/types/chat';
import * as chatService from '@/sanity/chat';
import { showNotification } from '@/utils/notifications';
import { getSanityPermissionError, isSanityPermissionError } from '@/utils/sanity-permissions';

interface ChatContextType {
    currentChat: Chat | null;
    chats: Chat[];
    createNewChat: () => void;
    addMessage: (message: Message) => void;
    addMessages: (messages: Message[]) => Promise<void>;
    addConversationTurn: (userMessage: Message, assistantMessage: Message) => Promise<void>;
    switchChat: (chatId: string) => void;
    deleteChat: (chatId: string) => Promise<void>;
    deleteAllChats: () => Promise<void>;
    setCurrentChat: (chat: Chat | null) => void;
    refreshChats: () => Promise<void>;
    canManageChats: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
    const { user } = useUser();
    const [currentChat, setCurrentChat] = useState<Chat | null>(null);
    const [chats, setChats] = useState<Chat[]>([]);

    // Generate or retrieve persistent guest ID
    const getGuestId = () => {
        if (typeof window !== 'undefined') {
            let guestId = localStorage.getItem('ahgpt_guest_id');
            if (!guestId) {
                guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
                localStorage.setItem('ahgpt_guest_id', guestId);
            }
            return guestId;
        }
        return `guest_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    };

    // Extract domain from parent origin for guest users
    const getGuestDomain = () => {
        if (typeof window !== 'undefined') {
            // First try to get parentOrigin from URL params (widget context)
            const urlParams = new URLSearchParams(window.location.search);
            const parentOrigin = urlParams.get('parentOrigin');

            if (parentOrigin && parentOrigin !== window.location.origin) {
                try {
                    const url = new URL(parentOrigin);
                    return url.hostname;
                } catch (error) {
                    console.warn('Failed to parse parent origin:', parentOrigin, error);
                }
            }

            // Fallback to document referrer
            if (document.referrer && document.referrer !== window.location.origin) {
                try {
                    const url = new URL(document.referrer);
                    return url.hostname;
                } catch (error) {
                    console.warn('Failed to parse referrer:', document.referrer, error);
                }
            }
        }

        return 'Unknown';
    };

    // Determine if user can manage chats (only authenticated users can delete)
    const canManageChats = !!user;

    const loadChats = useCallback(async () => {
        // Get user ID - either authenticated user or guest ID
        const userId = user ? user.id : getGuestId();

        if (!userId) {
            setChats([]);
            return;
        }

        try {
            console.log('Loading chats from Sanity for user:', userId, 'isAuthenticated:', !!user);
            const userChats = await chatService.getUserChats(userId);

            console.log('Loaded chats from Sanity:', {
                userChatsCount: userChats.length,
                isAuthenticated: !!user,
                userChats: userChats.map(chat => ({
                    id: chat._id,
                    title: chat.title,
                    messageCount: chat.messages.length,
                    user: chat.user
                }))
            });

            setChats(userChats);
        } catch (error) {
            console.error('Error loading chats:', error);
            showNotification({
                title: 'Error',
                message: 'Failed to load chats from database',
                type: 'error'
            });
        }
    }, [user]);

    // Load chats when user changes
    useEffect(() => {
        loadChats(); // Load chats for both authenticated and guest users
    }, [loadChats]);

    const createNewChat = () => {
        // Clear current chat state first
        setCurrentChat(null);

        const uniqueKey = `chat_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        const guestDomain = getGuestDomain();

        // Extract user data from Clerk with comprehensive fallbacks
        const userData = user ? {
            firstName: user.firstName || user.fullName?.split(' ')[0] || user.username || 'User',
            lastName: user.lastName || user.fullName?.split(' ')[1] || '',
            email: user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress || '',
            clerkId: user.id
        } : {
            firstName: 'Guest',
            lastName: guestDomain, // Use domain as last name for guest users
            email: 'guest@example.com',
            clerkId: getGuestId() // Use persistent guest ID
        };

        // Log user data for debugging (remove in production)
        if (process.env.NODE_ENV === 'development') {
            console.log('Creating new chat with user data:', {
                isAuthenticated: !!user,
                userData,
                guestDomain,
                parentOrigin: typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('parentOrigin') : null,
                referrer: typeof window !== 'undefined' ? document.referrer : null,
                userObject: user ? {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    username: user.username,
                    emailAddresses: user.emailAddresses?.length,
                    primaryEmail: user.primaryEmailAddress?.emailAddress,
                    fullName: user.fullName
                } : null
            });
        }

        const newChat: Chat = {
            user: userData,
            title: 'New Chat',
            messages: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            analytics: {
                viewCount: 0,
                exportCount: 0
            },
            uniqueKey: uniqueKey,
            _id: uniqueKey // Use uniqueKey as temporary ID
        };

        // Set as current chat
        // Note: All chats will now be synced to Sanity, but guests cannot delete them
        setCurrentChat(newChat);
    };

    const addMessage = async (message: Message) => {
        if (!currentChat) return;

        const messageWithKey = {
            ...message,
            uniqueKey: message.uniqueKey || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
        };

        const updatedChat = {
            ...currentChat,
            messages: [...currentChat.messages, messageWithKey],
            title: currentChat.messages.length === 0 && message.role === 'user'
                ? message.content.slice(0, 100).trim() + (message.content.length > 100 ? '...' : '')
                : currentChat.title,
            updatedAt: new Date()
        };

        // Update local state immediately for responsive UI
        setCurrentChat(updatedChat);

        // Save to Sanity for all users (authenticated and guests)
        try {
            const guestDomain = getGuestDomain();

            // Ensure the chat has the latest user data
            const freshUserData = user ? {
                firstName: user.firstName || user.fullName?.split(' ')[0] || user.username || 'User',
                lastName: user.lastName || user.fullName?.split(' ')[1] || '',
                email: user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress || '',
                clerkId: user.id
            } : {
                firstName: 'Guest',
                lastName: guestDomain, // Use domain as last name for guest users
                email: 'guest@example.com',
                clerkId: getGuestId()
            };

            const chatWithFreshUserData = {
                ...updatedChat,
                user: freshUserData
            };

            console.log('Saving chat with message to Sanity:', {
                messageRole: message.role,
                messageContent: message.content.slice(0, 100) + '...',
                totalMessages: chatWithFreshUserData.messages.length,
                messageTypes: chatWithFreshUserData.messages.map(m => m.role),
                chatUser: freshUserData,
                guestDomain,
                isAuthenticated: !!user,
                clerkUser: user ? {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    fullName: user.fullName,
                    username: user.username,
                    primaryEmail: user.primaryEmailAddress?.emailAddress,
                    emailAddresses: user.emailAddresses?.length
                } : null
            });

            const savedChat = await chatService.saveChat(chatWithFreshUserData);
            console.log('Chat saved successfully to Sanity:', {
                chatId: savedChat._id,
                messageCount: savedChat.messages.length,
                messageTypes: savedChat.messages.map(m => m.role),
                isAuthenticated: !!user
            });

            // Update with the saved version (which might have a proper _id)
            setCurrentChat(savedChat);
            // Only reload chats if this is a new chat (no _id yet) and user is authenticated
            if ((!currentChat._id || currentChat._id === currentChat.uniqueKey) && user) {
                await loadChats();
            }
        } catch (error) {
            console.error('Error saving chat:', error);

            // Check if it's a permissions error
            if (isSanityPermissionError(error)) {
                const permissionError = getSanityPermissionError(error);
                console.warn('Sanity permissions issue:', permissionError);
                showNotification({
                    title: 'Chat Not Saved',
                    message: 'Your conversation will continue but won\'t be saved to history due to permissions.',
                    type: 'warning'
                });
            } else {
                showNotification({
                    title: 'Error',
                    message: 'Failed to save message to history',
                    type: 'error'
                });
            }
        }
    };

    const addMessages = async (messages: Message[]) => {
        if (!currentChat || messages.length === 0) return;

        const messagesWithKeys = messages.map(message => ({
            ...message,
            uniqueKey: message.uniqueKey || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
        }));

        const updatedChat = {
            ...currentChat,
            messages: [...currentChat.messages, ...messagesWithKeys],
            title: currentChat.messages.length === 0 && messages[0]?.role === 'user'
                ? messages[0].content.slice(0, 100).trim() + (messages[0].content.length > 100 ? '...' : '')
                : currentChat.title,
            updatedAt: new Date()
        };

        // Update local state immediately for responsive UI
        setCurrentChat(updatedChat);

        // Save to Sanity for all users (authenticated and guests)
        try {
            const guestDomain = getGuestDomain();

            // Ensure the chat has the latest user data
            const freshUserData = user ? {
                firstName: user.firstName || user.fullName?.split(' ')[0] || user.username || 'User',
                lastName: user.lastName || user.fullName?.split(' ')[1] || '',
                email: user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress || '',
                clerkId: user.id
            } : {
                firstName: 'Guest',
                lastName: guestDomain, // Use domain as last name for guest users
                email: 'guest@example.com',
                clerkId: getGuestId()
            };

            const chatWithFreshUserData = {
                ...updatedChat,
                user: freshUserData
            };

            console.log('Saving chat with multiple messages to Sanity:', {
                messageCount: messages.length,
                messageTypes: messages.map(m => m.role),
                totalMessages: chatWithFreshUserData.messages.length,
                allMessageTypes: chatWithFreshUserData.messages.map(m => m.role),
                chatUser: freshUserData,
                guestDomain
            });

            const savedChat = await chatService.saveChat(chatWithFreshUserData);
            console.log('Chat with multiple messages saved successfully to Sanity:', {
                chatId: savedChat._id,
                messageCount: savedChat.messages.length,
                messageTypes: savedChat.messages.map(m => m.role)
            });

            // Update with the saved version (which might have a proper _id)
            setCurrentChat(savedChat);
            // Only reload chats if this is a new chat (no _id yet) and user is authenticated
            if ((!currentChat._id || currentChat._id === currentChat.uniqueKey) && user) {
                await loadChats();
            }
        } catch (error) {
            console.error('Error saving chat with multiple messages:', error);

            // Check if it's a permissions error
            if (isSanityPermissionError(error)) {
                const permissionError = getSanityPermissionError(error);
                console.warn('Sanity permissions issue:', permissionError);
                showNotification({
                    title: 'Chat Not Saved',
                    message: 'Your conversation will continue but won\'t be saved to history due to permissions.',
                    type: 'warning'
                });
            } else {
                showNotification({
                    title: 'Error',
                    message: 'Failed to save messages to history',
                    type: 'error'
                });
            }
        }
    };

    const addConversationTurn = async (userMessage: Message, assistantMessage: Message) => {
        if (!currentChat) return;

        const userMessageWithKey = {
            ...userMessage,
            uniqueKey: userMessage.uniqueKey || `msg_user_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
        };

        const assistantMessageWithKey = {
            ...assistantMessage,
            uniqueKey: assistantMessage.uniqueKey || `msg_ai_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
        };

        const updatedChat = {
            ...currentChat,
            messages: [...currentChat.messages, userMessageWithKey, assistantMessageWithKey],
            title: currentChat.messages.length === 0
                ? userMessage.content.slice(0, 100).trim() + (userMessage.content.length > 100 ? '...' : '')
                : currentChat.title,
            updatedAt: new Date()
        };

        // Update local state immediately for responsive UI
        setCurrentChat(updatedChat);

        // Save to Sanity for all users (authenticated and guests)
        try {
            const guestDomain = getGuestDomain();

            // Ensure the chat has the latest user data
            const freshUserData = user ? {
                firstName: user.firstName || user.fullName?.split(' ')[0] || user.username || 'User',
                lastName: user.lastName || user.fullName?.split(' ')[1] || '',
                email: user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress || '',
                clerkId: user.id
            } : {
                firstName: 'Guest',
                lastName: guestDomain, // Use domain as last name for guest users
                email: 'guest@example.com',
                clerkId: getGuestId()
            };

            const chatWithFreshUserData = {
                ...updatedChat,
                user: freshUserData
            };

            console.log('Saving complete conversation turn to Sanity:', {
                chatId: currentChat._id,
                chatUniqueKey: currentChat.uniqueKey,
                userMessage: {
                    role: userMessage.role,
                    content: userMessage.content.slice(0, 100) + '...',
                    uniqueKey: userMessageWithKey.uniqueKey
                },
                assistantMessage: {
                    role: assistantMessage.role,
                    content: assistantMessage.content.slice(0, 100) + '...',
                    uniqueKey: assistantMessageWithKey.uniqueKey
                },
                totalMessages: chatWithFreshUserData.messages.length,
                messageTypes: chatWithFreshUserData.messages.map(m => m.role),
                chatUser: freshUserData,
                guestDomain,
                isNewChat: !currentChat._id || currentChat._id === currentChat.uniqueKey
            });

            const savedChat = await chatService.saveChat(chatWithFreshUserData);
            console.log('Complete conversation turn saved successfully to Sanity:', {
                chatId: savedChat._id,
                messageCount: savedChat.messages.length,
                messageTypes: savedChat.messages.map(m => m.role),
                lastTwoMessages: savedChat.messages.slice(-2).map(m => ({
                    role: m.role,
                    content: m.content.slice(0, 50) + '...'
                })),
                isNewChat: !currentChat._id || currentChat._id === currentChat.uniqueKey
            });

            // Update with the saved version (which might have a proper _id)
            setCurrentChat(savedChat);
            // Only reload chats if this is a new chat (no _id yet) and user is authenticated
            if ((!currentChat._id || currentChat._id === currentChat.uniqueKey) && user) {
                await loadChats();
            }
        } catch (error) {
            console.error('Error saving conversation turn:', error);

            // Check if it's a permissions error
            if (isSanityPermissionError(error)) {
                const permissionError = getSanityPermissionError(error);
                console.warn('Sanity permissions issue:', permissionError);
                showNotification({
                    title: 'Chat Not Saved',
                    message: 'Your conversation will continue but won\'t be saved to history due to permissions.',
                    type: 'warning'
                });
            } else {
                showNotification({
                    title: 'Error',
                    message: 'Failed to save conversation to history',
                    type: 'error'
                });
            }
        }
    };

    const switchChat = async (chatId: string) => {
        try {
            console.log('Switching to chat:', chatId);
            const chat = await chatService.getChatById(chatId);
            if (chat) {
                console.log('Loaded chat from Sanity:', {
                    id: chat._id,
                    title: chat.title,
                    messageCount: chat.messages.length,
                    user: chat.user
                });
                setCurrentChat(chat);
                // Note: View count increment removed to avoid permissions issues
                // This can be re-enabled when proper API endpoint is created
            } else {
                console.warn('Chat not found:', chatId);
                showNotification({
                    title: 'Error',
                    message: 'Chat not found',
                    type: 'error'
                });
            }
        } catch (error) {
            console.error('Error switching chat:', error);
            showNotification({
                title: 'Error',
                message: 'Failed to load chat from database',
                type: 'error'
            });
        }
    };

    const deleteChat = async (chatId: string): Promise<void> => {
        // Only authenticated users can delete chats
        if (!canManageChats) {
            showNotification({
                title: 'Permission Denied',
                message: 'Guest users cannot delete chats. Please sign in to manage your chat history.',
                type: 'warning'
            });
            return;
        }

        try {
            await chatService.deleteChat(chatId);
            setChats(prev => prev.filter(chat => chat._id !== chatId));

            // If the deleted chat was the current chat, clear it
            if (currentChat?._id === chatId) {
                setCurrentChat(null);
            }

            showNotification({
                title: 'Success',
                message: 'Chat deleted successfully',
                type: 'success'
            });
        } catch (error) {
            console.error('Error deleting chat:', error);
            showNotification({
                title: 'Error',
                message: 'Failed to delete chat',
                type: 'error'
            });
            throw error;
        }
    };

    const deleteAllChats = async (): Promise<void> => {
        // Only authenticated users can delete chats
        if (!canManageChats) {
            showNotification({
                title: 'Permission Denied',
                message: 'Guest users cannot delete chats. Please sign in to manage your chat history.',
                type: 'warning'
            });
            return;
        }

        try {
            await chatService.deleteAllUserChats(user?.id || '');
            setChats([]);
            setCurrentChat(null);
            showNotification({
                title: 'Success',
                message: 'All chats deleted successfully',
                type: 'success'
            });
        } catch (error) {
            console.error('Error deleting all chats:', error);
            showNotification({
                title: 'Error',
                message: 'Failed to delete all chats',
                type: 'error'
            });
            throw error;
        }
    };

    return (
        <ChatContext.Provider value={{
            currentChat,
            chats,
            createNewChat,
            addMessage,
            addMessages,
            addConversationTurn,
            switchChat,
            deleteChat,
            deleteAllChats,
            setCurrentChat,
            refreshChats: loadChats,
            canManageChats: canManageChats
        }}>
            {children}
        </ChatContext.Provider>
    );
}

export function useChat() {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
} 