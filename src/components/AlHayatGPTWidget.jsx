'use client';

import useAlHayatGPTWidget from '../hooks/useAlHayatGPTWidget';

export default function AlHayatGPTWidget() {
    const widget = useAlHayatGPTWidget({
        clerkPublishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
        theme: "auto",
        onReady: () => {
            console.log("Widget is ready!");
        }
    });

    return <div id="chat-widget-container" />;
} 