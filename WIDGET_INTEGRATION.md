# 🔧 Widget Integration Guide - Al Hayat GPT

This guide provides comprehensive instructions for integrating the Al Hayat GPT widget into your website or application.

## 🚀 Quick Start

### Basic Integration

The simplest way to add Al Hayat GPT to your website:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Your Website</title>
</head>
<body>
    <!-- Your website content -->
    
    <!-- Al Hayat GPT Widget Container -->
    <div id="ahgpt-widget"></div>
    
    <!-- Widget SDK -->
    <script src="https://alhayatgpt.com/widget-sdk.js"></script>
    <script>
        AlHayatGPT.init({
            containerId: 'ahgpt-widget',
            domain: 'your-domain.com'
        });
    </script>
</body>
</html>
```

## ⚙️ Configuration Options

### Complete Configuration

```javascript
AlHayatGPT.init({
    // Required
    containerId: 'ahgpt-widget',
    domain: 'your-domain.com',
    
    // Appearance
    theme: 'light', // 'light' | 'dark' | 'auto'
    position: 'bottom-right', // 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center'
    height: '600px',
    width: '400px',
    borderRadius: '12px',
    
    // Behavior
    openByDefault: false,
    showToggleButton: true,
    enableMinimize: true,
    enableFullscreen: true,
    autoDetectLanguage: true,
    
    // Customization
    primaryColor: '#3B82F6',
    headerTitle: 'Al Hayat GPT',
    welcomeMessage: 'Hello! How can I help you today?',
    placeholder: 'Type your message...',
    
    // Advanced
    enableAnalytics: true,
    enableSoundNotifications: false,
    maxMessageLength: 1000,
    typingIndicator: true,
    
    // Callbacks
    onReady: function() {
        console.log('Al Hayat GPT widget is ready');
    },
    onMessage: function(message) {
        console.log('New message:', message);
    },
    onError: function(error) {
        console.error('Widget error:', error);
    }
});
```

### Configuration Options Reference

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `containerId` | string | Required | ID of the container element |
| `domain` | string | Required | Your website domain for authentication |
| `theme` | string | 'light' | Widget theme ('light', 'dark', 'auto') |
| `position` | string | 'bottom-right' | Widget position on screen |
| `height` | string | '600px' | Widget height |
| `width` | string | '400px' | Widget width |
| `openByDefault` | boolean | false | Open widget on page load |
| `showToggleButton` | boolean | true | Show minimize/maximize button |
| `autoDetectLanguage` | boolean | true | Auto-detect user language |
| `primaryColor` | string | '#3B82F6' | Primary color for theming |
| `welcomeMessage` | string | Auto | Custom welcome message |

## 🎨 Styling & Theming

### Custom CSS

You can customize the widget appearance with CSS:

```css
/* Custom widget styling */
.ahgpt-widget {
    font-family: 'Inter', sans-serif;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.ahgpt-widget-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.ahgpt-widget-message {
    animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
```

### Dark Theme

```javascript
AlHayatGPT.init({
    containerId: 'ahgpt-widget',
    domain: 'your-domain.com',
    theme: 'dark',
    primaryColor: '#8B5CF6',
    customCSS: `
        .ahgpt-widget {
            background: #1F2937;
            color: #F9FAFB;
        }
        .ahgpt-message-user {
            background: #8B5CF6;
        }
        .ahgpt-message-ai {
            background: #374151;
        }
    `
});
```

## 🌍 Multi-language Support

### Automatic Language Detection

```javascript
AlHayatGPT.init({
    containerId: 'ahgpt-widget',
    domain: 'your-domain.com',
    autoDetectLanguage: true, // Detects from browser/page language
    fallbackLanguage: 'en'
});
```

### Manual Language Setting

```javascript
AlHayatGPT.init({
    containerId: 'ahgpt-widget',
    domain: 'your-domain.com',
    language: 'ar', // Arabic
    rtl: true, // Enable right-to-left layout
    customMessages: {
        welcome: 'أهلاً وسهلاً! كيف يمكنني مساعدتك؟',
        placeholder: 'اكتب رسالتك هنا...',
        send: 'إرسال'
    }
});
```

### Supported Languages

- English (en)
- Arabic (ar)
- Spanish (es)
- French (fr)
- German (de)
- Chinese (zh)
- Japanese (ja)
- Korean (ko)
- Russian (ru)
- Portuguese (pt)
- Italian (it)
- Dutch (nl)
- Swedish (sv)
- Norwegian (no)
- Finnish (fi)
- Hebrew (he)
- Turkish (tr)
- Hindi (hi)
- Bengali (bn)
- Urdu (ur)

## 📱 Responsive Design

### Mobile Optimization

```javascript
AlHayatGPT.init({
    containerId: 'ahgpt-widget',
    domain: 'your-domain.com',
    responsive: {
        mobile: {
            width: '100vw',
            height: '100vh',
            position: 'fullscreen'
        },
        tablet: {
            width: '400px',
            height: '600px',
            position: 'bottom-right'
        },
        desktop: {
            width: '450px',
            height: '700px',
            position: 'bottom-right'
        }
    }
});
```

### Media Query Integration

```css
/* Responsive widget styles */
@media (max-width: 768px) {
    .ahgpt-widget {
        width: 100% !important;
        height: 100% !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        z-index: 10000 !important;
    }
}

@media (min-width: 769px) and (max-width: 1024px) {
    .ahgpt-widget {
        width: 380px !important;
        height: 550px !important;
    }
}
```

## 🔧 Advanced Integration

### React Integration

```jsx
import React, { useEffect, useRef } from 'react';

const AlHayatGPTWidget = ({ domain, ...config }) => {
    const widgetRef = useRef(null);
    const widgetInstance = useRef(null);

    useEffect(() => {
        // Load widget SDK
        const script = document.createElement('script');
        script.src = 'https://alhayatgpt.com/widget-sdk.js';
        script.onload = () => {
            widgetInstance.current = window.AlHayatGPT.init({
                containerId: widgetRef.current.id,
                domain,
                ...config
            });
        };
        document.body.appendChild(script);

        return () => {
            // Cleanup
            if (widgetInstance.current) {
                widgetInstance.current.destroy();
            }
            document.body.removeChild(script);
        };
    }, [domain, config]);

    return <div ref={widgetRef} id="ahgpt-widget-react" />;
};

export default AlHayatGPTWidget;
```

### Vue.js Integration

```vue
<template>
    <div ref="widgetContainer" id="ahgpt-widget-vue"></div>
</template>

<script>
export default {
    name: 'AlHayatGPTWidget',
    props: {
        domain: {
            type: String,
            required: true
        },
        config: {
            type: Object,
            default: () => ({})
        }
    },
    mounted() {
        this.loadWidget();
    },
    beforeDestroy() {
        if (this.widgetInstance) {
            this.widgetInstance.destroy();
        }
    },
    methods: {
        loadWidget() {
            const script = document.createElement('script');
            script.src = 'https://alhayatgpt.com/widget-sdk.js';
            script.onload = () => {
                this.widgetInstance = window.AlHayatGPT.init({
                    containerId: 'ahgpt-widget-vue',
                    domain: this.domain,
                    ...this.config
                });
            };
            document.body.appendChild(script);
        }
    }
};
</script>
```

### Angular Integration

```typescript
import { Component, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';

@Component({
    selector: 'app-alhayatgpt-widget',
    template: '<div [id]="containerId"></div>'
})
export class AlHayatGPTWidgetComponent implements OnInit, OnDestroy {
    @Input() domain: string;
    @Input() config: any = {};
    
    containerId = 'ahgpt-widget-angular';
    private widgetInstance: any;

    ngOnInit() {
        this.loadWidget();
    }

    ngOnDestroy() {
        if (this.widgetInstance) {
            this.widgetInstance.destroy();
        }
    }

    private loadWidget() {
        const script = document.createElement('script');
        script.src = 'https://alhayatgpt.com/widget-sdk.js';
        script.onload = () => {
            this.widgetInstance = (window as any).AlHayatGPT.init({
                containerId: this.containerId,
                domain: this.domain,
                ...this.config
            });
        };
        document.body.appendChild(script);
    }
}
```

## 🔐 Security & Authentication

### Domain Whitelisting

Ensure your domain is whitelisted for widget usage:

1. **Contact Support**: Email support@alhayatgpt.com
2. **Provide Domain**: Include your full domain (e.g., 'example.com')
3. **Verification**: We'll verify domain ownership
4. **Activation**: Widget will be activated for your domain

### Content Security Policy (CSP)

Add these directives to your CSP header:

```
Content-Security-Policy: 
    script-src 'self' https://alhayatgpt.com;
    connect-src 'self' https://alhayatgpt.com wss://alhayatgpt.com;
    frame-src 'self' https://alhayatgpt.com;
    img-src 'self' data: https://alhayatgpt.com;
```

## 📊 Analytics & Events

### Event Tracking

```javascript
AlHayatGPT.init({
    containerId: 'ahgpt-widget',
    domain: 'your-domain.com',
    enableAnalytics: true,
    onMessage: function(message) {
        // Track message events
        gtag('event', 'chat_message', {
            'event_category': 'Al Hayat GPT',
            'event_label': message.type
        });
    },
    onSessionStart: function() {
        // Track session start
        gtag('event', 'chat_session_start', {
            'event_category': 'Al Hayat GPT'
        });
    }
});
```

### Custom Analytics

```javascript
// Track widget interactions
AlHayatGPT.on('widget:open', function() {
    analytics.track('Widget Opened');
});

AlHayatGPT.on('widget:close', function() {
    analytics.track('Widget Closed');
});

AlHayatGPT.on('message:sent', function(data) {
    analytics.track('Message Sent', {
        messageLength: data.content.length,
        language: data.language
    });
});
```

## 🔧 API Integration

### Widget SDK Methods

```javascript
// Initialize widget
const widget = AlHayatGPT.init(config);

// Control methods
widget.open();           // Open widget
widget.close();          // Close widget
widget.toggle();         // Toggle widget
widget.minimize();       // Minimize widget
widget.maximize();       // Maximize widget
widget.destroy();        // Destroy widget

// Messaging methods
widget.sendMessage('Hello!');                    // Send message
widget.clearHistory();                           // Clear chat history
widget.setTyping(true);                         // Show typing indicator

// Configuration methods
widget.setTheme('dark');                        // Change theme
widget.setLanguage('ar');                       // Change language
widget.updateConfig({ primaryColor: '#FF5722' }); // Update config

// Event listeners
widget.on('ready', callback);
widget.on('message', callback);
widget.on('error', callback);
widget.off('message', callback);                // Remove listener
```

## 🚨 Troubleshooting

### Common Issues

1. **Widget Not Loading**
   ```javascript
   // Check if SDK is loaded
   if (typeof AlHayatGPT === 'undefined') {
       console.error('Al Hayat GPT SDK not loaded');
   }
   
   // Verify domain is whitelisted
   AlHayatGPT.checkDomain('your-domain.com')
       .then(isWhitelisted => {
           if (!isWhitelisted) {
               console.error('Domain not whitelisted');
           }
       });
   ```

2. **Styling Issues**
   ```css
   /* Reset potential conflicts */
   .ahgpt-widget * {
       box-sizing: border-box;
       font-family: inherit;
   }
   
   /* Ensure proper z-index */
   .ahgpt-widget {
       z-index: 999999 !important;
   }
   ```

3. **Performance Issues**
   ```javascript
   // Lazy load widget
   function loadWidgetOnInteraction() {
       document.addEventListener('scroll', function() {
           if (!window.widgetLoaded) {
               loadAlHayatGPTWidget();
               window.widgetLoaded = true;
           }
       }, { once: true });
   }
   ```

### Debug Mode

```javascript
AlHayatGPT.init({
    containerId: 'ahgpt-widget',
    domain: 'your-domain.com',
    debug: true, // Enable debug mode
    onDebug: function(debugInfo) {
        console.log('Debug:', debugInfo);
    }
});
```

## 📞 Support

### Documentation & Resources

- **Widget Demo**: [https://alhayatgpt.com/widget-demo](https://alhayatgpt.com/widget-demo)
- **API Reference**: [https://alhayatgpt.com/api-docs](https://alhayatgpt.com/api-docs)
- **GitHub Issues**: [https://github.com/burhankhatib/ahgpt/issues](https://github.com/burhankhatib/ahgpt/issues)

### Contact Support

- **Email**: widget-support@alhayatgpt.com
- **Technical Issues**: Include domain, browser, and error logs
- **Integration Help**: Provide code snippets and configuration

---

This guide covers everything you need to successfully integrate the Al Hayat GPT widget. For additional customization or enterprise features, please contact our support team. 