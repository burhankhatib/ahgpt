'use client'

import React, { useEffect, useState } from 'react'
import AlHayatGPTWidget from '@/lib/widget-sdk'

export default function Page() {
    const [widgetError, setWidgetError] = useState<string | null>(null);
    const [widgetReady, setWidgetReady] = useState(false);

    useEffect(() => {
        try {
            const widget = new AlHayatGPTWidget({
                containerId: 'chat-widget',
                theme: 'auto',
                width: '100%',
                height: '600px',
                allowGuests: true,
                apiEndpoint: window.location.origin, // Use current domain
                onReady: () => {
                    console.log('Widget is ready!');
                    setWidgetReady(true);
                },
                onError: (error) => {
                    console.error('Widget error:', error);
                    setWidgetError(error.message);
                }
            });

            // Cleanup function
            return () => {
                widget.destroy();
            };
        } catch (error) {
            console.error('Failed to create widget:', error);
            setWidgetError(error instanceof Error ? error.message : 'Failed to initialize widget');
        }
    }, []);

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1>Chat Widget Test</h1>
            <p>Testing the Al Hayat GPT widget integration</p>

            {widgetError && (
                <div style={{
                    color: 'red',
                    backgroundColor: '#ffebee',
                    padding: '10px',
                    borderRadius: '4px',
                    marginBottom: '20px'
                }}>
                    Error: {widgetError}
                </div>
            )}

            {!widgetReady && !widgetError && (
                <div style={{
                    color: '#666',
                    padding: '10px',
                    marginBottom: '20px'
                }}>
                    Loading widget...
                </div>
            )}

            <div
                id="chat-widget"
                style={{
                    width: '100%',
                    height: '600px',
                    border: '1px solid #ddd',
                    borderRadius: '12px',
                    backgroundColor: '#f5f5f5'
                }}
            ></div>
        </div>
    )
}
