import { client } from '../client'
import { Chat, SanityChat, convertSanityChatToChat } from '@/types/chat'

export async function getAllChats(): Promise<Chat[]> {
    try {
        const chats = await client.fetch<SanityChat[]>(
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
        )
        
        return chats.map(convertSanityChatToChat)
    } catch (error) {
        console.error('Error fetching all chats:', error)
        throw new Error('Failed to fetch chats from Sanity')
    }
}

export async function deleteChat(chatId: string): Promise<void> {
    try {
        console.log(`🗑️ [Sanity] Deleting chat: ${chatId}`)
        
        const result = await client.delete(chatId)
        
        if (result) {
            console.log(`✅ [Sanity] Successfully deleted chat: ${chatId}`)
        } else {
            throw new Error('Delete operation returned no result')
        }
    } catch (error) {
        console.error(`❌ [Sanity] Error deleting chat ${chatId}:`, error)
        throw new Error(`Failed to delete chat: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
}

export async function deleteAllChats(): Promise<{ deletedCount: number }> {
    try {
        console.log('🗑️ [Sanity] Starting bulk delete of all chats...')
        
        // First, get all chat IDs
        const chatIds = await client.fetch<string[]>(
            `*[_type == "chat"]._id`
        )
        
        console.log(`📊 [Sanity] Found ${chatIds.length} chats to delete`)
        
        if (chatIds.length === 0) {
            return { deletedCount: 0 }
        }
        
        // Delete all chats in batch
        const transaction = client.transaction()
        
        chatIds.forEach(chatId => {
            transaction.delete(chatId)
        })
        
        const result = await transaction.commit()
        
        console.log(`✅ [Sanity] Successfully deleted ${chatIds.length} chats`)
        console.log('🔄 [Sanity] Bulk delete result:', result)
        
        return { deletedCount: chatIds.length }
    } catch (error) {
        console.error('❌ [Sanity] Error during bulk delete:', error)
        throw new Error(`Failed to delete all chats: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
}

export async function getChatById(chatId: string): Promise<Chat | null> {
    try {
        const chat = await client.fetch<SanityChat | null>(
            `*[_type == "chat" && _id == $chatId][0] {
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
            }`,
            { chatId }
        )
        
        return chat ? convertSanityChatToChat(chat) : null
    } catch (error) {
        console.error(`Error fetching chat ${chatId}:`, error)
        throw new Error('Failed to fetch chat from Sanity')
    }
}
