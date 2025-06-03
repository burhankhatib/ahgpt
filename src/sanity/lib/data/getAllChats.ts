import { client } from '../client'
import { Chat, SanityChat, convertSanityChatToChat } from '@/types/chat'

export async function getAllChats(): Promise<Chat[]> {
    try {
        const chats = await client.fetch<SanityChat[]>(
            `*[_type == "chat"] | order(updatedAt desc)`
        )
        
        return chats.map(convertSanityChatToChat)
    } catch (error) {
        console.error('Error fetching all chats:', error)
        throw new Error('Failed to fetch chats from Sanity')
    }
}
