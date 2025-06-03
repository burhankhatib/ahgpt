'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { Metadata } from 'next';
import '../app/globals.css';

interface ForceEnglishContextType {
    language: 'en';
}

const ForceEnglishContext = createContext<ForceEnglishContextType>({ language: 'en' });

export const useForceEnglish = () => useContext(ForceEnglishContext);

export function ForceEnglish({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Force the document language to English
        if (typeof document !== 'undefined') {
            document.documentElement.lang = 'en';
            document.documentElement.dir = 'ltr'; // Left-to-right for English
        }
    }, []);

    return (
        <ForceEnglishContext.Provider value={{ language: 'en' }}>
            {children}
        </ForceEnglishContext.Provider>
    );
}

export const metadata: Metadata = {
    title: 'Al Hayat GPT',
    description: 'The first and most advanced Christian AI chatbot that can debate with you in Islam and Christianity.',
}


// Hebrew script - Noto Sans Hebrew (modern, clean Hebrew typography)

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={`
                font-inter
            `}>
                {children}
            </body>
        </html>
    )
} 