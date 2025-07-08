'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { Chat } from '@/types/chat';
import { useLiveChats } from '@/hooks/useLiveChats';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function AdminReference() {
    const { isLoaded: authLoading, userId } = useAuth();
    const router = useRouter();
    const { chats, loading: chatsLoading, error: chatsError } = useLiveChats();
    const [mounted, setMounted] = useState(false);

    // Handle client-side mounting
    useEffect(() => {
        setMounted(true);
    }, []);

    // Handle authentication
    useEffect(() => {
        if (!authLoading && !userId) {
            router.push('/');
        }
    }, [authLoading, userId, router]);

    // Show loading state while checking auth
    if (authLoading || !mounted) {
        return (
            <div className="container mx-auto p-4 space-y-4">
                <Skeleton className="h-8 w-1/4" />
                <div className="grid gap-4">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-24 w-full" />
                    ))}
                </div>
            </div>
        );
    }

    // Show error state if not authenticated
    if (!userId) {
        return null;
    }

    // Show error state if chats failed to load
    if (chatsError) {
        return (
            <div className="container mx-auto p-4">
                <Alert variant="destructive">
                    <ExclamationTriangleIcon className="h-4 w-4" />
                    <AlertDescription>
                        Failed to load data. Please try refreshing the page.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 space-y-4">
            <h1 className="text-2xl font-bold">Admin Reference</h1>

            {/* Loading State */}
            {chatsLoading ? (
                <div className="grid gap-4">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-24 w-full" />
                    ))}
                </div>
            ) : (
                <div className="grid gap-4">
                    {chats.map((chat) => (
                        <ChatCard key={chat._id} chat={chat} />
                    ))}
                </div>
            )}
        </div>
    );
}

function ChatCard({ chat }: { chat: Chat }) {
    return (
        <Card>
            <div className="p-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">
                        {chat.title || 'Untitled Chat'}
                    </h3>
                    <Badge variant={chat.analytics?.viewCount ? 'default' : 'secondary'}>
                        {chat.analytics?.viewCount ? 'Viewed' : 'New'}
                    </Badge>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                    <p>ID: {chat._id}</p>
                    <p>Created: {new Date(chat.createdAt).toLocaleString()}</p>
                    <p>Last Updated: {new Date(chat.updatedAt).toLocaleString()}</p>
                </div>
            </div>
        </Card>
    );
} 