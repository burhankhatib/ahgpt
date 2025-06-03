"use client";

import { useState } from 'react';
import HeaderChat from './HeaderChat';
import Sidebar from './Sidebar';
import { LanguageProvider } from '@/contexts/LanguageContext';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <LanguageProvider>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50">
                <HeaderChat onMenuClick={() => setIsSidebarOpen(true)} />
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                <div className="">
                    {children}
                </div>
            </div>
        </LanguageProvider>
    );
} 