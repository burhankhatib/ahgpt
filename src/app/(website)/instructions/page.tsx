"use client";
import React, { useState } from 'react';
import { CheckIcon, DocumentDuplicateIcon, CodeBracketIcon, GlobeAltIcon, Cog6ToothIcon, CommandLineIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { FaWordpress, FaReact, FaHtml5, FaAngular } from "react-icons/fa";


interface CodeBlockProps {
    code: string;
    language: string;
    filename?: string;
}

function CodeBlock({ code, language, filename }: CodeBlockProps) {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    return (
        <div className="relative bg-gray-900 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg" dir="ltr">
            {filename && (
                <div className="bg-gray-800 px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-300 border-b border-gray-700 overflow-x-auto">
                    {filename}
                </div>
            )}
            <div className="relative">
                <pre className="p-3 sm:p-4 lg:p-6 text-xs sm:text-sm text-gray-100 overflow-x-auto">
                    <code className={`language-${language}`}>{code}</code>
                </pre>
                <button
                    onClick={copyToClipboard}
                    className="absolute top-2 sm:top-4 right-2 sm:right-4 p-1.5 sm:p-2 bg-gray-800 hover:bg-gray-700 rounded-md sm:rounded-lg transition-colors"
                    title="Copy to clipboard"
                >
                    {copied ? (
                        <CheckIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-400" />
                    ) : (
                        <DocumentDuplicateIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
                    )}
                </button>
            </div>
        </div>
    );
}

function PlatformCard({ icon, title, description, children }: {
    icon: React.ReactNode;
    title: string;
    description: string;
    children: React.ReactNode;
}) {
    return (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                    {icon}
                </div>
                <div>
                    <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
                    <p className="text-gray-600">{description}</p>
                </div>
            </div>
            {children}
        </div>
    );
}

function Step({ number, title, children }: {
    number: number;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold flex-shrink-0">
                {number}
            </div>
            <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">{title}</h4>
                {children}
            </div>
        </div>
    );
}

export default function InstructionsPage() {
    const [activeTab, setActiveTab] = useState('wordpress');

    const platforms = [
        { id: 'wordpress', name: 'WordPress', icon: <FaWordpress className="h-5 w-5" /> },
        { id: 'react', name: 'React/Next.js', icon: <FaReact className="h-5 w-5" /> },
        { id: 'html', name: 'HTML/Static', icon: <FaHtml5 className="h-5 w-5" /> },
        { id: 'angular', name: 'Angular', icon: <FaAngular className="h-5 w-5" /> },
    ];

    return (
        <div className="min-h-screen bg-gray-50" dir="ltr" lang="en">
            <style jsx>{`
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                @media (max-width: 475px) {
                    .xs\\:inline {
                        display: inline;
                    }
                }
            `}</style>
            {/* Back Button */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                    <Link
                        href="/"
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Home
                    </Link>
                </div>
            </div>

            {/* Header */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
                    <div className="text-center" dir="ltr">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                            Add Al Hayat GPT to Your Website
                        </h1>
                        <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
                            Integrate our powerful Christian AI chatbot into your website with just a few lines of code.
                            <strong>Works instantly in guest mode</strong> - no authentication required for your visitors.
                        </p>

                        {/* Migration Notice */}
                        <div className="mt-8 max-w-4xl mx-auto">
                            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                        <span className="text-white text-sm font-bold">!</span>
                                    </div>
                                    <div className="text-left">
                                        <h3 className="text-lg font-semibold text-blue-900 mb-2">
                                            🚀 Guest-Only Widget - Zero Authentication Required
                                        </h3>
                                        <p className="text-blue-800 mb-3">
                                            <strong>New approach:</strong> The widget now operates in guest-only mode for external websites.
                                            No login prompts, no 404 errors, no popup blockers - just seamless integration that works instantly.
                                        </p>
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <Link
                                                href="/MIGRATION_GUIDE.md"
                                                target="_blank"
                                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                            >
                                                <DocumentDuplicateIcon className="w-4 h-4 mr-2" />
                                                View Migration Guide
                                            </Link>
                                            <div className="text-xs text-blue-700 flex items-center">
                                                ✅ Guest-only mode &nbsp;•&nbsp; ✅ No authentication &nbsp;•&nbsp; ✅ Works instantly
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Start */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16" dir="ltr">
                <div className="text-center mb-8 sm:mb-16">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Quick Start</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto px-4">
                        Choose your platform below and follow the simple integration steps.
                        <strong>Works in guest mode</strong> - no login required for your visitors.
                    </p>
                </div>

                {/* Key Changes Summary */}
                <div className="mb-12 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">🆕 What&apos;s New in v2.0.0-Optimized</h3>
                        <p className="text-gray-600">Major improvements for better performance and user experience</p>
                    </div>
                    <div className="p-6">
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    <span className="text-2xl">🚀</span>
                                </div>
                                <h4 className="font-semibold text-gray-900 mb-2">47% Smaller</h4>
                                <p className="text-sm text-gray-600">Bundle size reduced from 38KB to 20KB for faster loading</p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    <span className="text-2xl">🔒</span>
                                </div>
                                <h4 className="font-semibold text-gray-900 mb-2">Guest Mode Only</h4>
                                <p className="text-sm text-gray-600">No authentication required - seamless guest experience</p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    <span className="text-2xl">🛡️</span>
                                </div>
                                <h4 className="font-semibold text-gray-900 mb-2">Enhanced Security</h4>
                                <p className="text-sm text-gray-600">CSP compliance and cryptographic nonce validation</p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    <span className="text-2xl">🔄</span>
                                </div>
                                <h4 className="font-semibold text-gray-900 mb-2">Auto Retry</h4>
                                <p className="text-sm text-gray-600">Automatic retry mechanism with exponential backoff</p>
                            </div>
                        </div>
                        <div className="mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                            <h5 className="font-semibold text-yellow-800 mb-2">⚠️ Breaking Changes for Existing Users</h5>
                            <ul className="text-sm text-yellow-700 space-y-1">
                                <li>• <strong>Remove</strong> <code className="bg-white px-1 py-0.5 rounded">usePopupAuth: true</code> configuration</li>
                                <li>• <strong>Remove</strong> <code className="bg-white px-1 py-0.5 rounded">clerkPublishableKey</code> (widgets are guest-only now)</li>
                                <li>• <strong>Replace</strong> <code className="bg-white px-1 py-0.5 rounded">fallbackToGuest</code> with <code className="bg-white px-1 py-0.5 rounded">allowGuests</code></li>
                                <li>• <strong>Update</strong> error handling to use new error codes</li>
                                <li>• <strong>See migration guide</strong> for complete upgrade instructions</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Guest-Only Benefits */}
                <div className="mb-12 bg-gradient-to-r from-green-50 to-blue-50 rounded-3xl p-8 border border-green-100">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">🎯</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Perfect for External Websites</h3>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Our widget is specifically designed for seamless integration on external websites.
                            Your visitors get instant access without any authentication barriers.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-xl p-6 text-center">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-xl">⚡</span>
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-2">Instant Access</h4>
                            <p className="text-sm text-gray-600">
                                No sign-ups, no logins, no barriers. Visitors can start chatting immediately after the widget loads.
                            </p>
                        </div>

                        <div className="bg-white rounded-xl p-6 text-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-xl">🏠</span>
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-2">Stay on Your Site</h4>
                            <p className="text-sm text-gray-600">
                                Visitors never leave your website. No redirects to external sign-in pages or popup windows.
                            </p>
                        </div>

                        <div className="bg-white rounded-xl p-6 text-center">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-xl">🔧</span>
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-2">Zero Configuration</h4>
                            <p className="text-sm text-gray-600">
                                Just copy, paste, and it works. No API keys, no authentication setup, no complex configuration.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Platform Tabs */}
                <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Tab Navigation */}
                    <div className="border-b border-gray-100" dir="ltr">
                        <div className="flex overflow-x-auto scrollbar-hide">
                            {platforms.map((platform) => (
                                <button
                                    key={platform.id}
                                    onClick={() => setActiveTab(platform.id)}
                                    className={`flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 border-b-2 min-w-max ${activeTab === platform.id
                                        ? 'text-blue-600 border-blue-600 bg-blue-50'
                                        : 'text-gray-600 border-transparent hover:text-gray-900 hover:border-gray-200'
                                        }`}
                                >
                                    <span className="w-4 h-4 sm:w-5 sm:h-5">{platform.icon}</span>
                                    <span className="">{platform.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="p-4 sm:p-6 lg:p-8 text-left">
                        {activeTab === 'wordpress' && (
                            <div>
                                <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                                        <FaWordpress className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900">WordPress Integration</h3>
                                        <p className="text-sm sm:text-base text-gray-600">Guest-only mode - works instantly without authentication</p>
                                    </div>
                                </div>
                                <Step number={1} title="Add to Post/Page">
                                    <p className="text-gray-600 mb-4">
                                        In the WordPress editor, add a Custom HTML block and paste:
                                    </p>
                                    <CodeBlock
                                        language="html"
                                        code={`<!-- Al Hayat GPT Widget for WordPress -->
<div id="ahgpt-widget-wp" style="width: 100%; height: 600px; margin: 20px 0;"></div>

<script src="https://www.alhayatgpt.com/widget-sdk.min.js" async></script>
<script>
function initAlHayatGPTWordPress() {
    if (window.AlHayatGPT) {
        window.AlHayatGPT.createWidget({
            containerId: 'ahgpt-widget-wp',
            height: '600px', // Change height here (e.g., '400px', '800px')
            allowGuests: true,
            autoDetectLanguage: true,
            
            onReady: function() {
                console.log('Al Hayat GPT widget loaded in WordPress');
            },
            
            onLanguageDetected: function(detection) {
                console.log('Language detected:', detection.language, 'Direction:', detection.direction);
                document.getElementById('ahgpt-widget-wp').dir = detection.direction;
            }
        });
    }
}

window.addEventListener('AlHayatGPTSDKReady', initAlHayatGPTWordPress);
setTimeout(initAlHayatGPTWordPress, 100);
</script>`}
                                    />
                                </Step>

                                <Step number={2} title="Add Shortcode to functions.php">
                                    <CodeBlock
                                        language="php"
                                        filename="functions.php"
                                        code={`<?php
// Add Al Hayat GPT Widget Shortcode
function ahgpt_widget_shortcode($atts) {
    $atts = shortcode_atts(array(
        'height' => '600'
    ), $atts);
    
    $container_id = 'ahgpt-widget-' . uniqid();
    
    ob_start();
    ?>
    <div id="<?php echo esc_attr($container_id); ?>" 
         style="width: 100%; height: <?php echo esc_attr($atts['height']); ?>px; margin: 20px 0;"></div>
    
    <script>
    (function() {
        if (!window.AlHayatGPTSDKLoaded) {
            var script = document.createElement('script');
            script.src = 'https://www.alhayatgpt.com/widget-sdk.min.js';
            script.async = true;
            document.head.appendChild(script);
            window.AlHayatGPTSDKLoaded = true;
        }
        
        function initWidget() {
            if (window.AlHayatGPT) {
                window.AlHayatGPT.createWidget({
                    containerId: '<?php echo esc_js($container_id); ?>',
                                height: '<?php echo esc_js($atts['height']); ?>px',
            allowGuests: true,
                    autoDetectLanguage: true,
                    
                    onReady: function() {
                        console.log('Al Hayat GPT widget ready in WordPress');
                    },
                    
                    onLanguageDetected: function(detection) {
                        console.log('Language detected:', detection.language, 'Direction:', detection.direction);
                        document.getElementById('<?php echo esc_js($container_id); ?>').dir = detection.direction;
                    }
                });
            }
        }
        
        if (window.AlHayatGPT) {
            initWidget();
        } else {
            window.addEventListener('AlHayatGPTSDKReady', initWidget);
            setTimeout(initWidget, 200);
        }
    })();
    </script>
    <?php
    return ob_get_clean();
}
add_shortcode('ahgpt_widget', 'ahgpt_widget_shortcode');
?>`}
                                    />
                                </Step>

                                <Step number={3} title="Use in Posts/Pages">
                                    <div className="bg-blue-50 rounded-xl p-4 mb-4">
                                        <h5 className="font-semibold text-blue-900 mb-2">Basic Usage</h5>
                                        <p className="text-sm text-blue-800 mb-2">Add this shortcode to any post or page:</p>
                                        <code className="text-sm bg-white px-2 py-1 rounded">[ahgpt_widget]</code>
                                    </div>

                                    <div className="bg-green-50 rounded-xl p-4">
                                        <h5 className="font-semibold text-green-900 mb-2">Custom Height</h5>
                                        <p className="text-sm text-green-800 mb-2">To change the widget height:</p>
                                        <code className="text-sm bg-white px-2 py-1 rounded">[ahgpt_widget height=&quot;800&quot;]</code>
                                    </div>
                                </Step>


                            </div>
                        )}

                        {activeTab === 'react' && (
                            <div>
                                <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                                        <FaReact className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900">React / Next.js Integration</h3>
                                        <p className="text-sm sm:text-base text-gray-600">Component-based integration</p>
                                    </div>
                                </div>

                                <Step number={1} title="Create Widget Component">
                                    <CodeBlock
                                        language="typescript"
                                        filename="components/AlHayatGPTWidget.tsx"
                                        code={`'use client';

import React, { useEffect, useRef, useId } from 'react';

interface LanguageDetection {
    language: string;
    direction: 'ltr' | 'rtl';
    confidence: number;
}

interface AlHayatGPTConfig {
    containerId: string;
    clerkPublishableKey?: string; // Optional since we support guest-only mode
    height?: string;
    allowGuests?: boolean;
    autoDetectLanguage?: boolean;
    onReady?: () => void;
    onLanguageDetected?: (detection: LanguageDetection) => void;
}

interface AlHayatGPTWidget {
    destroy: () => void;
}

declare global {
    interface Window {
        AlHayatGPT: {
            createWidget: (config: AlHayatGPTConfig) => AlHayatGPTWidget;
        };
        AlHayatGPTSDKLoaded?: boolean;
    }
}

interface Props {
    height?: string;
}

export default function AlHayatGPTWidget({ height = '600px' }: Props): React.ReactElement {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetRef = useRef<AlHayatGPTWidget | null>(null);
    const scriptRef = useRef<HTMLScriptElement | null>(null);
    const initAttemptedRef = useRef(false);

    // Generate unique ID for this widget instance
    const uniqueId = useId();
    const containerId = \`chat-widget-\${uniqueId.replace(/:/g, '')}\`;

    useEffect(() => {
        // Prevent multiple initialization attempts
        if (initAttemptedRef.current) {
            return;
        }
        initAttemptedRef.current = true;

        const initWidget = (): void => {
            // Check if widget already exists to prevent duplicates
            if (widgetRef.current || !containerRef.current) {
                return;
            }

            if (window.AlHayatGPT) {
                try {
                                            widgetRef.current = window.AlHayatGPT.createWidget({
                            containerId: containerId,
                            height: height,
                            allowGuests: true,
                        autoDetectLanguage: true,

                        onReady: () => {
                            console.log('Widget is ready');
                        },

                        onLanguageDetected: (detection: LanguageDetection) => {
                            console.log('Language detected:', detection.language, 'Direction:', detection.direction);
                            if (containerRef.current) {
                                containerRef.current.dir = detection.direction;
                            }
                        }
                    });
                } catch (error) {
                    console.error('Error creating AlHayatGPT widget:', error);
                }
            }
        };

        // Check if SDK is already loaded
        if (window.AlHayatGPTSDKLoaded && window.AlHayatGPT) {
            initWidget();
            return;
        }

        // Check if script is already being loaded or exists
        const existingScript = document.querySelector('script[src="https://www.alhayatgpt.com/widget-sdk.min.js"]');
        if (existingScript) {
            // Script exists, wait for it to load or try initializing if already loaded
            if (window.AlHayatGPT) {
                initWidget();
            } else {
                const handleLoad = () => {
                    window.AlHayatGPTSDKLoaded = true;
                    initWidget();
                    existingScript.removeEventListener('load', handleLoad);
                };
                existingScript.addEventListener('load', handleLoad);
            }
            return;
        }

        // Create and load the script
        const script = document.createElement('script');
        script.src = 'https://www.alhayatgpt.com/widget-sdk.min.js';
        script.async = true;
        scriptRef.current = script;

        const handleScriptLoad = () => {
            window.AlHayatGPTSDKLoaded = true;
            initWidget();
            script.removeEventListener('load', handleScriptLoad);
            script.removeEventListener('error', handleScriptError);
        };

        const handleScriptError = (error: Event) => {
            console.error('Failed to load AlHayatGPT SDK:', error);
            script.removeEventListener('load', handleScriptLoad);
            script.removeEventListener('error', handleScriptError);
        };

        script.addEventListener('load', handleScriptLoad);
        script.addEventListener('error', handleScriptError);

        document.head.appendChild(script);

        // Cleanup function
        return () => {
            initAttemptedRef.current = false;

            // Destroy widget instance
            if (widgetRef.current) {
                try {
                    widgetRef.current.destroy();
                    widgetRef.current = null;
                } catch (error) {
                    console.error('Error destroying widget:', error);
                }
            }

            // Clean up script event listeners
            if (scriptRef.current) {
                scriptRef.current.removeEventListener('load', handleScriptLoad);
                scriptRef.current.removeEventListener('error', handleScriptError);
            }

            // Note: We don't remove the script from DOM as it might be used by other instances
            // The SDK should handle multiple widget instances properly
        };
    }, [height, containerId]);

    return (
        <div className="w-full" dir="auto" style={{ height }}>
            <div id={containerId} ref={containerRef} />
        </div>
    );
}`}
                                    />
                                </Step>

                                <Step number={2} title="Use in Your App">
                                    <CodeBlock
                                        language="typescript"
                                        filename="app/page.tsx or pages/index.tsx"
                                        code={`import AlHayatGPTWidget from '@/components/AlHayatGPTWidget';

export default function HomePage() {
    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8">
                Welcome to Our Website
            </h1>
            
            {/* Basic usage */}
            <AlHayatGPTWidget />
            
            {/* Custom height */}
            <AlHayatGPTWidget height="800px" />
        </div>
    );
}`}
                                    />
                                </Step>
                            </div>
                        )}

                        {activeTab === 'html' && (
                            <div>
                                <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                                        <FaHtml5 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900">HTML / Static Sites Integration</h3>
                                        <p className="text-sm sm:text-base text-gray-600">Pure HTML implementation</p>
                                    </div>
                                </div>
                                <Step number={1} title="Basic Integration">
                                    <CodeBlock
                                        language="html"
                                        filename="index.html"
                                        code={`<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Website with Al Hayat GPT</title>
    <style>
        .ahgpt-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .ahgpt-widget {
            width: 100%;
            height: 600px;
            margin: 20px 0;
            transition: all 0.3s ease;
        }
        
        /* RTL Support Styles */
        .rtl-mode {
            direction: rtl;
        }
        
        .rtl-mode .ahgpt-container {
            text-align: right;
        }
        
        .rtl-mode .ahgpt-widget {
            direction: rtl;
        }
        
        /* Language detection indicator */
        .language-indicator {
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(59, 130, 246, 0.9);
            color: white;
            padding: 5px 10px;
            border-radius: 20px;
            font-size: 12px;
            z-index: 1000;
            transition: all 0.3s ease;
        }
    </style>
</head>
<body>
    <div class="language-indicator" id="langIndicator" style="display: none;">
        Language: <span id="detectedLang">Auto</span> | Direction: <span id="detectedDir">LTR</span>
    </div>
    
    <div class="ahgpt-container">
        <h1>Christian AI Assistant</h1>
        <p>The chat below automatically detects your language and adjusts text direction (RTL/LTR) accordingly.</p>
        
        <!-- Al Hayat GPT Widget -->
        <div id="chat-widget" class="ahgpt-widget"></div>
    </div>

    <script src="https://www.alhayatgpt.com/widget-sdk.min.js" async></script>
    <script>
        function initAlHayatGPT() {
            if (window.AlHayatGPT) {
                window.AlHayatGPT.createWidget({
                    containerId: 'chat-widget',
                    allowGuests: true,
                    theme: 'auto',
                    autoDetectLanguage: true,
                    defaultDirection: 'auto',
                    
                    onReady: function() {
                        console.log('Al Hayat GPT widget ready with language detection');
                        document.getElementById('langIndicator').style.display = 'block';
                    },
                    
                    onUserSignIn: function(user) {
                        console.log('User signed in:', user);
                    },
                    
                    onUserSignOut: function() {
                        console.log('User signed out');
                    },
                    
                    onLanguageDetected: function(detection) {
                        console.log('Language detected:', detection);
                        
                        // Update language indicator
                        document.getElementById('detectedLang').textContent = detection.language.toUpperCase();
                        document.getElementById('detectedDir').textContent = detection.direction.toUpperCase();
                        
                        // Auto-adjust page direction for better integration
                        if (detection.confidence > 0.7) {
                            // Update HTML direction
                            document.documentElement.dir = detection.direction;
                            
                            // Toggle RTL mode class
                            document.body.classList.toggle('rtl-mode', detection.direction === 'rtl');
                            
                            // Update widget container direction
                            document.getElementById('chat-widget').dir = detection.direction;
                        }
                    },
                    
                    onDirectionChange: function(direction) {
                        console.log('Text direction changed to:', direction);
                        document.getElementById('detectedDir').textContent = direction.toUpperCase();
                    },
                    
                    onError: function(error) {
                        console.error('Widget error:', error);
                    }
                });
            }
        }

        // Initialize widget when SDK loads
        window.addEventListener('AlHayatGPTSDKReady', initAlHayatGPT);
        
        // Also try immediate initialization in case SDK is already loaded
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(initAlHayatGPT, 100);
        });
    </script>
</body>
</html>`}
                                    />
                                </Step>

                                <Step number={2} title="Add Widget to HTML">
                                    <CodeBlock
                                        language="html"
                                        filename="index.html"
                                        code={`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Website with Al Hayat GPT</title>
</head>
<body>
    <h1>Christian AI Assistant</h1>
    <p>The chat below automatically detects your language.</p>
    
    <!-- Al Hayat GPT Widget -->
    <div id="chat-widget" style="width: 100%; height: 600px;"></div>

    <script src="https://www.alhayatgpt.com/widget-sdk.min.js" async></script>
    <script>
        function initAlHayatGPT() {
            if (window.AlHayatGPT) {
                window.AlHayatGPT.createWidget({
                    containerId: 'chat-widget',
                    height: '600px', // Change height here (e.g., '400px', '800px')
                    allowGuests: true,
                    autoDetectLanguage: true,
                    
                    onReady: function() {
                        console.log('Widget is ready');
                    },
                    
                    onLanguageDetected: function(detection) {
                        console.log('Language detected:', detection.language, 'Direction:', detection.direction);
                        document.getElementById('chat-widget').dir = detection.direction;
                    }
                });
            }
        }

        window.addEventListener('AlHayatGPTSDKReady', initAlHayatGPT);
        setTimeout(initAlHayatGPT, 100);
    </script>
</body>
</html>`}
                                    />
                                </Step>
                            </div>
                        )}

                        {activeTab === 'angular' && (
                            <div>
                                <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                                        <FaAngular className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Angular Integration</h3>
                                        <p className="text-sm sm:text-base text-gray-600">Angular component integration</p>
                                    </div>
                                </div>
                                <Step number={1} title="Create Widget Component">
                                    <CodeBlock
                                        language="typescript"
                                        filename="ahgpt-widget.component.ts"
                                        code={`import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';

interface LanguageDetection {
  language: string;
  direction: 'ltr' | 'rtl';
  confidence: number;
}

interface AlHayatGPTWidget {
  destroy: () => void;
}

declare global {
  interface Window {
    AlHayatGPT: {
      createWidget: (config: any) => AlHayatGPTWidget;
    };
    AlHayatGPTSDKLoaded?: boolean;
  }
}

@Component({
  selector: 'app-ahgpt-widget',
  template: \`
    <div class="ahgpt-widget-container" [style.height]="height">
      <div #widgetContainer [id]="containerId"></div>
    </div>
  \`,
  styles: [\`
    .ahgpt-widget-container {
      width: 100%;
      position: relative;
    }
  \`]
})
export class AhgptWidgetComponent implements OnInit, OnDestroy {
  @Input() height: string = '600px';

  @ViewChild('widgetContainer') widgetContainer!: ElementRef<HTMLDivElement>;

  containerId: string = 'ahgpt-widget-' + Math.random().toString(36).substr(2, 9);
  
  private widget: AlHayatGPTWidget | null = null;
  private initAttempted: boolean = false;
  private scriptEventHandlers: { [key: string]: () => void } = {};

  ngOnInit() {
    this.loadSDK();
  }

  ngOnDestroy() {
    // Cleanup widget
    if (this.widget) {
      try {
        this.widget.destroy();
        this.widget = null;
      } catch (error) {
        console.error('Error destroying widget:', error);
      }
    }

    // Cleanup event listeners
    Object.keys(this.scriptEventHandlers).forEach(event => {
      window.removeEventListener(event, this.scriptEventHandlers[event]);
    });
    
    this.initAttempted = false;
  }

  private loadSDK() {
    // Prevent multiple initialization attempts
    if (this.initAttempted) {
      return;
    }
    this.initAttempted = true;

    // Check if SDK is already loaded
    if (window.AlHayatGPTSDKLoaded && window.AlHayatGPT) {
      this.initializeWidget();
      return;
    }

    // Check if script is already being loaded or exists
    const existingScript = document.querySelector('script[src="https://www.alhayatgpt.com/widget-sdk.min.js"]');
    if (existingScript) {
      // Script exists, wait for it to load or try initializing if already loaded
      if (window.AlHayatGPT) {
        this.initializeWidget();
      } else {
        const handleLoad = () => {
          window.AlHayatGPTSDKLoaded = true;
          this.initializeWidget();
          existingScript.removeEventListener('load', handleLoad);
        };
        existingScript.addEventListener('load', handleLoad);
      }
      return;
    }

    // Create and load the script
    const script = document.createElement('script');
    script.src = 'https://www.alhayatgpt.com/widget-sdk.min.js';
    script.async = true;
    
    const handleScriptLoad = () => {
      window.AlHayatGPTSDKLoaded = true;
      this.initializeWidget();
      script.removeEventListener('load', handleScriptLoad);
      script.removeEventListener('error', handleScriptError);
    };

    const handleScriptError = (error: Event) => {
      console.error('Failed to load AlHayatGPT SDK:', error);
      script.removeEventListener('load', handleScriptLoad);
      script.removeEventListener('error', handleScriptError);
    };

    script.addEventListener('load', handleScriptLoad);
    script.addEventListener('error', handleScriptError);

    document.head.appendChild(script);

    // Also listen for SDK ready event
    const handleSDKReady = () => {
      this.initializeWidget();
    };
    this.scriptEventHandlers['AlHayatGPTSDKReady'] = handleSDKReady;
    window.addEventListener('AlHayatGPTSDKReady', handleSDKReady);
  }

  private initializeWidget() {
    // Check if widget already exists to prevent duplicates
    if (this.widget || !this.widgetContainer) {
      return;
    }

    if (!window.AlHayatGPT) {
      setTimeout(() => this.initializeWidget(), 100);
      return;
    }

    try {
      this.widget = window.AlHayatGPT.createWidget({
        containerId: this.containerId,
        height: this.height,
        allowGuests: true,
        autoDetectLanguage: true,

        onReady: () => {
          console.log('Al Hayat GPT widget ready in Angular');
        },

        onLanguageDetected: (detection: LanguageDetection) => {
          console.log('Language detected:', detection.language, 'Direction:', detection.direction);
          const container = document.getElementById(this.containerId);
          if (container) {
            container.dir = detection.direction;
          }
        }
      });
    } catch (error) {
      console.error('Failed to initialize Al Hayat GPT widget:', error);
    }
  }
}`}
                                    />
                                </Step>

                                <Step number={2} title="Module Configuration">
                                    <CodeBlock
                                        language="typescript"
                                        filename="app.module.ts"
                                        code={`import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AhgptWidgetComponent } from './ahgpt-widget.component';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent,
    AhgptWidgetComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }`}
                                    />
                                </Step>

                                <Step number={3} title="Use in Template">
                                    <CodeBlock
                                        language="html"
                                        filename="app.component.html"
                                        code={`<div class="container" [class.rtl-mode]="isRtlMode">
  <h1>Welcome to Our Christian Community</h1>
  <p>The chat below automatically detects language and adjusts text direction.</p>
  
  <!-- Al Hayat GPT Widget with Full Customization -->
  <div class="widget-section">
    <app-ahgpt-widget 
      height="700px">
      fontFamily="Roboto, sans-serif"
      fontSize="16px"
      [allowGuests]="true"
      [autoDetectLanguage]="true"
      defaultDirection="auto"
      welcomeMessage="Hello! I&apos;m here to help with any questions about Christianity."
      placeholder="Ask me anything about faith..."
      [enableVoiceInput]="true"
      [enableFileUpload]="false"
      [enableEmoji]="true"
      [enableAnimations]="true"
      [allowGuests]="true"
      [showLanguageIndicator]="true"
      (ready)="onWidgetReady()"
      (userSignIn)="onUserSignIn($event)"
      (languageDetected)="onLanguageDetected($event)"
      (directionChange)="onDirectionChange($event)">
    </app-ahgpt-widget>
  </div>
</div>`}
                                    />
                                </Step>

                                <Step number={4} title="Component Logic">
                                    <CodeBlock
                                        language="typescript"
                                        filename="app.component.ts"
                                        code={`import { Component } from '@angular/core';

interface LanguageDetection {
  language: string;
  direction: 'ltr' | 'rtl';
  confidence: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  isRtlMode = false;
  currentLanguage = 'auto';
  
  onWidgetReady() {
    console.log('Al Hayat GPT widget is ready!');
  }
  
  onUserSignIn(user: any) {
    console.log('User signed in:', user);
    // Handle user sign-in logic
  }
  
  onLanguageDetected(detection: LanguageDetection) {
    console.log('Language detected:', detection);
    this.currentLanguage = detection.language;
    
    // Update page direction based on detected language
    if (detection.confidence > 0.7) {
      this.isRtlMode = detection.direction === 'rtl';
      
      // Update document direction for better integration
      document.documentElement.dir = detection.direction;
      document.body.classList.toggle('rtl-active', this.isRtlMode);
    }
  }
  
  onDirectionChange(direction: 'ltr' | 'rtl') {
    console.log('Text direction changed to:', direction);
    this.isRtlMode = direction === 'rtl';
  }
}`}
                                    />
                                </Step>

                                <Step number={5} title="Use in Your App">
                                    <CodeBlock
                                        language="html"
                                        filename="app.component.html"
                                        code={`<div class="container">
  <h1>Welcome to Our Christian Community</h1>
  
  <!-- Basic usage -->
  <app-ahgpt-widget></app-ahgpt-widget>
  
  <!-- Custom height -->
  <app-ahgpt-widget height="800px"></app-ahgpt-widget>
</div>`}
                                    />
                                </Step>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Implementation Summary */}
                <div className="mt-8 sm:mt-16">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-blue-100">
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8 flex items-center gap-2 sm:gap-3">
                            <Cog6ToothIcon className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600" />
                            Quick Implementation Summary
                        </h3>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                            {/* WordPress */}
                            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
                                <h4 className="font-bold text-gray-900 mb-3 text-base sm:text-lg">WordPress</h4>
                                <ol className="text-xs sm:text-sm text-gray-600 space-y-1.5 sm:space-y-2">
                                    <li><strong>1.</strong> Add functions.php code</li>
                                    <li><strong>2.</strong> Add CSS to Additional CSS</li>
                                    <li><strong>3.</strong> Use shortcode: <code className="text-xs bg-gray-100 px-1 rounded">[ahgpt_widget]</code></li>
                                    <li><strong>4.</strong> Configure Clerk key in settings</li>
                                </ol>
                            </div>

                            {/* React/Next.js */}
                            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
                                <h4 className="font-bold text-gray-900 mb-3 text-base sm:text-lg">React/Next.js</h4>
                                <ol className="text-xs sm:text-sm text-gray-600 space-y-1.5 sm:space-y-2">
                                    <li><strong>1.</strong> Create widget component</li>
                                    <li><strong>2.</strong> Create CSS file</li>
                                    <li><strong>3.</strong> Import styles in app</li>
                                    <li><strong>4.</strong> Add environment variables</li>
                                </ol>
                            </div>

                            {/* HTML/Static */}
                            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
                                <h4 className="font-bold text-gray-900 mb-3 text-base sm:text-lg">HTML/Static</h4>
                                <ol className="text-xs sm:text-sm text-gray-600 space-y-1.5 sm:space-y-2">
                                    <li><strong>1.</strong> Create CSS file</li>
                                    <li><strong>2.</strong> Link CSS in HTML head</li>
                                    <li><strong>3.</strong> Add widget div + script</li>
                                    <li><strong>4.</strong> Replace Clerk key</li>
                                </ol>
                            </div>

                            {/* Angular */}
                            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
                                <h4 className="font-bold text-gray-900 mb-3 text-base sm:text-lg">Angular</h4>
                                <ol className="text-xs sm:text-sm text-gray-600 space-y-1.5 sm:space-y-2">
                                    <li><strong>1.</strong> Create component files</li>
                                    <li><strong>2.</strong> Add to app module</li>
                                    <li><strong>3.</strong> Add CSS styles</li>
                                    <li><strong>4.</strong> Use in template</li>
                                </ol>
                            </div>
                        </div>

                        {/* Key Features Reminder */}
                        <div className="mt-6 sm:mt-8 grid sm:grid-cols-3 gap-4 sm:gap-6">
                            <div className="text-center">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                                    <GlobeAltIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                                </div>
                                <h5 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Auto Language Detection</h5>
                                <p className="text-xs sm:text-sm text-gray-600">Automatically detects user language and switches RTL/LTR direction</p>
                            </div>

                            <div className="text-center">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                                    <Cog6ToothIcon className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                                </div>
                                <h5 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Full Customization</h5>
                                <p className="text-xs sm:text-sm text-gray-600">Customize colors, fonts, layout, and behavior via CSS and configuration</p>
                            </div>

                            <div className="text-center">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                                    <CodeBracketIcon className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                                </div>
                                <h5 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Easy Integration</h5>
                                <p className="text-xs sm:text-sm text-gray-600">Works with all platforms - just copy, paste, and customize</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Configuration Options */}
                <div className="mt-8 sm:mt-16">
                    <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-sm border border-gray-100">
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">Complete Configuration Options</h3>

                        {/* Layout & Appearance */}
                        <div className="mb-6 sm:mb-8">
                            <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Layout & Appearance</h4>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                <div className="p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                                    <h5 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">theme</h5>
                                    <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">Visual appearance</p>
                                    <code className="text-xs bg-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">auto | light | dark | custom</code>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <h5 className="font-semibold text-gray-900 mb-2">width / height</h5>
                                    <p className="text-sm text-gray-600 mb-2">Widget dimensions</p>
                                    <code className="text-xs bg-white px-2 py-1 rounded">CSS values (px, %, vh, auto)</code>
                                </div>

                                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                                    <h5 className="font-semibold text-green-900 mb-2">🆕 autoResize</h5>
                                    <p className="text-sm text-green-700 mb-2">Smart height detection</p>
                                    <code className="text-xs bg-white px-2 py-1 rounded">true (default) | false</code>
                                </div>

                                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                                    <h5 className="font-semibold text-green-900 mb-2">🆕 smartHeight</h5>
                                    <p className="text-sm text-green-700 mb-2">Container-aware sizing</p>
                                    <code className="text-xs bg-white px-2 py-1 rounded">true (default) | false</code>
                                </div>

                                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                                    <h5 className="font-semibold text-green-900 mb-2">🆕 responsiveHeight</h5>
                                    <p className="text-sm text-green-700 mb-2">Device-specific heights</p>
                                    <code className="text-xs bg-white px-2 py-1 rounded">true (default) | false</code>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <h5 className="font-semibold text-gray-900 mb-2">borderRadius</h5>
                                    <p className="text-sm text-gray-600 mb-2">Corner rounding</p>
                                    <code className="text-xs bg-white px-2 py-1 rounded">CSS border-radius value</code>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <h5 className="font-semibold text-gray-900 mb-2">position</h5>
                                    <p className="text-sm text-gray-600 mb-2">Widget positioning</p>
                                    <code className="text-xs bg-white px-2 py-1 rounded">relative | fixed | absolute</code>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <h5 className="font-semibold text-gray-900 mb-2">boxShadow</h5>
                                    <p className="text-sm text-gray-600 mb-2">Drop shadow effect</p>
                                    <code className="text-xs bg-white px-2 py-1 rounded">CSS box-shadow value</code>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <h5 className="font-semibold text-gray-900 mb-2">zIndex</h5>
                                    <p className="text-sm text-gray-600 mb-2">Layer stacking order</p>
                                    <code className="text-xs bg-white px-2 py-1 rounded">Number (e.g., 1000)</code>
                                </div>
                            </div>
                        </div>

                        {/* Color Customization */}
                        <div className="mb-8">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Color Customization</h4>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <h5 className="font-semibold text-gray-900 mb-2">customColors.primary</h5>
                                    <p className="text-sm text-gray-600 mb-2">Main brand color</p>
                                    <code className="text-xs bg-white px-2 py-1 rounded">#3b82f6 (hex/rgb/hsl)</code>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <h5 className="font-semibold text-gray-900 mb-2">customColors.background</h5>
                                    <p className="text-sm text-gray-600 mb-2">Chat background</p>
                                    <code className="text-xs bg-white px-2 py-1 rounded">#ffffff</code>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <h5 className="font-semibold text-gray-900 mb-2">customColors.text</h5>
                                    <p className="text-sm text-gray-600 mb-2">Text color</p>
                                    <code className="text-xs bg-white px-2 py-1 rounded">#1f2937</code>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <h5 className="font-semibold text-gray-900 mb-2">customColors.surface</h5>
                                    <p className="text-sm text-gray-600 mb-2">Message bubbles</p>
                                    <code className="text-xs bg-white px-2 py-1 rounded">#f8fafc</code>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <h5 className="font-semibold text-gray-900 mb-2">customColors.border</h5>
                                    <p className="text-sm text-gray-600 mb-2">Border colors</p>
                                    <code className="text-xs bg-white px-2 py-1 rounded">#e5e7eb</code>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <h5 className="font-semibold text-gray-900 mb-2">Full Color Object</h5>
                                    <p className="text-sm text-gray-600 mb-2">Complete color scheme</p>
                                    <code className="text-xs bg-white px-2 py-1 rounded">See full example →</code>
                                </div>
                            </div>
                        </div>

                        {/* Typography */}
                        <div className="mb-8">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Typography</h4>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <h5 className="font-semibold text-gray-900 mb-2">fontFamily</h5>
                                    <p className="text-sm text-gray-600 mb-2">Font stack</p>
                                    <code className="text-xs bg-white px-2 py-1 rounded">CSS font-family value</code>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <h5 className="font-semibold text-gray-900 mb-2">fontSize</h5>
                                    <p className="text-sm text-gray-600 mb-2">Text size</p>
                                    <code className="text-xs bg-white px-2 py-1 rounded">CSS font-size value</code>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <h5 className="font-semibold text-gray-900 mb-2">lineHeight</h5>
                                    <p className="text-sm text-gray-600 mb-2">Line spacing</p>
                                    <code className="text-xs bg-white px-2 py-1 rounded">Number or CSS value</code>
                                </div>
                            </div>
                        </div>

                        {/* Language & Direction */}
                        <div className="mb-8">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Language & Direction</h4>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <h5 className="font-semibold text-gray-900 mb-2">autoDetectLanguage</h5>
                                    <p className="text-sm text-gray-600 mb-2">Auto language detection</p>
                                    <code className="text-xs bg-white px-2 py-1 rounded">true | false</code>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <h5 className="font-semibold text-gray-900 mb-2">defaultDirection</h5>
                                    <p className="text-sm text-gray-600 mb-2">Text direction</p>
                                    <code className="text-xs bg-white px-2 py-1 rounded">auto | ltr | rtl</code>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <h5 className="font-semibold text-gray-900 mb-2">supportedLanguages</h5>
                                    <p className="text-sm text-gray-600 mb-2">Language whitelist</p>
                                    <code className="text-xs bg-white px-2 py-1 rounded">&apos;en&apos;, &apos;ar&apos;, &apos;es&apos;</code>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <h5 className="font-semibold text-gray-900 mb-2">fallbackLanguage</h5>
                                    <p className="text-sm text-gray-600 mb-2">Default language</p>
                                    <code className="text-xs bg-white px-2 py-1 rounded">Language code (e.g., &apos;en&apos;)</code>
                                </div>
                            </div>
                        </div>

                        {/* Enhanced Height Detection */}
                        <div className="mb-8">
                            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-2xl border border-green-200 mb-6">
                                <h4 className="text-lg font-semibold text-green-900 mb-3">🆕 Enhanced Height Detection</h4>
                                <p className="text-green-700 mb-4">
                                    Automatically adapts to any website layout. The widget intelligently detects your site&apos;s structure
                                    and adjusts its height to ensure the input field is always visible and properly positioned.
                                </p>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <h5 className="font-semibold text-green-900 mb-2">✨ Smart Features:</h5>
                                        <ul className="text-sm text-green-700 space-y-1">
                                            <li>• Detects headers and footers</li>
                                            <li>• Responsive breakpoints (mobile/tablet/desktop)</li>
                                            <li>• Parent container awareness</li>
                                            <li>• Virtual keyboard handling on mobile</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h5 className="font-semibold text-green-900 mb-2">🎯 Benefits:</h5>
                                        <ul className="text-sm text-green-700 space-y-1">
                                            <li>• Input always above the fold</li>
                                            <li>• Perfect fit on any website</li>
                                            <li>• No manual height adjustments needed</li>
                                            <li>• Works with dynamic layouts</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Behavior & Features */}
                        <div className="mb-8">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Behavior & Features</h4>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <h5 className="font-semibold text-gray-900 mb-2">allowGuests</h5>
                                    <p className="text-sm text-gray-600 mb-2">Guest mode access</p>
                                    <code className="text-xs bg-white px-2 py-1 rounded">true | false</code>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <h5 className="font-semibold text-gray-900 mb-2">enableVoiceInput</h5>
                                    <p className="text-sm text-gray-600 mb-2">Voice message support</p>
                                    <code className="text-xs bg-white px-2 py-1 rounded">true | false</code>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <h5 className="font-semibold text-gray-900 mb-2">enableFileUpload</h5>
                                    <p className="text-sm text-gray-600 mb-2">File attachment support</p>
                                    <code className="text-xs bg-white px-2 py-1 rounded">true | false</code>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <h5 className="font-semibold text-gray-900 mb-2">welcomeMessage</h5>
                                    <p className="text-sm text-gray-600 mb-2">Initial greeting</p>
                                    <code className="text-xs bg-white px-2 py-1 rounded">String message</code>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <h5 className="font-semibold text-gray-900 mb-2">placeholder</h5>
                                    <p className="text-sm text-gray-600 mb-2">Input placeholder text</p>
                                    <code className="text-xs bg-white px-2 py-1 rounded">String text</code>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <h5 className="font-semibold text-gray-900 mb-2">enableAnimations</h5>
                                    <p className="text-sm text-gray-600 mb-2">UI animations</p>
                                    <code className="text-xs bg-white px-2 py-1 rounded">true | false</code>
                                </div>
                            </div>
                        </div>

                        {/* CSS Classes */}
                        <div className="mb-8">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Custom CSS Classes</h4>
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <h5 className="font-semibold text-gray-900 mb-2">containerClass</h5>
                                    <p className="text-sm text-gray-600 mb-2">Main wrapper</p>
                                    <code className="text-xs bg-white px-2 py-1 rounded">CSS class name</code>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <h5 className="font-semibold text-gray-900 mb-2">headerClass</h5>
                                    <p className="text-sm text-gray-600 mb-2">Header section</p>
                                    <code className="text-xs bg-white px-2 py-1 rounded">CSS class name</code>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <h5 className="font-semibold text-gray-900 mb-2">bodyClass</h5>
                                    <p className="text-sm text-gray-600 mb-2">Chat messages area</p>
                                    <code className="text-xs bg-white px-2 py-1 rounded">CSS class name</code>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <h5 className="font-semibold text-gray-900 mb-2">inputClass</h5>
                                    <p className="text-sm text-gray-600 mb-2">Input field</p>
                                    <code className="text-xs bg-white px-2 py-1 rounded">CSS class name</code>
                                </div>
                            </div>
                        </div>

                        {/* Customization Examples */}
                        <div className="mt-8">
                            <h4 className="text-lg font-semibold text-gray-900 mb-6">Customization Examples</h4>

                            {/* Chat Bubble Colors Example */}
                            <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                                <h5 className="font-semibold text-gray-900 mb-3">Custom Chat Bubble Colors</h5>
                                <CodeBlock
                                    language="javascript"
                                    code={`// Example: Custom chat bubble colors (guest-only mode)
window.AlHayatGPT.createWidget({
    containerId: 'chat-widget',
    allowGuests: true,
    customColors: {
        // User Messages (right side)
        userBubble: '#8B5CF6', // Purple bubble
        userBubbleText: '#FFFFFF', // White text
        
        // Assistant Messages (left side)
        assistantBubble: '#F1F5F9', // Light gray bubble
        assistantBubbleText: '#1E293B', // Dark text
        
        // System Messages (center)
        systemBubble: '#FEF3C7', // Light yellow bubble
        systemBubbleText: '#92400E', // Brown text
        
        // Chat Interface
        background: '#FFFFFF',
        inputBackground: '#F9FAFB',
        inputBorder: '#D1D5DB',
        buttonPrimary: '#8B5CF6'
    }
});`}
                                />
                            </div>

                            {/* Brand Colors Example */}
                            <div className="mb-6 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
                                <h5 className="font-semibold text-gray-900 mb-3">Complete Brand Integration</h5>
                                <CodeBlock
                                    language="javascript"
                                    code={`// Example: Full brand color scheme (guest-only mode)
window.AlHayatGPT.createWidget({
    containerId: 'chat-widget',
    allowGuests: true,
    customColors: {
        // Brand Identity
        primary: '#8B5CF6', // Your brand purple
        secondary: '#A78BFA', // Lighter purple
        accent: '#EC4899', // Pink accent
        
        // Chat Bubbles
        userBubble: '#8B5CF6',
        userBubbleText: '#FFFFFF',
        assistantBubble: '#F3F4F6',
        assistantBubbleText: '#1F2937',
        
        // Interface
        background: '#FAFAFA',
        headerBackground: '#8B5CF6',
        headerText: '#FFFFFF',
        inputBackground: '#FFFFFF',
        buttonPrimary: '#8B5CF6',
        
        // Interactive States
        hover: '#7C3AED',
        focus: '#A855F7',
        border: '#E5E7EB'
    }
});`}
                                />
                            </div>

                            {/* Dark Theme Example */}
                            <div className="mb-6 p-6 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl border border-gray-100">
                                <h5 className="font-semibold text-gray-900 mb-3">Dark Theme Configuration</h5>
                                <CodeBlock
                                    language="javascript"
                                    code={`// Example: Dark theme (guest-only mode)
window.AlHayatGPT.createWidget({
    containerId: 'chat-widget',
    allowGuests: true,
    theme: 'dark',
    customColors: {
        primary: '#60A5FA',
        background: '#1F2937',
        surface: '#374151',
        text: '#F9FAFB',
        textSecondary: '#D1D5DB',
        border: '#4B5563'
    },
    borderRadius: '12px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
});`}
                                />
                            </div>

                            {/* Floating Widget Example */}
                            <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100">
                                <h5 className="font-semibold text-gray-900 mb-3">Floating Chat Widget</h5>
                                <CodeBlock
                                    language="javascript"
                                    code={`// Example: Floating widget with custom positioning (guest-only mode)
window.AlHayatGPT.createWidget({
    containerId: 'floating-chat',
    allowGuests: true,
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '350px',
    height: '500px',
    zIndex: 9999,
    borderRadius: '20px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    enableAnimations: true,
    transitionDuration: '400ms'
});`}
                                />
                            </div>

                            {/* Enhanced Height Detection Example */}
                            <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl border border-green-100">
                                <h5 className="font-semibold text-gray-900 mb-3">🆕 Enhanced Height Detection</h5>
                                <CodeBlock
                                    language="javascript"
                                    code={`// Example: Smart height detection (guest-only mode)
window.AlHayatGPT.createWidget({
    containerId: 'chat-widget',
    allowGuests: true,
    
    // Height Detection Features (all enabled by default)
    autoResize: true,           // Auto-adjust to page changes
    smartHeight: true,          // Detect parent containers
    responsiveHeight: true,     // Device-specific sizing
    minHeight: 400,            // Minimum height (px)
    maxHeight: 800,            // Maximum height (px)
    
    // Manual override (if needed)
    height: 'auto',            // Let system decide
    // height: '100vh',        // Full viewport
    // height: 'calc(100vh - 120px)', // Viewport minus header/footer
    
    // Event handler for height changes
    onResize: function(dimensions) {
        console.log('Widget resized:', dimensions);
        console.log('Breakpoint:', dimensions.breakpoint);
        console.log('Is embedded:', dimensions.isEmbedded);
    }
});`}
                                />
                                <div className="mt-4 p-4 bg-white rounded-lg border border-green-200">
                                    <h6 className="font-medium text-green-900 mb-2">✨ Automatic Features:</h6>
                                    <ul className="text-sm text-green-700 space-y-1">
                                        <li>• Detects website headers and footers</li>
                                        <li>• Adjusts for mobile virtual keyboards</li>
                                        <li>• Handles responsive breakpoints (mobile/tablet/desktop)</li>
                                        <li>• Ensures input field is always visible above the fold</li>
                                        <li>• Works with dynamic layouts and SPA navigation</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Multi-language Example */}
                            <div className="mb-6 p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-100">
                                <h5 className="font-semibold text-gray-900 mb-3">Multi-language Configuration</h5>
                                <CodeBlock
                                    language="javascript"
                                    code={`// Example: Multi-language support with RTL (guest-only mode)
window.AlHayatGPT.createWidget({
    containerId: 'chat-widget',
    allowGuests: true,
    autoDetectLanguage: true,
    supportedLanguages: ['en', 'ar', 'he', 'es', 'fr', 'de'],
    fallbackLanguage: 'en',
    defaultDirection: 'auto',
    welcomeMessage: 'Welcome! Ask me anything.',
    placeholder: 'Type your message...',
    
    onLanguageDetected: function(detection) {
        console.log('Detected:', detection.language, detection.direction);
        // Update your page elements if needed
        if (detection.direction === 'rtl') {
            document.body.classList.add('rtl-chat-active');
        }
    }
});`}
                                />
                            </div>
                        </div>

                        {/* Enhanced Error Handling */}
                        <div className="mt-8 p-6 bg-gradient-to-r from-red-50 to-rose-50 rounded-2xl border border-red-100">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">🆕 Guest-Only Error Handling</h4>
                            <p className="text-gray-600 mb-4">Simplified error handling for guest-only widgets with automatic retry and detailed error codes:</p>
                            <CodeBlock
                                language="javascript"
                                code={`// Guest-only widget with enhanced error handling
const widget = window.AlHayatGPT.createWidget({
    containerId: 'chat-widget',
    allowGuests: true, // Always true for external widgets
    
    // Unified error callback - no authentication errors!
    onError: (error) => {
        console.error('Widget error:', error.code, error.message);
        
        switch (error.code) {
            case 'CONTAINER_NOT_FOUND':
                console.error('Widget container not found in DOM');
                break;
                
            case 'SECURITY_VIOLATION':
                console.error('Security or origin validation issue');
                // Handle cross-origin security issues
                break;
                
            case 'NETWORK_ERROR':
                console.error('Network error occurred');
                if (error.retryable) {
                    console.log('Will retry automatically in', error.retryAfter, 'ms');
                }
                break;
                
            case 'IFRAME_LOAD_FAILED':
                console.error('Widget failed to load');
                break;
                
            case 'TIMEOUT':
                console.error('Operation timed out');
                break;
                
            case 'INVALID_CONFIG':
                console.error('Invalid configuration:', error.details);
                break;
                
            case 'INITIALIZATION_FAILED':
                console.error('Widget initialization failed');
                break;
                
            default:
                console.error('Unknown error:', error.message);
        }
    }
});

// Event-based error handling
widget.on('ERROR', (error) => {
    console.log('Error details:', {
        code: error.code,
        message: error.message,
        retryable: error.retryable,
        timestamp: error.timestamp
    });
});

// ❌ OLD - Remove these (no longer supported):
// widget.on('AUTH_ERROR', handler);     // REMOVED - no authentication
// onAuthError: (error) => {}            // REMOVED - no authentication  
// usePopupAuth: true                    // REMOVED - guest-only mode
// clerkPublishableKey: 'KEY'            // REMOVED - no authentication needed`}
                            />
                        </div>

                        {/* Widget Methods */}
                        <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Widget Methods & API</h4>
                            <p className="text-gray-600 mb-4">Control the widget programmatically after initialization:</p>
                            <CodeBlock
                                language="javascript"
                                code={`// Get widget instance
const widget = window.AlHayatGPT.createWidget(config);

// Available methods:
widget.setTheme('dark');                    // Change theme
widget.setDirection('rtl');                 // Change text direction
widget.updateColors({ primary: '#FF6B6B' }); // Update colors
widget.toggleFeature('voiceInput');         // Toggle features
widget.resize({ width: '400px', height: '600px' }); // Resize
widget.showMessage('Welcome back!');        // Show custom message
widget.clearChat();                         // Clear chat history
widget.minimize();                          // Minimize widget
widget.maximize();                          // Maximize widget
widget.destroy();                           // Remove widget

// Event listeners:
widget.on('messageReceived', (msg) => console.log(msg));
widget.on('userTyping', () => console.log('User is typing'));
widget.on('themeChanged', (theme) => console.log('Theme:', theme));
widget.on('ERROR', (error) => console.log('Error:', error.code)); // 🆕 New error handling`}
                            />
                        </div>

                        {/* Language Detection Features */}
                        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <GlobeAltIcon className="h-5 w-5 text-blue-600" />
                                Language Detection & RTL Support
                            </h4>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h5 className="font-medium text-gray-900 mb-2">Automatic Features</h5>
                                    <ul className="text-sm text-gray-600 space-y-1">
                                        <li>• Real-time language detection</li>
                                        <li>• Automatic RTL/LTR switching</li>
                                        <li>• Location detection with country flags</li>
                                        <li>• Unicode-based character analysis</li>
                                        <li>• Dynamic layout adjustments</li>
                                    </ul>
                                </div>
                                <div>
                                    <h5 className="font-medium text-gray-900 mb-2">Supported Languages</h5>
                                    <ul className="text-sm text-gray-600 space-y-1">
                                        <li>• <strong>RTL:</strong> Arabic, Hebrew, Persian, Urdu</li>
                                        <li>• <strong>LTR:</strong> English, Chinese, Russian, European</li>
                                        <li>• <strong>Mixed:</strong> Automatic detection per message</li>
                                        <li>• <strong>Confidence:</strong> 85%+ accuracy rate</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Support Section */}
                <div className="mt-8 sm:mt-16 text-center">
                    <div className="bg-blue-50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8">
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Need Help?</h3>
                        <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-2xl mx-auto px-2">
                            Our guest-only widget is designed to work instantly without configuration.
                            If you need help with integration or customization, we&apos;re here to assist.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                            <button className="px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg sm:rounded-xl hover:bg-blue-700 transition-colors text-sm sm:text-base">
                                Contact Support
                            </button>
                            <button className="px-4 sm:px-6 py-2.5 sm:py-3 bg-white text-blue-600 border border-blue-600 rounded-lg sm:rounded-xl hover:bg-blue-50 transition-colors text-sm sm:text-base">
                                View Documentation
                            </button>
                        </div>
                    </div>
                </div>
            </div >
        </div >
    );
}
