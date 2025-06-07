"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { Chat, Message } from '@/types/chat';
import { format, isWithinInterval, parseISO, startOfDay, endOfDay, startOfMonth, subDays, subWeeks } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';
import { trackChatEvent } from '@/utils/analytics';
import { useLiveChats } from '@/hooks/useLiveChats';

import {
    FunnelIcon,
    MagnifyingGlassIcon,
    CalendarIcon,
    UserIcon,
    GlobeAltIcon,
    LanguageIcon,
    XMarkIcon,
    ArrowLeftIcon,
    ArrowRightIcon,
    DocumentArrowDownIcon,
    EyeIcon,
    FlagIcon,
    MapPinIcon,
    ClockIcon,
    UserGroupIcon,
    ComputerDesktopIcon,
    TrashIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import ChatDetailModal from './ChatDetailModal';

// Enhanced interfaces for better type safety
interface UserLocation {
    latitude?: number;
    longitude?: number;
    city?: string;
    region?: string;
    country?: string;
    timezone?: string;
    ip?: string;
    source: 'geolocation' | 'ip' | 'unknown';
}

type UserType = 'all' | 'registered' | 'guest';
type DateRange = {
    start: Date | null;
    end: Date | null;
};
type Language = 'all' | 'en' | 'ar' | 'fa' | 'he' | 'fi' | 'sv' | 'no' | 'da' | 'zh' | 'hi' | 'es' | 'fr' | 'bn' | 'pt' | 'ru' | 'id' | 'ur' | 'de' | 'ja' | 'tr' | 'ko' | 'vi' | 'te' | 'mr' | 'ta' | 'th' | 'bal' | 'ms';
type SourceFilter = 'all' | 'website' | 'widget' | string;
type LocationFilter = 'all' | string;

interface LanguageOption {
    code: Language;
    name: string;
    flag: string;
    nativeName: string;
}

interface DateRangeOption {
    label: string;
    value: string;
    getRange: () => DateRange;
}

interface FilterStats {
    totalChats: number;
    languageStats: Record<string, number>;
    locationStats: Record<string, { count: number; flag: string }>;
    sourceStats: Record<string, number>;
    timeframeStats: Record<string, number>;
}

// Enhanced language options with better flags and native names
const allLanguages: LanguageOption[] = [
    { code: 'en', name: 'English', flag: '🇺🇸', nativeName: 'English' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦', nativeName: 'العربية' },
    { code: 'fa', name: 'Persian', flag: '🇮🇷', nativeName: 'فارسی' },
    { code: 'he', name: 'Hebrew', flag: '🇮🇱', nativeName: 'עברית' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳', nativeName: '中文' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳', nativeName: 'हिन्दी' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸', nativeName: 'Español' },
    { code: 'fr', name: 'French', flag: '🇫🇷', nativeName: 'Français' },
    { code: 'de', name: 'German', flag: '🇩🇪', nativeName: 'Deutsch' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺', nativeName: 'Русский' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵', nativeName: '日本語' },
    { code: 'pt', name: 'Portuguese', flag: '🇧🇷', nativeName: 'Português' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷', nativeName: '한국어' },
    { code: 'tr', name: 'Turkish', flag: '🇹🇷', nativeName: 'Türkçe' },
    { code: 'ur', name: 'Urdu', flag: '🇵🇰', nativeName: 'اردو' },
    { code: 'bn', name: 'Bengali', flag: '🇧🇩', nativeName: 'বাংলা' },
    { code: 'id', name: 'Indonesian', flag: '🇮🇩', nativeName: 'Bahasa Indonesia' },
    { code: 'vi', name: 'Vietnamese', flag: '🇻🇳', nativeName: 'Tiếng Việt' },
    { code: 'th', name: 'Thai', flag: '🇹🇭', nativeName: 'ไทย' },
    { code: 'fi', name: 'Finnish', flag: '🇫🇮', nativeName: 'Suomi' },
    { code: 'sv', name: 'Swedish', flag: '🇸🇪', nativeName: 'Svenska' },
    { code: 'no', name: 'Norwegian', flag: '🇳🇴', nativeName: 'Norsk' },
    { code: 'da', name: 'Danish', flag: '🇩🇰', nativeName: 'Dansk' },
    { code: 'ms', name: 'Malay', flag: '🇲🇾', nativeName: 'Bahasa Melayu' },
    { code: 'te', name: 'Telugu', flag: '🇮🇳', nativeName: 'తెలుగు' },
    { code: 'mr', name: 'Marathi', flag: '🇮🇳', nativeName: 'मराठी' },
    { code: 'ta', name: 'Tamil', flag: '🇮🇳', nativeName: 'தமிழ்' },
    { code: 'bal', name: 'Balochi', flag: '🇵🇰', nativeName: 'بلۏچی' },
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
        label: 'Last 30 Days',
        value: 'last30days',
        getRange: () => ({
            start: startOfDay(subDays(new Date(), 29)),
            end: endOfDay(new Date())
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

// Helper function to get country flag from country name
const getCountryFlag = (countryName: string): string => {
    const countryFlags: Record<string, string> = {
        'United States': '🇺🇸', 'USA': '🇺🇸', 'US': '🇺🇸',
        'United Kingdom': '🇬🇧', 'UK': '🇬🇧', 'England': '🇬🇧', 'Britain': '🇬🇧',
        'Canada': '🇨🇦', 'Germany': '🇩🇪', 'France': '🇫🇷', 'Italy': '🇮🇹',
        'Spain': '🇪🇸', 'Netherlands': '🇳🇱', 'Belgium': '🇧🇪', 'Sweden': '🇸🇪',
        'Norway': '🇳🇴', 'Denmark': '🇩🇰', 'Finland': '🇫🇮', 'Poland': '🇵🇱',
        'Russia': '🇷🇺', 'China': '🇨🇳', 'Japan': '🇯🇵', 'South Korea': '🇰🇷',
        'India': '🇮🇳', 'Australia': '🇦🇺', 'Brazil': '🇧🇷', 'Mexico': '🇲🇽',
        'Argentina': '🇦🇷', 'Chile': '🇨🇱', 'Egypt': '🇪🇬', 'Saudi Arabia': '🇸🇦',
        'Israel': '🇮🇱', 'Turkey': '🇹🇷', 'Pakistan': '🇵🇰', 'Bangladesh': '🇧🇩',
        'Indonesia': '🇮🇩', 'Thailand': '🇹🇭', 'Vietnam': '🇻🇳', 'Philippines': '🇵🇭',
        'Malaysia': '🇲🇾', 'Singapore': '🇸🇬', 'United Arab Emirates': '🇦🇪',
        'South Africa': '🇿🇦', 'Nigeria': '🇳🇬', 'Kenya': '🇰🇪', 'Morocco': '🇲🇦',
    };
    return countryFlags[countryName] || '🌍';
};

// Helper function to get language display name
const getLanguageName = (code: string): string => {
    const lang = allLanguages.find(l => l.code === code);
    return lang ? `${lang.flag} ${lang.name}` : code.toUpperCase();
};

// Helper function to strip HTML tags from text content
const stripHtmlTags = (content: string): string => {
    return content.replace(/<[^>]*>/g, '').trim();
};

export default function AllChats() {
    const { currentChat } = useChat();
    const { language: currentLanguage } = useLanguage();

    // Use live chat hook for real-time updates
    const { chats: allChats, loading, error: dataError, refetch } = useLiveChats(
        5000, // Refresh every 5 seconds
        true  // Enable auto-refresh
    );

    // Filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [userTypeFilter, setUserTypeFilter] = useState<UserType>('all');
    const [languageFilter, setLanguageFilter] = useState<Language>('all');
    const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
    const [locationFilter, setLocationFilter] = useState<LocationFilter>('all');
    const [selectedDateRange, setSelectedDateRange] = useState<string>('all');
    const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });

    // UI state
    const [currentPage, setCurrentPage] = useState(1);
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

    // Modal and delete state
    const [selectedChatForModal, setSelectedChatForModal] = useState<Chat | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deletingChatId, setDeletingChatId] = useState<string | null>(null);
    const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
    const [deleteAllStep, setDeleteAllStep] = useState<1 | 2>(1);

    const CHATS_PER_PAGE = 25;

    // Show data error if there's an issue loading chats
    useEffect(() => {
        if (dataError) {
            console.error('❌ [AllChats] Error loading chats:', dataError);
        }
    }, [dataError]);

    // Calculate filter statistics
    const filterStats: FilterStats = useMemo(() => {
        const stats: FilterStats = {
            totalChats: allChats.length,
            languageStats: {},
            locationStats: {},
            sourceStats: {},
            timeframeStats: {}
        };

        // Count by language (using Sanity detectedLanguage field)
        allChats.forEach(chat => {
            const lang = chat.detectedLanguage || 'unknown';
            stats.languageStats[lang] = (stats.languageStats[lang] || 0) + 1;
        });

        // Count by location (using Sanity location field)
        allChats.forEach(chat => {
            if (chat.location?.country) {
                const country = chat.location.country;
                const flag = getCountryFlag(country);
                if (!stats.locationStats[country]) {
                    stats.locationStats[country] = { count: 0, flag };
                }
                stats.locationStats[country].count++;
            }
        });

        // Count by source
        allChats.forEach(chat => {
            const isGuest = chat.user.clerkId.startsWith('guest_');
            const source = isGuest ? 'widget' : 'website';
            stats.sourceStats[source] = (stats.sourceStats[source] || 0) + 1;
        });

        return stats;
    }, [allChats]);

    // Filter chats based on current filters
    const filteredChats = useMemo(() => {
        return allChats.filter(chat => {
            // User type filter
            const isGuest = chat.user.clerkId.startsWith('guest_');
            if (userTypeFilter === 'registered' && isGuest) return false;
            if (userTypeFilter === 'guest' && !isGuest) return false;

            // Source filter
            if (sourceFilter !== 'all') {
                const isGuestUser = chat.user.clerkId.startsWith('guest_');
                if (sourceFilter === 'website' && isGuestUser) return false;
                if (sourceFilter === 'widget' && !isGuestUser) return false;
            }

            // Language filter (using Sanity detectedLanguage)
            if (languageFilter !== 'all') {
                if (chat.detectedLanguage !== languageFilter) return false;
            }

            // Location filter (using Sanity location)
            if (locationFilter !== 'all') {
                if (!chat.location?.country || chat.location.country !== locationFilter) return false;
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
                        if (!isWithinInterval(chatDate, { start: startDate, end: endDate })) return false;
                    }
                } else {
                    const option = dateRangeOptions.find(opt => opt.value === selectedDateRange);
                    if (option) {
                        const range = option.getRange();
                        if (range.start && range.end) {
                            if (!isWithinInterval(chatDate, { start: range.start, end: range.end })) return false;
                        }
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
                const matchesLocation = chat.location?.country?.toLowerCase().includes(searchLower) ||
                    chat.location?.city?.toLowerCase().includes(searchLower);
                return matchesTitle || matchesUser || matchesEmail || matchesContent || matchesLocation;
            }

            return true;
        });
    }, [allChats, userTypeFilter, sourceFilter, languageFilter, locationFilter, selectedDateRange, dateRange, searchQuery]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredChats.length / CHATS_PER_PAGE);
    const startIndex = (currentPage - 1) * CHATS_PER_PAGE;
    const endIndex = startIndex + CHATS_PER_PAGE;
    const currentChats = filteredChats.slice(startIndex, endIndex);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [userTypeFilter, sourceFilter, languageFilter, locationFilter, selectedDateRange, searchQuery]);

    // Clear all filters
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

    // Reset date range when switching away from custom
    useEffect(() => {
        if (selectedDateRange !== 'custom') {
            setDateRange({ start: null, end: null });
        }
    }, [selectedDateRange]);

    // Modal functions
    const openChatModal = (chat: Chat) => {
        setSelectedChatForModal(chat);
        setIsModalOpen(true);
    };

    const closeChatModal = () => {
        setIsModalOpen(false);
        setSelectedChatForModal(null);
    };



    // Delete functions
    const handleDeleteChat = async (chatId: string) => {
        if (!confirm('Are you sure you want to delete this chat? This action cannot be undone.')) {
            return;
        }

        setIsDeleting(true);
        setDeletingChatId(chatId);

        try {
            const response = await fetch(`/api/admin/chats?chatId=${encodeURIComponent(chatId)}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP ${response.status}`);
            }

            const result = await response.json();

            // Refresh data to show updated state
            await refetch();

            console.log(`✅ [AllChats] Successfully deleted chat: ${chatId}`, result);
        } catch (error) {
            console.error('❌ [AllChats] Error deleting chat:', error);
            alert(`Failed to delete chat: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsDeleting(false);
            setDeletingChatId(null);
        }
    };

    const handleDeleteAllChats = async () => {
        if (deleteAllStep === 1) {
            setDeleteAllStep(2);
            return;
        }

        if (!confirm(`FINAL CONFIRMATION: Are you absolutely sure you want to delete ALL ${allChats.length} chats? This will permanently remove everything from Sanity and cannot be undone!`)) {
            setShowDeleteAllConfirm(false);
            setDeleteAllStep(1);
            return;
        }

        setIsDeleting(true);

        try {
            const response = await fetch('/api/admin/chats', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action: 'deleteAll' }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP ${response.status}`);
            }

            const result = await response.json();

            // Refresh data to show updated state
            await refetch();
            setShowDeleteAllConfirm(false);
            setDeleteAllStep(1);

            alert(`✅ Successfully deleted ${result.deletedCount} chats from Sanity.`);
            console.log(`✅ [AllChats] Successfully deleted all chats: ${result.deletedCount} removed`);
        } catch (error) {
            console.error('❌ [AllChats] Error deleting all chats:', error);
            alert(`Failed to delete all chats: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsDeleting(false);
        }
    };

    const openDeleteAllConfirm = () => {
        setShowDeleteAllConfirm(true);
        setDeleteAllStep(1);
    };

    const closeDeleteAllConfirm = () => {
        setShowDeleteAllConfirm(false);
        setDeleteAllStep(1);
    };

    // Export functionality
    const exportChats = async (exportFormat: 'text' | 'json') => {
        // Show confirmation alert
        const confirmExport = window.confirm(
            `Are you sure you want to export ${filteredChats.length} chat${filteredChats.length !== 1 ? 's' : ''} as ${exportFormat.toUpperCase()}?\n\nThis will download a file containing all filtered chat data including messages and user information.`
        );

        if (!confirmExport) {
            return; // User cancelled the export
        }

        setIsExporting(true);
        try {
            const exportData = filteredChats.map(chat => ({
                id: chat._id,
                title: chat.title,
                createdAt: format(chat.createdAt, 'yyyy-MM-dd HH:mm:ss'),
                updatedAt: format(chat.updatedAt, 'yyyy-MM-dd HH:mm:ss'),
                messageCount: chat.messages.length,
                user: {
                    name: `${chat.user.firstName} ${chat.user.lastName}`,
                    email: chat.user.email,
                    type: chat.user.clerkId.startsWith('guest_') ? 'Guest' : 'Registered',
                    clerkId: chat.user.clerkId
                },
                detectedLanguage: chat.detectedLanguage,
                location: chat.location ? {
                    country: chat.location.country,
                    city: chat.location.city,
                    region: chat.location.region,
                    source: chat.location.source
                } : null,
                source: chat.user.clerkId.startsWith('guest_') ? 'Widget' : 'Website',
                messages: chat.messages.map(msg => ({
                    role: msg.role,
                    content: stripHtmlTags(msg.content), // Strip HTML tags for clean export
                    timestamp: format(msg.timestamp, 'yyyy-MM-dd HH:mm:ss')
                }))
            }));

            const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
            let content: string;
            let filename: string;
            let mimeType: string;

            if (exportFormat === 'json') {
                content = JSON.stringify(exportData, null, 2);
                filename = `chats_export_${timestamp}.json`;
                mimeType = 'application/json';
            } else {
                content = exportData.map(chat =>
                    `Chat: ${chat.title}
ID: ${chat.id}
Created: ${chat.createdAt}
User: ${chat.user.name} (${chat.user.type})
Email: ${chat.user.email}
Language: ${chat.detectedLanguage || 'Unknown'}
Location: ${chat.location?.country || 'Unknown'} ${chat.location?.city ? `(${chat.location.city})` : ''}
Source: ${chat.source}
Messages: ${chat.messageCount}

Messages:
${chat.messages.map(msg => `[${msg.timestamp}] ${msg.role.toUpperCase()}: ${stripHtmlTags(msg.content)}`).join('\n')}

${'='.repeat(80)}`
                ).join('\n\n');
                filename = `chats_export_${timestamp}.txt`;
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

            // Show success alert
            alert(`✅ Export successful!\n\n${exportData.length} chat${exportData.length !== 1 ? 's' : ''} exported as ${filename}\n\nThe file has been downloaded to your default downloads folder.`);

            // Track the export event
            trackChatEvent('EXPORT_TEXT', `${exportData.length} chats exported as ${exportFormat}`);
        } catch (error) {
            console.error('Error exporting chats:', error);
            // Show error alert
            alert(`❌ Export failed!\n\nThere was an error exporting the chat data. Please try again.\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsExporting(false);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="p-6 max-w-7xl mx-auto">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-24 bg-gray-100 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header with Title and Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                <span className="text-2xl text-blue-600">💬</span>
                                All Chats
                            </h1>
                            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                Live Updates
                            </div>
                        </div>
                        <p className="text-gray-600 mt-1">
                            Manage and analyze all chat conversations from the website and SDK widget • Auto-refreshes every 5 seconds
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">{filteredChats.length}</div>
                            <div className="text-sm text-gray-500">Total Chats</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <UserGroupIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <div className="text-lg font-semibold text-gray-900">
                                {filterStats.sourceStats.website || 0}
                            </div>
                            <div className="text-sm text-gray-500">Website Users</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <ComputerDesktopIcon className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <div className="text-lg font-semibold text-gray-900">
                                {filterStats.sourceStats.widget || 0}
                            </div>
                            <div className="text-sm text-gray-500">Widget Users</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <LanguageIcon className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <div className="text-lg font-semibold text-gray-900">
                                {Object.keys(filterStats.languageStats).length}
                            </div>
                            <div className="text-sm text-gray-500">Languages</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <GlobeAltIcon className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                            <div className="text-lg font-semibold text-gray-900">
                                {Object.keys(filterStats.locationStats).length}
                            </div>
                            <div className="text-sm text-gray-500">Countries</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Search and Filter Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search Input */}
                    <div className="flex-1 relative">
                        <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search chats, users, content, or locations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <XMarkIcon className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {/* Filter Toggles */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2 transition-colors"
                        >
                            <FunnelIcon className="h-4 w-4" />
                            Filters
                            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                                {[
                                    userTypeFilter !== 'all' ? 1 : 0,
                                    sourceFilter !== 'all' ? 1 : 0,
                                    languageFilter !== 'all' ? 1 : 0,
                                    locationFilter !== 'all' ? 1 : 0,
                                    selectedDateRange !== 'all' ? 1 : 0,
                                    searchQuery ? 1 : 0
                                ].reduce((sum, val) => sum + val, 0)}
                            </span>
                        </button>

                        <div className="flex gap-2">
                            <button
                                onClick={() => exportChats('json')}
                                disabled={isExporting}
                                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                            >
                                <DocumentArrowDownIcon className="h-4 w-4" />
                                {isExporting ? 'Exporting...' : 'Export'}
                            </button>

                            <button
                                onClick={openDeleteAllConfirm}
                                disabled={isDeleting || allChats.length === 0}
                                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                            >
                                <TrashIcon className="h-4 w-4" />
                                Delete All
                            </button>
                        </div>
                    </div>
                </div>

                {/* Expanded Filter Menu */}
                {isFilterMenuOpen && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                            {/* User Type Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <UserIcon className="h-4 w-4" />
                                    User Type
                                </label>
                                <select
                                    value={userTypeFilter}
                                    onChange={(e) => setUserTypeFilter(e.target.value as UserType)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="all">All Users</option>
                                    <option value="registered">Registered</option>
                                    <option value="guest">Guest</option>
                                </select>
                            </div>

                            {/* Source Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <ComputerDesktopIcon className="h-4 w-4" />
                                    Source
                                </label>
                                <select
                                    value={sourceFilter}
                                    onChange={(e) => setSourceFilter(e.target.value as SourceFilter)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="all">All Sources</option>
                                    <option value="website">Website</option>
                                    <option value="widget">SDK Widget</option>
                                </select>
                            </div>

                            {/* Language Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <LanguageIcon className="h-4 w-4" />
                                    Language
                                </label>
                                <select
                                    value={languageFilter}
                                    onChange={(e) => setLanguageFilter(e.target.value as Language)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="all">All Languages</option>
                                    {Object.entries(filterStats.languageStats)
                                        .filter(([lang]) => lang !== 'unknown')
                                        .sort(([, a], [, b]) => b - a)
                                        .map(([lang, count]) => (
                                            <option key={lang} value={lang}>
                                                {getLanguageName(lang)} ({count})
                                            </option>
                                        ))}
                                </select>
                            </div>

                            {/* Location Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <MapPinIcon className="h-4 w-4" />
                                    Location
                                </label>
                                <select
                                    value={locationFilter}
                                    onChange={(e) => setLocationFilter(e.target.value as LocationFilter)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="all">All Locations</option>
                                    {Object.entries(filterStats.locationStats)
                                        .sort(([, a], [, b]) => b.count - a.count)
                                        .map(([country, data]) => (
                                            <option key={country} value={country}>
                                                {data.flag} {country} ({data.count})
                                            </option>
                                        ))}
                                </select>
                            </div>

                            {/* Date Range Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <CalendarIcon className="h-4 w-4" />
                                    Date Range
                                </label>
                                <select
                                    value={selectedDateRange}
                                    onChange={(e) => setSelectedDateRange(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="all">All Time</option>
                                    {dateRangeOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Custom Date Range Inputs */}
                        {selectedDateRange === 'custom' && (
                            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            From Date
                                        </label>
                                        <input
                                            type="date"
                                            value={dateRange.start ? format(dateRange.start, 'yyyy-MM-dd') : ''}
                                            onChange={(e) => {
                                                const startDate = e.target.value ? new Date(e.target.value) : null;
                                                setDateRange(prev => ({ ...prev, start: startDate }));
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            To Date
                                        </label>
                                        <input
                                            type="date"
                                            value={dateRange.end ? format(dateRange.end, 'yyyy-MM-dd') : ''}
                                            onChange={(e) => {
                                                const endDate = e.target.value ? new Date(e.target.value) : null;
                                                setDateRange(prev => ({ ...prev, end: endDate }));
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                                <div className="mt-3 text-sm text-blue-600">
                                    <span className="font-medium">Note:</span> Custom date range will filter chats by their last updated date.
                                    {dateRange.start && dateRange.end && (
                                        <span className="ml-2">
                                            Filtering from {format(dateRange.start, 'MMM d, yyyy')} to {format(dateRange.end, 'MMM d, yyyy')}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Clear Filters Button */}
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={clearAllFilters}
                                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 hover:border-gray-400 rounded-lg transition-colors"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Chat List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Conversations ({filteredChats.length})
                        </h2>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">
                                Showing {startIndex + 1}-{Math.min(endIndex, filteredChats.length)} of {filteredChats.length}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="divide-y divide-gray-200">
                    {currentChats.map((chat) => {
                        const isGuest = chat.user.clerkId.startsWith('guest_');
                        const source = isGuest ? 'SDK Widget' : 'Website';
                        const hasLocation = chat.location?.country;
                        const lastMessage = chat.messages[chat.messages.length - 1];

                        return (
                            <div
                                key={chat._id}
                                className="p-6 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-medium text-gray-900 truncate">
                                                {chat.title}
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                {/* Source Badge */}
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${isGuest
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                    {source}
                                                </span>

                                                {/* Language Badge */}
                                                {chat.detectedLanguage && (
                                                    <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                                                        {getLanguageName(chat.detectedLanguage)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <UserIcon className="h-4 w-4" />
                                                    <span>{chat.user.firstName} {chat.user.lastName}</span>
                                                </div>
                                                {/* Show email for registered users only */}
                                                {!isGuest && chat.user.email && (
                                                    <div className="flex items-center gap-2 text-xs text-gray-500 ml-6">
                                                        <span>{chat.user.email}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {hasLocation && (
                                                <div className="flex items-center gap-2">
                                                    <MapPinIcon className="h-4 w-4" />
                                                    <span>
                                                        {getCountryFlag(chat.location?.country || '')} {chat.location?.country}
                                                        {chat.location?.city && `, ${chat.location.city}`}
                                                    </span>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-2">
                                                <span className="text-blue-600">💬</span>
                                                <span>{chat.messages.length} messages</span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <ClockIcon className="h-4 w-4" />
                                                <span>{format(chat.updatedAt, 'MMM d, yyyy')}</span>
                                            </div>
                                        </div>

                                        {lastMessage && (
                                            <div className="mt-3 text-sm text-gray-500">
                                                <span className="font-medium">{lastMessage.role === 'user' ? 'User' : 'Assistant'}:</span>{' '}
                                                {/* Strip HTML tags from message content for preview */}
                                                {(() => {
                                                    const cleanContent = stripHtmlTags(lastMessage.content);
                                                    return cleanContent.substring(0, 150) + (cleanContent.length > 150 ? '...' : '');
                                                })()}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 ml-4">
                                        <button
                                            onClick={() => openChatModal(chat)}
                                            className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="View Full Conversation"
                                        >
                                            <EyeIcon className="h-5 w-5" />
                                        </button>



                                        <button
                                            onClick={() => handleDeleteChat(chat._id!)}
                                            disabled={isDeleting && deletingChatId === chat._id}
                                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                            title="Delete Chat"
                                        >
                                            {isDeleting && deletingChatId === chat._id ? (
                                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-red-300 border-t-red-600"></div>
                                            ) : (
                                                <TrashIcon className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                                Page {currentPage} of {totalPages}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    <ArrowLeftIcon className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    <ArrowRightIcon className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Empty State */}
            {filteredChats.length === 0 && !loading && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <div className="text-6xl text-gray-400 mb-4">💬</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No chats found</h3>
                    <p className="text-gray-500 mb-6">
                        {searchQuery ? 'Try adjusting your search query or filters.' : 'No chat conversations match the current filters.'}
                    </p>
                    <button
                        onClick={clearAllFilters}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Clear Filters
                    </button>
                </div>
            )}

            {/* Chat Detail Modal */}
            <ChatDetailModal
                chat={selectedChatForModal}
                isOpen={isModalOpen}
                onClose={closeChatModal}
                onDelete={handleDeleteChat}
            />

            {/* Delete All Confirmation Dialog */}
            {showDeleteAllConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-red-100 rounded-lg">
                                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {deleteAllStep === 1 ? 'Delete All Chats?' : 'Final Confirmation'}
                                </h3>
                            </div>

                            {deleteAllStep === 1 ? (
                                <div>
                                    <p className="text-gray-600 mb-4">
                                        You are about to delete <strong>{allChats.length} chats</strong> from Sanity.
                                        This action cannot be undone and will permanently remove all conversation data.
                                    </p>
                                    <p className="text-sm text-red-600 mb-6">
                                        Are you sure you want to proceed to the final confirmation?
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-red-700 font-medium mb-4">
                                        ⚠️ FINAL WARNING: This will permanently delete ALL {allChats.length} chats from Sanity!
                                    </p>
                                    <p className="text-gray-600 mb-6">
                                        Type &quot;DELETE ALL&quot; below to confirm this irreversible action:
                                    </p>
                                    <input
                                        type="text"
                                        placeholder="Type DELETE ALL to confirm"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 mb-4"
                                        onKeyDown={(e) => {
                                            const confirmText = 'DELETE ALL';
                                            if (e.key === 'Enter' && (e.target as HTMLInputElement).value === confirmText) {
                                                handleDeleteAllChats();
                                            }
                                        }}
                                    />
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={closeDeleteAllConfirm}
                                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteAllChats}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isDeleting ? (
                                        <>
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            <TrashIcon className="h-4 w-4" />
                                            {deleteAllStep === 1 ? 'Continue' : 'DELETE ALL'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

