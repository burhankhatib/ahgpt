'use client';

import { useState, useEffect } from 'react';
import { Chat } from '@/types/chat';

interface UseLiveChatsReturn {
    chats: Chat[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useLiveChats(
    refreshInterval: number = 5000,
    enableAutoRefresh: boolean = true
): UseLiveChatsReturn {
    const [chats, setChats] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchChats = async () => {
        try {
            setError(null);
            
            const response = await fetch('/api/admin/chats');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch chats');
            }
            
            setChats(data.chats || []);
            
        } catch (err) {
            console.error('Error fetching chats:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch chats');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Only run on client side
        if (typeof window === 'undefined') {
            return;
        }

        // Initial fetch
        fetchChats();

        // Setup interval for auto-refresh
        let interval: NodeJS.Timeout | null = null;
        
        if (enableAutoRefresh) {
            interval = setInterval(fetchChats, refreshInterval);
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [refreshInterval, enableAutoRefresh]);

    return {
        chats,
        loading,
        error,
        refetch: fetchChats
    };
} 