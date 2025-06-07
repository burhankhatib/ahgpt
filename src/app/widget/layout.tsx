import type { Metadata } from "next";
import "../globals.css";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
    title: "Al Hayat GPT Widget",
    description: "Advanced Christian AI chatbot widget for your website",
    robots: "noindex, nofollow", // Prevent indexing of widget pages
};

export default function WidgetLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="h-full">
            <head>
                {/* Ensure proper responsive design */}
                <meta name="viewport" content="width=device-width, initial-scale=1" />

                {/* Load external CSS from main website for centralized styling control */}
                <link rel="stylesheet" href="https://www.alhayatgpt.com/api/globals.css" />

                {/* Minimal widget-specific CSS - only for layout and iframe compatibility */}
                <style dangerouslySetInnerHTML={{
                    __html: `
            /* Essential widget container layout */
            html, body {
              margin: 0;
              padding: 0;
              height: 100%;
              overflow-x: hidden;
            }
            
            /* Widget container - essential for iframe and standalone usage */
            .widget-container {
              height: 100%;
              min-height: 100vh;
              width: 100%;
              position: relative;
            }
            
            /* Chat container optimized for widget usage */
            .widget-chat-container {
              height: 100%;
              min-height: 100vh;
              overflow: hidden;
              display: flex;
              flex-direction: column;
            }
            
            /* Scrollable messages area */
            .widget-messages-container {
                flex: 1 1 auto;
                overflow-y: auto;
                -webkit-overflow-scrolling: touch;
            }
            
            /* Auto-height container optimization for embedded usage */
            .widget-container[data-auto-height="true"] {
              display: flex;
              flex-direction: column;
              overflow: hidden;
            }
            
            .widget-container[data-auto-height="true"] .widget-chat-container {
              flex: 1;
              min-height: 0;
              overflow: hidden;
            }
            
            /* Embedded widget styling */
            .widget-embedded {
              border-radius: 12px;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
              overflow: hidden;
            }
            
            .widget-embedded .widget-chat-container {
              border-radius: 12px;
            }
          `
                }} />
            </head>
            <body className="h-full bg-gray-50">
                <div className="widget-container">
                    {children}
                </div>
                <Analytics />
            </body>
        </html>
    );
} 