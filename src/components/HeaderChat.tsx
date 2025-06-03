"use client"

import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import { ArrowPathIcon, Bars3Icon, SparklesIcon } from '@heroicons/react/24/solid'
import React, { useState, useEffect } from 'react'
import { trackChatEvent } from '@/utils/analytics'
import LanguageToggle from './LanguageToggle'

interface HeaderChatProps {
    onMenuClick: () => void;
}

export default function HeaderChat({ onMenuClick }: HeaderChatProps) {
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                // Scrolling down
                setIsVisible(false);
            } else {
                // Scrolling up
                setIsVisible(true);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [lastScrollY]);

    const handleRestartChat = () => {
        trackChatEvent('DELETE_CHAT', 'Chat restarted');
        localStorage.removeItem('chatMessages');
        window.location.reload();
    };

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'
                }`}
        >
            <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Left side */}
                        <div className="flex items-center gap-4">
                            <SignedIn>
                                <button
                                    onClick={onMenuClick}
                                    className="p-2.5 rounded-xl hover:bg-gray-100/80 transition-all duration-200 text-gray-600 hover:text-gray-800"
                                    title="Open Menu"
                                >
                                    <Bars3Icon className="w-5 h-5" />
                                </button>
                            </SignedIn>

                            {/* Logo/Brand */}
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <SparklesIcon className="w-4 h-4 text-white" />
                                </div>
                                <h1 className="text-xl font-semibold text-gray-800 hidden sm:block">
                                    AHGPT
                                </h1>
                            </div>
                        </div>

                        {/* Right side */}
                        <div className="flex items-center gap-3">
                            {/* Language Toggle */}
                            <LanguageToggle />

                            <button
                                onClick={handleRestartChat}
                                className="p-2.5 rounded-xl hover:bg-gray-100/80 transition-all duration-200 text-gray-600 hover:text-gray-800"
                                title="Restart Chat"
                            >
                                <ArrowPathIcon className="w-5 h-5" />
                            </button>

                            <SignedIn>
                                <div className="ml-2">
                                    <UserButton
                                        appearance={{
                                            elements: {
                                                avatarBox: "w-8 h-8 rounded-xl shadow-lg",
                                                userButtonPopoverCard: "rounded-2xl shadow-2xl border-0",
                                                userButtonPopoverActions: "rounded-xl"
                                            }
                                        }}
                                    />
                                </div>
                            </SignedIn>

                            <SignedOut>
                                <SignInButton mode='modal'>
                                    <button className="px-4 py-2 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-sm">
                                        Sign In to Save Chats
                                    </button>
                                </SignInButton>
                            </SignedOut>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}
