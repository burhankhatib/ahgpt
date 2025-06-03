import { SanityLive } from '@/sanity/lib/live'
import React from 'react'

export function Providers({ children }: { children: React.ReactNode }): React.ReactNode {
    return (
        <>
            {children}
            <SanityLive />
        </>
    )
} 