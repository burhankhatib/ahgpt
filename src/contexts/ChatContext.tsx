"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Chat, Message } from '@/types/chat';
import * as chatService from '@/sanity/chat';
import { showNotification } from '@/utils/notifications';
import { getSanityPermissionError, isSanityPermissionError } from '@/utils/sanity-permissions';
import { useUser } from '@clerk/nextjs';

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
    hideChat: (chatId: string) => Promise<void>;
    hideAllChats: () => Promise<void>;
    setCurrentChat: (chat: Chat | null) => void;
    refreshChats: () => Promise<void>;
    canManageChats: boolean;
    isInvisibleMode: boolean;
    toggleInvisibleMode: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
    children: React.ReactNode;
    forceGuestMode?: boolean; // Optional prop to force guest mode (for widgets)
}

// Widget-only provider that doesn't use Clerk at all
export function GuestChatProvider({ children }: { children: React.ReactNode }) {
    const [currentChat, setCurrentChat] = useState<Chat | null>(null);
    const [chats, setChats] = useState<Chat[]>([]);
    const [hiddenChatIds, setHiddenChatIds] = useState<Set<string>>(new Set());
    const [isInvisibleMode, setIsInvisibleMode] = useState(false);

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

    const loadChats = useCallback(async () => {
        const userId = getGuestId();

        if (!userId) {
            setChats([]);
            return;
        }

        try {
            console.log('Loading chats from Sanity for guest user:', userId);
            const userChats = await chatService.getUserChats(userId);
            const visibleChats = userChats.filter(chat => !hiddenChatIds.has(chat._id || ''));
            setChats(visibleChats);
        } catch (error) {
            console.error('Error loading chats:', error);
        }
    }, [hiddenChatIds]);

    useEffect(() => {
        loadChats();
    }, [loadChats]);

    const createNewChat = () => {
        setCurrentChat(null);

        const uniqueKey = `chat_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        const guestDomain = getGuestDomain();

        const userData = {
            firstName: 'Guest',
            lastName: guestDomain,
            email: 'guest@example.com',
            clerkId: getGuestId()
        };

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
            _id: uniqueKey
        };

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

        setCurrentChat(updatedChat);

        try {
            const guestDomain = getGuestDomain();
            const freshUserData = {
                firstName: 'Guest',
                lastName: guestDomain,
                email: 'guest@example.com',
                clerkId: getGuestId()
            };

            const chatWithFreshUserData = {
                ...updatedChat,
                user: freshUserData
            };

            const savedChat = await chatService.saveChat(chatWithFreshUserData);
            setCurrentChat(savedChat);

            const isNewChat = !currentChat._id || currentChat._id === currentChat.uniqueKey;
            if (isNewChat && !isInvisibleMode) {
                await loadChats();
            }
        } catch (error) {
            console.error('Error saving chat:', error);
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

        setCurrentChat(updatedChat);

        try {
            const guestDomain = getGuestDomain();
            const freshUserData = {
                firstName: 'Guest',
                lastName: guestDomain,
                email: 'guest@example.com',
                clerkId: getGuestId()
            };

            const chatWithFreshUserData = {
                ...updatedChat,
                user: freshUserData
            };

            const savedChat = await chatService.saveChat(chatWithFreshUserData);
            setCurrentChat(savedChat);

            const isNewChat = !currentChat._id || currentChat._id === currentChat.uniqueKey;
            if (isNewChat && !isInvisibleMode) {
                await loadChats();
            }
        } catch (error) {
            console.error('Error saving chat with multiple messages:', error);
        }
    };

    const addConversationTurn = async (userMessage: Message, assistantMessage: Message) => {
        if (!currentChat) {
            console.error('No current chat available for adding conversation turn');
            return;
        }

        const messagesWithKeys = [
            {
                ...userMessage,
                uniqueKey: userMessage.uniqueKey || `msg_user_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
            },
            {
                ...assistantMessage,
                uniqueKey: assistantMessage.uniqueKey || `msg_ai_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
            }
        ];

        const updatedChat = {
            ...currentChat,
            messages: [...currentChat.messages, ...messagesWithKeys],
            title: currentChat.messages.length === 0 && userMessage.role === 'user'
                ? userMessage.content.slice(0, 100).trim() + (userMessage.content.length > 100 ? '...' : '')
                : currentChat.title,
            updatedAt: new Date()
        };

        setCurrentChat(updatedChat);

        try {
            const guestDomain = getGuestDomain();
            const freshUserData = {
                firstName: 'Guest',
                lastName: guestDomain,
                email: 'guest@example.com',
                clerkId: getGuestId()
            };

            const chatWithFreshUserData = {
                ...updatedChat,
                user: freshUserData
            };

            const savedChat = await chatService.saveChat(chatWithFreshUserData);
            setCurrentChat(savedChat);

            const isNewChat = !currentChat._id || currentChat._id === currentChat.uniqueKey;
            if (isNewChat && !isInvisibleMode) {
                await loadChats();
            }
        } catch (error) {
            console.error('Error saving conversation turn:', error);
            throw error; // Re-throw to allow handling in calling component
        }
    };

    const switchChat = async (chatId: string) => {
        const chat = chats.find(c => c._id === chatId);
        if (chat) {
            setCurrentChat(chat);
        }
    };

    const deleteChat = async (chatId: string): Promise<void> => {
        // Guests cannot delete chats
        console.warn('Guest users cannot delete chats');
    };

    const deleteAllChats = async (): Promise<void> => {
        // Guests cannot delete chats
        console.warn('Guest users cannot delete chats');
    };

    const hideChat = async (chatId: string): Promise<void> => {
        setHiddenChatIds(prev => new Set([...prev, chatId]));
        setChats(prev => prev.filter(chat => chat._id !== chatId));
        if (currentChat?._id === chatId) {
            setCurrentChat(null);
        }
    };

    const hideAllChats = async (): Promise<void> => {
        const chatIds = chats.map(chat => chat._id).filter(Boolean) as string[];
        setHiddenChatIds(prev => new Set([...prev, ...chatIds]));
        setChats([]);
        setCurrentChat(null);
    };

    const refreshChats = async () => {
        await loadChats();
    };

    const toggleInvisibleMode = () => {
        setIsInvisibleMode(prev => !prev);
    };

    const value: ChatContextType = {
        currentChat,
        chats,
        createNewChat,
        addMessage,
        addMessages,
        addConversationTurn,
        switchChat,
        deleteChat,
        deleteAllChats,
        hideChat,
        hideAllChats,
        setCurrentChat,
        refreshChats,
        canManageChats: false, // Guests cannot manage chats
        isInvisibleMode,
        toggleInvisibleMode,
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
}

export function ChatProvider({ children, forceGuestMode = false }: ChatProviderProps) {
    // If forceGuestMode is true, use the guest provider instead
    if (forceGuestMode) {
        return <GuestChatProvider>{children}</GuestChatProvider>;
    }

    // Conditionally use Clerk authentication based on context
    const clerkUser = useUser();

    // Determine if we should use Clerk auth or force guest mode
    const isMainWebsite = typeof window !== 'undefined' &&
        (window.location.hostname === 'alhayatgpt.com' ||
            window.location.hostname === 'www.alhayatgpt.com' ||
            window.location.hostname === 'localhost');

    // Use Clerk user if on main website and not forcing guest mode, otherwise null for guest mode
    const user = (isMainWebsite && !forceGuestMode) ? clerkUser.user : null;

    console.log('ChatProvider context detection:', {
        isMainWebsite,
        forceGuestMode,
        hostname: typeof window !== 'undefined' ? window.location.hostname : 'server',
        hasClerkUser: !!clerkUser.user,
        finalUserState: !!user,
        userInfo: user ? {
            id: user.id,
            firstName: user.firstName,
            email: user.primaryEmailAddress?.emailAddress
        } : 'guest'
    });

    const [currentChat, setCurrentChat] = useState<Chat | null>(null);
    const [chats, setChats] = useState<Chat[]>([]);
    const [hiddenChatIds, setHiddenChatIds] = useState<Set<string>>(new Set());
    const [isInvisibleMode, setIsInvisibleMode] = useState(false);

    // Load hidden chats and invisible mode from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const userId = user ? user.id : getGuestId();
            const savedHiddenChats = localStorage.getItem(`hidden_chats_${userId}`);
            if (savedHiddenChats) {
                setHiddenChatIds(new Set(JSON.parse(savedHiddenChats)));
            }

            const savedInvisibleMode = localStorage.getItem(`invisible_mode_${userId}`);
            setIsInvisibleMode(savedInvisibleMode === 'true');
        }
    }, [user]);

    // Save hidden chats to localStorage when it changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const userId = user ? user.id : getGuestId();
            localStorage.setItem(`hidden_chats_${userId}`, JSON.stringify(Array.from(hiddenChatIds)));
        }
    }, [hiddenChatIds, user]);

    // Save invisible mode to localStorage when it changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const userId = user ? user.id : getGuestId();
            localStorage.setItem(`invisible_mode_${userId}`, isInvisibleMode.toString());
        }
    }, [isInvisibleMode, user]);

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
            console.log('getGuestDomain: Starting domain extraction');

            // First try to get parentOrigin from URL params (widget context)
            const urlParams = new URLSearchParams(window.location.search);
            const parentOrigin = urlParams.get('parentOrigin');

            console.log('getGuestDomain: URL params check', {
                currentUrl: window.location.href,
                searchParams: window.location.search,
                parentOrigin: parentOrigin,
                allParams: Object.fromEntries(urlParams.entries())
            });

            if (parentOrigin && parentOrigin !== window.location.origin) {
                try {
                    const url = new URL(parentOrigin);
                    console.log('getGuestDomain: Successfully parsed parentOrigin', {
                        originalUrl: parentOrigin,
                        hostname: url.hostname,
                        origin: url.origin
                    });
                    return url.hostname;
                } catch (error) {
                    console.warn('getGuestDomain: Failed to parse parent origin:', parentOrigin, error);
                }
            }

            // Fallback to document referrer
            console.log('getGuestDomain: Fallback to document.referrer', {
                referrer: document.referrer,
                currentOrigin: window.location.origin
            });

            if (document.referrer && document.referrer !== window.location.origin) {
                try {
                    const url = new URL(document.referrer);
                    console.log('getGuestDomain: Successfully parsed referrer', {
                        originalUrl: document.referrer,
                        hostname: url.hostname,
                        origin: url.origin
                    });
                    return url.hostname;
                } catch (error) {
                    console.warn('getGuestDomain: Failed to parse referrer:', document.referrer, error);
                }
            }

            console.log('getGuestDomain: No valid domain found, returning Unknown');
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

            // Filter out hidden chats from the display
            const visibleChats = userChats.filter(chat => !hiddenChatIds.has(chat._id || ''));
            setChats(visibleChats);
        } catch (error) {
            console.error('Error loading chats:', error);
            showNotification({
                title: 'Error',
                message: 'Failed to load chats from database',
                type: 'error'
            });
        }
    }, [user, hiddenChatIds]);

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

            // Always reload chats after saving a new chat (both authenticated and guest users)
            // BUT respect invisible mode - if invisible mode is ON, don't show in sidebar
            const isNewChat = !currentChat._id || currentChat._id === currentChat.uniqueKey;

            if (isNewChat) {
                console.log('New chat detected in addMessage, checking if should update sidebar:', {
                    isNewChat,
                    isInvisibleMode,
                    shouldShowInSidebar: !isInvisibleMode
                });

                if (!isInvisibleMode) {
                    // Only reload sidebar if invisible mode is OFF
                    console.log('Invisible mode is OFF, reloading chats for sidebar update (addMessage)');
                    await loadChats();
                } else {
                    console.log('Invisible mode is ON, chat saved to Sanity but not shown in sidebar (addMessage)');
                }
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

            // Always reload chats after saving a new chat (both authenticated and guest users)
            // BUT respect invisible mode - if invisible mode is ON, don't show in sidebar
            const isNewChat = !currentChat._id || currentChat._id === currentChat.uniqueKey;

            if (isNewChat) {
                console.log('New chat detected in addMessages, checking if should update sidebar:', {
                    isNewChat,
                    isInvisibleMode,
                    shouldShowInSidebar: !isInvisibleMode
                });

                if (!isInvisibleMode) {
                    // Only reload sidebar if invisible mode is OFF
                    console.log('Invisible mode is OFF, reloading chats for sidebar update (addMessages)');
                    await loadChats();
                } else {
                    console.log('Invisible mode is ON, chat saved to Sanity but not shown in sidebar (addMessages)');
                }
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
        if (!currentChat) {
            console.error('No current chat available for adding conversation turn');
            return;
        }

        // Add both messages to the current chat
        const messagesWithKeys = [
            {
                ...userMessage,
                uniqueKey: userMessage.uniqueKey || `msg_user_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
            },
            {
                ...assistantMessage,
                uniqueKey: assistantMessage.uniqueKey || `msg_ai_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
            }
        ];

        const updatedChat = {
            ...currentChat,
            messages: [...currentChat.messages, ...messagesWithKeys],
            title: currentChat.messages.length === 0 && userMessage.role === 'user'
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

            console.log('Saving conversation turn to Sanity:', {
                userMessageContent: userMessage.content.slice(0, 100) + '...',
                assistantMessageContent: assistantMessage.content.slice(0, 100) + '...',
                totalMessages: chatWithFreshUserData.messages.length,
                messageTypes: chatWithFreshUserData.messages.map(m => m.role),
                chatUser: freshUserData,
                guestDomain,
                isAuthenticated: !!user
            });

            const savedChat = await chatService.saveChat(chatWithFreshUserData);
            console.log('Conversation turn saved successfully to Sanity:', {
                chatId: savedChat._id,
                messageCount: savedChat.messages.length,
                messageTypes: savedChat.messages.map(m => m.role),
                isAuthenticated: !!user
            });

            // Update with the saved version (which might have a proper _id)
            setCurrentChat(savedChat);

            // Always reload chats after saving a new chat (both authenticated and guest users)
            // BUT respect invisible mode - if invisible mode is ON, don't show in sidebar
            const isNewChat = !currentChat._id || currentChat._id === currentChat.uniqueKey;

            if (isNewChat) {
                console.log('New chat detected in addConversationTurn, checking if should update sidebar:', {
                    isNewChat,
                    isInvisibleMode,
                    shouldShowInSidebar: !isInvisibleMode
                });

                if (!isInvisibleMode) {
                    // Only reload sidebar if invisible mode is OFF
                    console.log('Invisible mode is OFF, reloading chats for sidebar update (addConversationTurn)');
                    await loadChats();
                } else {
                    console.log('Invisible mode is ON, chat saved to Sanity but not shown in sidebar (addConversationTurn)');
                }
            }
        } catch (error) {
            console.error('Error saving conversation turn:', error);

            // Re-throw error to allow handling in calling component
            throw error;
        }
    };

    const switchChat = async (chatId: string) => {
        const chat = chats.find(c => c._id === chatId);
        if (chat) {
            setCurrentChat(chat);

            // Track view for analytics (when implemented)
            // try {
            //     await chatService.incrementChatView(chatId);
            // } catch (error) {
            //     console.error('Failed to track chat view:', error);
            // }
        }
    };

    const deleteChat = async (chatId: string): Promise<void> => {
        if (!canManageChats) {
            showNotification({
                title: 'Access Denied',
                message: 'Only authenticated users can delete chats',
                type: 'error'
            });
            return;
        }

        try {
            console.log('Deleting chat:', chatId);
            await chatService.deleteChat(chatId);

            // Remove from local state
            setChats(prev => prev.filter(chat => chat._id !== chatId));

            // If this was the current chat, clear it
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
        }
    };

    const deleteAllChats = async (): Promise<void> => {
        if (!canManageChats) {
            showNotification({
                title: 'Access Denied',
                message: 'Only authenticated users can delete chats',
                type: 'error'
            });
            return;
        }

        try {
            console.log('Deleting all chats for user:', user?.id);
            await chatService.deleteAllUserChats(user!.id);

            // Clear local state
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
        }
    };

    const hideChat = async (chatId: string): Promise<void> => {
        setHiddenChatIds(prev => new Set([...prev, chatId]));
        setChats(prev => prev.filter(chat => chat._id !== chatId));

        // If this was the current chat, clear it
        if (currentChat?._id === chatId) {
            setCurrentChat(null);
        }

        showNotification({
            title: 'Chat Hidden',
            message: 'Chat hidden from sidebar (still accessible from dashboard)',
            type: 'info'
        });
    };

    const hideAllChats = async (): Promise<void> => {
        const chatIds = chats.map(chat => chat._id).filter(Boolean) as string[];
        setHiddenChatIds(prev => new Set([...prev, ...chatIds]));
        setChats([]);
        setCurrentChat(null);

        showNotification({
            title: 'All Chats Hidden',
            message: 'All chats hidden from sidebar (still accessible from dashboard)',
            type: 'info'
        });
    };

    const refreshChats = async () => {
        await loadChats();
    };

    const toggleInvisibleMode = () => {
        setIsInvisibleMode(prev => !prev);
    };

    const value: ChatContextType = {
        currentChat,
        chats,
        createNewChat,
        addMessage,
        addMessages,
        addConversationTurn,
        switchChat,
        deleteChat,
        deleteAllChats,
        hideChat,
        hideAllChats,
        setCurrentChat,
        refreshChats,
        canManageChats,
        isInvisibleMode,
        toggleInvisibleMode,
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
}

export function useChat() {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
} 