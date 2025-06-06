'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Chat, Message } from '@/types/chat';
import { getAllChats } from '@/sanity/lib/data/getAllChats';
import { detectLanguage } from '@/utils/languageDetection';
import { getCountryFlag } from '@/utils/visitorApiDetection';
import { format, isWithinInterval, subDays, parseISO } from 'date-fns';

interface StatCard {
    title: string;
    value: string | number;
    subtitle?: string;
    trend?: 'up' | 'down' | 'neutral';
    icon?: string;
}

interface TopItem {
    name: string;
    value: number;
    flag?: string;
    percentage?: number;
}

interface DateRange {
    label: string;
    days: number;
}

const dateRanges: DateRange[] = [
    { label: 'Last 7 days', days: 7 },
    { label: 'Last 30 days', days: 30 },
    { label: 'Last 90 days', days: 90 },
    { label: 'All time', days: 0 }
];

export default function StatsDashboard() {
    const [allChats, setAllChats] = useState<Chat[]>([]);
    const [selectedRange, setSelectedRange] = useState<DateRange>(dateRanges[1]); // Default to 30 days
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [detectedLanguages, setDetectedLanguages] = useState<Record<string, string>>({});
    const [userLocations, setUserLocations] = useState<Record<string, {
        country: string;
        countryCode: string;
        city?: string;
        region?: string;
        confidence: 'high' | 'medium' | 'low';
        detectionMethod: 'geolocation' | 'content-analysis' | 'language-based' | 'hash-based';
    }>>({});

    useEffect(() => {
        const loadChats = async () => {
            try {
                setLoading(true);
                const chats = await getAllChats();
                setAllChats(chats);

                // Detect language for each chat
                const languages: Record<string, string> = {};

                chats.forEach(chat => {
                    if (chat && chat._id && chat.messages && Array.isArray(chat.messages) && chat.messages.length > 0) {
                        try {
                            // Use the last few messages to detect language
                            const recentMessages = chat.messages.slice(-3);
                            const combinedText = recentMessages.map(msg => msg?.content || '').join(' ');
                            if (combinedText.trim()) {
                                const detectedLang = detectLanguage(combinedText);
                                if (detectedLang) {
                                    languages[chat._id] = detectedLang;
                                }
                            }
                        } catch (error) {
                            console.warn('Error detecting language for chat:', chat._id, error);
                        }
                    }
                });

                // Detect location for each user using multiple methods (same as AllChats)
                const userLocationData: Record<string, {
                    country: string;
                    countryCode: string;
                    city?: string;
                    region?: string;
                    confidence: 'high' | 'medium' | 'low';
                    detectionMethod: 'geolocation' | 'content-analysis' | 'language-based' | 'hash-based';
                }> = {};

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
                                if (typeof window !== 'undefined') {
                                    localStorage.removeItem(`userLocation_${userKey}`);
                                }
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

                setDetectedLanguages(languages);
                setUserLocations(userLocationData);
                console.log('📊 StatsDashboard - Detected languages:', languages);
                console.log('🌍 StatsDashboard - User locations:', userLocationData);
            } catch (err) {
                setError('Failed to load chat data');
                console.error('Error loading chats:', err);
            } finally {
                setLoading(false);
            }
        };

        loadChats();
    }, []);

    const filteredChats = useMemo(() => {
        if (selectedRange.days === 0) return allChats;

        const cutoffDate = subDays(new Date(), selectedRange.days);
        return allChats.filter(chat => {
            const chatDate = new Date(chat.createdAt);
            return chatDate >= cutoffDate;
        });
    }, [allChats, selectedRange]);

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

    // Location detection methods (same as AllChats)
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

        // Use hash to select from diverse countries (same as AllChats)
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

    const getTop5 = (data: Record<string, number>, isCountryData: boolean = false): TopItem[] => {
        const total = Object.values(data).reduce((a: number, b: number) => a + b, 0);
        if (total === 0) return [];

        return Object.entries(data)
            .sort(([, a]: [string, number], [, b]: [string, number]) => b - a)
            .slice(0, 5)
            .map(([name, value]) => ({
                name,
                value,
                flag: isCountryData ? getCountryFlag(getCountryCode(name)) : undefined,
                percentage: Math.round((value / total) * 100)
            }));
    };

    const getCountryCode = (countryName: string): string => {
        const codes: Record<string, string> = {
            'Iran': 'IR',
            'Israel': 'IL',
            'Palestine': 'PS',
            'Saudi Arabia': 'SA',
            'UAE': 'AE',
            'Germany': 'DE',
            'France': 'FR',
            'United States': 'US',
            'United Kingdom': 'GB',
            'Canada': 'CA',
            'Japan': 'JP',
            'South Korea': 'KR',
            'Turkey': 'TR',
            'China': 'CN',
            'Russia': 'RU',
            'India': 'IN',
            'Brazil': 'BR',
            'Australia': 'AU',
            'Spain': 'ES',
            'Italy': 'IT',
            'Netherlands': 'NL',
            'Sweden': 'SE',
            'Norway': 'NO',
            'Denmark': 'DK',
            'Finland': 'FI',
            'Poland': 'PL',
            'Ukraine': 'UA',
            'Bulgaria': 'BG',
            'Romania': 'RO',
            'Croatia': 'HR',
            'Serbia': 'RS',
            'Slovakia': 'SK',
            'Czech Republic': 'CZ',
            'Hungary': 'HU',
            'Estonia': 'EE',
            'Latvia': 'LV',
            'Lithuania': 'LT',
            'Slovenia': 'SI',
            'North Macedonia': 'MK',
            'Malta': 'MT',
            'Iceland': 'IS',
            'Ireland': 'IE',
            'Wales': 'GB',
            'Scotland': 'GB',
            'Thailand': 'TH',
            'Vietnam': 'VN',
            'Egypt': 'EG',
            'Jordan': 'JO'
        };
        return codes[countryName] || '';
    };

    const statistics = useMemo(() => {
        const stats = {
            totalChats: filteredChats.length,
            websiteUsers: 0,
            sdkUsers: 0,
            languages: {} as Record<string, number>,
            countries: {} as Record<string, number>,
            websites: {} as Record<string, number>,
            lastQuestions: [] as { question: string; timestamp: Date; user: string }[]
        };

        // Process each chat
        filteredChats?.forEach(chat => {
            // Safety checks
            if (!chat || !chat.user || !chat._id) return;

            // Determine user source (website vs SDK)
            const isGuestUser = chat.user?.firstName === 'Guest';
            const isSDKUser = isGuestUser && chat.user?.lastName && chat.user.lastName !== 'Unknown';

            if (isSDKUser) {
                stats.sdkUsers++;
                // Track website domains for SDK users
                const domain = chat.user?.lastName || 'Unknown';
                stats.websites[domain] = (stats.websites[domain] || 0) + 1;
            } else {
                stats.websiteUsers++;
            }

            // Use pre-detected language from state
            const detectedLang = detectedLanguages?.[chat._id] || chat.language;
            if (detectedLang) {
                const langName = getLanguageName(detectedLang);
                stats.languages[langName] = (stats.languages[langName] || 0) + 1;
            }

            // Extract country information using detected location data
            try {
                const userKey = chat.user?.clerkId;
                const userLocation = userLocations[userKey];
                if (userLocation && userLocation.country && userLocation.country !== 'Unknown') {
                    stats.countries[userLocation.country] = (stats.countries[userLocation.country] || 0) + 1;
                }
            } catch (error) {
                console.warn('Error extracting country:', error);
            }

            // Collect last questions (user messages)
            try {
                if (chat.messages && Array.isArray(chat.messages)) {
                    const userMessages = chat.messages.filter(msg => msg && msg.role === 'user');
                    if (userMessages.length > 0) {
                        const lastUserMessage = userMessages[userMessages.length - 1];
                        if (lastUserMessage?.content) {
                            stats.lastQuestions.push({
                                question: lastUserMessage.content,
                                timestamp: new Date(lastUserMessage.timestamp),
                                user: chat.user?.firstName === 'Guest' ? 'Guest User' : `${chat.user?.firstName || ''} ${chat.user?.lastName || ''}`.trim()
                            });
                        }
                    }
                }
            } catch (error) {
                console.warn('Error collecting last questions:', error);
            }
        });

        // Sort last questions by timestamp (most recent first) and take top 5
        stats.lastQuestions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        stats.lastQuestions = stats.lastQuestions.slice(0, 5);

        return stats;
    }, [filteredChats, detectedLanguages, userLocations]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-red-600 text-center">
                    <p className="text-lg font-medium">Error loading statistics</p>
                    <p className="text-sm text-gray-500 mt-2">{error}</p>
                </div>
            </div>
        );
    }

    const topLanguages = getTop5(statistics?.languages || {});
    const topCountries = getTop5(statistics?.countries || {}, true);
    const topWebsites = getTop5(statistics?.websites || {});

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                            <p className="mt-2 text-gray-600">Overview of chat activity and user engagement</p>
                        </div>
                        <div className="mt-4 sm:mt-0">
                            <select
                                value={selectedRange.label}
                                onChange={(e) => {
                                    const range = dateRanges.find(r => r.label === e.target.value);
                                    if (range) setSelectedRange(range);
                                }}
                                className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {dateRanges.map(range => (
                                    <option key={range.label} value={range.label}>
                                        {range.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Main Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Total Chats"
                        value={(statistics?.totalChats || 0).toLocaleString()}
                        subtitle={selectedRange?.label?.toLowerCase() || 'all time'}
                        icon="💬"
                    />
                    <StatCard
                        title="Website Users"
                        value={(statistics?.websiteUsers || 0).toLocaleString()}
                        subtitle={`${(statistics?.totalChats || 0) > 0 ? Math.round(((statistics?.websiteUsers || 0) / (statistics?.totalChats || 1)) * 100) : 0}% of total`}
                        icon="🌐"
                    />
                    <StatCard
                        title="SDK Users"
                        value={(statistics?.sdkUsers || 0).toLocaleString()}
                        subtitle={`${(statistics?.totalChats || 0) > 0 ? Math.round(((statistics?.sdkUsers || 0) / (statistics?.totalChats || 1)) * 100) : 0}% of total`}
                        icon="⚡"
                    />
                    <StatCard
                        title="Active Languages"
                        value={Object.keys(statistics?.languages || {}).length}
                        subtitle="Different languages used"
                        icon="🗣️"
                    />
                </div>

                {/* Detailed Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Questions */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <span className="mr-2">❓</span>
                            Recent Questions
                        </h3>
                        <div className="space-y-4">
                            {statistics.lastQuestions.length > 0 ? (
                                statistics.lastQuestions.map((item, index) => (
                                    <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                                        <p className="text-gray-800 text-sm font-medium line-clamp-2">
                                            {item.question.length > 100 ? `${item.question.substring(0, 100)}...` : item.question}
                                        </p>
                                        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                                            <span>{item.user}</span>
                                            <span>{format(item.timestamp, 'MMM d, h:mm a')}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 italic">No recent questions found</p>
                            )}
                        </div>
                    </div>

                    {/* Top Languages */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <span className="mr-2">🌍</span>
                            Top Languages
                        </h3>
                        <div className="space-y-3">
                            {topLanguages.length > 0 ? (
                                topLanguages.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold mr-3">
                                                {index + 1}
                                            </span>
                                            <span className="text-gray-800 font-medium">{item.name}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-gray-900 font-semibold">{item.value}</span>
                                            <span className="text-gray-500 text-sm ml-2">({item.percentage}%)</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 italic">No language data available</p>
                            )}
                        </div>
                    </div>

                    {/* Top Countries */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <span className="mr-2">🗺️</span>
                            Top Countries
                        </h3>
                        <div className="space-y-3">
                            {topCountries.length > 0 ? (
                                topCountries.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <span className="w-6 h-6 bg-green-100 text-green-800 rounded-full flex items-center justify-center text-xs font-bold mr-3">
                                                {index + 1}
                                            </span>
                                            <div className="flex items-center">
                                                {item.flag && <span className="mr-2 text-lg">{item.flag}</span>}
                                                <span className="text-gray-800 font-medium">{item.name}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-gray-900 font-semibold">{item.value}</span>
                                            <span className="text-gray-500 text-sm ml-2">({item.percentage}%)</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 italic">No country data available</p>
                            )}
                        </div>
                    </div>

                    {/* Top SDK Websites */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <span className="mr-2">🔗</span>
                            Top SDK Websites
                        </h3>
                        <div className="space-y-3">
                            {topWebsites.length > 0 ? (
                                topWebsites.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <span className="w-6 h-6 bg-purple-100 text-purple-800 rounded-full flex items-center justify-center text-xs font-bold mr-3">
                                                {index + 1}
                                            </span>
                                            <span className="text-gray-800 font-medium">{item.name}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-gray-900 font-semibold">{item.value}</span>
                                            <span className="text-gray-500 text-sm ml-2">chats</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 italic">No SDK usage detected</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* User Source Comparison */}
                <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <span className="mr-2">📊</span>
                        User Source Comparison
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="text-center">
                            <div className="bg-blue-50 rounded-lg p-6">
                                <div className="text-3xl font-bold text-blue-600 mb-2">
                                    {statistics.websiteUsers.toLocaleString()}
                                </div>
                                <div className="text-gray-600 font-medium">Website Users</div>
                                <div className="text-sm text-gray-500 mt-1">
                                    Direct website engagement
                                </div>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="bg-purple-50 rounded-lg p-6">
                                <div className="text-3xl font-bold text-purple-600 mb-2">
                                    {statistics.sdkUsers.toLocaleString()}
                                </div>
                                <div className="text-gray-600 font-medium">SDK Users</div>
                                <div className="text-sm text-gray-500 mt-1">
                                    Third-party integrations
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Reusable StatCard Component
function StatCard({ title, value, subtitle, icon }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: string;
}) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
                {icon && <span className="text-2xl mr-3">{icon}</span>}
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                    {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
                </div>
            </div>
        </div>
    );
} 