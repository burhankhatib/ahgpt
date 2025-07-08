'use client';

import React, { useState } from 'react';
import { Chat, Message } from '@/types/chat';
import { format } from 'date-fns';
import { trackChatEvent } from '@/utils/analytics';
import {
    DocumentArrowDownIcon,
    XMarkIcon,
    CogIcon,
    CheckIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface EnhancedExportProps {
    filteredChats: Chat[];
    isExporting: boolean;
    setIsExporting: (value: boolean) => void;
    filterSummary: {
        userTypeFilter: string;
        sourceFilter: string;
        languageFilter: string;
        locationFilter: string;
        selectedDateRange: string;
        searchQuery: string;
    };
}

interface ExportOptions {
    format: 'json' | 'text';
    includeAIResponses: boolean;
    includeUserInfo: boolean;
    includeMetadata: boolean;
    includeTimestamps: boolean;
}

// Helper function to strip HTML tags from text content
const stripHtmlTags = (content: string): string => {
    return content.replace(/<[^>]*>/g, '').trim();
};

export default function EnhancedExport({
    filteredChats,
    isExporting,
    setIsExporting,
    filterSummary
}: EnhancedExportProps) {
    const [showModal, setShowModal] = useState(false);
    const [exportOptions, setExportOptions] = useState<ExportOptions>({
        format: 'json',
        includeAIResponses: true,
        includeUserInfo: true,
        includeMetadata: true,
        includeTimestamps: true
    });

    const handleExport = async () => {
        if (filteredChats.length === 0) {
            alert('No chats to export. Please adjust your filters.');
            return;
        }

        // Show confirmation alert with export details
        const aiResponseText = exportOptions.includeAIResponses ? 'including' : 'excluding';
        const confirmExport = window.confirm(
            `Enhanced Export Confirmation:\n\n` +
            `• Format: ${exportOptions.format.toUpperCase()}\n` +
            `• Chats: ${filteredChats.length} conversation${filteredChats.length !== 1 ? 's' : ''}\n` +
            `• AI Responses: ${aiResponseText} AI responses\n` +
            `• User Info: ${exportOptions.includeUserInfo ? 'included' : 'excluded'}\n` +
            `• Metadata: ${exportOptions.includeMetadata ? 'included' : 'excluded'}\n` +
            `• Timestamps: ${exportOptions.includeTimestamps ? 'included' : 'excluded'}\n\n` +
            `Active Filters: ${getActiveFiltersText()}\n\n` +
            `Proceed with export?`
        );

        if (!confirmExport) {
            return;
        }

        setIsExporting(true);
        setShowModal(false);

        try {
            const exportData = filteredChats.map(chat => {
                // Filter messages based on AI response option
                let messages = chat.messages;
                if (!exportOptions.includeAIResponses) {
                    messages = messages.filter(msg => msg.role === 'user');
                }

                // Build the chat data object
                const chatData: any = {
                    id: chat._id,
                    title: chat.title,
                    messageCount: messages.length,
                    totalMessageCount: chat.messages.length
                };

                // Add timestamps if requested
                if (exportOptions.includeTimestamps) {
                    chatData.createdAt = format(chat.createdAt, 'yyyy-MM-dd HH:mm:ss');
                    chatData.updatedAt = format(chat.updatedAt, 'yyyy-MM-dd HH:mm:ss');
                }

                // Add user info if requested
                if (exportOptions.includeUserInfo) {
                    chatData.user = {
                        name: `${chat.user.firstName} ${chat.user.lastName}`,
                        email: chat.user.email,
                        type: chat.user.clerkId.startsWith('guest_') ? 'Guest' : 'Registered',
                        clerkId: chat.user.clerkId
                    };
                }

                // Add metadata if requested
                if (exportOptions.includeMetadata) {
                    chatData.detectedLanguage = chat.detectedLanguage;
                    chatData.location = chat.location ? {
                        country: chat.location.country,
                        city: chat.location.city,
                        region: chat.location.region,
                        source: chat.location.source
                    } : null;
                    chatData.source = chat.user.clerkId.startsWith('guest_') ? 'Widget' : 'Website';
                    chatData.analytics = chat.analytics;
                }

                // Add messages
                chatData.messages = messages.map(msg => {
                    const messageData: any = {
                        role: msg.role,
                        content: stripHtmlTags(msg.content)
                    };

                    if (exportOptions.includeTimestamps) {
                        messageData.timestamp = format(msg.timestamp, 'yyyy-MM-dd HH:mm:ss');
                    }

                    return messageData;
                });

                return chatData;
            });

            // Add export metadata
            const exportMetadata = {
                exportedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
                totalChats: exportData.length,
                exportOptions: exportOptions,
                appliedFilters: filterSummary,
                aiResponsesIncluded: exportOptions.includeAIResponses,
                generatedBy: 'AHGPT Enhanced Export'
            };

            const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
            let content: string;
            let filename: string;
            let mimeType: string;

            if (exportOptions.format === 'json') {
                const fullExportData = {
                    metadata: exportMetadata,
                    chats: exportData
                };
                content = JSON.stringify(fullExportData, null, 2);
                filename = `enhanced_chats_export_${timestamp}.json`;
                mimeType = 'application/json';
            } else {
                // Text format
                let textContent = `AHGPT Enhanced Chat Export\n`;
                textContent += `Generated: ${exportMetadata.exportedAt}\n`;
                textContent += `Total Chats: ${exportMetadata.totalChats}\n`;
                textContent += `AI Responses: ${exportOptions.includeAIResponses ? 'Included' : 'Excluded'}\n`;
                textContent += `Active Filters: ${getActiveFiltersText()}\n`;
                textContent += `${'='.repeat(80)}\n\n`;

                textContent += exportData.map(chat => {
                    let chatText = `Chat: ${chat.title}\n`;
                    chatText += `ID: ${chat.id}\n`;

                    if (exportOptions.includeTimestamps) {
                        chatText += `Created: ${chat.createdAt}\n`;
                        chatText += `Updated: ${chat.updatedAt}\n`;
                    }

                    if (exportOptions.includeUserInfo) {
                        chatText += `User: ${chat.user.name} (${chat.user.type})\n`;
                        chatText += `Email: ${chat.user.email}\n`;
                    }

                    if (exportOptions.includeMetadata) {
                        chatText += `Language: ${chat.detectedLanguage || 'Unknown'}\n`;
                        chatText += `Location: ${chat.location?.country || 'Unknown'} ${chat.location?.city ? `(${chat.location.city})` : ''}\n`;
                        chatText += `Source: ${chat.source}\n`;
                    }

                    chatText += `Messages: ${chat.messageCount}${!exportOptions.includeAIResponses ? ` (User only, Total: ${chat.totalMessageCount})` : ''}\n\n`;

                    chatText += `Messages:\n`;
                    chatText += chat.messages.map((msg: any) => {
                        let msgText = `[${exportOptions.includeTimestamps ? msg.timestamp : 'No timestamp'}] ${msg.role.toUpperCase()}: ${msg.content}`;
                        return msgText;
                    }).join('\n');

                    chatText += `\n\n${'='.repeat(80)}`;
                    return chatText;
                }).join('\n\n');

                content = textContent;
                filename = `enhanced_chats_export_${timestamp}.txt`;
                mimeType = 'text/plain';
            }

            // Download the file
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
            const aiText = exportOptions.includeAIResponses ? 'with AI responses' : 'user messages only';
            alert(
                `✅ Enhanced Export Successful!\n\n` +
                `File: ${filename}\n` +
                `Chats: ${exportData.length}\n` +
                `Content: ${aiText}\n` +
                `Format: ${exportOptions.format.toUpperCase()}\n\n` +
                `The file has been downloaded to your default downloads folder.`
            );

            // Track the export event
            trackChatEvent('ENHANCED_EXPORT', `${exportData.length} chats exported as ${exportOptions.format} (AI: ${exportOptions.includeAIResponses})`);
        } catch (error) {
            console.error('Error in enhanced export:', error);
            alert(`❌ Enhanced Export Failed!\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsExporting(false);
        }
    };

    const getActiveFiltersText = (): string => {
        const filters = [];
        if (filterSummary.userTypeFilter !== 'all') filters.push(`User: ${filterSummary.userTypeFilter}`);
        if (filterSummary.sourceFilter !== 'all') filters.push(`Source: ${filterSummary.sourceFilter}`);
        if (filterSummary.languageFilter !== 'all') filters.push(`Language: ${filterSummary.languageFilter}`);
        if (filterSummary.locationFilter !== 'all') filters.push(`Location: ${filterSummary.locationFilter}`);
        if (filterSummary.selectedDateRange !== 'all') filters.push(`Date: ${filterSummary.selectedDateRange}`);
        if (filterSummary.searchQuery) filters.push(`Search: "${filterSummary.searchQuery}"`);
        return filters.length > 0 ? filters.join(', ') : 'None';
    };

    const getEstimatedFileSize = (): string => {
        if (filteredChats.length === 0) return '0 KB';

        // Rough estimation based on average message length and options
        let avgMessagesPerChat = 0;
        let avgMessageLength = 0;

        filteredChats.slice(0, 10).forEach(chat => {
            const messages = exportOptions.includeAIResponses ? chat.messages : chat.messages.filter(m => m.role === 'user');
            avgMessagesPerChat += messages.length;
            messages.forEach(msg => {
                avgMessageLength += stripHtmlTags(msg.content).length;
            });
        });

        avgMessagesPerChat = avgMessagesPerChat / Math.min(10, filteredChats.length);
        avgMessageLength = avgMessageLength / Math.max(1, avgMessagesPerChat * Math.min(10, filteredChats.length));

        const estimatedBytes = filteredChats.length * avgMessagesPerChat * avgMessageLength * 1.5; // 1.5x for JSON overhead

        if (estimatedBytes < 1024) return `${Math.round(estimatedBytes)} B`;
        if (estimatedBytes < 1024 * 1024) return `${Math.round(estimatedBytes / 1024)} KB`;
        return `${Math.round(estimatedBytes / (1024 * 1024))} MB`;
    };

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                disabled={isExporting || filteredChats.length === 0}
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                title="Enhanced export with advanced options"
            >
                <CogIcon className="h-4 w-4" />
                {isExporting ? 'Exporting...' : 'Enhanced Export'}
            </button>

            {/* Enhanced Export Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <CogIcon className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">Enhanced Export</h3>
                                        <p className="text-sm text-gray-500">Advanced export options for filtered data</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <XMarkIcon className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Export Summary */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <h4 className="font-medium text-blue-900 mb-2">Export Summary</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-blue-700">Filtered Chats:</span>
                                        <span className="ml-2 font-medium">{filteredChats.length}</span>
                                    </div>
                                    <div>
                                        <span className="text-blue-700">Estimated Size:</span>
                                        <span className="ml-2 font-medium">{getEstimatedFileSize()}</span>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-blue-700">Active Filters:</span>
                                        <span className="ml-2 font-medium">{getActiveFiltersText()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Export Options */}
                            <div className="space-y-6">
                                {/* Format Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">Export Format</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setExportOptions(prev => ({ ...prev, format: 'json' }))}
                                            className={`p-3 border rounded-lg text-left transition-colors ${exportOptions.format === 'json'
                                                ? 'border-purple-500 bg-purple-50 text-purple-700'
                                                : 'border-gray-300 hover:border-gray-400'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <CheckIcon className={`h-4 w-4 ${exportOptions.format === 'json' ? 'text-purple-600' : 'text-transparent'}`} />
                                                <span className="font-medium">JSON</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">Structured data, smaller file size</p>
                                        </button>
                                        <button
                                            onClick={() => setExportOptions(prev => ({ ...prev, format: 'text' }))}
                                            className={`p-3 border rounded-lg text-left transition-colors ${exportOptions.format === 'text'
                                                ? 'border-purple-500 bg-purple-50 text-purple-700'
                                                : 'border-gray-300 hover:border-gray-400'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <CheckIcon className={`h-4 w-4 ${exportOptions.format === 'text' ? 'text-purple-600' : 'text-transparent'}`} />
                                                <span className="font-medium">Text</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">Human-readable format</p>
                                        </button>
                                    </div>
                                </div>

                                {/* Content Options */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">Content Options</label>
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                checked={exportOptions.includeAIResponses}
                                                onChange={(e) => setExportOptions(prev => ({ ...prev, includeAIResponses: e.target.checked }))}
                                                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                            />
                                            <div>
                                                <span className="text-sm font-medium text-gray-700">Include AI Responses</span>
                                                <p className="text-xs text-gray-500">Include assistant messages in export (uncheck for smaller files)</p>
                                            </div>
                                        </label>
                                        <label className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                checked={exportOptions.includeUserInfo}
                                                onChange={(e) => setExportOptions(prev => ({ ...prev, includeUserInfo: e.target.checked }))}
                                                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                            />
                                            <div>
                                                <span className="text-sm font-medium text-gray-700">Include User Information</span>
                                                <p className="text-xs text-gray-500">Names, emails, and user types</p>
                                            </div>
                                        </label>
                                        <label className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                checked={exportOptions.includeMetadata}
                                                onChange={(e) => setExportOptions(prev => ({ ...prev, includeMetadata: e.target.checked }))}
                                                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                            />
                                            <div>
                                                <span className="text-sm font-medium text-gray-700">Include Metadata</span>
                                                <p className="text-xs text-gray-500">Languages, locations, sources, and analytics</p>
                                            </div>
                                        </label>
                                        <label className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                checked={exportOptions.includeTimestamps}
                                                onChange={(e) => setExportOptions(prev => ({ ...prev, includeTimestamps: e.target.checked }))}
                                                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                            />
                                            <div>
                                                <span className="text-sm font-medium text-gray-700">Include Timestamps</span>
                                                <p className="text-xs text-gray-500">Creation dates and message timestamps</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {/* Warning for excluding AI responses */}
                                {!exportOptions.includeAIResponses && (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <div className="flex items-start gap-3">
                                            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
                                            <div>
                                                <h4 className="text-sm font-medium text-yellow-800">AI Responses Excluded</h4>
                                                <p className="text-sm text-yellow-700 mt-1">
                                                    Only user messages will be exported. This will significantly reduce file size but may make conversations incomplete.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 mt-8">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleExport}
                                    disabled={filteredChats.length === 0}
                                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <DocumentArrowDownIcon className="h-4 w-4" />
                                    Export {filteredChats.length} Chat{filteredChats.length !== 1 ? 's' : ''}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
} 