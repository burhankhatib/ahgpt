import { useEffect, useRef } from 'react';

export default function useAlHayatGPTWidget(options) {
    const widgetRef = useRef(null);

    useEffect(() => {
        // Load the widget SDK
        const script = document.createElement('script');
        script.src = 'https://www.alhayatgpt.com/widget-sdk.min.js';
        script.async = true;
        document.body.appendChild(script);

        // Initialize the widget when the SDK is ready
        script.onload = () => {
            window.addEventListener('AlHayatGPTSDKReady', () => {
                widgetRef.current = window.AlHayatGPT.createWidget({
                    containerId: "chat-widget-container",
                    ...options
                });
            });
        };

        // Clean up
        return () => {
            if (widgetRef.current) {
                widgetRef.current.destroy();
            }
            document.body.removeChild(script);
        };
    }, [options]);

    return widgetRef.current;
} 