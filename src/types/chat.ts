export interface User {
    firstName: string;
    lastName?: string;
    email: string;
    clerkId: string;
    // Location data
    country?: string;
    countryCode?: string;
    city?: string;
    region?: string;
    ip?: string;
    timezone?: string;
}

export interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    uniqueKey: string;
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
    viewCount?: number;
    exportCount?: number;
    lastViewedAt?: Date;
}

export interface SanityAnalytics {
    viewCount?: number;
    exportCount?: number;
    lastViewedAt?: string;
}

// User location interface based on UserLocation component
export interface UserLocation {
    latitude?: number;
    longitude?: number;
    city?: string;
    region?: string;
    country?: string;
    timezone?: string;
    ip?: string;
    source: 'geolocation' | 'ip' | 'unknown';
}

// Supported languages type for auto-detection
export type DetectedLanguage = 'en' | 'zh' | 'hi' | 'es' | 'ar' | 'fr' | 'bn' | 'pt' | 'ru' | 'id' | 'ur' | 'de' | 'ja' | 'tr' | 'ko' | 'vi' | 'te' | 'mr' | 'ta' | 'th' | 'he' | 'bal' | 'ms' | 'fi' | 'sv' | 'no' | 'da';

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
    detectedLanguage?: DetectedLanguage;
    location?: UserLocation;
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
    detectedLanguage?: DetectedLanguage;
    location?: UserLocation;
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
        detectedLanguage: sanityChat.detectedLanguage,
        location: sanityChat.location
    };
} 