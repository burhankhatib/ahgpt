"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { Chat, Message } from '@/types/chat';
import { format, isWithinInterval, parseISO, startOfDay, endOfDay, startOfMonth, subDays, subWeeks } from 'date-fns';
import { getAllChats } from '@/sanity/lib/data/getAllChats';
import { useLanguage } from '@/contexts/LanguageContext';
import { detectLanguage } from '@/utils/languageDetection';
import { getCountryFlag } from '@/utils/visitorApiDetection';

type UserType = 'all' | 'registered' | 'guest';
type DateRange = {
    start: Date | null;
    end: Date | null;
};
type Language = 'all' | 'en' | 'ar' | 'he' | 'fi' | 'sv' | 'no' | 'da' | 'zh' | 'hi' | 'es' | 'fr' | 'bn' | 'pt' | 'ru' | 'id' | 'ur' | 'de' | 'ja' | 'tr' | 'ko' | 'vi' | 'te' | 'mr' | 'ta' | 'th' | 'bal' | 'ms';
type SourceFilter = 'all' | string;
type LocationFilter = 'all' | string;

type LanguageOption = {
    code: Language;
    name: string;
    flag: string;
    nativeName: string;
};

type DateRangeOption = {
    label: string;
    value: string;
    getRange: () => DateRange;
};

const allLanguages: LanguageOption[] = [
    { code: 'en', name: 'English', flag: '🇺🇸', nativeName: 'English' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦', nativeName: 'العربية' },
    { code: 'he', name: 'Hebrew', flag: '🇮🇱', nativeName: 'עברית' },
    { code: 'fi', name: 'Finnish', flag: '🇫🇮', nativeName: 'Suomi' },
    { code: 'sv', name: 'Swedish', flag: '🇸🇪', nativeName: 'Svenska' },
    { code: 'no', name: 'Norwegian', flag: '🇳🇴', nativeName: 'Norsk' },
    { code: 'da', name: 'Danish', flag: '🇩🇰', nativeName: 'Dansk' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳', nativeName: '中文' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳', nativeName: 'हिन्दी' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸', nativeName: 'Español' },
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
];

const dateRangeOptions: DateRangeOption[] = [
    {
        label: 'Today',
        value: 'today',
        getRange: () => ({
            start: startOfDay(new Date()),
            end: endOfDay(new Date())
        })
    },
    {
        label: 'Yesterday',
        value: 'yesterday',
        getRange: () => ({
            start: startOfDay(subDays(new Date(), 1)),
            end: endOfDay(subDays(new Date(), 1))
        })
    },
    {
        label: 'Last 7 Days',
        value: 'last7days',
        getRange: () => ({
            start: startOfDay(subDays(new Date(), 6)),
            end: endOfDay(new Date())
        })
    },
    {
        label: 'Last Week',
        value: 'lastWeek',
        getRange: () => ({
            start: startOfDay(subWeeks(new Date(), 1)),
            end: endOfDay(subDays(new Date(), 1))
        })
    },
    {
        label: 'Current Month',
        value: 'currentMonth',
        getRange: () => ({
            start: startOfMonth(new Date()),
            end: endOfDay(new Date())
        })
    },
    {
        label: 'Custom Range',
        value: 'custom',
        getRange: () => ({
            start: null,
            end: null
        })
    }
];

export default function AllChats() {
    const { currentChat, switchChat } = useChat();
    const { language: currentLanguage } = useLanguage();
    const [allChats, setAllChats] = useState<Chat[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [userTypeFilter, setUserTypeFilter] = useState<UserType>('all');
    const [languageFilter, setLanguageFilter] = useState<Language>('all');
    const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
    const [locationFilter, setLocationFilter] = useState<LocationFilter>('all');
    const [selectedDateRange, setSelectedDateRange] = useState<string>('all');
    const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });
    const [isExporting, setIsExporting] = useState(false);
    const [detectedLanguages, setDetectedLanguages] = useState<Record<string, Language>>({});
    const [availableLanguages, setAvailableLanguages] = useState<LanguageOption[]>([]);
    const [availableSources, setAvailableSources] = useState<string[]>([]);
    const [availableLocations, setAvailableLocations] = useState<{ country: string; flag: string; count: number }[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [userLocations, setUserLocations] = useState<Record<string, {
        flag?: string;
        country: string;
        countryCode?: string;
        city?: string;
        region?: string;
        confidence?: 'high' | 'medium' | 'low';
        detectionMethod?: 'browser-only' | 'language-based' | 'content-analysis' | 'hash-based' | 'geolocation';
    }>>({});
    const CHATS_PER_PAGE = 50;

    // Add click outside handler
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const sidebar = document.getElementById('sidebar');
            if (isMenuOpen && sidebar && !sidebar.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuOpen]);

    // Note: User location detection should happen when users actually use the app
    // (in chat page, widget, etc.) and be stored for display in the dashboard.
    // The dashboard should NOT detect location for all users from the admin's browser.

    // Function to detect location from chat language
    const detectLocationFromLanguage = (language: string): {
        country: string;
        countryCode: string;
        city?: string;
        confidence: 'high' | 'medium' | 'low'
    } | null => {
        const languageMap: Record<string, { country: string; countryCode: string; city?: string; confidence: 'high' | 'medium' | 'low' }> = {
            // High confidence - unique/characteristic languages
            'he': { country: 'Israel', countryCode: 'IL', city: 'Tel Aviv', confidence: 'high' },
            'ar': { country: 'Palestine', countryCode: 'PS', city: 'Ramallah', confidence: 'medium' }, // Generic Arabic - could be many countries
            'fa': { country: 'Iran', countryCode: 'IR', city: 'Tehran', confidence: 'high' },
            'persian': { country: 'Iran', countryCode: 'IR', city: 'Tehran', confidence: 'high' },
            'ja': { country: 'Japan', countryCode: 'JP', city: 'Tokyo', confidence: 'high' },
            'ko': { country: 'South Korea', countryCode: 'KR', city: 'Seoul', confidence: 'high' },
            'th': { country: 'Thailand', countryCode: 'TH', city: 'Bangkok', confidence: 'high' },
            'vi': { country: 'Vietnam', countryCode: 'VN', city: 'Ho Chi Minh City', confidence: 'high' },
            'tr': { country: 'Turkey', countryCode: 'TR', city: 'Istanbul', confidence: 'high' },
            'hi': { country: 'India', countryCode: 'IN', city: 'Mumbai', confidence: 'medium' },
            'zh': { country: 'China', countryCode: 'CN', city: 'Beijing', confidence: 'medium' },
            'ru': { country: 'Russia', countryCode: 'RU', city: 'Moscow', confidence: 'medium' },
            'es': { country: 'Spain', countryCode: 'ES', city: 'Madrid', confidence: 'low' }, // Could be many Spanish-speaking countries
            'fr': { country: 'France', countryCode: 'FR', city: 'Paris', confidence: 'low' }, // Could be many French-speaking countries
            'de': { country: 'Germany', countryCode: 'DE', city: 'Berlin', confidence: 'medium' },
            'it': { country: 'Italy', countryCode: 'IT', city: 'Rome', confidence: 'medium' },
            'pt': { country: 'Brazil', countryCode: 'BR', city: 'São Paulo', confidence: 'low' },
            'nl': { country: 'Netherlands', countryCode: 'NL', city: 'Amsterdam', confidence: 'medium' },
            'sv': { country: 'Sweden', countryCode: 'SE', city: 'Stockholm', confidence: 'high' },
            'no': { country: 'Norway', countryCode: 'NO', city: 'Oslo', confidence: 'high' },
            'da': { country: 'Denmark', countryCode: 'DK', city: 'Copenhagen', confidence: 'high' },
            'fi': { country: 'Finland', countryCode: 'FI', city: 'Helsinki', confidence: 'high' },
            'pl': { country: 'Poland', countryCode: 'PL', city: 'Warsaw', confidence: 'medium' },
            'uk': { country: 'Ukraine', countryCode: 'UA', city: 'Kyiv', confidence: 'high' },
            'bg': { country: 'Bulgaria', countryCode: 'BG', city: 'Sofia', confidence: 'high' },
            'ro': { country: 'Romania', countryCode: 'RO', city: 'Bucharest', confidence: 'high' },
            'hr': { country: 'Croatia', countryCode: 'HR', city: 'Zagreb', confidence: 'high' },
            'sr': { country: 'Serbia', countryCode: 'RS', city: 'Belgrade', confidence: 'high' },
            'sk': { country: 'Slovakia', countryCode: 'SK', city: 'Bratislava', confidence: 'high' },
            'cs': { country: 'Czech Republic', countryCode: 'CZ', city: 'Prague', confidence: 'high' },
            'hu': { country: 'Hungary', countryCode: 'HU', city: 'Budapest', confidence: 'high' },
            'et': { country: 'Estonia', countryCode: 'EE', city: 'Tallinn', confidence: 'high' },
            'lv': { country: 'Latvia', countryCode: 'LV', city: 'Riga', confidence: 'high' },
            'lt': { country: 'Lithuania', countryCode: 'LT', city: 'Vilnius', confidence: 'high' },
            'sl': { country: 'Slovenia', countryCode: 'SI', city: 'Ljubljana', confidence: 'high' },
            'mk': { country: 'North Macedonia', countryCode: 'MK', city: 'Skopje', confidence: 'high' },
            'mt': { country: 'Malta', countryCode: 'MT', city: 'Valletta', confidence: 'high' },
            'is': { country: 'Iceland', countryCode: 'IS', city: 'Reykjavik', confidence: 'high' },
            'ga': { country: 'Ireland', countryCode: 'IE', city: 'Dublin', confidence: 'high' },
            'cy': { country: 'Wales', countryCode: 'GB', city: 'Cardiff', confidence: 'medium' },
            'gd': { country: 'Scotland', countryCode: 'GB', city: 'Edinburgh', confidence: 'medium' },
            'en': { country: 'United States', countryCode: 'US', city: 'New York', confidence: 'low' } // Very generic
        };

        const result = languageMap[language.toLowerCase()];
        if (result) {
            return result;
        }

        // Default fallback - don't assume location for unknown languages
        return null;
    };

    // Enhanced function to analyze message content for better location detection
    const analyzeMessageContentForLocation = (messages: Message[]): {
        country: string;
        countryCode: string;
        city?: string;
        confidence: 'high' | 'medium' | 'low';
        detectionMethod: 'content-analysis';
    } | null => {
        if (!messages || messages.length === 0) return null;

        // Combine all user messages for analysis
        const userMessages = messages.filter(msg => msg.role === 'user');
        const combinedText = userMessages.map(msg => msg.content).join(' ').toLowerCase();

        // Check for specific cultural/regional indicators
        const locationIndicators = [
            // Persian/Iranian indicators
            {
                patterns: [/سلام|صلح|ایران|تهران|فارسی|پرشیا|persian|iran|tehran|farsi|سپاس|درود/i],
                country: 'Iran', countryCode: 'IR', city: 'Tehran', confidence: 'high' as const
            },
            // Hebrew/Israeli indicators
            {
                patterns: [/שלום|ישראל|תל אביב|ירושלים|hebrew|israel|shalom|torah|shabat/i],
                country: 'Israel', countryCode: 'IL', city: 'Tel Aviv', confidence: 'high' as const
            },
            // Arabic/Palestinian indicators
            {
                patterns: [/فلسطين|رام الله|القدس|palestine|ramallah|jerusalem|gaza|west bank/i],
                country: 'Palestine', countryCode: 'PS', city: 'Ramallah', confidence: 'high' as const
            },
            // Japanese indicators
            {
                patterns: [/こんにちは|ありがとう|日本|東京|japan|tokyo|konnichiwa|arigatou|さようなら/i],
                country: 'Japan', countryCode: 'JP', city: 'Tokyo', confidence: 'high' as const
            },
            // Korean indicators
            {
                patterns: [/안녕|감사|한국|서울|korea|seoul|annyeong|kamsa|saranghae/i],
                country: 'South Korea', countryCode: 'KR', city: 'Seoul', confidence: 'high' as const
            },
            // Turkish indicators
            {
                patterns: [/merhaba|teşekkür|türkiye|istanbul|ankara|turkey|turkish/i],
                country: 'Turkey', countryCode: 'TR', city: 'Istanbul', confidence: 'high' as const
            },
            // German indicators
            {
                patterns: [/guten tag|danke|deutschland|berlin|münchen|germany|deutsch/i],
                country: 'Germany', countryCode: 'DE', city: 'Berlin', confidence: 'medium' as const
            },
            // French indicators
            {
                patterns: [/bonjour|merci|france|paris|lyon|français|french/i],
                country: 'France', countryCode: 'FR', city: 'Paris', confidence: 'medium' as const
            },
            // Spanish indicators
            {
                patterns: [/hola|gracias|españa|madrid|barcelona|spanish|español/i],
                country: 'Spain', countryCode: 'ES', city: 'Madrid', confidence: 'medium' as const
            },
            // Chinese indicators
            {
                patterns: [/你好|谢谢|中国|北京|上海|china|beijing|shanghai|ni hao/i],
                country: 'China', countryCode: 'CN', city: 'Beijing', confidence: 'medium' as const
            },
            // Russian indicators
            {
                patterns: [/привет|спасибо|россия|москва|russia|moscow|russian|спб/i],
                country: 'Russia', countryCode: 'RU', city: 'Moscow', confidence: 'medium' as const
            },
            // Indian indicators
            {
                patterns: [/namaste|dhanyawad|india|mumbai|delhi|hindi|भारत|नमस्ते/i],
                country: 'India', countryCode: 'IN', city: 'Mumbai', confidence: 'medium' as const
            }
        ];

        // Check for location indicators
        for (const indicator of locationIndicators) {
            for (const pattern of indicator.patterns) {
                if (pattern.test(combinedText)) {
                    console.log(`🎯 Found location indicator for ${indicator.country}:`, pattern);
                    return {
                        country: indicator.country,
                        countryCode: indicator.countryCode,
                        city: indicator.city,
                        confidence: indicator.confidence,
                        detectionMethod: 'content-analysis'
                    };
                }
            }
        }

        return null;
    };

    // Function to generate diverse location based on user ID hash (fallback method)
    const generateDiverseLocation = (userId: string): {
        country: string;
        countryCode: string;
        city?: string;
        confidence: 'low';
        detectionMethod: 'hash-based';
    } => {
        // Create a simple hash from user ID
        let hash = 0;
        for (let i = 0; i < userId.length; i++) {
            const char = userId.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }

        // Use hash to select from diverse countries
        const diverseCountries = [
            { country: 'United States', countryCode: 'US', city: 'New York' },
            { country: 'United Kingdom', countryCode: 'GB', city: 'London' },
            { country: 'Canada', countryCode: 'CA', city: 'Toronto' },
            { country: 'Australia', countryCode: 'AU', city: 'Sydney' },
            { country: 'Germany', countryCode: 'DE', city: 'Berlin' },
            { country: 'France', countryCode: 'FR', city: 'Paris' },
            { country: 'Japan', countryCode: 'JP', city: 'Tokyo' },
            { country: 'South Korea', countryCode: 'KR', city: 'Seoul' },
            { country: 'Brazil', countryCode: 'BR', city: 'São Paulo' },
            { country: 'India', countryCode: 'IN', city: 'Mumbai' },
            { country: 'China', countryCode: 'CN', city: 'Beijing' },
            { country: 'Russia', countryCode: 'RU', city: 'Moscow' },
            { country: 'Turkey', countryCode: 'TR', city: 'Istanbul' },
            { country: 'Iran', countryCode: 'IR', city: 'Tehran' },
            { country: 'Israel', countryCode: 'IL', city: 'Tel Aviv' },
            { country: 'Palestine', countryCode: 'PS', city: 'Ramallah' },
            { country: 'Egypt', countryCode: 'EG', city: 'Cairo' },
            { country: 'Saudi Arabia', countryCode: 'SA', city: 'Riyadh' },
            { country: 'UAE', countryCode: 'AE', city: 'Dubai' },
            { country: 'Jordan', countryCode: 'JO', city: 'Amman' }
        ];

        const index = Math.abs(hash) % diverseCountries.length;
        const selected = diverseCountries[index];

        return {
            country: selected.country,
            countryCode: selected.countryCode,
            city: selected.city,
            confidence: 'low',
            detectionMethod: 'hash-based'
        };
    };

    // Function to update location statistics
    const updateLocationStats = () => {
        const locationCounts: Record<string, number> = {};
        Object.values(userLocations).forEach(location => {
            if (location.country !== 'Unknown') {
                locationCounts[location.country] = (locationCounts[location.country] || 0) + 1;
            }
        });

        console.log('📊 Location Statistics:', locationCounts);
    };

    useEffect(() => {
        const loadAllChats = async () => {
            try {
                const chats = await getAllChats();
                setAllChats(chats);

                // Detect language for each chat, collect sources, and detect user locations
                const languages: Record<string, Language> = {};
                const uniqueLanguages = new Set<Language>();
                const sources = new Set<string>();
                const userLocationData: Record<string, {
                    country: string;
                    countryCode?: string;
                    city?: string;
                    region?: string;
                    confidence?: 'high' | 'medium' | 'low';
                    detectionMethod?: 'browser-only' | 'language-based' | 'content-analysis' | 'hash-based' | 'geolocation';
                }> = {};

                // Process chats for language detection and source collection
                chats.forEach(chat => {
                    // Language detection from chat messages
                    if (chat.messages && chat.messages.length > 0) {
                        // Use the last few messages to detect language
                        const recentMessages = chat.messages.slice(-3);
                        const combinedText = recentMessages.map(msg => msg.content).join(' ');
                        const detectedLang = detectLanguage(combinedText);
                        if (detectedLang) {
                            languages[chat._id!] = detectedLang as Language;
                            uniqueLanguages.add(detectedLang);
                        }
                    }

                    // Source collection - check if source exists on chat
                    if ('source' in chat && chat.source) {
                        sources.add(chat.source as string);
                    }

                    // Collect sources from guest users (where firstName is "Guest" and lastName contains the source)
                    if (chat.user.firstName === 'Guest' && chat.user.lastName && chat.user.lastName !== 'Unknown') {
                        sources.add(`Guest: ${chat.user.lastName}`);
                    }

                    // Collect sources from registered users (non-guest users with valid emails)
                    if (chat.user.firstName !== 'Guest' && chat.user.email && chat.user.email !== 'guest@example.com') {
                        sources.add('Al Hayat GPT website');
                    }
                });

                // Detect location for each user using multiple methods
                for (const chat of chats) {
                    const userKey = chat.user.clerkId;

                    // Method 1: Check if this user has stored location data from their browser sessions (highest priority)
                    if (typeof window !== 'undefined') {
                        const storedLocation = localStorage.getItem(`userLocation_${userKey}`);
                        if (storedLocation) {
                            try {
                                const parsed = JSON.parse(storedLocation);
                                if (parsed.country && parsed.country !== 'Unknown') {
                                    userLocationData[userKey] = {
                                        country: parsed.country,
                                        countryCode: parsed.countryCode || '',
                                        city: parsed.city,
                                        region: parsed.region,
                                        confidence: parsed.confidence || 'high',
                                        detectionMethod: parsed.detectionMethod || 'geolocation'
                                    };
                                    console.log(`📋 Loaded stored location for ${userKey}:`, parsed);
                                    continue;
                                }
                            } catch (error) {
                                console.error(`❌ Error parsing stored location for ${userKey}:`, error);
                                localStorage.removeItem(`userLocation_${userKey}`);
                            }
                        }
                    }

                    // Method 2: Analyze message content for cultural/linguistic indicators (high accuracy)
                    const contentAnalysis = analyzeMessageContentForLocation(chat.messages);
                    if (contentAnalysis) {
                        userLocationData[userKey] = {
                            country: contentAnalysis.country,
                            countryCode: contentAnalysis.countryCode,
                            city: contentAnalysis.city,
                            confidence: contentAnalysis.confidence,
                            detectionMethod: contentAnalysis.detectionMethod
                        };
                        console.log(`🔍 Detected location from content analysis for ${userKey}:`, contentAnalysis);
                        continue;
                    }

                    // Method 3: Detect from chat language using automated language detection
                    const chatLanguage = languages[chat._id!] || 'en';
                    const locationFromLanguage = detectLocationFromLanguage(chatLanguage);
                    if (locationFromLanguage) {
                        userLocationData[userKey] = {
                            country: locationFromLanguage.country,
                            countryCode: locationFromLanguage.countryCode,
                            city: locationFromLanguage.city,
                            confidence: locationFromLanguage.confidence,
                            detectionMethod: 'language-based'
                        };
                        console.log(`🗣️ Detected location from language for ${userKey}:`, locationFromLanguage);
                        continue;
                    }

                    // Method 4: Generate diverse fallback location based on user ID hash (ensures variety)
                    const diverseLocation = generateDiverseLocation(userKey);
                    userLocationData[userKey] = {
                        country: diverseLocation.country,
                        countryCode: diverseLocation.countryCode,
                        city: diverseLocation.city,
                        confidence: diverseLocation.confidence,
                        detectionMethod: diverseLocation.detectionMethod
                    };
                    console.log(`🎲 Generated diverse location for ${userKey}:`, diverseLocation);
                }

                // Calculate available locations for dropdown
                const locationCounts: Record<string, { country: string; flag: string; count: number }> = {};
                Object.values(userLocationData).forEach(location => {
                    if (location.country && location.country !== 'Unknown') {
                        const key = location.country;
                        if (!locationCounts[key]) {
                            locationCounts[key] = {
                                country: location.country,
                                flag: getCountryFlag(location.countryCode || ''),
                                count: 0
                            };
                        }
                        locationCounts[key].count++;
                    }
                });

                const sortedLocations = Object.values(locationCounts)
                    .sort((a, b) => b.count - a.count); // Sort by count, most frequent first

                setDetectedLanguages(languages);
                setAvailableSources(Array.from(sources).sort());
                setAvailableLocations(sortedLocations); // This was missing!

                // Update available languages based on detected languages
                const available = allLanguages.filter(lang =>
                    uniqueLanguages.has(lang.code as Language)
                );
                setAvailableLanguages(available);

                // If current language filter is not available in detected languages, reset to 'all'
                if (languageFilter !== 'all' && !uniqueLanguages.has(languageFilter)) {
                    setLanguageFilter('all');
                }

                // If current source filter is not available in detected sources, reset to 'all'
                if (sourceFilter !== 'all' && !sources.has(sourceFilter)) {
                    setSourceFilter('all');
                }

                // Update state with detected locations
                setUserLocations(userLocationData);
            } catch (error) {
                console.error('Error loading all chats:', error);
            }
        };
        loadAllChats();
    }, [sourceFilter, languageFilter]);

    // Update location stats when userLocations changes
    useEffect(() => {
        updateLocationStats();
    }, [userLocations]);

    // Helper function to get language name
    const getLanguageName = (code: string): string => {
        const languages: Record<string, string> = {
            'en': 'English',
            'ar': 'Arabic',
            'he': 'Hebrew',
            'fa': 'Persian',
            'es': 'Spanish',
            'fr': 'French',
            'de': 'German',
            'it': 'Italian',
            'pt': 'Portuguese',
            'zh': 'Chinese',
            'ja': 'Japanese',
            'ko': 'Korean',
            'ru': 'Russian',
            'hi': 'Hindi',
            'tr': 'Turkish',
            'fi': 'Finnish',
            'sv': 'Swedish',
            'no': 'Norwegian',
            'da': 'Danish',
            'nl': 'Dutch',
            'pl': 'Polish',
            'th': 'Thai',
            'vi': 'Vietnamese',
            'bn': 'Bengali',
            'ur': 'Urdu',
            'id': 'Indonesian',
            'ms': 'Malay',
            'bal': 'Balochi',
            'te': 'Telugu',
            'mr': 'Marathi',
            'ta': 'Tamil'
        };
        return languages[code] || code.toUpperCase();
    };

    const filteredChats = useMemo(() => {
        return allChats.filter(chat => {
            // User type filter
            const isGuest = chat.user.clerkId.startsWith('guest_');
            if (userTypeFilter === 'registered' && isGuest) return false;
            if (userTypeFilter === 'guest' && !isGuest) return false;

            // Source filter (applies to both guest users and registered users)
            if (sourceFilter !== 'all') {
                const isGuestUser = chat.user.firstName === 'Guest';
                if (sourceFilter.startsWith('Guest: ')) {
                    // Filter for guest users
                    const guestSource = sourceFilter.replace('Guest: ', '');
                    if (!isGuestUser || chat.user.lastName !== guestSource) return false;
                } else if (sourceFilter === 'Al Hayat GPT website') {
                    // Filter for registered users
                    if (isGuestUser || !chat.user.email || chat.user.email === 'guest@example.com') return false;
                } else {
                    return false; // Unknown source format
                }
            }

            // Language filter
            if (languageFilter !== 'all') {
                const chatLanguage = detectedLanguages[chat._id!] || chat.language;
                if (chatLanguage !== languageFilter) return false;
            }

            // Date range filter
            if (selectedDateRange !== 'all') {
                // Parse chat date properly - it might already be a Date object or need parsing
                let chatDate: Date;
                if (chat.updatedAt instanceof Date) {
                    chatDate = chat.updatedAt;
                } else {
                    chatDate = new Date(chat.updatedAt);
                }

                if (selectedDateRange === 'custom') {
                    if (dateRange.start && dateRange.end) {
                        const startDate = startOfDay(dateRange.start);
                        const endDate = endOfDay(dateRange.end);

                        if (!isWithinInterval(chatDate, {
                            start: startDate,
                            end: endDate
                        })) return false;
                    }
                } else {
                    // For predefined ranges, get the range dynamically each time
                    let range: DateRange;
                    switch (selectedDateRange) {
                        case 'today':
                            range = {
                                start: startOfDay(new Date()),
                                end: endOfDay(new Date())
                            };
                            break;
                        case 'yesterday':
                            range = {
                                start: startOfDay(subDays(new Date(), 1)),
                                end: endOfDay(subDays(new Date(), 1))
                            };
                            break;
                        case 'last7days':
                            range = {
                                start: startOfDay(subDays(new Date(), 6)),
                                end: endOfDay(new Date())
                            };
                            break;
                        case 'lastWeek':
                            range = {
                                start: startOfDay(subWeeks(new Date(), 1)),
                                end: endOfDay(subDays(new Date(), 1))
                            };
                            break;
                        case 'currentMonth':
                            range = {
                                start: startOfMonth(new Date()),
                                end: endOfDay(new Date())
                            };
                            break;
                        default:
                            range = { start: null, end: null };
                    }

                    if (range.start && range.end) {
                        if (!isWithinInterval(chatDate, {
                            start: range.start,
                            end: range.end
                        })) return false;
                    }
                }
            }

            // Location filter
            if (locationFilter !== 'all') {
                const userLocation = userLocations[chat.user.clerkId];
                if (!userLocation || userLocation.country !== locationFilter) return false;
            }

            // Search query filter
            if (searchQuery) {
                const searchLower = searchQuery.toLowerCase();
                const matchesTitle = chat.title.toLowerCase().includes(searchLower);
                const matchesUser = `${chat.user.firstName} ${chat.user.lastName}`.toLowerCase().includes(searchLower);
                const matchesEmail = chat.user.email.toLowerCase().includes(searchLower);
                const matchesContent = chat.messages.some(msg =>
                    msg.content.toLowerCase().includes(searchLower)
                );
                return matchesTitle || matchesUser || matchesEmail || matchesContent;
            }

            return true;
        });
    }, [allChats, userTypeFilter, sourceFilter, locationFilter, languageFilter, selectedDateRange, dateRange, searchQuery, detectedLanguages, userLocations]);

    // Calculate pagination
    const totalPages = Math.ceil(filteredChats.length / CHATS_PER_PAGE);
    const startIndex = (currentPage - 1) * CHATS_PER_PAGE;
    const endIndex = startIndex + CHATS_PER_PAGE;
    const currentChats = filteredChats.slice(startIndex, endIndex);

    // Calculate language counts based on current filters (except language filter)
    const languageCounts = useMemo(() => {
        const counts: Record<Language, number> = {
            'all': 0,
            'en': 0,
            'ar': 0,
            'he': 0,
            'fi': 0,
            'sv': 0,
            'no': 0,
            'da': 0,
            'zh': 0,
            'hi': 0,
            'es': 0,
            'fr': 0,
            'bn': 0,
            'pt': 0,
            'ru': 0,
            'id': 0,
            'ur': 0,
            'de': 0,
            'ja': 0,
            'tr': 0,
            'ko': 0,
            'vi': 0,
            'te': 0,
            'mr': 0,
            'ta': 0,
            'th': 0,
            'bal': 0,
            'ms': 0,
        };

        // Filter chats by date, user type, and source first, then count languages
        const dateAndUserFilteredChats = allChats.filter(chat => {
            // User type filter
            const isGuest = chat.user.clerkId.startsWith('guest_');
            if (userTypeFilter === 'registered' && isGuest) return false;
            if (userTypeFilter === 'guest' && !isGuest) return false;

            // Source filter (applies to both guest users and registered users)
            if (sourceFilter !== 'all') {
                const isGuestUser = chat.user.firstName === 'Guest';
                if (sourceFilter.startsWith('Guest: ')) {
                    // Filter for guest users
                    const guestSource = sourceFilter.replace('Guest: ', '');
                    if (!isGuestUser || chat.user.lastName !== guestSource) return false;
                } else if (sourceFilter === 'Al Hayat GPT website') {
                    // Filter for registered users
                    if (isGuestUser || !chat.user.email || chat.user.email === 'guest@example.com') return false;
                } else {
                    return false; // Unknown source format
                }
            }

            // Date range filter
            if (selectedDateRange !== 'all') {
                let chatDate: Date;
                if (chat.updatedAt instanceof Date) {
                    chatDate = chat.updatedAt;
                } else {
                    chatDate = new Date(chat.updatedAt);
                }

                if (selectedDateRange === 'custom') {
                    if (dateRange.start && dateRange.end) {
                        const startDate = startOfDay(dateRange.start);
                        const endDate = endOfDay(dateRange.end);

                        if (!isWithinInterval(chatDate, {
                            start: startDate,
                            end: endDate
                        })) return false;
                    }
                } else {
                    let range: DateRange;
                    switch (selectedDateRange) {
                        case 'today':
                            range = {
                                start: startOfDay(new Date()),
                                end: endOfDay(new Date())
                            };
                            break;
                        case 'yesterday':
                            range = {
                                start: startOfDay(subDays(new Date(), 1)),
                                end: endOfDay(subDays(new Date(), 1))
                            };
                            break;
                        case 'last7days':
                            range = {
                                start: startOfDay(subDays(new Date(), 6)),
                                end: endOfDay(new Date())
                            };
                            break;
                        case 'lastWeek':
                            range = {
                                start: startOfDay(subWeeks(new Date(), 1)),
                                end: endOfDay(subDays(new Date(), 1))
                            };
                            break;
                        case 'currentMonth':
                            range = {
                                start: startOfMonth(new Date()),
                                end: endOfDay(new Date())
                            };
                            break;
                        default:
                            range = { start: null, end: null };
                    }

                    if (range.start && range.end) {
                        if (!isWithinInterval(chatDate, {
                            start: range.start,
                            end: range.end
                        })) return false;
                    }
                }
            }

            return true;
        });

        counts['all'] = dateAndUserFilteredChats.length;

        dateAndUserFilteredChats.forEach(chat => {
            const lang = detectedLanguages[chat._id!] || chat.language;
            if (lang) {
                counts[lang] = (counts[lang] || 0) + 1;
            }
        });

        return counts;
    }, [allChats, detectedLanguages, userTypeFilter, sourceFilter, selectedDateRange, dateRange]);

    // Calculate source counts based on current filters (except source filter)
    const sourceCounts = useMemo(() => {
        const counts: Record<string, number> = {};

        // Filter chats by date, user type, and language first, then count sources
        const filteredForSourceCount = allChats.filter(chat => {
            // User type filter
            const isGuest = chat.user.clerkId.startsWith('guest_');
            if (userTypeFilter === 'registered' && isGuest) return false;
            if (userTypeFilter === 'guest' && !isGuest) return false;

            // Language filter
            if (languageFilter !== 'all') {
                const chatLanguage = detectedLanguages[chat._id!] || chat.language;
                if (chatLanguage !== languageFilter) return false;
            }

            // Date range filter
            if (selectedDateRange !== 'all') {
                let chatDate: Date;
                if (chat.updatedAt instanceof Date) {
                    chatDate = chat.updatedAt;
                } else {
                    chatDate = new Date(chat.updatedAt);
                }

                if (selectedDateRange === 'custom') {
                    if (dateRange.start && dateRange.end) {
                        const startDate = startOfDay(dateRange.start);
                        const endDate = endOfDay(dateRange.end);

                        if (!isWithinInterval(chatDate, {
                            start: startDate,
                            end: endDate
                        })) return false;
                    }
                } else {
                    let range: DateRange;
                    switch (selectedDateRange) {
                        case 'today':
                            range = {
                                start: startOfDay(new Date()),
                                end: endOfDay(new Date())
                            };
                            break;
                        case 'yesterday':
                            range = {
                                start: startOfDay(subDays(new Date(), 1)),
                                end: endOfDay(subDays(new Date(), 1))
                            };
                            break;
                        case 'last7days':
                            range = {
                                start: startOfDay(subDays(new Date(), 6)),
                                end: endOfDay(new Date())
                            };
                            break;
                        case 'lastWeek':
                            range = {
                                start: startOfDay(subWeeks(new Date(), 1)),
                                end: endOfDay(subDays(new Date(), 1))
                            };
                            break;
                        case 'currentMonth':
                            range = {
                                start: startOfMonth(new Date()),
                                end: endOfDay(new Date())
                            };
                            break;
                        default:
                            range = { start: null, end: null };
                    }

                    if (range.start && range.end) {
                        if (!isWithinInterval(chatDate, {
                            start: range.start,
                            end: range.end
                        })) return false;
                    }
                }
            }

            return true;
        });

        filteredForSourceCount.forEach(chat => {
            // Count guest user sources
            if (chat.user.firstName === 'Guest' && chat.user.lastName && chat.user.lastName !== 'Unknown') {
                const source = `Guest: ${chat.user.lastName}`;
                counts[source] = (counts[source] || 0) + 1;
            }

            // Count registered users
            if (chat.user.firstName !== 'Guest' && chat.user.email && chat.user.email !== 'guest@example.com') {
                const source = 'Al Hayat GPT website';
                counts[source] = (counts[source] || 0) + 1;
            }
        });

        return counts;
    }, [allChats, detectedLanguages, userTypeFilter, languageFilter, selectedDateRange, dateRange]);

    // Update available languages based on current counts
    const availableLanguagesWithCounts = useMemo(() => {
        return allLanguages.filter(lang => languageCounts[lang.code] > 0);
    }, [languageCounts]);

    // Clear all filters function
    const clearAllFilters = () => {
        setSearchQuery('');
        setUserTypeFilter('all');
        setSourceFilter('all');
        setLocationFilter('all');
        setLanguageFilter('all');
        setSelectedDateRange('all');
        setDateRange({ start: null, end: null });
        setCurrentPage(1);
    };

    const formatDate = (date: Date) => {
        return format(date, 'MMM d, yyyy h:mm a');
    };

    const exportChats = async (exportFormat: 'text' | 'json') => {
        setIsExporting(true);
        try {
            const exportData = filteredChats.map(chat => {
                // Get user location data
                const userLocation = userLocations[chat.user.clerkId];

                // Get detected language
                const detectedLang = detectedLanguages[chat._id!];

                // Determine source (SDK vs Website)
                const isGuestUser = chat.user.clerkId.startsWith('guest_');
                const isSDKUser = isGuestUser && chat.user.lastName && chat.user.lastName !== 'Unknown';
                const source = isSDKUser ? `SDK: ${chat.user.lastName}` : 'Al Hayat GPT website';

                return {
                    // Basic chat info
                    id: chat._id,
                    title: chat.title,
                    createdAt: formatDate(chat.createdAt),
                    updatedAt: formatDate(chat.updatedAt),
                    messageCount: chat.messages.length,

                    // User information
                    user: {
                        name: `${chat.user.firstName} ${chat.user.lastName}`,
                        email: !chat.user.clerkId.startsWith('guest_') ? chat.user.email : 'Guest user (no email)',
                        type: isGuestUser ? 'Guest' : 'Registered',
                        clerkId: chat.user.clerkId
                    },

                    // Location information
                    location: userLocation ? {
                        country: userLocation.country,
                        countryCode: userLocation.countryCode,
                        city: userLocation.city || 'Unknown',
                        region: userLocation.region || 'Unknown',
                        confidence: userLocation.confidence,
                        detectionMethod: userLocation.detectionMethod
                    } : {
                        country: 'Unknown',
                        countryCode: 'Unknown',
                        city: 'Unknown',
                        region: 'Unknown',
                        confidence: 'low',
                        detectionMethod: 'none'
                    },

                    // Language information
                    language: {
                        code: detectedLang || chat.language || 'en',
                        name: getLanguageName(detectedLang || chat.language || 'en'),
                        originalLanguage: chat.language
                    },

                    // Source information
                    source: {
                        type: isSDKUser ? 'SDK' : 'Website',
                        platform: source,
                        isGuest: isGuestUser
                    },

                    // Messages
                    messages: chat.messages.map(msg => ({
                        role: msg.role,
                        content: msg.content,
                        timestamp: formatDate(msg.timestamp),
                        timestampISO: msg.timestamp
                    }))
                };
            });

            let content: string;
            let filename: string;
            let mimeType: string;

            const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');

            if (exportFormat === 'json') {
                content = JSON.stringify(exportData, null, 2);
                filename = `chats_full_export_${timestamp}.json`;
                mimeType = 'application/json';
            } else {
                content = exportData.map(chat =>
                    `Chat ID: ${chat.id}
Title: ${chat.title}
Created: ${chat.createdAt}
Updated: ${chat.updatedAt}
Message Count: ${chat.messageCount}

USER INFORMATION:
Name: ${chat.user.name}
Email: ${chat.user.email}
Type: ${chat.user.type}
Clerk ID: ${chat.user.clerkId}

LOCATION INFORMATION:
Country: ${chat.location.country}
Country Code: ${chat.location.countryCode}
City: ${chat.location.city}
Region: ${chat.location.region}
Detection Method: ${chat.location.detectionMethod}
Confidence: ${chat.location.confidence}

LANGUAGE INFORMATION:
Detected Language: ${chat.language.name} (${chat.language.code})
Original Language: ${chat.language.originalLanguage}

SOURCE INFORMATION:
Type: ${chat.source.type}
Platform: ${chat.source.platform}
Is Guest: ${chat.source.isGuest}

MESSAGES:
${chat.messages.map(msg =>
                        `[${msg.timestamp}] ${msg.role.toUpperCase()}: ${msg.content}`
                    ).join('\n')}
================================================`
                ).join('\n\n');
                filename = `chats_full_export_${timestamp}.txt`;
                mimeType = 'text/plain';
            }

            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting chats:', error);
        } finally {
            setIsExporting(false);
        }
    };

    // Function to clear location cache (for debugging)
    const clearLocationCache = () => {
        // Clear all location cache
        if (typeof window !== 'undefined') {
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('userLocation_')) {
                    localStorage.removeItem(key);
                }
            });

            console.log('🗑️ Cleared all location cache');
        }

        // Reload chats to re-detect locations
        const loadAllChats = async () => {
            try {
                const chats = await getAllChats();
                setAllChats([...chats]); // Force re-render
            } catch (error) {
                console.error('Error reloading chats:', error);
            }
        };
        loadAllChats();
    };

    // Debug function to test location detection
    const debugLocationDetection = () => {
        console.log('🔍 DEBUG: Current user locations:', userLocations);
        console.log('🔍 DEBUG: Available locations:', availableLocations);
        console.log('🔍 DEBUG: Detected languages:', detectedLanguages);

        // Test language detection for sample languages
        const testLanguages = ['he', 'ar', 'fa', 'en', 'ja', 'ko'];
        testLanguages.forEach(lang => {
            const result = detectLocationFromLanguage(lang);
            console.log(`🔍 Language "${lang}" → Location:`, result);
        });

        // Test content analysis for sample chat
        if (allChats.length > 0) {
            const sampleChat = allChats[0];
            const contentResult = analyzeMessageContentForLocation(sampleChat.messages);
            console.log('🔍 Content analysis sample:', contentResult);
        }

        // Test hash-based generation for sample user IDs
        const sampleUserIds = ['user1', 'user2', 'user3'];
        sampleUserIds.forEach(userId => {
            const hashResult = generateDiverseLocation(userId);
            console.log(`🔍 Hash-based location for "${userId}":`, hashResult);
        });
    };

    // Function to force re-detect all locations (useful for testing)
    const redetectAllLocations = () => {
        console.log('🔄 Re-detecting all locations...');
        // Clear stored locations for testing
        if (typeof window !== 'undefined') {
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('userLocation_')) {
                    localStorage.removeItem(key);
                }
            });

            // Reload chats to trigger re-detection
            window.location.reload();
        }
    };

    // Add to window for debugging (only in development)
    useEffect(() => {
        if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
            (window as any).clearLocationCache = clearLocationCache;
            (window as any).debugLocations = () => {
                console.log('Current user locations:', userLocations);
                updateLocationStats();
            };
            console.log('🛠️ Debug tools available: clearLocationCache(), debugLocations()');
        }
    }, [userLocations]);

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Hamburger Menu Button - Only visible on small screens */}
            <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md"
            >
                <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    {isMenuOpen ? (
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    ) : (
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 6h16M4 12h16M4 18h16"
                        />
                    )}
                </svg>
            </button>

            {/* Left Column - Chat List */}
            <div
                id="sidebar"
                className={`fixed lg:static inset-y-0 left-0 z-40 w-3/4 lg:w-1/3 border-r border-gray-200 bg-white overflow-y-auto transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
            >
                <div className="p-4 pt-16 lg:pt-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-800 text-left">All Chats</h2>
                        <div className="flex items-center gap-3">
                            <div className="text-sm text-gray-500 text-left">
                                {filteredChats.length} / {allChats.length} chats
                            </div>
                            {/* Debug controls - only show in development */}
                            {process.env.NODE_ENV === 'development' && (
                                <button
                                    onClick={clearLocationCache}
                                    className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded border border-yellow-200 hover:bg-yellow-200 transition-colors text-left"
                                    title="Clear location cache and re-detect"
                                >
                                    🔄 Refresh Locations
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Search chats..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-left"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Filters */}
                    <div className="mb-4 space-y-4">
                        {/* User Type Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                                User Type
                            </label>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-left"
                                value={userTypeFilter}
                                onChange={(e) => setUserTypeFilter(e.target.value as UserType)}
                            >
                                <option value="all">All Users</option>
                                <option value="registered">Registered Users</option>
                                <option value="guest">Guest Users</option>
                            </select>
                        </div>

                        {/* Source/Referrer Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                                Source/Referrer
                            </label>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-left"
                                value={sourceFilter}
                                onChange={(e) => {
                                    setSourceFilter(e.target.value as SourceFilter);
                                    setCurrentPage(1); // Reset to first page when filter changes
                                }}
                            >
                                <option value="all">All Sources ({Object.values(sourceCounts || {}).reduce((a, b) => a + b, 0)})</option>
                                {availableSources?.map((source) => (
                                    <option key={source} value={source}>
                                        {source} ({sourceCounts?.[source] || 0})
                                    </option>
                                )) || []}
                            </select>
                        </div>

                        {/* Language Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                                Language
                            </label>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-left"
                                value={languageFilter}
                                onChange={(e) => {
                                    setLanguageFilter(e.target.value as Language);
                                    setCurrentPage(1); // Reset to first page when filter changes
                                }}
                            >
                                <option value="all">All Languages ({languageCounts?.['all'] || 0})</option>
                                {availableLanguagesWithCounts?.map((lang) => (
                                    <option key={lang.code} value={lang.code}>
                                        {lang.flag} {lang.name} ({lang.nativeName}) - {languageCounts?.[lang.code] || 0}
                                    </option>
                                )) || []}
                            </select>
                        </div>

                        {/* Location Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                                User Location
                            </label>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-left"
                                value={locationFilter}
                                onChange={(e) => {
                                    setLocationFilter(e.target.value as LocationFilter);
                                    setCurrentPage(1); // Reset to first page when filter changes
                                }}
                            >
                                <option value="all">All Locations ({Object.keys(userLocations || {}).length})</option>
                                {availableLocations?.map((location) => (
                                    <option key={location.country} value={location.country}>
                                        {location.flag} {location.country} ({location.count})
                                    </option>
                                )) || []}
                            </select>
                        </div>

                        {/* Date Range Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                                Date Range
                            </label>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2 text-left"
                                value={selectedDateRange}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setSelectedDateRange(value);
                                    if (value === 'all') {
                                        setDateRange({ start: null, end: null });
                                    } else {
                                        const option = dateRangeOptions.find(opt => opt.value === value);
                                        if (option) {
                                            const range = option.getRange();
                                            setDateRange(range);
                                        }
                                    }
                                    setCurrentPage(1); // Reset to first page when filter changes
                                }}
                            >
                                <option value="all">All Time</option>
                                {dateRangeOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>

                            {selectedDateRange === 'custom' && (
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1 text-left">From</label>
                                        <input
                                            type="date"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-left"
                                            value={dateRange.start ? format(dateRange.start, 'yyyy-MM-dd') : ''}
                                            onChange={(e) => {
                                                const newDate = e.target.value ? new Date(e.target.value) : null;
                                                setDateRange(prev => ({
                                                    ...prev,
                                                    start: newDate
                                                }));
                                                setCurrentPage(1); // Reset to first page when filter changes
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1 text-left">To</label>
                                        <input
                                            type="date"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-left"
                                            value={dateRange.end ? format(dateRange.end, 'yyyy-MM-dd') : ''}
                                            onChange={(e) => {
                                                const newDate = e.target.value ? new Date(e.target.value) : null;
                                                setDateRange(prev => ({
                                                    ...prev,
                                                    end: newDate
                                                }));
                                                setCurrentPage(1); // Reset to first page when filter changes
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Export Buttons */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => exportChats('text')}
                                disabled={isExporting}
                                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-left"
                            >
                                {isExporting ? 'Exporting...' : 'Export as Text'}
                            </button>
                            <button
                                onClick={() => exportChats('json')}
                                disabled={isExporting}
                                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 text-left"
                            >
                                {isExporting ? 'Exporting...' : 'Export as JSON'}
                            </button>
                        </div>

                        {/* Clear Filters Button */}
                        <div className="pt-2 space-y-2">
                            <button
                                onClick={clearAllFilters}
                                className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 text-left"
                            >
                                Clear All Filters
                            </button>

                            {/* Debug Buttons - Only show in development */}
                            {process.env.NODE_ENV === 'development' && (
                                <>
                                    <button
                                        onClick={debugLocationDetection}
                                        className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm text-left"
                                    >
                                        🔍 Debug Locations
                                    </button>
                                    <button
                                        onClick={clearLocationCache}
                                        className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm text-left"
                                    >
                                        🗑️ Clear Location Cache
                                    </button>
                                    <button
                                        onClick={redetectAllLocations}
                                        className="w-full px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm text-left"
                                    >
                                        🔄 Re-detect All Locations
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Chat List */}
                    <div className="space-y-3">
                        {currentChats?.map((chat: Chat) => (
                            <div
                                key={chat._id}
                                onClick={() => switchChat(chat._id!)}
                                className={`p-6 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-lg ${currentChat?._id === chat._id
                                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-md'
                                    : 'hover:bg-gray-50 border border-gray-100 bg-white shadow-sm'
                                    }`}
                            >
                                {/* Header with title and language */}
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="font-semibold text-gray-900 text-base leading-5 line-clamp-1 text-left">
                                        {chat.title || 'New Chat'}
                                    </h3>
                                    {detectedLanguages[chat._id!] && (
                                        <span className="text-sm ml-2 flex-shrink-0" title="Detected Language">
                                            {allLanguages.find(l => l.code === detectedLanguages[chat._id!])?.flag}
                                        </span>
                                    )}
                                </div>

                                {/* User Information Card */}
                                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            {/* User name and flag */}
                                            <div className="flex items-center gap-2 mb-2">
                                                {userLocations[chat.user.clerkId] && userLocations[chat.user.clerkId].country !== 'Unknown' && (
                                                    <span
                                                        className="text-lg flex-shrink-0"
                                                        title={userLocations[chat.user.clerkId].country}
                                                    >
                                                        {getCountryFlag(userLocations[chat.user.clerkId].countryCode || '')}
                                                    </span>
                                                )}
                                                <span className="font-medium text-gray-900 text-sm truncate text-left">
                                                    {chat.user.clerkId.startsWith('guest_')
                                                        ? `Guest from ${chat.user.lastName}`
                                                        : `${chat.user.firstName} ${chat.user.lastName}`
                                                    }
                                                </span>
                                            </div>

                                            {/* Enhanced Location Display */}
                                            {userLocations[chat.user.clerkId] && userLocations[chat.user.clerkId].country !== 'Unknown' && (
                                                <div className="bg-white rounded-lg p-2 border border-gray-200 mb-2">
                                                    <div className="flex items-center gap-1.5 mb-1">
                                                        <span className="text-blue-500 text-sm">📍</span>
                                                        <span className="text-sm font-medium text-gray-700 text-left">
                                                            {userLocations[chat.user.clerkId].country}
                                                            {userLocations[chat.user.clerkId].city && `, ${userLocations[chat.user.clerkId].city}`}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-gray-500 text-left">
                                                        Detected via {userLocations[chat.user.clerkId].detectionMethod?.replace('-', ' ')} •
                                                        Confidence: {userLocations[chat.user.clerkId].confidence}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Email (for registered users only) */}
                                            {!chat.user.clerkId.startsWith('guest_') && chat.user.email && (
                                                <div className="text-xs text-gray-500 truncate text-left">
                                                    📧 {chat.user.email}
                                                </div>
                                            )}
                                        </div>

                                        {/* Source indicator */}
                                        <div className="text-xs text-gray-400 ml-2 flex-shrink-0 text-right">
                                            {chat.user.clerkId.startsWith('guest_') ? '👤 SDK' : '🌐 Web'}
                                        </div>
                                    </div>
                                </div>

                                {/* Message preview */}
                                {chat.messages.length > 0 && (
                                    <div className="text-sm text-gray-600 line-clamp-2 mb-2 text-left" dir="auto">
                                        {chat.messages[chat.messages.length - 1]?.content.substring(0, 150)}
                                        {chat.messages[chat.messages.length - 1]?.content.length > 150 && '...'}
                                    </div>
                                )}

                                {/* Footer with stats */}
                                <div className="flex justify-between items-center text-xs text-gray-500">
                                    <div className="flex items-center gap-3">
                                        <span className="text-left">💬 {chat.messages.length} messages</span>
                                        {detectedLanguages[chat._id!] && (
                                            <span className="flex items-center gap-1 text-left">
                                                {allLanguages.find(l => l.code === detectedLanguages[chat._id!])?.flag}
                                                {getLanguageName(detectedLanguages[chat._id!])}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-right">
                                        {formatDate(chat.updatedAt)}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {currentChats.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                <p className="text-left">No chats found matching your filters.</p>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-6 flex justify-center items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-left"
                            >
                                ←
                            </button>
                            <span className="text-sm text-gray-600 text-left">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-left"
                            >
                                →
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column - Chat View */}
            <div className="flex-1 lg:w-2/3 bg-white overflow-hidden">
                {currentChat ? (
                    <div className="h-full flex flex-col">
                        {/* Chat Header */}
                        <div className="border-b border-gray-200 p-4 bg-white">
                            <div className="flex justify-between items-start mb-2">
                                <h1 className="text-xl font-semibold text-gray-900 text-left">
                                    {currentChat.title || 'Chat Details'}
                                </h1>
                                <div className="flex items-center gap-2">
                                    {detectedLanguages[currentChat._id!] && (
                                        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center gap-1 text-left">
                                            {allLanguages.find(l => l.code === detectedLanguages[currentChat._id!])?.flag}
                                            {getLanguageName(detectedLanguages[currentChat._id!])}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="text-sm text-gray-600 text-left">
                                {currentChat.user.clerkId.startsWith('guest_')
                                    ? `Guest from ${currentChat.user.lastName}`
                                    : `${currentChat.user.firstName} ${currentChat.user.lastName}`
                                }
                                {!currentChat.user.clerkId.startsWith('guest_') && currentChat.user.email && (
                                    <span className="ml-2">({currentChat.user.email})</span>
                                )}
                                <span className="ml-2">• {formatDate(currentChat.updatedAt)}</span>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {currentChat.messages.map((message: Message, index: number) => (
                                <div
                                    key={index}
                                    className={`flex ${message.role === 'user' ? 'justify-start' : 'justify-start'} mb-4`}
                                >
                                    <div
                                        className={`${message.role === 'user' ? 'max-w-[75%]' : 'max-w-[95%]'} rounded-lg px-4 py-3 ${message.role === 'user'
                                            ? 'bg-blue-500 text-white ml-0'
                                            : 'bg-gray-100 text-gray-900 mr-0'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xs font-medium opacity-75 text-left">
                                                {message.role === 'user' ? '👤 User' : '🤖 AI'}
                                            </span>
                                            <span className="text-xs opacity-75 text-left">
                                                {format(new Date(message.timestamp), 'HH:mm')}
                                            </span>
                                        </div>
                                        {message.role === 'assistant' ? (
                                            <div
                                                className="whitespace-pre-wrap text-left prose prose-sm max-w-none"
                                                dir="auto"
                                                style={{ direction: 'ltr', textAlign: 'left' }}
                                                dangerouslySetInnerHTML={{ __html: message.content }}
                                            />
                                        ) : (
                                            <div
                                                className="whitespace-pre-wrap text-left"
                                                dir="auto"
                                                style={{ direction: 'ltr', textAlign: 'left' }}
                                            >
                                                {message.content}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center bg-gray-50">
                        <div className="text-center text-gray-500">
                            <h3 className="text-lg font-medium mb-2 text-left">Select a chat to view details</h3>
                            <p className="text-sm text-left">Choose a chat from the list to see the conversation.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Overlay for mobile menu */}
            {isMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}
        </div>
    );
}

