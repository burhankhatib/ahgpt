import { Analytics } from '@vercel/analytics/react';
import { useUser } from '@clerk/nextjs';

// Event categories
export const EventCategories = {
    CHAT: 'chat',
    USER: 'user',
    EXPORT: 'export',
    NAVIGATION: 'navigation',
    ENGAGEMENT: 'engagement'
} as const;

// Event actions
export const EventActions = {
    // Chat events
    CREATE_CHAT: 'create_chat',
    DELETE_CHAT: 'delete_chat',
    SEND_MESSAGE: 'send_message',
    RECEIVE_MESSAGE: 'receive_message',
    
    // User events
    SIGN_IN: 'sign_in',
    SIGN_OUT: 'sign_out',
    SIGN_UP: 'sign_up',
    
    // Export events
    EXPORT_PDF: 'export_pdf',
    EXPORT_TEXT: 'export_text',
    EMAIL_EXPORT: 'email_export',
    
    // Navigation events
    OPEN_SIDEBAR: 'open_sidebar',
    CLOSE_SIDEBAR: 'close_sidebar',
    SWITCH_CHAT: 'switch_chat',
    
    // Engagement events
    SCROLL: 'scroll',
    CLICK: 'click',
    HOVER: 'hover',
    SEARCH: 'search',
    FILTER: 'filter'
} as const;

interface AnalyticsEvent {
    category: keyof typeof EventCategories;
    action: keyof typeof EventActions;
    label?: string;
    value?: number;
    nonInteraction?: boolean;
    userId?: string;
}

declare global {
    interface Window {
        gtag: (
            command: string,
            action: string,
            params: {
                event_category: string;
                event_label?: string;
                value?: number;
                non_interaction?: boolean;
                user_id?: string;
                timestamp?: string;
            }
        ) => void;
    }
}

export function trackEvent({ category, action, label, value, nonInteraction }: AnalyticsEvent) {
    if (typeof window !== 'undefined' && window.gtag) {
        const userId = typeof window !== 'undefined' ? 'anonymous' : 'anonymous'; // We'll get the actual user ID from the component
        window.gtag('event', action, {
            event_category: category,
            event_label: label,
            value: value,
            non_interaction: nonInteraction,
            user_id: userId,
            timestamp: new Date().toISOString()
        });
    }
}

// Track user behavior
export function trackUserBehavior() {
    if (typeof window === 'undefined') return;

    // Track scroll depth
    let maxScroll = 0;
    window.addEventListener('scroll', () => {
        const scrollPercent = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100;
        if (scrollPercent > maxScroll) {
            maxScroll = scrollPercent;
            trackEvent({
                category: 'ENGAGEMENT',
                action: 'SCROLL',
                label: `Scroll Depth: ${Math.round(maxScroll)}%`,
                nonInteraction: true
            });
        }
    });

    // Track time on page
    const startTime = Date.now();
    setInterval(() => {
        const timeSpent = Math.round((Date.now() - startTime) / 1000);
        trackEvent({
            category: 'ENGAGEMENT',
            action: 'CLICK',
            label: `Time Spent: ${timeSpent}s`,
            nonInteraction: true
        });
    }, 60000); // Track every minute

    // Track clicks
    document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const elementType = target.tagName.toLowerCase();
        const elementId = target.id;
        const elementClass = target.className;
        
        trackEvent({
            category: 'ENGAGEMENT',
            action: 'CLICK',
            label: `${elementType}${elementId ? `#${elementId}` : ''}${elementClass ? `.${elementClass}` : ''}`
        });
    });
}

// Get user ID for tracking
export function useAnalyticsUserId(): string {
    const { user } = useUser();
    return user?.id || 'anonymous';
}

// Track chat-specific events
export function trackChatEvent(action: keyof typeof EventActions, label?: string, value?: number) {
    trackEvent({
        category: 'CHAT',
        action,
        label,
        value
    });
}

// Track export events
export function trackExportEvent(action: keyof typeof EventActions, format: string) {
    trackEvent({
        category: 'EXPORT',
        action,
        label: `Format: ${format}`
    });
}

// Track navigation events
export function trackNavigationEvent(action: keyof typeof EventActions, page: string) {
    trackEvent({
        category: 'NAVIGATION',
        action,
        label: `Page: ${page}`
    });
}

// Initialize analytics
export function initAnalytics(userId: string) {
    if (typeof window !== 'undefined') {
        // Initialize Vercel Analytics
        Analytics({ debug: false });
        
        // Start tracking user behavior
        trackUserBehavior();
        
        // Track page views with user ID
        trackEvent({
            category: 'NAVIGATION',
            action: 'CLICK',
            label: `Page View: ${window.location.pathname}`,
            nonInteraction: true,
            userId
        });
    }
} 