"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { Chat, Message } from '@/types/chat';
import { format, isWithinInterval, parseISO, startOfDay, endOfDay, startOfMonth, subDays, subWeeks } from 'date-fns';
import { getAllChats } from '@/sanity/lib/data/getAllChats';
import { useLanguage } from '@/contexts/LanguageContext';
import { detectLanguage } from '@/utils/languageDetection';

type UserType = 'all' | 'registered' | 'guest';
type DateRange = {
    start: Date | null;
    end: Date | null;
};
type Language = 'all' | 'en' | 'ar' | 'he' | 'fi' | 'sv' | 'no' | 'da' | 'zh' | 'hi' | 'es' | 'fr' | 'bn' | 'pt' | 'ru' | 'id' | 'ur' | 'de' | 'ja' | 'tr' | 'ko' | 'vi' | 'te' | 'mr' | 'ta' | 'th' | 'bal' | 'ms';

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
    const [selectedDateRange, setSelectedDateRange] = useState<string>('all');
    const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });
    const [isExporting, setIsExporting] = useState(false);
    const [detectedLanguages, setDetectedLanguages] = useState<Record<string, Language>>({});
    const [availableLanguages, setAvailableLanguages] = useState<LanguageOption[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const CHATS_PER_PAGE = 100;

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

    useEffect(() => {
        const loadAllChats = async () => {
            try {
                const chats = await getAllChats();
                setAllChats(chats);

                // Detect language for each chat
                const languages: Record<string, Language> = {};
                const uniqueLanguages = new Set<Language>();

                chats.forEach(chat => {
                    if (chat.messages.length > 0) {
                        // Use the last few messages to detect language
                        const recentMessages = chat.messages.slice(-3);
                        const combinedText = recentMessages.map(msg => msg.content).join(' ');
                        const detected = detectLanguage(combinedText);
                        languages[chat._id!] = detected as Language;
                        uniqueLanguages.add(detected as Language);
                    }
                });

                setDetectedLanguages(languages);

                // Update available languages based on detected languages
                const available = allLanguages.filter(lang =>
                    uniqueLanguages.has(lang.code as Language)
                );
                setAvailableLanguages(available);

                // If current language filter is not available in detected languages, reset to 'all'
                if (languageFilter !== 'all' && !uniqueLanguages.has(languageFilter)) {
                    setLanguageFilter('all');
                }
            } catch (error) {
                console.error('Error loading all chats:', error);
            }
        };
        loadAllChats();
    }, []);

    const filteredChats = useMemo(() => {
        return allChats.filter(chat => {
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
    }, [allChats, userTypeFilter, languageFilter, selectedDateRange, dateRange, searchQuery, detectedLanguages]);

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

        // Filter chats by date and user type first, then count languages
        const dateAndUserFilteredChats = allChats.filter(chat => {
            // User type filter
            const isGuest = chat.user.clerkId.startsWith('guest_');
            if (userTypeFilter === 'registered' && isGuest) return false;
            if (userTypeFilter === 'guest' && !isGuest) return false;

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
    }, [allChats, detectedLanguages, userTypeFilter, selectedDateRange, dateRange]);

    // Update available languages based on current counts
    const availableLanguagesWithCounts = useMemo(() => {
        return allLanguages.filter(lang => languageCounts[lang.code] > 0);
    }, [languageCounts]);

    // Clear all filters function
    const clearAllFilters = () => {
        setSearchQuery('');
        setUserTypeFilter('all');
        setLanguageFilter('all');
        setSelectedDateRange('all');
        setDateRange({ start: null, end: null });
        setCurrentPage(1);
    };

    const formatDate = (date: Date) => {
        return format(date, 'MMM d, yyyy h:mm a');
    };

    const exportChats = async (format: 'text' | 'json') => {
        setIsExporting(true);
        try {
            const exportData = filteredChats.map(chat => ({
                title: chat.title,
                user: `${chat.user.firstName} ${chat.user.lastName}`,
                email: chat.user.email,
                createdAt: formatDate(chat.createdAt),
                updatedAt: formatDate(chat.updatedAt),
                messages: chat.messages.map(msg => ({
                    role: msg.role,
                    content: msg.content,
                    timestamp: formatDate(msg.timestamp)
                }))
            }));

            let content: string;
            let filename: string;
            let mimeType: string;

            if (format === 'json') {
                content = JSON.stringify(exportData, null, 2);
                filename = `chats_export_${formatDate(new Date())}.json`;
                mimeType = 'application/json';
            } else {
                content = exportData.map(chat =>
                    `Chat: ${chat.title}
User: ${chat.user}
Email: ${chat.email}
Created: ${chat.createdAt}
Updated: ${chat.updatedAt}
Messages:
${chat.messages.map(msg =>
                        `[${msg.timestamp}] ${msg.role.toUpperCase()}: ${msg.content}`
                    ).join('\n')}
----------------------------------------`
                ).join('\n\n');
                filename = `chats_export_${formatDate(new Date())}.txt`;
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
                        <h2 className="text-xl font-semibold text-gray-800">All Chats</h2>
                        <div className="text-sm text-gray-500">
                            {filteredChats.length} / {allChats.length} chats
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Search chats..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Filters */}
                    <div className="mb-4 space-y-4">
                        {/* User Type Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                User Type
                            </label>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={userTypeFilter}
                                onChange={(e) => setUserTypeFilter(e.target.value as UserType)}
                            >
                                <option value="all">All Users</option>
                                <option value="registered">Registered Users</option>
                                <option value="guest">Guest Users</option>
                            </select>
                        </div>

                        {/* Language Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Language
                            </label>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={languageFilter}
                                onChange={(e) => {
                                    setLanguageFilter(e.target.value as Language);
                                    setCurrentPage(1); // Reset to first page when filter changes
                                }}
                            >
                                <option value="all">All Languages ({languageCounts['all']})</option>
                                {availableLanguagesWithCounts.map((lang) => (
                                    <option key={lang.code} value={lang.code}>
                                        {lang.flag} {lang.name} ({lang.nativeName}) - {languageCounts[lang.code]}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Date Range Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Date Range
                            </label>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
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
                                        <label className="block text-xs text-gray-500 mb-1">From</label>
                                        <input
                                            type="date"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                        <label className="block text-xs text-gray-500 mb-1">To</label>
                                        <input
                                            type="date"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {isExporting ? 'Exporting...' : 'Export as Text'}
                            </button>
                            <button
                                onClick={() => exportChats('json')}
                                disabled={isExporting}
                                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                            >
                                {isExporting ? 'Exporting...' : 'Export as JSON'}
                            </button>
                        </div>

                        {/* Clear Filters Button */}
                        <div className="pt-2">
                            <button
                                onClick={clearAllFilters}
                                className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    </div>

                    {/* Chat List */}
                    <div className="space-y-2">
                        {currentChats.map((chat: Chat) => (
                            <div
                                key={chat._id}
                                onClick={() => switchChat(chat._id!)}
                                className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${currentChat?._id === chat._id
                                    ? 'bg-blue-50 border border-blue-200'
                                    : 'hover:bg-gray-50 border border-gray-100'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-medium text-gray-900">
                                        {chat.title || 'New Chat'}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        {detectedLanguages[chat._id!] && (
                                            <span className="text-xs text-gray-500">
                                                {allLanguages.find(l => l.code === detectedLanguages[chat._id!])?.flag}
                                            </span>
                                        )}
                                        <span className="text-xs text-gray-500">
                                            {chat.user.firstName} {chat.user.lastName}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500">
                                    {formatDate(chat.updatedAt)}
                                </p>
                                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                    {chat.messages[chat.messages.length - 1]?.content || 'No messages yet'}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-4 flex justify-between items-center">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <span className="text-sm text-gray-600">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column - Messages */}
            <div className="w-full lg:w-2/3 bg-gray-50 overflow-y-auto">
                {currentChat ? (
                    <div className="p-6 pt-16 lg:pt-6">
                        <div className="mb-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                                        {currentChat.title || 'New Chat'}
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                        Created: {formatDate(currentChat.createdAt)}
                                    </p>
                                </div>
                                <div className="text-sm text-gray-600">
                                    <p>By: {currentChat.user.firstName} {currentChat.user.lastName}</p>
                                    <p>{currentChat.user.email}</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {currentChat.messages.map((message: Message) => (
                                <div
                                    key={message.uniqueKey}
                                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'
                                        }`}
                                >
                                    <div
                                        className={`max-w-[70%] rounded-lg p-4 ${message.role === 'user'
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-white border border-gray-200'
                                            }`}
                                    >
                                        <div className="text-sm mb-1">
                                            {message.role === 'user' ? 'You' : 'Assistant'}
                                        </div>
                                        <div
                                            className="whitespace-pre-wrap"
                                            dangerouslySetInnerHTML={{ __html: message.content }}
                                        />
                                        <div className="text-xs mt-2 opacity-70">
                                            {formatDate(message.timestamp)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center">
                        <div className="text-center text-gray-500">
                            <h3 className="text-xl font-medium mb-2">No Chat Selected</h3>
                            <p>Select a chat from the list to view messages</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
