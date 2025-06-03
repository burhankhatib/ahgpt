import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/sanity/lib/client';
import { Chat, SanityChat, convertSanityChatToChat } from '@/types/chat';

// Helper function to generate unique keys
const generateUniqueKey = (prefix: string) => {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
};

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    console.log('API route hit: /api/chat/operations');
    
    try {
        const { operation, data } = await request.json();
        console.log('Operation:', operation);

        switch (operation) {
            case 'saveChat': {
                const chat = data as Chat;
                console.log('Processing saveChat operation:', { 
                    chatId: chat._id,
                    messageCount: chat.messages.length,
                    messageTypes: chat.messages.map(m => m.role),
                    messages: chat.messages.map(m => ({
                        role: m.role,
                        content: m.content.slice(0, 100) + '...',
                        uniqueKey: m.uniqueKey
                    }))
                });
                
                const { _id, ...chatData } = chat;
                const doc = {
                    _type: 'chat',
                    uniqueKey: chatData.uniqueKey || generateUniqueKey('chat'),
                    ...chatData,
                    messages: chatData.messages.map((msg, index) => ({
                        _key: msg.uniqueKey || `msg_${index}_${Date.now()}`,
                        role: msg.role,
                        content: msg.content,
                        uniqueKey: msg.uniqueKey || generateUniqueKey('msg'),
                        timestamp: new Date(msg.timestamp).toISOString()
                    })),
                    createdAt: new Date(chatData.createdAt).toISOString(),
                    updatedAt: new Date().toISOString(),
                    analytics: chatData.analytics ? {
                        ...chatData.analytics,
                        lastViewedAt: chatData.analytics.lastViewedAt ? new Date(chatData.analytics.lastViewedAt).toISOString() : undefined
                    } : undefined
                };

                try {
                    let savedChat: SanityChat;
                    
                    if (_id && _id !== chatData.uniqueKey) {
                        // Update existing chat
                        console.log('Updating existing chat with ID:', _id);
                        savedChat = await client
                            .patch(_id)
                            .set(doc)
                            .commit() as SanityChat;
                    } else {
                        // Create new chat
                        console.log('Creating new chat');
                        savedChat = await client.create(doc) as SanityChat;
                    }
                    
                    console.log('Successfully saved chat:', { 
                        chatId: savedChat._id,
                        messageCount: savedChat.messages.length 
                    });
                    return NextResponse.json(convertSanityChatToChat(savedChat));
                } catch (error) {
                    console.error('Sanity save operation error:', error);
                    return NextResponse.json(
                        { error: 'Failed to save chat', details: (error as Error).message },
                        { status: 500 }
                    );
                }
            }

            case 'createChat': {
                const chat = data as Chat;
                console.log('Processing createChat operation:', { chatId: chat._id });
                
                const doc = {
                    _type: 'chat',
                    uniqueKey: chat.uniqueKey || generateUniqueKey('chat'),
                    ...chat,
                    messages: chat.messages.map((msg, index) => ({
                        _key: msg.uniqueKey || `msg_${index}_${Date.now()}`,
                        role: msg.role,
                        content: msg.content,
                        uniqueKey: msg.uniqueKey || generateUniqueKey('msg'),
                        timestamp: new Date(msg.timestamp).toISOString()
                    })),
                    createdAt: new Date(chat.createdAt).toISOString(),
                    updatedAt: new Date().toISOString(),
                    analytics: chat.analytics ? {
                        ...chat.analytics,
                        lastViewedAt: chat.analytics.lastViewedAt ? new Date(chat.analytics.lastViewedAt).toISOString() : undefined
                    } : undefined
                };

                try {
                    const savedChat = await client.create(doc) as SanityChat;
                    console.log('Successfully created chat:', { chatId: savedChat._id });
                    return NextResponse.json(convertSanityChatToChat(savedChat));
                } catch (error) {
                    console.error('Sanity create operation error:', error);
                    return NextResponse.json(
                        { error: 'Failed to create chat', details: (error as Error).message },
                        { status: 500 }
                    );
                }
            }

            case 'deleteChat': {
                const { chatId } = data;
                console.log('Processing deleteChat operation:', { chatId });
                
                try {
                    await client.delete(chatId);
                    console.log('Successfully deleted chat:', { chatId });
                    return NextResponse.json({ success: true });
                } catch (error) {
                    console.error('Sanity delete operation error:', error);
                    return NextResponse.json(
                        { error: 'Failed to delete chat', details: (error as Error).message },
                        { status: 500 }
                    );
                }
            }

            case 'deleteAllUserChats': {
                const { userId } = data;
                console.log('Processing deleteAllUserChats operation:', { userId });
                
                try {
                    // First, get all chats for the user
                    const userChats = await client.fetch<SanityChat[]>(
                        `*[_type == "chat" && user.clerkId == $userId]`,
                        { userId }
                    );
                    
                    console.log(`Found ${userChats.length} chats to delete for user:`, userId);
                    
                    // Delete all chats
                    const deletePromises = userChats.map(chat => client.delete(chat._id));
                    await Promise.all(deletePromises);
                    
                    console.log(`Successfully deleted ${userChats.length} chats for user:`, userId);
                    return NextResponse.json({ 
                        success: true, 
                        deletedCount: userChats.length 
                    });
                } catch (error) {
                    console.error('Sanity delete all operation error:', error);
                    return NextResponse.json(
                        { error: 'Failed to delete all chats', details: (error as Error).message },
                        { status: 500 }
                    );
                }
            }

            default:
                console.log('Unknown operation:', operation);
                return NextResponse.json(
                    { error: 'Unknown operation' },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('API route error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: (error as Error).message },
            { status: 500 }
        );
    }
} 