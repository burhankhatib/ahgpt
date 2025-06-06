import type { Metadata } from "next";
import "../globals.css";
import { ClerkProvider } from "@clerk/nextjs";
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

                {/* Add custom CSS for widget-specific styling */}
                <style dangerouslySetInnerHTML={{
                    __html: `
            /* Widget-specific enhancements */
            body {
              margin: 0;
              padding: 0;
              overflow-x: hidden;
            }
            
            /* Enhanced widget container */
            .widget-container {
              min-height: 100vh;
              width: 100%;
              background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
              position: relative;
            }
            
            /* Improved scrollbar styling for widget */
            .widget-scrollbar::-webkit-scrollbar {
              width: 6px;
            }
            
            .widget-scrollbar::-webkit-scrollbar-track {
              background: rgba(0, 0, 0, 0.05);
              border-radius: 3px;
            }
            
            .widget-scrollbar::-webkit-scrollbar-thumb {
              background: rgba(0, 0, 0, 0.2);
              border-radius: 3px;
            }
            
            .widget-scrollbar::-webkit-scrollbar-thumb:hover {
              background: rgba(0, 0, 0, 0.3);
            }
            
            /* Enhanced chat bubbles for widget */
            .chat-bubble-user {
              background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
              box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            }
            
            .chat-bubble-assistant {
              background: white;
              border: 1px solid #e5e7eb;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }
            
            /* Enhanced button styling */
            .widget-button {
              background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
              border: none;
              border-radius: 12px;
              padding: 12px 24px;
              color: white;
              font-weight: 600;
              font-size: 14px;
              cursor: pointer;
              transition: all 0.2s ease;
              box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
            }
            
            .widget-button:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
            }
            
            .widget-button:active {
              transform: translateY(0);
            }
            
            /* Enhanced input styling */
            .widget-input {
              border: 2px solid #e5e7eb;
              border-radius: 16px;
              padding: 16px 20px;
              font-size: 16px;
              transition: all 0.2s ease;
              background: white;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            }
            
            .widget-input:focus {
              outline: none;
              border-color: #3b82f6;
              box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1), 0 4px 12px rgba(0, 0, 0, 0.1);
            }
            
            /* Enhanced animation for widget */
            .widget-fade-in {
              animation: widgetFadeIn 0.5s ease-out;
            }
            
            @keyframes widgetFadeIn {
              from {
                opacity: 0;
                transform: translateY(20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            
            /* Widget-specific typography */
            .widget-text {
              line-height: 1.6;
              color: #374151;
            }
            
            .widget-heading {
              color: #1f2937;
              font-weight: 700;
              letter-spacing: -0.025em;
            }
            
            /* Enhanced loading states */
            .widget-loading {
              display: inline-block;
              width: 20px;
              height: 20px;
              border: 3px solid #f3f4f6;
              border-radius: 50%;
              border-top-color: #3b82f6;
              animation: spin 1s ease-in-out infinite;
            }
            
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
            
            /* Widget notification styling */
            .widget-notification {
              background: white;
              border: 1px solid #e5e7eb;
              border-radius: 12px;
              padding: 16px;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
              margin: 16px 0;
            }
            
            /* Widget success state */
            .widget-success {
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              color: white;
            }
            
            /* Widget error state */
            .widget-error {
              background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
              color: white;
            }
            
            /* Widget responsive design */
            @media (max-width: 768px) {
              .widget-container {
                padding: 8px;
              }
              
              .widget-button {
                padding: 10px 20px;
                font-size: 13px;
              }
              
              .widget-input {
                padding: 14px 16px;
                font-size: 15px;
              }
            }
            
            /* Enhanced table styling for widget */
            .widget-table {
              width: 100%;
              border-collapse: collapse;
              background: white;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
              margin: 16px 0;
            }
            
            .widget-table th {
              background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
              padding: 16px 20px;
              text-align: left;
              font-weight: 600;
              color: #374151;
              border-bottom: 2px solid #e5e7eb;
            }
            
            .widget-table td {
              padding: 16px 20px;
              border-bottom: 1px solid #f3f4f6;
              color: #4b5563;
            }
            
            .widget-table tr:hover {
              background: rgba(59, 130, 246, 0.05);
            }
            
            /* Widget badge styling */
            .widget-badge {
              display: inline-flex;
              align-items: center;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .widget-badge-success {
              background: #d1fae5;
              color: #065f46;
            }
            
            .widget-badge-info {
              background: #dbeafe;
              color: #1e40af;
            }
            
            .widget-badge-warning {
              background: #fef3c7;
              color: #92400e;
            }
            
            .widget-badge-error {
              background: #fee2e2;
              color: #991b1b;
            }
            
            /* Revert to fixed height container */
            .widget-chat-container {
              height: 100vh;
              overflow: hidden; /* This is crucial to prevent the parent page from scrolling */
              display: flex;
              flex-direction: column;
              background: #f9fafb; /* A simple, clean background */
            }
            
            /* Make the message area the only scrollable part */
            .widget-messages-container {
                flex: 1 1 auto; /* Allow this area to grow and shrink */
                overflow-y: auto; /* Enable vertical scrollbar only when needed */
                -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
            }
            
            /* Widget header styling */
            .widget-header {
              background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
              color: white;
              padding: 16px 20px;
              border-radius: 0;
              box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
            }
            
                         /* Widget footer styling */
             .widget-footer {
               background: white;
               border-top: 1px solid #e5e7eb;
               padding: 16px 20px;
               box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
             }
             
             /* Import all main website styles for consistency */
             .widget-assistant-content {
               line-height: 1.6;
               color: #374151;
             }
             
             .widget-assistant-content h1,
             .widget-assistant-content h2,
             .widget-assistant-content h3,
             .widget-assistant-content h4,
             .widget-assistant-content h5,
             .widget-assistant-content h6 {
               color: #1f2937;
               font-weight: 600;
               margin: 16px 0 8px 0;
             }
             
             .widget-assistant-content p {
               margin: 8px 0;
               line-height: 1.6;
             }
             
             .widget-assistant-content ul,
             .widget-assistant-content ol {
               margin: 8px 0;
               padding-left: 20px;
             }
             
             .widget-assistant-content li {
               margin: 4px 0;
               line-height: 1.5;
             }
             
             .widget-assistant-content blockquote {
               border-left: 4px solid #3b82f6;
               padding-left: 16px;
               margin: 16px 0;
               font-style: italic;
               color: #6b7280;
             }
             
             .widget-assistant-content code {
               background: #f3f4f6;
               padding: 2px 6px;
               border-radius: 4px;
               font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
               font-size: 0.9em;
               color: #1f2937;
             }
             
             .widget-assistant-content pre {
               background: #1f2937;
               color: #f9fafb;
               padding: 16px;
               border-radius: 8px;
               overflow-x: auto;
               margin: 16px 0;
               font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
               font-size: 0.9em;
               line-height: 1.4;
             }
             
             .widget-assistant-content pre code {
               background: transparent;
               padding: 0;
               color: inherit;
             }
             
             .widget-assistant-content a {
               color: #3b82f6;
               text-decoration: underline;
               transition: color 0.2s ease;
             }
             
             .widget-assistant-content a:hover {
               color: #2563eb;
             }
             
             .widget-assistant-content strong {
               font-weight: 600;
               color: #1f2937;
             }
             
             .widget-assistant-content em {
               font-style: italic;
               color: #4b5563;
             }
             
             /* Remove problematic animations that cause blinking */
             
             /* Widget loading animation */
             .widget-typing {
               display: inline-flex;
               align-items: center;
               gap: 4px;
             }
             
             .widget-typing span {
               width: 6px;
               height: 6px;
               border-radius: 50%;
               background: #9ca3af;
               animation: widgetTyping 1.4s infinite ease-in-out;
             }
             
             .widget-typing span:nth-child(1) {
               animation-delay: -0.32s;
             }
             
             .widget-typing span:nth-child(2) {
               animation-delay: -0.16s;
             }
             
             @keyframes widgetTyping {
               0%, 80%, 100% {
                 transform: scale(0.8);
                 opacity: 0.5;
               }
               40% {
                 transform: scale(1);
                 opacity: 1;
               }
             }
             
             /* Widget focus states */
             .widget-input:focus-within {
               transform: translateY(-1px);
               box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1), 0 8px 25px rgba(0, 0, 0, 0.15);
             }
             
             /* Widget hover effects */
             .widget-message-hover:hover {
               transform: translateY(-1px);
               box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
             }
             
             /* Widget responsive improvements */
             @media (max-width: 480px) {
               .widget-chat-container {
                 padding: 4px;
               }
               
               .widget-footer {
                 padding: 12px 16px;
               }
               
               .widget-input {
                 padding: 12px 16px;
                 font-size: 14px;
               }
               
               .widget-button {
                 padding: 8px 16px;
                 font-size: 12px;
               }
             }
             
             /* Enhanced responsive breakpoint classes */
             .widget-breakpoint-mobile {
               height: calc(100vh - 20px) !important;
               max-height: 98vh !important;
             }
             
             .widget-breakpoint-tablet {
               height: calc(100vh - 30px) !important;
               max-height: 98vh !important;
             }
             
             .widget-breakpoint-desktop {
               height: calc(100vh - 40px) !important;
               max-height: 98vh !important;
             }
             
             /* Embedded widget adjustments */
             .widget-embedded {
               border-radius: 12px;
               box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
               overflow: hidden;
             }
             
             .widget-embedded .widget-chat-container {
               border-radius: 12px;
             }
             
             /* Auto-height container optimization */
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
             
             /* Simple text rendering without streaming effects */
             .widget-assistant-content {
               overflow-wrap: break-word;
               word-wrap: break-word;
             }
          `
                }} />
            </head>
            <body className="h-full bg-gray-50">
                <ClerkProvider
                    publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
                    appearance={{
                        elements: {
                            formButtonPrimary: "widget-button",
                            card: "widget-notification",
                            headerTitle: "widget-heading",
                            headerSubtitle: "widget-text",
                            socialButtonsBlockButton: "widget-button",
                            formFieldInput: "widget-input",
                        },
                    }}
                    // Prevent authentication redirects by making URLs empty
                    signInUrl=""
                    signUpUrl=""
                >
                    <div className="widget-container">
                        {children}
                    </div>
                    <Analytics />
                </ClerkProvider>
            </body>
        </html>
    );
} 