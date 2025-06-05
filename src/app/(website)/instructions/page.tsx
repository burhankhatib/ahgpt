"use client";
import React, { useState } from 'react';
import { CheckIcon, DocumentDuplicateIcon, CodeBracketIcon, GlobeAltIcon, Cog6ToothIcon, CommandLineIcon } from '@heroicons/react/24/outline';

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
        <div className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-lg" dir="ltr">
            {filename && (
                <div className="bg-gray-800 px-4 py-2 text-sm text-gray-300 border-b border-gray-700">
                    {filename}
                </div>
            )}
            <div className="relative">
                <pre className="p-6 text-sm text-gray-100 overflow-x-auto">
                    <code className={`language-${language}`}>{code}</code>
                </pre>
                <button
                    onClick={copyToClipboard}
                    className="absolute top-4 right-4 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                    title="Copy to clipboard"
                >
                    {copied ? (
                        <CheckIcon className="h-4 w-4 text-green-400" />
                    ) : (
                        <DocumentDuplicateIcon className="h-4 w-4 text-gray-400" />
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
        <div className="flex gap-4 mb-8">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                {number}
            </div>
            <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-3">{title}</h4>
                {children}
            </div>
        </div>
    );
}

export default function InstructionsPage() {
    const [activeTab, setActiveTab] = useState('wordpress');

    const platforms = [
        { id: 'wordpress', name: 'WordPress', icon: <GlobeAltIcon className="h-5 w-5" /> },
        { id: 'react', name: 'React/Next.js', icon: <CodeBracketIcon className="h-5 w-5" /> },
        { id: 'html', name: 'HTML/Static', icon: <DocumentDuplicateIcon className="h-5 w-5" /> },
        { id: 'angular', name: 'Angular', icon: <CommandLineIcon className="h-5 w-5" /> },
    ];

    return (
        <div className="min-h-screen bg-gray-50" dir="ltr" lang="en">
            {/* Header */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 py-16">
                    <div className="text-center" dir="ltr">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            Add Al Hayat GPT to Your Website
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Integrate our powerful Christian AI chatbot into your website with just a few lines of code.
                            Available for all major platforms and frameworks.
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Start */}
            <div className="max-w-7xl mx-auto px-6 py-16" dir="ltr">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Quick Start</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Choose your platform below and follow the simple integration steps.
                        No API keys required - just copy, paste, and customize.
                    </p>
                </div>



                {/* Platform Tabs */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Tab Navigation */}
                    <div className="border-b border-gray-100" dir="ltr">
                        <div className="flex overflow-x-auto">
                            {platforms.map((platform) => (
                                <button
                                    key={platform.id}
                                    onClick={() => setActiveTab(platform.id)}
                                    className={`flex items-center gap-3 px-6 py-4 text-sm font-medium whitespace-nowrap transition-all duration-200 border-b-2 ${activeTab === platform.id
                                        ? 'text-blue-600 border-blue-600 bg-blue-50'
                                        : 'text-gray-600 border-transparent hover:text-gray-900 hover:border-gray-200'
                                        }`}
                                >
                                    {platform.icon}
                                    {platform.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="p-8 text-left">
                        {activeTab === 'wordpress' && (
                            <div>
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                                        <GlobeAltIcon className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900">WordPress Integration</h3>
                                        <p className="text-gray-600">Add to posts, pages, or widgets</p>
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
            clerkPublishableKey: 'YOUR_CLERK_PUBLISHABLE_KEY',
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
                    clerkPublishableKey: 'YOUR_CLERK_PUBLISHABLE_KEY',
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
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                                        <CodeBracketIcon className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900">React / Next.js Integration</h3>
                                        <p className="text-gray-600">Component-based integration</p>
                                    </div>
                                </div>

                                <Step number={1} title="Create Widget Component">
                                    <CodeBlock
                                        language="typescript"
                                        filename="components/AlHayatGPTWidget.tsx"
                                        code={`'use client';

import React, { useEffect, useRef } from 'react';

interface LanguageDetection {
    language: string;
    direction: 'ltr' | 'rtl';
    confidence: number;
}

interface AlHayatGPTConfig {
    containerId: string;
    clerkPublishableKey: string;
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
    }
}

interface Props {
    height?: string;
}

export default function AlHayatGPTWidget({ height = '600px' }: Props): React.ReactElement {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetRef = useRef<AlHayatGPTWidget | null>(null);

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://www.alhayatgpt.com/widget-sdk.min.js';
        script.async = true;
        document.body.appendChild(script);

        const initWidget = (): void => {
            if (window.AlHayatGPT && containerRef.current) {
                widgetRef.current = window.AlHayatGPT.createWidget({
                    containerId: 'chat-widget',
                    clerkPublishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '',
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
            }
        };

        script.onload = () => {
            initWidget();
            window.addEventListener('AlHayatGPTSDKReady', initWidget);
        };

        return () => {
            if (widgetRef.current) {
                try {
                    widgetRef.current.destroy();
                } catch (error) {
                    console.error('Error destroying widget:', error);
                }
            }
            window.removeEventListener('AlHayatGPTSDKReady', initWidget);
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        };
    }, [height]);

    return (
        <div className="w-full" dir="auto" style={{ height }}>
            <div id="chat-widget" ref={containerRef} />
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
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                                        <DocumentDuplicateIcon className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900">HTML / Static Sites Integration</h3>
                                        <p className="text-gray-600">Pure HTML implementation</p>
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
                    clerkPublishableKey: 'YOUR_CLERK_PUBLISHABLE_KEY', // Replace with your key
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
                    clerkPublishableKey: 'YOUR_CLERK_PUBLISHABLE_KEY',
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
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                                        <CommandLineIcon className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900">Angular Integration</h3>
                                        <p className="text-gray-600">Angular component integration</p>
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

  ngOnInit() {
    this.loadSDK();
  }

  ngOnDestroy() {
    if (this.widget) {
      try {
        this.widget.destroy();
      } catch (error) {
        console.error('Error destroying widget:', error);
      }
    }
  }

  private loadSDK() {
    if (window.AlHayatGPT) {
      this.initializeWidget();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://www.alhayatgpt.com/widget-sdk.min.js';
    script.async = true;
    
    script.onload = () => {
      this.initializeWidget();
    };

    document.head.appendChild(script);
    window.addEventListener('AlHayatGPTSDKReady', () => {
      this.initializeWidget();
    });
  }

  private initializeWidget() {
    if (!window.AlHayatGPT) {
      setTimeout(() => this.initializeWidget(), 100);
      return;
    }

    try {
      this.widget = window.AlHayatGPT.createWidget({
        containerId: this.containerId,
        clerkPublishableKey: 'YOUR_CLERK_PUBLISHABLE_KEY',
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
      height="700px"
      width="100%"
      theme="auto"
      borderRadius="20px"
      boxShadow="0 10px 25px -5px rgba(0, 0, 0, 0.2)"
      border="2px solid #3f51b5"
      primaryColor="#3f51b5"
      backgroundColor="#fafafa"
      textColor="#212121"
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
      clerkPublishableKey="YOUR_CLERK_PUBLISHABLE_KEY"
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
                <div className="mt-16">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-100">
                        <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                            <Cog6ToothIcon className="h-7 w-7 text-blue-600" />
                            Quick Implementation Summary
                        </h3>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* WordPress */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm">
                                <h4 className="font-bold text-gray-900 mb-3 text-lg">WordPress</h4>
                                <ol className="text-sm text-gray-600 space-y-2">
                                    <li><strong>1.</strong> Add functions.php code</li>
                                    <li><strong>2.</strong> Add CSS to Additional CSS</li>
                                    <li><strong>3.</strong> Use shortcode: <code>[ahgpt_widget]</code></li>
                                    <li><strong>4.</strong> Configure Clerk key in settings</li>
                                </ol>
                            </div>

                            {/* React/Next.js */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm">
                                <h4 className="font-bold text-gray-900 mb-3 text-lg">React/Next.js</h4>
                                <ol className="text-sm text-gray-600 space-y-2">
                                    <li><strong>1.</strong> Create widget component</li>
                                    <li><strong>2.</strong> Create CSS file</li>
                                    <li><strong>3.</strong> Import styles in app</li>
                                    <li><strong>4.</strong> Add environment variables</li>
                                </ol>
                            </div>

                            {/* HTML/Static */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm">
                                <h4 className="font-bold text-gray-900 mb-3 text-lg">HTML/Static</h4>
                                <ol className="text-sm text-gray-600 space-y-2">
                                    <li><strong>1.</strong> Create CSS file</li>
                                    <li><strong>2.</strong> Link CSS in HTML head</li>
                                    <li><strong>3.</strong> Add widget div + script</li>
                                    <li><strong>4.</strong> Replace Clerk key</li>
                                </ol>
                            </div>

                            {/* Angular */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm">
                                <h4 className="font-bold text-gray-900 mb-3 text-lg">Angular</h4>
                                <ol className="text-sm text-gray-600 space-y-2">
                                    <li><strong>1.</strong> Create component files</li>
                                    <li><strong>2.</strong> Add to app module</li>
                                    <li><strong>3.</strong> Add CSS styles</li>
                                    <li><strong>4.</strong> Use in template</li>
                                </ol>
                            </div>
                        </div>

                        {/* Key Features Reminder */}
                        <div className="mt-8 grid md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <GlobeAltIcon className="h-8 w-8 text-blue-600" />
                                </div>
                                <h5 className="font-semibold text-gray-900 mb-2">Auto Language Detection</h5>
                                <p className="text-sm text-gray-600">Automatically detects user language and switches RTL/LTR direction</p>
                            </div>

                            <div className="text-center">
                                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Cog6ToothIcon className="h-8 w-8 text-purple-600" />
                                </div>
                                <h5 className="font-semibold text-gray-900 mb-2">Full Customization</h5>
                                <p className="text-sm text-gray-600">Customize colors, fonts, layout, and behavior via CSS and configuration</p>
                            </div>

                            <div className="text-center">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <CodeBracketIcon className="h-8 w-8 text-green-600" />
                                </div>
                                <h5 className="font-semibold text-gray-900 mb-2">Easy Integration</h5>
                                <p className="text-sm text-gray-600">Works with all platforms - just copy, paste, and customize</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Configuration Options */}
                <div className="mt-16">
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                        <h3 className="text-2xl font-bold text-gray-900 mb-8">Complete Configuration Options</h3>

                        {/* Layout & Appearance */}
                        <div className="mb-8">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Layout & Appearance</h4>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <h5 className="font-semibold text-gray-900 mb-2">theme</h5>
                                    <p className="text-sm text-gray-600 mb-2">Visual appearance</p>
                                    <code className="text-xs bg-white px-2 py-1 rounded">auto | light | dark | custom</code>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <h5 className="font-semibold text-gray-900 mb-2">width / height</h5>
                                    <p className="text-sm text-gray-600 mb-2">Widget dimensions</p>
                                    <code className="text-xs bg-white px-2 py-1 rounded">CSS values (px, %, vh, etc.)</code>
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
                                    code={`// Example: Custom chat bubble colors
window.AlHayatGPT.createWidget({
    containerId: 'chat-widget',
    clerkPublishableKey: 'YOUR_KEY',
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
                                    code={`// Example: Full brand color scheme
window.AlHayatGPT.createWidget({
    containerId: 'chat-widget',
    clerkPublishableKey: 'YOUR_KEY',
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
                                    code={`// Example: Dark theme
window.AlHayatGPT.createWidget({
    containerId: 'chat-widget',
    clerkPublishableKey: 'YOUR_KEY',
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
                                    code={`// Example: Floating widget with custom positioning
window.AlHayatGPT.createWidget({
    containerId: 'floating-chat',
    clerkPublishableKey: 'YOUR_KEY',
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

                            {/* Multi-language Example */}
                            <div className="mb-6 p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-100">
                                <h5 className="font-semibold text-gray-900 mb-3">Multi-language Configuration</h5>
                                <CodeBlock
                                    language="javascript"
                                    code={`// Example: Multi-language support with RTL
window.AlHayatGPT.createWidget({
    containerId: 'chat-widget',
    clerkPublishableKey: 'YOUR_KEY',
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
widget.on('themeChanged', (theme) => console.log('Theme:', theme));`}
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
                <div className="mt-16 text-center">
                    <div className="bg-blue-50 rounded-3xl p-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Need Help?</h3>
                        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                            If you encounter any issues during integration or need custom implementation support,
                            we&apos;re here to help you get Al Hayat GPT running on your website.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                                Contact Support
                            </button>
                            <button className="px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-xl hover:bg-blue-50 transition-colors">
                                View Documentation
                            </button>
                        </div>
                    </div>
                </div>
            </div >
        </div >
    );
}
