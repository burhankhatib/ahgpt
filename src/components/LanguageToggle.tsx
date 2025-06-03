"use client";

import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { useState, useEffect, useRef } from 'react';

export default function LanguageToggle() {
    const { language, setLanguage, toggleLanguage, autoDetect, setAutoDetect, isRTL, mounted } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const languages = [
        { code: 'en', name: 'English', flag: '🇺🇸', nativeName: 'English' },
        { code: 'zh', name: 'Chinese', flag: '🇨🇳', nativeName: '中文' },
        { code: 'hi', name: 'Hindi', flag: '🇮🇳', nativeName: 'हिन्दी' },
        { code: 'es', name: 'Spanish', flag: '🇪🇸', nativeName: 'Español' },
        { code: 'ar', name: 'Arabic', flag: '🇸🇦', nativeName: 'العربية' },
        { code: 'he', name: 'Hebrew', flag: '🇮🇱', nativeName: 'עברית' },
        { code: 'fr', name: 'French', flag: '🇫🇷', nativeName: 'Français' },
        { code: 'bn', name: 'Bengali', flag: '🇧🇩', nativeName: 'বাংলা' },
        { code: 'pt', name: 'Portuguese', flag: '🇧🇷', nativeName: 'Português' },
        { code: 'ru', name: 'Russian', flag: '🇷🇺', nativeName: 'Русский' },
        { code: 'id', name: 'Indonesian', flag: '🇮🇩', nativeName: 'Bahasa Indonesia' },
        { code: 'ur', name: 'Urdu', flag: '🇵🇰', nativeName: 'اردو' },
        { code: 'de', name: 'German', flag: '🇩🇪', nativeName: 'Deutsch' },
        { code: 'ja', name: 'Japanese', flag: '🇯🇵', nativeName: '日本語' },
        { code: 'tr', name: 'Turkish', flag: '🇹🇷', nativeName: 'Türkçe' },
        { code: 'ko', name: 'Korean', flag: '🇰🇷', nativeName: '한국어' },
        { code: 'vi', name: 'Vietnamese', flag: '🇻🇳', nativeName: 'Tiếng Việt' },
        { code: 'te', name: 'Telugu', flag: '🇮🇳', nativeName: 'తెలుగు' },
        { code: 'mr', name: 'Marathi', flag: '🇮🇳', nativeName: 'मराठी' },
        { code: 'ta', name: 'Tamil', flag: '🇮🇳', nativeName: 'தமிழ்' },
        { code: 'th', name: 'Thai', flag: '🇹🇭', nativeName: 'ไทย' },
        { code: 'bal', name: 'Balochi', flag: '🇵🇰', nativeName: 'بلۏچی' },
        { code: 'ms', name: 'Malay', flag: '🇲🇾', nativeName: 'Bahasa Melayu' },
        { code: 'fi', name: 'Finnish', flag: '🇫🇮', nativeName: 'Suomi' },
        { code: 'sv', name: 'Swedish', flag: '🇸🇪', nativeName: 'Svenska' },
        { code: 'no', name: 'Norwegian', flag: '🇳🇴', nativeName: 'Norsk' },
        { code: 'da', name: 'Danish', flag: '🇩🇰', nativeName: 'Dansk' },
    ] as const;

    const currentLanguage = languages.find(lang => lang.code === language);

    // Group languages for better organization
    const popularLanguages = languages.slice(0, 8); // Top 8 most spoken including Hebrew
    const otherLanguages = languages.slice(8);

    // Handle click outside and escape key
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                isOpen &&
                dropdownRef.current &&
                buttonRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscapeKey);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [isOpen]);

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    const handleLanguageSelect = (langCode: typeof language) => {
        setLanguage(langCode);
        setIsOpen(false);
    };

    const handleQuickToggle = () => {
        toggleLanguage();
        setIsOpen(false);
    };

    // Show loading state until hydration is complete
    if (!mounted) {
        return (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-200/50">
                <div className="w-4 h-4 bg-gray-300 rounded animate-pulse"></div>
                <div className="w-16 h-4 bg-gray-300 rounded animate-pulse"></div>
                <div className="w-3 h-3 bg-gray-300 rounded animate-pulse"></div>
            </div>
        );
    }

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                onClick={handleToggle}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:bg-white/90 transition-all duration-200 shadow-sm hover:shadow-md"
                title="Language Settings"
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                <LanguageIcon className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                    {currentLanguage?.flag} {currentLanguage?.nativeName}
                </span>
                <Cog6ToothIcon className="w-3 h-3 text-gray-400" />
            </button>

            {isOpen && (
                <div
                    ref={dropdownRef}
                    className={`absolute ${isRTL ? 'left-0' : 'right-0'} top-full mt-2 w-80 bg-white/95 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-xl z-50 p-4 max-h-96 overflow-y-auto`}
                >
                    {/* Auto-detect toggle */}
                    <div className="mb-4 p-3 bg-gray-50/50 rounded-xl">
                        <div className={`flex items-center justify-between mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <span className="text-sm font-medium text-gray-700">Auto-detect Language</span>
                            <button
                                onClick={() => setAutoDetect(!autoDetect)}
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${autoDetect ? 'bg-blue-500' : 'bg-gray-300'
                                    }`}
                                aria-label={`Auto-detect is ${autoDetect ? 'enabled' : 'disabled'}`}
                            >
                                <span
                                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200 ${isRTL ? autoDetect ? '-translate-x-5' : '-translate-x-1' : autoDetect ? 'translate-x-1' : 'translate-x-5'}`}
                                />
                            </button>
                        </div>
                        <p className={`text-xs text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`}>
                            Automatically detect and switch language based on your messages
                        </p>
                    </div>

                    {/* Popular Languages */}
                    <div className="mb-4">
                        <p className="text-xs font-medium text-gray-500 mb-2 px-2">Popular Languages</p>
                        <div className="grid grid-cols-2 gap-1">
                            {popularLanguages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => handleLanguageSelect(lang.code)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all duration-200 ${language === lang.code
                                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                        : 'hover:bg-gray-50 text-gray-700'
                                        }`}
                                >
                                    <span className="text-sm">{lang.flag}</span>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-xs font-medium truncate">{lang.name}</span>
                                        <span className="text-xs text-gray-500 truncate">{lang.nativeName}</span>
                                    </div>
                                    {language === lang.code && (
                                        <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Other Languages */}
                    <div className="mb-4">
                        <p className="text-xs font-medium text-gray-500 mb-2 px-2">Other Languages</p>
                        <div className="space-y-1">
                            {otherLanguages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => handleLanguageSelect(lang.code)}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all duration-200 ${language === lang.code
                                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                        : 'hover:bg-gray-50 text-gray-700'
                                        }`}
                                >
                                    <span className="text-sm">{lang.flag}</span>
                                    <div className="flex flex-col min-w-0 flex-1">
                                        <span className="text-sm font-medium">{lang.name}</span>
                                        <span className="text-xs text-gray-500">{lang.nativeName}</span>
                                    </div>
                                    {language === lang.code && (
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quick toggle button */}
                    <div className="pt-3 border-t border-gray-200/50">
                        <button
                            onClick={handleQuickToggle}
                            className="w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-xl transition-all duration-200"
                        >
                            Quick Switch (En → 中文 → हिन्दी → Es → العربية → עברית → Fr → Sv → Fi → No → Da)
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
} 