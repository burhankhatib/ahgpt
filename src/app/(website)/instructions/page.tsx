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
        <div className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-lg">
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

                {/* Universal Widget Code */}
                <div className="bg-blue-50 rounded-3xl p-8 mb-16">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Universal Widget Code</h3>
                    <p className="text-gray-600 mb-6">
                        This code works on any website. Customize the parameters as needed:
                    </p>

                    <CodeBlock
                        language="html"
                        code={`<!-- Al Hayat GPT Widget -->
<div id="ahgpt-widget-container" style="width: 100%; height: 600px; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden;">
    <iframe 
        src="https://ahgpt.vercel.app/widget/chat?theme=auto&allowGuests=true&parentOrigin=${typeof window !== 'undefined' ? encodeURIComponent(window.location.origin) : 'YOUR_DOMAIN'}&version=2.0.0-stable"
        width="100%" 
        height="100%" 
        frameborder="0"
        style="border: none; border-radius: 16px;"
        allow="clipboard-write"
        title="Al Hayat GPT Chat">
    </iframe>
</div>

<script>
// Optional: Listen for widget events
window.addEventListener('message', function(event) {
    if (event.origin !== 'https://ahgpt.vercel.app') return;
    
    switch(event.data.type) {
        case 'WIDGET_READY':
            console.log('Al Hayat GPT widget is ready');
            break;
        case 'USER_SIGNED_IN':
            console.log('User signed in:', event.data.payload);
            break;
        case 'RESIZE':
            // Optional: Handle widget resize
            const container = document.getElementById('ahgpt-widget-container');
            if (container && event.data.payload.height) {
                container.style.height = event.data.payload.height + 'px';
            }
            break;
    }
});
</script>`}
                    />
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
<div class="ahgpt-widget" style="width: 100%; height: 600px; margin: 20px 0; border: 1px solid #ddd; border-radius: 16px; overflow: hidden;">
    <iframe 
        src="https://ahgpt.vercel.app/widget/chat?theme=auto&allowGuests=true&parentOrigin=<?php echo urlencode(home_url()); ?>&version=2.0.0-stable"
        width="100%" 
        height="100%" 
        frameborder="0"
        style="border: none;"
        allow="clipboard-write"
        title="Al Hayat GPT Chat">
    </iframe>
</div>`}
                                    />
                                </Step>

                                <Step number={2} title="Add to Theme (functions.php)">
                                    <p className="text-gray-600 mb-4">
                                        For site-wide integration, add this to your theme&apos;s functions.php:
                                    </p>
                                    <CodeBlock
                                        language="php"
                                        filename="functions.php"
                                        code={`<?php
// Add Al Hayat GPT Widget Shortcode
function ahgpt_widget_shortcode($atts) {
    $atts = shortcode_atts(array(
        'height' => '600',
        'theme' => 'auto',
        'allow_guests' => 'true'
    ), $atts);
    
    $widget_url = sprintf(
        'https://ahgpt.vercel.app/widget/chat?theme=%s&allowGuests=%s&parentOrigin=%s&version=2.0.0-stable',
        $atts['theme'],
        $atts['allow_guests'],
        urlencode(home_url())
    );
    
    return sprintf(
        '<div class="ahgpt-widget" style="width: 100%%; height: %spx; border: 1px solid #ddd; border-radius: 16px; overflow: hidden;">
            <iframe src="%s" width="100%%" height="100%%" frameborder="0" style="border: none;" allow="clipboard-write" title="Al Hayat GPT Chat"></iframe>
        </div>',
        $atts['height'],
        $widget_url
    );
}
add_shortcode('ahgpt_widget', 'ahgpt_widget_shortcode');

// Usage: [ahgpt_widget height="500" theme="auto" allow_guests="true"]
?>`}
                                    />
                                </Step>

                                <Step number={3} title="Widget Areas">
                                    <p className="text-gray-600 mb-4">
                                        Add to sidebars or widget areas using the Custom HTML widget with the iframe code above.
                                    </p>
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
                                        filename="components/AhgptWidget.tsx"
                                        code={`import React, { useEffect, useRef, useState } from 'react';

interface AhgptWidgetProps {
    height?: string;
    theme?: 'auto' | 'light' | 'dark';
    allowGuests?: boolean;
    className?: string;
}

export default function AhgptWidget({ 
    height = '600px', 
    theme = 'auto', 
    allowGuests = true,
    className = ''
}: AhgptWidgetProps) {
    const [parentOrigin, setParentOrigin] = useState('');
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setParentOrigin(encodeURIComponent(window.location.origin));
        }

        // Listen for widget events
        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== 'https://ahgpt.vercel.app') return;
            
            switch(event.data.type) {
                case 'WIDGET_READY':
                    console.log('Al Hayat GPT widget is ready');
                    break;
                case 'USER_SIGNED_IN':
                    console.log('User signed in:', event.data.payload);
                    break;
                case 'RESIZE':
                    // Handle widget resize if needed
                    break;
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const widgetUrl = \`https://ahgpt.vercel.app/widget/chat?theme=\${theme}&allowGuests=\${allowGuests}&parentOrigin=\${parentOrigin}&version=2.0.0-stable\`;

    return (
        <div 
            className={\`ahgpt-widget-container \${className}\`}
            style={{ 
                width: '100%', 
                height, 
                border: '1px solid #e5e7eb', 
                borderRadius: '16px', 
                overflow: 'hidden' 
            }}
        >
            <iframe
                ref={iframeRef}
                src={widgetUrl}
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 'none' }}
                allow="clipboard-write"
                title="Al Hayat GPT Chat"
            />
        </div>
    );
}`}
                                    />
                                </Step>

                                <Step number={2} title="Use in Your App">
                                    <CodeBlock
                                        language="typescript"
                                        filename="pages/index.tsx or app/page.tsx"
                                        code={`import AhgptWidget from '@/components/AhgptWidget';

export default function HomePage() {
    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8">
                Welcome to Our Website
            </h1>
            
            {/* Al Hayat GPT Widget */}
            <div className="max-w-4xl mx-auto">
                <AhgptWidget 
                    height="700px"
                    theme="auto"
                    allowGuests={true}
                    className="shadow-lg"
                />
            </div>
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
<html lang="en">
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
            border: 1px solid #e5e7eb;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
    </style>
</head>
<body>
    <div class="ahgpt-container">
        <h1>Christian AI Assistant</h1>
        
        <!-- Al Hayat GPT Widget -->
        <div class="ahgpt-widget">
            <iframe 
                src="https://ahgpt.vercel.app/widget/chat?theme=auto&allowGuests=true&parentOrigin=YOUR_DOMAIN&version=2.0.0-stable"
                width="100%" 
                height="100%" 
                frameborder="0"
                style="border: none;"
                allow="clipboard-write"
                title="Al Hayat GPT Chat">
            </iframe>
        </div>
    </div>

    <script>
        // Set correct parent origin
        document.addEventListener('DOMContentLoaded', function() {
            const iframe = document.querySelector('.ahgpt-widget iframe');
            const currentOrigin = encodeURIComponent(window.location.origin);
            const src = iframe.src.replace('YOUR_DOMAIN', currentOrigin);
            iframe.src = src;
        });

        // Listen for widget events
        window.addEventListener('message', function(event) {
            if (event.origin !== 'https://ahgpt.vercel.app') return;
            
            console.log('Widget event:', event.data.type, event.data.payload);
        });
    </script>
</body>
</html>`}
                                    />
                                </Step>

                                <Step number={2} title="Responsive Design">
                                    <CodeBlock
                                        language="css"
                                        filename="styles.css"
                                        code={`/* Responsive Al Hayat GPT Widget */
.ahgpt-widget {
    width: 100%;
    height: 600px;
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
    .ahgpt-widget {
        height: 500px;
        border-radius: 12px;
        margin: 0 -10px;
        width: calc(100% + 20px);
    }
}

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) {
    .ahgpt-widget {
        height: 550px;
    }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
    .ahgpt-widget {
        border-color: #374151;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
    }
}`}
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

@Component({
  selector: 'app-ahgpt-widget',
  template: \`
    <div class="ahgpt-widget-container" [style.height]="height">
      <iframe
        #widgetIframe
        [src]="widgetUrl"
        width="100%"
        height="100%"
        frameborder="0"
        style="border: none; border-radius: 16px;"
        allow="clipboard-write"
        title="Al Hayat GPT Chat">
      </iframe>
    </div>
  \`,
  styles: [\`
    .ahgpt-widget-container {
      width: 100%;
      border: 1px solid #e5e7eb;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
  \`]
})
export class AhgptWidgetComponent implements OnInit, OnDestroy {
  @Input() height: string = '600px';
  @Input() theme: 'auto' | 'light' | 'dark' = 'auto';
  @Input() allowGuests: boolean = true;

  @ViewChild('widgetIframe') iframe!: ElementRef<HTMLIFrameElement>;

  widgetUrl: string = '';
  private messageListener?: (event: MessageEvent) => void;

  ngOnInit() {
    this.setupWidgetUrl();
    this.setupMessageListener();
  }

  ngOnDestroy() {
    if (this.messageListener) {
      window.removeEventListener('message', this.messageListener);
    }
  }

  private setupWidgetUrl() {
    const parentOrigin = encodeURIComponent(window.location.origin);
    this.widgetUrl = \`https://ahgpt.vercel.app/widget/chat?theme=\${this.theme}&allowGuests=\${this.allowGuests}&parentOrigin=\${parentOrigin}&version=2.0.0-stable\`;
  }

  private setupMessageListener() {
    this.messageListener = (event: MessageEvent) => {
      if (event.origin !== 'https://ahgpt.vercel.app') return;
      
      switch(event.data.type) {
        case 'WIDGET_READY':
          console.log('Al Hayat GPT widget is ready');
          break;
        case 'USER_SIGNED_IN':
          console.log('User signed in:', event.data.payload);
          break;
        case 'RESIZE':
          // Handle widget resize if needed
          break;
      }
    };

    window.addEventListener('message', this.messageListener);
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
                                        code={`<div class="container">
  <h1>Welcome to Our Christian Community</h1>
  
  <!-- Al Hayat GPT Widget -->
  <div class="widget-section">
    <app-ahgpt-widget 
      height="700px"
      theme="auto"
      [allowGuests]="true">
    </app-ahgpt-widget>
  </div>
</div>`}
                                    />
                                </Step>
                            </div>
                        )}
                    </div>
                </div>

                {/* Configuration Options */}
                <div className="mt-16">
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Configuration Options</h3>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <h4 className="font-semibold text-gray-900 mb-2">theme</h4>
                                <p className="text-sm text-gray-600 mb-2">Visual appearance</p>
                                <code className="text-xs bg-white px-2 py-1 rounded">auto | light | dark</code>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-xl">
                                <h4 className="font-semibold text-gray-900 mb-2">allowGuests</h4>
                                <p className="text-sm text-gray-600 mb-2">Guest mode access</p>
                                <code className="text-xs bg-white px-2 py-1 rounded">true | false</code>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-xl">
                                <h4 className="font-semibold text-gray-900 mb-2">parentOrigin</h4>
                                <p className="text-sm text-gray-600 mb-2">Your domain for security</p>
                                <code className="text-xs bg-white px-2 py-1 rounded">https://yoursite.com</code>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-xl">
                                <h4 className="font-semibold text-gray-900 mb-2">version</h4>
                                <p className="text-sm text-gray-600 mb-2">Widget version</p>
                                <code className="text-xs bg-white px-2 py-1 rounded">2.0.0-stable</code>
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
            </div>
        </div>
    );
}