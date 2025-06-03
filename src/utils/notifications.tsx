"use client";

import React from 'react';
import { toast } from 'react-hot-toast';
import { trackChatEvent } from './analytics';

export interface NotificationOptions {
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
}

export function showNotification({ title, message, type, duration = 4000 }: NotificationOptions) {
    const notificationContent = (
        <div className="flex flex-col">
            <div className="font-semibold text-sm">{title}</div>
            <div className="text-sm opacity-90">{message}</div>
        </div>
    );

    switch (type) {
        case 'success':
            toast.success(notificationContent, { duration });
            break;
        case 'error':
            toast.error(notificationContent, { duration });
            break;
        case 'warning':
            toast(notificationContent, {
                duration,
                icon: '⚠️',
                style: {
                    background: '#fef3c7',
                    color: '#92400e',
                    border: '1px solid #fbbf24'
                }
            });
            break;
        case 'info':
            toast(notificationContent, {
                duration,
                icon: 'ℹ️',
                style: {
                    background: '#dbeafe',
                    color: '#1e40af',
                    border: '1px solid #60a5fa'
                }
            });
            break;
    }
}

// Chat-specific notifications
export function notifyChatSaved(chatId: string) {
    showNotification({
        title: 'Chat Saved',
        message: 'Your conversation has been saved successfully',
        type: 'success'
    });
    trackChatEvent('SEND_MESSAGE', `Chat saved: ${chatId}`);
}

export function notifyChatDeleted(chatTitle: string) {
    showNotification({
        title: 'Chat Deleted',
        message: `"${chatTitle}" has been deleted`,
        type: 'info'
    });
    trackChatEvent('DELETE_CHAT', `Chat deleted: ${chatTitle}`);
}

export function notifyAllChatsDeleted(count: number) {
    showNotification({
        title: 'All Chats Deleted',
        message: `Successfully deleted ${count} chat${count !== 1 ? 's' : ''}`,
        type: 'info'
    });
    trackChatEvent('DELETE_CHAT', `All chats deleted: ${count}`);
}

export function notifyChatError(error: string) {
    showNotification({
        title: 'Chat Error',
        message: error,
        type: 'error'
    });
    trackChatEvent('SEND_MESSAGE', `Error: ${error}`);
} 