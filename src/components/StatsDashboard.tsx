'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Chat, Message } from '@/types/chat';
import { detectLanguage } from '@/utils/languageDetection';
import { getCountryFlag } from '@/utils/browserLocationDetection';
import { format, isWithinInterval, subDays, parseISO } from 'date-fns';
import { useLiveChats } from '@/hooks/useLiveChats';

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
    // Use live chat hook for real-time updates
    const { chats: allChats, loading, error: dataError } = useLiveChats(
        10000, // Refresh every 10 seconds for dashboard
        true   // Enable auto-refresh
    );

    const [selectedRange, setSelectedRange] = useState<DateRange>(dateRanges[1]); // Default to 30 days
    const [detectedLanguages, setDetectedLanguages] = useState<Record<string, string>>({});

    useEffect(() => {
        const processLanguages = async () => {
            if (allChats.length === 0) return;

            try {
                console.log('🔄 [StatsDashboard] Processing language data...');

                // Language detection using Franc
                const languages: Record<string, string> = {};
                console.log('🗣️ [StatsDashboard] Processing language detection...');

                for (const chat of allChats) {
                    if (chat._id) {
                        // Use Sanity-stored detected language first, fallback to detection
                        if (chat.detectedLanguage) {
                            languages[chat._id] = chat.detectedLanguage;
                            console.log(`✅ [StatsDashboard] Using Sanity language for chat ${chat._id}: ${chat.detectedLanguage}`);
                        } else if (chat.messages && chat.messages.length > 0) {
                            // Fallback to local detection for old chats
                            const userMessages = chat.messages.filter((msg: Message) => msg?.role === 'user');
                            const recentUserMessages = userMessages.slice(-3);
                            const combinedText = recentUserMessages.map((msg: Message) => msg?.content || '').join(' ');

                            if (combinedText.trim()) {
                                try {
                                    const detectedLang = detectLanguage(combinedText);
                                    languages[chat._id] = detectedLang;
                                    console.log(`🔄 [StatsDashboard] Fallback language detected for chat ${chat._id}: ${detectedLang}`);
                                } catch (error) {
                                    console.error(`❌ [StatsDashboard] Language detection failed for chat ${chat._id}:`, error);
                                }
                            }
                        }
                    }
                }

                setDetectedLanguages(languages);
                console.log(`🎯 [StatsDashboard] Language processing completed. Found ${Object.keys(languages).length} languages`);

                // Count chats with Sanity location data
                const chatsWithLocation = allChats.filter((chat: Chat) =>
                    chat.location &&
                    chat.location.country &&
                    chat.location.country !== 'Unknown' &&
                    chat.location.source !== 'unknown'
                );

                console.log(`🗺️ [StatsDashboard] Found ${chatsWithLocation.length}/${allChats.length} chats with valid Sanity location data`);

            } catch (error) {
                console.error('❌ [StatsDashboard] Error processing language data:', error);
            }
        };

        processLanguages();
    }, [allChats]);

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

    const getTop10 = (data: Record<string, number>, isCountryData: boolean = false): TopItem[] => {
        const total = Object.values(data).reduce((a: number, b: number) => a + b, 0);
        if (total === 0) return [];

        return Object.entries(data)
            .sort(([, a]: [string, number], [, b]: [string, number]) => b - a)
            .slice(0, 10)
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
            'Netherlands': 'NL',
            'Sweden': 'SE',
            'Norway': 'NO',
            'Finland': 'FI',
            'Denmark': 'DK',
            'United States': 'US',
            'United Kingdom': 'GB',
            'Canada': 'CA',
            'Australia': 'AU',
            'Japan': 'JP',
            'South Korea': 'KR',
            'China': 'CN',
            'India': 'IN',
            'Brazil': 'BR',
            'Mexico': 'MX',
            'Spain': 'ES',
            'Italy': 'IT',
            'Russia': 'RU',
            'Turkey': 'TR',
            'Egypt': 'EG',
            'Jordan': 'JO',
            'Pakistan': 'PK',
            'Bangladesh': 'BD',
            'Indonesia': 'ID',
            'Malaysia': 'MY',
            'Thailand': 'TH',
            'Vietnam': 'VN',
            'South Africa': 'ZA',
            'Nigeria': 'NG',
            'Kenya': 'KE',
            'Morocco': 'MA',
            'Argentina': 'AR',
            'Chile': 'CL',
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
            'Scotland': 'GB'
        };
        return codes[countryName] || '';
    };

    const statistics = useMemo(() => {
        const stats = {
            totalChats: filteredChats.length,
            chatsWithLocation: 0,
            websiteUsers: 0,
            sdkUsers: 0,
            languages: {} as Record<string, number>,
            countries: {} as Record<string, number>,
            websites: {} as Record<string, number>,
            recentChats: [] as {
                question: string;
                timestamp: Date;
                user: string;
                source: string;
                language?: string;
                languageName: string;
                country: string;
                countryCode: string;
                countryFlag: string;
                city?: string;
            }[]
        };

        // Process each chat
        filteredChats?.forEach(chat => {
            // Safety checks
            if (!chat || !chat.user || !chat._id) return;

            // Check if chat has valid Sanity location data
            const hasValidLocation = chat.location &&
                chat.location.country &&
                chat.location.country !== 'Unknown' &&
                chat.location.source !== 'unknown';

            if (hasValidLocation) {
                stats.chatsWithLocation++;
            }

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

            // Use detected language from Sanity or state
            const detectedLang = chat.detectedLanguage || detectedLanguages?.[chat._id];
            if (detectedLang) {
                const langName = getLanguageName(detectedLang);
                stats.languages[langName] = (stats.languages[langName] || 0) + 1;
            }

            // Only count countries from chats with valid Sanity location data
            if (hasValidLocation) {
                const country = chat.location!.country!;
                stats.countries[country] = (stats.countries[country] || 0) + 1;
            }

            // Collect recent chats (user messages) with language and location data
            try {
                if (chat.messages && Array.isArray(chat.messages)) {
                    const userMessages = chat.messages.filter(msg => msg && msg.role === 'user');
                    if (userMessages.length > 0) {
                        const lastUserMessage = userMessages[userMessages.length - 1];
                        if (lastUserMessage?.content) {
                            const detectedLang = chat.detectedLanguage || detectedLanguages[chat._id];

                            // Determine user display and source
                            let userDisplay = '';
                            let source = '';

                            if (isSDKUser) {
                                // For SDK users, show the source domain
                                userDisplay = 'Guest User';
                                source = chat.user.lastName || 'Unknown SDK';
                            } else {
                                // For website users, show their name
                                userDisplay = `${chat.user?.firstName || ''} ${chat.user?.lastName || ''}`.trim();
                                source = 'Al Hayat GPT Website';
                            }

                            // Use Sanity location data if available, otherwise skip location info
                            const locationInfo = hasValidLocation ? {
                                country: chat.location!.country!,
                                countryCode: chat.location!.ip ? getCountryCode(chat.location!.country!) : '',
                                countryFlag: chat.location!.ip ? getCountryFlag(getCountryCode(chat.location!.country!)) : '🌍',
                                city: chat.location!.city
                            } : {
                                country: 'Unknown',
                                countryCode: '',
                                countryFlag: '🌍',
                                city: undefined
                            };

                            stats.recentChats.push({
                                question: lastUserMessage.content,
                                timestamp: new Date(lastUserMessage.timestamp),
                                user: userDisplay,
                                source: source,
                                language: detectedLang,
                                languageName: detectedLang ? getLanguageName(detectedLang) : 'Unknown',
                                ...locationInfo
                            });
                        }
                    }
                }
            } catch (error) {
                console.warn('Error collecting recent chats:', error);
            }
        });

        // Sort recent chats by timestamp (most recent first) and take top 5
        stats.recentChats.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        stats.recentChats = stats.recentChats.slice(0, 5);

        return stats;
    }, [filteredChats, detectedLanguages]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading dashboard data...</p>
                </div>
            </div>
        );
    }

    if (dataError) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-red-600 text-center">
                    <p className="text-lg font-medium">Error loading statistics</p>
                    <p className="text-sm text-gray-500 mt-2">{dataError}</p>
                </div>
            </div>
        );
    }

    const topLanguages = getTop10(statistics?.languages || {});
    const topCountries = getTop10(statistics?.countries || {}, true);
    const topWebsites = getTop10(statistics?.websites || {});

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                                <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    Live Updates
                                </div>
                            </div>
                            <p className="mt-2 text-gray-600">Overview of chat activity and user engagement • Auto-refreshes every 10 seconds</p>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    <StatCard
                        title="Total Chats"
                        value={(statistics?.totalChats || 0).toLocaleString()}
                        subtitle={selectedRange?.label?.toLowerCase() || 'all time'}
                        icon="💬"
                    />
                    <StatCard
                        title="With Location Data"
                        value={(statistics?.chatsWithLocation || 0).toLocaleString()}
                        subtitle={`${statistics?.totalChats > 0 ? Math.round((statistics.chatsWithLocation / statistics.totalChats) * 100) : 0}% of total`}
                        icon="📍"
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
                    {/* Recent Chats */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <span className="mr-2">💬</span>
                            Recent Chats
                        </h3>
                        <div className="space-y-4">
                            {statistics.recentChats.length > 0 ? (
                                statistics.recentChats.map((item: any, index: number) => (
                                    <div key={index} className="border-l-4 border-blue-500 pl-4 py-3 bg-gray-50 rounded-r-lg">
                                        <p className="text-gray-800 text-sm font-medium line-clamp-2 mb-3">
                                            {item.question.length > 100 ? `${item.question.substring(0, 100)}...` : item.question}
                                        </p>

                                        {/* User and Source Row */}
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-semibold text-gray-700">{item.user}</span>
                                                <span className="text-xs text-gray-500">•</span>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                    🔗 {item.source}
                                                </span>
                                            </div>
                                            <span className="text-xs text-gray-500">{format(item.timestamp, 'MMM d, h:mm a')}</span>
                                        </div>

                                        {/* Language and Location Row */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    🗣️ {item.languageName}
                                                </span>
                                                {item.country !== 'Unknown' && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        {item.countryFlag} {item.country}
                                                        {item.city && item.city !== 'Unknown' ? `, ${item.city}` : ''}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 italic">No recent chats found</p>
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
                                topLanguages.map((item: TopItem, index: number) => (
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
                            <span className="ml-2 text-sm text-gray-500">(Sanity Data Only)</span>
                        </h3>
                        <div className="space-y-3">
                            {topCountries.length > 0 ? (
                                topCountries.map((item: TopItem, index: number) => (
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
                                <div className="text-center py-4">
                                    <p className="text-gray-500 italic mb-2">No location data available yet</p>
                                    <p className="text-xs text-gray-400">Location data will appear here as users interact with the new system</p>
                                </div>
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
                                topWebsites.map((item: TopItem, index: number) => (
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                        <div className="text-center">
                            <div className="bg-green-50 rounded-lg p-6">
                                <div className="text-3xl font-bold text-green-600 mb-2">
                                    {statistics.chatsWithLocation.toLocaleString()}
                                </div>
                                <div className="text-gray-600 font-medium">With Location Data</div>
                                <div className="text-sm text-gray-500 mt-1">
                                    Auto-detected from Sanity
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