import { NextRequest, NextResponse } from 'next/server';
import { createClient } from 'next-sanity';
import { dataset, projectId, apiVersion } from '@/sanity/env';

// Create admin client with write permissions
const adminClient = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token: process.env.SANITY_API_TOKEN, // This should have write/delete permissions
    perspective: 'published'
});

// DELETE /api/admin/chats - Delete single chat or all chats
export async function DELETE(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const chatId = url.searchParams.get('chatId');
        
        // Try to get request body for bulk operations
        let body = null;
        try {
            const text = await request.text();
            if (text) {
                body = JSON.parse(text);
            }
        } catch {
            // No body or invalid JSON, continue
        }

        if (chatId) {
            // Delete single chat using query parameter
            console.log(`🗑️ [API] Deleting single chat: ${chatId}`);
            
            // First check if chat exists
            const existingChat = await adminClient.fetch(
                `*[_type == "chat" && _id == $chatId][0]`,
                { chatId }
            );
            
            if (!existingChat) {
                return NextResponse.json({ 
                    error: 'Chat not found',
                    chatId 
                }, { status: 404 });
            }
            
            const result = await adminClient.delete(chatId);
            
            if (result) {
                console.log(`✅ [API] Successfully deleted chat: ${chatId}`);
                return NextResponse.json({ 
                    success: true, 
                    message: 'Chat deleted successfully',
                    deletedChatId: chatId
                });
            } else {
                throw new Error('Delete operation returned no result');
            }
            
        } else if (body && body.action === 'deleteAll') {
            // Handle bulk delete (delete all chats)
            console.log('🗑️ [API] Starting bulk delete of all chats...');
            
            // Get all chat IDs
            const chatIds = await adminClient.fetch<string[]>(
                `*[_type == "chat"]._id`
            );
            
            console.log(`📊 [API] Found ${chatIds.length} chats to delete`);
            
            if (chatIds.length === 0) {
                return NextResponse.json({ 
                    success: true,
                    deletedCount: 0,
                    message: 'No chats to delete'
                });
            }
            
            // Delete all chats in batch using transaction
            const transaction = adminClient.transaction();
            
            chatIds.forEach(id => {
                transaction.delete(id);
            });
            
            const result = await transaction.commit();
            
            console.log(`✅ [API] Successfully deleted ${chatIds.length} chats`);
            
            return NextResponse.json({ 
                success: true, 
                deletedCount: chatIds.length,
                message: `Successfully deleted ${chatIds.length} chats`
            });
        } else {
            return NextResponse.json({ 
                error: 'Invalid request. Provide either chatId query parameter or action=deleteAll in body.' 
            }, { status: 400 });
        }
        
    } catch (error) {
        console.error('❌ [API] Error in delete operation:', error);
        
        // Handle specific Sanity errors
        if (error instanceof Error) {
            if (error.message.includes('permissions') || error.message.includes('Insufficient')) {
                return NextResponse.json({ 
                    error: 'Insufficient permissions. Please check your Sanity token has write/delete permissions.',
                    details: error.message 
                }, { status: 403 });
            }
            
            if (error.message.includes('not found')) {
                return NextResponse.json({ 
                    error: 'Chat not found',
                    details: error.message 
                }, { status: 404 });
            }
        }
        
        return NextResponse.json({ 
            error: 'Failed to delete chat(s)',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

// GET /api/admin/chats - Get all chats (for admin dashboard)
export async function GET() {
    try {
        console.log('📚 [API] Fetching all chats for admin dashboard...');
        
        const chats = await adminClient.fetch(
            `*[_type == "chat"] {
                _id,
                _createdAt,
                _updatedAt,
                _rev,
                uniqueKey,
                title,
                user,
                messages,
                analytics,
                createdAt,
                updatedAt,
                tags,
                detectedLanguage,
                location
            } | order(updatedAt desc)`
        );
        
        console.log(`✅ [API] Successfully fetched ${chats.length} chats`);
        
        return NextResponse.json({ 
            success: true, 
            chats,
            count: chats.length 
        });
        
    } catch (error) {
        console.error('❌ [API] Error fetching chats:', error);
        
        return NextResponse.json({ 
            error: 'Failed to fetch chats',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
} 