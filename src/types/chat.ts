export interface User {
    firstName: string;
    lastName: string;
    email: string;
    clerkId: string;
}

export interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    uniqueKey?: string;
    // Optional user context for messages (mainly for API calls)
    firstName?: string;
    lastName?: string;
    email?: string;
}

export interface SanityMessage {
    _key: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    uniqueKey: string;
}

export interface Analytics {
    viewCount: number;
    exportCount: number;
    lastViewedAt?: Date;
}

export interface SanityAnalytics {
    viewCount: number;
    exportCount: number;
    lastViewedAt?: string;
}

export interface Chat {
    _id?: string;
    uniqueKey?: string;
    user: User;
    title: string;
    messages: Message[];
    analytics?: Analytics;
    createdAt: Date;
    updatedAt: Date;
    tags?: string[];
    language?: 'en' | 'ar' | 'he';
}

export interface SanityChat {
    _id: string;
    _type: string;
    uniqueKey?: string;
    user: User;
    title: string;
    messages: SanityMessage[];
    analytics?: SanityAnalytics;
    createdAt: string;
    updatedAt: string;
    tags?: string[];
    language?: 'en' | 'ar' | 'he';
}

export function convertSanityChatToChat(sanityChat: SanityChat): Chat {
    return {
        _id: sanityChat._id,
        user: sanityChat.user,
        title: sanityChat.title,
        messages: sanityChat.messages.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
        })),
        analytics: sanityChat.analytics ? {
            ...sanityChat.analytics,
            lastViewedAt: sanityChat.analytics.lastViewedAt ? new Date(sanityChat.analytics.lastViewedAt) : undefined
        } : undefined,
        createdAt: new Date(sanityChat.createdAt),
        updatedAt: new Date(sanityChat.updatedAt),
        tags: sanityChat.tags,
        language: sanityChat.language
    };
} 