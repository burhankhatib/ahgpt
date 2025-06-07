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

const TABS = [
    { id: 'html', label: 'HTML', icon: <FaHtml5 className="w-5 h-5 sm:w-6 sm:h-6" /> },
    { id: 'wordpress', label: 'WordPress', icon: <FaWordpress className="w-5 h-5 sm:w-6 sm:h-6" /> },
    { id: 'react', label: 'React / Next.js', icon: <FaReact className="w-5 h-5 sm:w-6 sm:h-6" /> },
    { id: 'angular', label: 'Angular', icon: <FaAngular className="w-5 h-5 sm:w-6 sm:h-6" /> },
];

export default function InstructionsPage() {
    const [activeTab, setActiveTab] = useState('html');

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
                            The widget works instantly in guest mode - no authentication required for your visitors.
                        </p>
                    </div>
                </div>
            </div>

            {/* What&apos;s New Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12" dir="ltr">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200 mb-12">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">🚀 SDK v3.0 - Completely Rebuilt</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Our latest SDK is a complete rebuild from the ground up, designed for maximum simplicity and reliability.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                <span className="text-2xl">⚡</span>
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-2">Ultra-Lightweight</h4>
                            <p className="text-sm text-gray-600">Only 3KB minified - loads instantly on any website</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                <span className="text-2xl">🎯</span>
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-2">Zero Dependencies</h4>
                            <p className="text-sm text-gray-600">Pure JavaScript - no external libraries required</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                <span className="text-2xl">🌐</span>
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-2">Universal Compatibility</h4>
                            <p className="text-sm text-gray-600">Works on any website, any framework, any platform</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                <span className="text-2xl">🎨</span>
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-2">Auto-Updating Styles</h4>
                            <p className="text-sm text-gray-600">Automatic visual updates - no code changes required on your end</p>
                        </div>
                    </div>
                </div>

                {/* Centralized Styling Feature */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-200 mb-12">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">🎨 Automatic Style Updates</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            The widget automatically receives style updates from our servers. When we improve the design, typography, or add new features, your widget gets updated instantly without any code changes on your end.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-xl">🔄</span>
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-2">Zero Maintenance</h4>
                            <p className="text-sm text-gray-600">
                                Style improvements, bug fixes, and new features are deployed automatically to all widgets.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-xl">✨</span>
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-2">Always Up-to-Date</h4>
                            <p className="text-sm text-gray-600">
                                Your widget stays current with the latest design trends and accessibility improvements.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Benefits Section */}
                <div className="bg-white rounded-2xl p-8 border border-gray-200 mb-12 shadow-sm">
                    <div className="text-center mb-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Perfect for Any Website</h3>
                        <p className="text-gray-600">
                            Whether you&apos;re running a blog, business site, or online ministry, our widget integrates seamlessly.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-xl">🚀</span>
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-2">Instant Setup</h4>
                            <p className="text-sm text-gray-600">
                                Copy, paste, done. No complex configuration or API keys needed.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-xl">💬</span>
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-2">Immediate Engagement</h4>
                            <p className="text-sm text-gray-600">
                                Visitors can start conversations without any sign-up process.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-xl">📱</span>
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-2">Mobile Optimized</h4>
                            <p className="text-sm text-gray-600">
                                Responsive design that works perfectly on all devices.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Integration Guide */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16" dir="ltr">
                <div className="text-center mb-8">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Choose Your Platform</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Select your platform below for step-by-step integration instructions.
                    </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                    {/* Tab Navigation */}
                    <div className="flex justify-start sm:justify-center items-center border-b border-gray-200 bg-gray-50 overflow-x-auto">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 sm:gap-3 px-4 py-3 sm:px-6 sm:py-4 font-semibold text-sm sm:text-base whitespace-nowrap transition-colors duration-200 ${activeTab === tab.id
                                    ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                                    : 'text-gray-500 hover:text-gray-800'
                                    }`}
                            >
                                {tab.icon}
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="p-4 sm:p-6 lg:p-8 text-left">
                        {activeTab === 'html' && (
                            <div>
                                <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                                        <FaHtml5 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900">HTML / Static Site Integration</h3>
                                        <p className="text-sm sm:text-base text-gray-600">The most direct method. Works on any basic website.</p>
                                    </div>
                                </div>
                                <Step number={1} title="Add a Container Element">
                                    <p className="text-gray-600 mb-4">
                                        Add a div element where you want the widget to appear. The widget will fill 100% of the container by default.
                                    </p>
                                    <CodeBlock
                                        language="html"
                                        filename="index.html"
                                        code={`<!-- Full-screen widget (recommended - covers entire viewport) -->
<div id="alhayat-gpt-widget" style="width: 100%; height: 100vh;"></div>

<!-- Full-width but fixed height -->
<div id="alhayat-gpt-widget" style="width: 100%; height: 600px;"></div>

<!-- Fixed size container -->
<div id="alhayat-gpt-widget" style="width: 400px; height: 600px; margin: 0 auto;"></div>

<!-- For specific page sections with full height -->
<div style="height: 100vh; display: flex; flex-direction: column;">
    <h1>My Website</h1>
    <div id="alhayat-gpt-widget" style="flex: 1; min-height: 500px;"></div>
</div>`}
                                    />
                                </Step>
                                <Step number={2} title="Add the SDK Scripts">
                                    <p className="text-gray-600 mb-4">
                                        Place these script tags just before the closing &lt;/body&gt; tag. The widget supports flexible styling options.
                                    </p>
                                    <CodeBlock
                                        language="html"
                                        filename="index.html"
                                        code={`<script src="https://www.alhayatgpt.com/sdk.js" defer></script>
<script>
    window.addEventListener('AlHayatGPTSDKReady', () => {
        // Default widget (fills 100% of container)
        AlHayatGPT.createWidget({
            containerId: 'alhayat-gpt-widget'
        });

        // OR with custom styling
        AlHayatGPT.createWidget({
            containerId: 'alhayat-gpt-widget',
            width: '400px',
            height: '600px',
            style: {
                borderRadius: '15px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                border: '2px solid #e0e0e0'
            }
        });
    });
</script>`}
                                    />
                                </Step>
                                <Step number={3} title="Styling Options">
                                    <p className="text-gray-600 mb-4">
                                        You can customize the widget appearance using various styling options:
                                    </p>
                                    <CodeBlock
                                        language="javascript"
                                        filename="Advanced Styling Examples"
                                        code={`// Fullscreen widget
AlHayatGPT.createWidget({
    containerId: 'fullscreen-widget'
    // Defaults to 100% width & height
});

// Custom dimensions
AlHayatGPT.createWidget({
    containerId: 'custom-widget',
    width: '350px',
    height: '500px'
});

// Rounded corners with shadow
AlHayatGPT.createWidget({
    containerId: 'styled-widget',
    style: {
        borderRadius: '20px',
        boxShadow: '0 15px 40px rgba(0,0,0,0.15)',
        border: '1px solid #ddd'
    }
});

// Compact mobile-friendly widget
AlHayatGPT.createWidget({
    containerId: 'mobile-widget',
    width: '320px',
    height: '480px',
    style: {
        borderRadius: '10px',
        boxShadow: '0 5px 20px rgba(0,0,0,0.1)'
    }
});`}
                                    />
                                </Step>
                            </div>
                        )}

                        {activeTab === 'wordpress' && (
                            <div>
                                <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                                        <FaWordpress className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900">WordPress Integration</h3>
                                        <p className="text-sm sm:text-base text-gray-600">The easiest way to add the widget to a post or page.</p>
                                    </div>
                                </div>
                                <Step number={1} title="Add a Custom HTML Block">
                                    <p className="text-gray-600 mb-4">
                                        In the WordPress editor, add a &quot;Custom HTML&quot; block to your page or post where you want the widget to appear.
                                    </p>
                                </Step>
                                <Step number={2} title="Paste the Code">
                                    <p className="text-gray-600 mb-4">
                                        Copy and paste the following code into the Custom HTML block. The widget fills 100% of the container by default.
                                    </p>
                                    <CodeBlock
                                        language="html"
                                        filename="WordPress Custom HTML Block"
                                        code={`<!-- Full-screen widget (recommended - covers entire viewport) -->
<div id="alhayat-gpt-widget" style="width: 100%; height: 100vh;"></div>

<!-- Full-width but custom height -->
<div id="alhayat-gpt-widget" style="width: 100%; height: 70vh; min-height: 500px;"></div>

<script src="https://www.alhayatgpt.com/sdk.js" defer></script>
<script>
    window.addEventListener('AlHayatGPTSDKReady', () => {
        if (document.getElementById('alhayat-gpt-widget')) {
            AlHayatGPT.createWidget({
                containerId: 'alhayat-gpt-widget'
            });
        }
    });
</script>`}
                                    />
                                </Step>
                                <Step number={3} title="Custom Styling (Optional)">
                                    <p className="text-gray-600 mb-4">
                                        For a more customized appearance, use this enhanced version with styling options:
                                    </p>
                                    <CodeBlock
                                        language="html"
                                        filename="WordPress Custom HTML Block - Styled"
                                        code={`<!-- Styled widget with custom appearance -->
<div id="alhayat-gpt-widget" style="width: 100%; max-width: 500px; height: 600px; margin: 0 auto;"></div>

<script src="https://www.alhayatgpt.com/sdk.js" defer></script>
<script>
    window.addEventListener('AlHayatGPTSDKReady', () => {
        if (document.getElementById('alhayat-gpt-widget')) {
            AlHayatGPT.createWidget({
                containerId: 'alhayat-gpt-widget',
                style: {
                    borderRadius: '15px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                    border: '2px solid #e0e0e0'
                }
            });
        }
    });
</script>`}
                                    />
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
                                        <p className="text-sm sm:text-base text-gray-600">A reusable component for your React-based projects.</p>
                                    </div>
                                </div>

                                <Step number={1} title="Create the Widget Component">
                                    <p className="text-gray-600 mb-4">
                                        Create a new component file, for example <code>components/AlHayatGPTWidget.tsx</code>, and add the following code. The component defaults to 100% width and height.
                                    </p>
                                    <CodeBlock
                                        language="typescript"
                                        filename="components/AlHayatGPTWidget.tsx"
                                        code={`'use client';

import React, { useEffect } from 'react';

interface Props {
    containerId?: string;
    style?: React.CSSProperties;
}

export default function AlHayatGPTWidget({ 
    containerId = 'alhayat-gpt-widget-container',
    style = { width: '100%', height: '100%' }
}: Props) {
    useEffect(() => {
        const initWidget = () => {
            const container = document.getElementById(containerId);
            const windowObj = window as unknown as Record<string, unknown>;
            const sdk = windowObj['AlHayatGPT'];
            
            // Final check to ensure the container exists and hasn't been initialized
            if (sdk && typeof sdk === 'object' && sdk !== null && 
                'createWidget' in sdk && typeof sdk.createWidget === 'function' &&
                container && !container.hasAttribute('data-ahgpt-widget-initialized')) {
                container.setAttribute('data-ahgpt-widget-initialized', 'true');
                (sdk.createWidget as (options: { containerId: string }) => void)({ containerId });
            }
        };

        const loadAndInit = () => {
            const windowObj = window as unknown as Record<string, unknown>;
            
            // If SDK is already ready, initialize now
            if (windowObj['AlHayatGPTSDKReady']) {
                initWidget();
                return;
            }

            // If not ready, add a listener for when it is
            window.addEventListener('AlHayatGPTSDKReady', initWidget);

            // Check if script is already being loaded or has been loaded
            if (document.getElementById('ahgpt-sdk-script')) {
                return;
            }

            // If not, create and load the script
            const script = document.createElement('script');
            script.id = 'ahgpt-sdk-script';
            script.src = 'https://www.alhayatgpt.com/sdk.js';
            script.async = true;
            document.body.appendChild(script);
        };

        loadAndInit();

        // Cleanup: remove the event listener when the component unmounts
        return () => {
            window.removeEventListener('AlHayatGPTSDKReady', initWidget);
        };
    }, [containerId]);

    return <div id={containerId} style={style} />;
}`}
                                    />
                                </Step>

                                <Step number={2} title="Use the Component">
                                    <p className="text-gray-600 mb-4">
                                        Now you can import and use the component anywhere in your app with flexible styling options.
                                    </p>
                                    <CodeBlock
                                        language="typescript"
                                        filename="app/page.tsx"
                                        code={`import AlHayatGPTWidget from '@/components/AlHayatGPTWidget';

export default function HomePage() {
    return (
        <div>
            <h1>Welcome to My Website</h1>
            
            {/* Full-screen widget (recommended - covers entire viewport) */}
            <div style={{ width: '100%', height: '100vh' }}>
                <AlHayatGPTWidget />
            </div>
            
            {/* OR custom styled widget */}
            <AlHayatGPTWidget 
                containerId="my-widget-container" 
                style={{ 
                    width: '400px', 
                    height: '700px', 
                    margin: 'auto',
                    borderRadius: '15px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
                }}
            />
        </div>
    );
}`}
                                    />
                                </Step>
                                <Step number={3} title="Styling Examples">
                                    <p className="text-gray-600 mb-4">
                                        Here are some common styling patterns you can use:
                                    </p>
                                    <CodeBlock
                                        language="typescript"
                                        filename="Styling Examples"
                                        code={`// Full-screen widget (covers entire viewport)
<div style={{ width: '100%', height: '100vh' }}>
    <AlHayatGPTWidget />
</div>

// Centered custom-sized widget
<AlHayatGPTWidget 
    style={{ 
        width: '500px', 
        height: '700px', 
        margin: '0 auto',
        borderRadius: '20px',
        boxShadow: '0 15px 40px rgba(0,0,0,0.1)',
        border: '2px solid #f0f0f0'
    }}
/>

// Mobile-friendly responsive widget
<AlHayatGPTWidget 
    style={{ 
        width: '100%', 
        maxWidth: '400px', 
        height: '500px', 
        margin: '0 auto',
        borderRadius: '12px',
        boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
    }}
/>

// Sidebar widget
<AlHayatGPTWidget 
    containerId="sidebar-chat"
    style={{ 
        width: '350px', 
        height: '450px',
        borderRadius: '10px',
        border: '1px solid #e0e0e0'
    }}
/>`}
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
                                        <p className="text-sm sm:text-base text-gray-600">A simple component for your Angular application.</p>
                                    </div>
                                </div>
                                <Step number={1} title="Create the Widget Component">
                                    <p className="text-gray-600 mb-4">
                                        Create a new component, for example <code>ng g c alhayat-gpt-widget</code>, and update the TypeScript file. The widget defaults to 100% width and height.
                                    </p>
                                    <CodeBlock
                                        language="typescript"
                                        filename="alhayat-gpt-widget.component.ts"
                                        code={`import { Component, Input, OnInit, OnDestroy, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-alhayat-gpt-widget',
  template: '<div [id]="containerId" [ngStyle]="containerStyle"></div>',
})
export class AlhayatGptWidgetComponent implements OnInit, OnDestroy, AfterViewInit {
    @Input() containerId: string = 'alhayat-gpt-widget';
    @Input() width: string = '100%';
    @Input() height: string = '100%';
    @Input() customStyle: Record<string, string> = {};

    public containerStyle: Record<string, string> = {};
    private sdkReadyListener: () => void;

    constructor() {
        this.sdkReadyListener = () => this.initWidget();
    }

    ngOnInit(): void {
        // Combine default styles with custom styles
        this.containerStyle = {
            width: this.width,
            height: this.height,
            ...this.customStyle
        };
        this.loadSdk();
    }
    
    ngAfterViewInit(): void {
        const windowObj = window as unknown as Record<string, unknown>;
        if (windowObj['AlHayatGPTSDKReady']) {
            this.initWidget();
        }
    }

    ngOnDestroy(): void {
        window.removeEventListener('AlHayatGPTSDKReady', this.sdkReadyListener);
    }

    private initWidget(): void {
        const windowObj = window as unknown as Record<string, unknown>;
        const sdk = windowObj['AlHayatGPT'];
        const hasContainer = document.getElementById(this.containerId);
        
        if (sdk && typeof sdk === 'object' && sdk !== null && 
            'createWidget' in sdk && typeof sdk.createWidget === 'function' &&
            hasContainer && !hasContainer.hasAttribute('data-initialized')) {
            hasContainer.setAttribute('data-initialized', 'true');
            
            // Create widget with potential styling options
            const widgetOptions: Record<string, unknown> = { containerId: this.containerId };
            
            // Add style options if custom styling is provided
            if (Object.keys(this.customStyle).length > 0) {
                widgetOptions.style = this.customStyle;
            }
            
            (sdk.createWidget as (options: Record<string, unknown>) => void)(widgetOptions);
        }
    }

    private loadSdk(): void {
        if (!document.querySelector('script[src="https://www.alhayatgpt.com/sdk.js"]')) {
            const script = document.createElement('script');
            script.src = 'https://www.alhayatgpt.com/sdk.js';
            script.defer = true;
            document.body.appendChild(script);
            window.addEventListener('AlHayatGPTSDKReady', this.sdkReadyListener);
        }
    }
}`}
                                    />
                                </Step>

                                <Step number={2} title="Use in Your App Template">
                                    <p className="text-gray-600 mb-4">
                                        Add the component&apos;s selector to any template with flexible styling options.
                                    </p>
                                    <CodeBlock
                                        language="html"
                                        filename="app.component.html"
                                        code={`<h1>Welcome to My Angular App</h1>

<!-- Full-screen widget (recommended - covers entire viewport) -->
<div style="width: 100%; height: 100vh;">
    <app-alhayat-gpt-widget></app-alhayat-gpt-widget>
</div>

<!-- Custom sized widget -->
<app-alhayat-gpt-widget 
    containerId="custom-chat"
    width="400px" 
    height="600px"
    [customStyle]="{
        'margin': '0 auto',
        'border-radius': '15px',
        'box-shadow': '0 10px 30px rgba(0,0,0,0.15)',
        'border': '2px solid #e0e0e0'
    }">
</app-alhayat-gpt-widget>`}
                                    />
                                </Step>
                                <Step number={3} title="Styling Examples">
                                    <p className="text-gray-600 mb-4">
                                        Here are some common styling patterns you can use:
                                    </p>
                                    <CodeBlock
                                        language="html"
                                        filename="Angular Styling Examples"
                                        code={`<!-- Full-screen widget (covers entire viewport) -->
<div style="width: 100%; height: 100vh;">
    <app-alhayat-gpt-widget></app-alhayat-gpt-widget>
</div>

<!-- Centered custom widget -->
<app-alhayat-gpt-widget 
    width="500px" 
    height="700px"
    [customStyle]="{
        'margin': '0 auto',
        'border-radius': '20px',
        'box-shadow': '0 15px 40px rgba(0,0,0,0.1)',
        'border': '2px solid #f0f0f0'
    }">
</app-alhayat-gpt-widget>

<!-- Mobile-friendly widget -->
<app-alhayat-gpt-widget 
    width="100%" 
    height="500px"
    [customStyle]="{
        'max-width': '400px',
        'margin': '0 auto',
        'border-radius': '12px',
        'box-shadow': '0 8px 25px rgba(0,0,0,0.15)'
    }">
</app-alhayat-gpt-widget>

<!-- Sidebar widget -->
<app-alhayat-gpt-widget 
    containerId="sidebar-chat"
    width="350px" 
    height="450px"
    [customStyle]="{
        'border-radius': '10px',
        'border': '1px solid #e0e0e0'
    }">
</app-alhayat-gpt-widget>`}
                                    />
                                </Step>
                            </div>
                        )}
                    </div>
                </div>

                {/* Support Section */}
                <div className="mt-16 bg-gray-50 rounded-2xl p-8 text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Need Help?</h3>
                    <p className="text-gray-600 mb-6">
                        Having trouble with the integration? We&apos;re here to help!
                    </p>
                    <Link
                        href="/contact"
                        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        Contact Support
                    </Link>
                </div>
            </div>
        </div>
    );
}
