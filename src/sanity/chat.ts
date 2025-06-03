import { client } from '@/sanity/lib/client';
import { Chat, SanityChat, convertSanityChatToChat } from '@/types/chat';

export async function saveChat(chat: Chat): Promise<Chat> {
    try {
        console.log('Attempting to save chat:', { chatId: chat._id });
        
        // Ensure all dates are properly formatted
        const chatToSave = {
            ...chat,
            createdAt: new Date(chat.createdAt),
            messages: chat.messages.map(msg => ({
                ...msg,
                timestamp: new Date(msg.timestamp)
            })),
            analytics: chat.analytics ? {
                ...chat.analytics,
                lastViewedAt: chat.analytics.lastViewedAt ? new Date(chat.analytics.lastViewedAt) : undefined
            } : undefined
        };
        
        const response = await fetch('/api/chat/operations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                operation: 'saveChat',
                data: chatToSave
            }),
        });

        let data;
        try {
            data = await response.json();
            console.log('Save chat response:', data);
        } catch (e) {
            console.error('Failed to parse response:', e);
            throw new Error('Failed to parse server response');
        }

        if (!response.ok) {
            const errorMessage = data?.details || data?.error || 'Failed to save chat';
            console.error('Save chat failed:', { 
                status: response.status, 
                statusText: response.statusText,
                error: errorMessage,
                data 
            });
            
            // If it's a permissions error, return the original chat instead of throwing
            if (errorMessage.includes('Insufficient permissions') || errorMessage.includes('permission')) {
                console.warn('Permissions error - returning original chat without saving to Sanity');
                return chat;
            }
            
            throw new Error(errorMessage);
        }

        if (!data) {
            throw new Error('No data received from server');
        }

        return data;
    } catch (error) {
        console.error('Error saving chat:', error);
        
        // If it's a permissions error, return the original chat to allow the conversation to continue
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        if (errorMessage.includes('Insufficient permissions') || errorMessage.includes('permission')) {
            console.warn('Permissions error - returning original chat to allow conversation to continue');
            return chat;
        }
        
        throw error;
    }
}

export async function getUserChats(userId: string): Promise<Chat[]> {
    const chats = await client.fetch<SanityChat[]>(
        `*[_type == "chat" && user.clerkId == $userId] | order(updatedAt desc)`,
        { userId }
    );

    // Convert each Sanity chat to a Chat object - no merging needed
    // Each chat should remain as a separate conversation
    return chats.map(convertSanityChatToChat);
}

export async function deleteChat(chatId: string): Promise<void> {
    try {
        const response = await fetch('/api/chat/operations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                operation: 'deleteChat',
                data: { chatId }
            }),
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to delete chat');
        }
    } catch (error) {
        console.error('Error deleting chat:', error);
        throw error;
    }
}

export async function getChatById(chatId: string): Promise<Chat | null> {
    const chat = await client.fetch<SanityChat | null>(
        `*[_type == "chat" && _id == $chatId][0]`,
        { chatId }
    );
    return chat ? convertSanityChatToChat(chat) : null;
}

export async function incrementViewCount(chatId: string): Promise<Chat> {
    const savedChat = await client
        .patch(chatId)
        .inc({ 'analytics.viewCount': 1 })
        .set({
            'analytics.lastViewedAt': new Date().toISOString(),
            updatedAt: new Date().toISOString()
        })
        .commit() as SanityChat;
    
    return convertSanityChatToChat(savedChat);
}

export async function incrementExportCount(chatId: string): Promise<Chat> {
    const savedChat = await client
        .patch(chatId)
        .inc({ 'analytics.exportCount': 1 })
        .set({
            updatedAt: new Date().toISOString()
        })
        .commit() as SanityChat;
    
    return convertSanityChatToChat(savedChat);
}

export async function createChat(chat: Chat): Promise<Chat> {
    try {
        const response = await fetch('/api/chat/operations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                operation: 'createChat',
                data: chat
            }),
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to create chat');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error creating chat:', error);
        throw error;
    }
}

export async function deleteAllUserChats(userId: string): Promise<{ success: boolean; deletedCount: number }> {
    try {
        console.log('Attempting to delete all chats for user:', { userId });
        
        const response = await fetch('/api/chat/operations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                operation: 'deleteAllUserChats',
                data: { userId }
            }),
        });

        let data;
        try {
            data = await response.json();
            console.log('Delete all chats response:', data);
        } catch (e) {
            console.error('Failed to parse response:', e);
            throw new Error('Failed to parse server response');
        }

        if (!response.ok) {
            const errorMessage = data?.details || data?.error || 'Failed to delete all chats';
            console.error('Delete all chats failed:', { 
                status: response.status, 
                statusText: response.statusText,
                error: errorMessage,
                data 
            });
            throw new Error(errorMessage);
        }

        return data;
    } catch (error) {
        console.error('Error deleting all chats:', error);
        throw error;
    }
} 