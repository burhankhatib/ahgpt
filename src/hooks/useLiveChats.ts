'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Chat } from '@/types/chat';
import { getAllChats } from '@/sanity/lib/data/getAllChats';

interface UseLiveChatsReturn {
    chats: Chat[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useLiveChats(
    refreshInterval: number = 5000, // 5 seconds default
    enableAutoRefresh: boolean = true
): UseLiveChatsReturn {
    const [chats, setChats] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const mountedRef = useRef(true);

    const fetchChats = useCallback(async (isInitial: boolean = false) => {
        try {
            if (isInitial) {
                setLoading(true);
            }
            setError(null);
            
            console.log('🔄 [useLiveChats] Fetching chats with live updates...');
            
            const response = await getAllChats();
            
            if (mountedRef.current) {
                setChats(response);
                
                console.log(`✅ [useLiveChats] Loaded ${response.length} chats with live updates`);
                
                // Log sample of language and location data
                const withLanguage = response.filter(c => c.detectedLanguage).length;
                const withLocation = response.filter(c => c.location?.country).length;
                console.log(`📊 [useLiveChats] Chats with language: ${withLanguage}/${response.length}`);
                console.log(`🌍 [useLiveChats] Chats with location: ${withLocation}/${response.length}`);
            }
        } catch (error) {
            console.error('❌ [useLiveChats] Error fetching chats:', error);
            if (mountedRef.current) {
                setError(error instanceof Error ? error.message : 'Failed to fetch chats');
            }
        } finally {
            if (mountedRef.current && isInitial) {
                setLoading(false);
            }
        }
    }, []);

    // Setup polling interval for real-time updates
    useEffect(() => {
        // Initial fetch
        fetchChats(true);

        // Setup interval for live updates
        if (enableAutoRefresh) {
            intervalRef.current = setInterval(() => {
                fetchChats(false);
            }, refreshInterval);

            console.log(`🔄 [useLiveChats] Auto-refresh enabled with ${refreshInterval}ms interval`);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [fetchChats, refreshInterval, enableAutoRefresh]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            mountedRef.current = false;
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    const refetch = useCallback(async () => {
        await fetchChats(false);
    }, [fetchChats]);

    return {
        chats,
        loading,
        error,
        refetch
    };
} 