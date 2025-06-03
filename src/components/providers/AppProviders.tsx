"use client";

import React from 'react';
import { Toaster } from 'react-hot-toast';
import { Analytics } from '@vercel/analytics/react';
import { useUser } from '@clerk/nextjs';
import { initAnalytics } from '@/utils/analytics';

interface AppProvidersProps {
    children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
    const { user } = useUser();

    React.useEffect(() => {
        if (user) {
            initAnalytics(user.id);
        }
    }, [user]);

    return (
        <>
            {children}
            <Toaster />
            <Analytics />
        </>
    );
} 