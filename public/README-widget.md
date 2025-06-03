# Al Hayat GPT Stable Widget SDK - Integration Guide

## 🎯 Overview

The **Al Hayat GPT Stable Widget SDK v2.0.0** is a production-ready, embeddable chat interface that brings advanced Christian AI conversations to any website. This version specifically addresses cross-origin embedding issues and provides robust authentication through popup windows.

### 🔧 Key Features

- ✅ **Cross-Origin Compatible**: Works on any third-party website
- 🔐 **Popup Authentication**: Solves "refused to connect" errors 
- 🛡️ **Robust Error Handling**: Graceful fallbacks and retry mechanisms
- 🔄 **Auto-Recovery**: Automatic retry with exponential backoff
- 🎨 **Theme Support**: Light, dark, and auto themes
- 📱 **Responsive Design**: Works on all devices
- 🚀 **Performance Optimized**: Fast loading with minimal footprint
- 🔍 **Debug Mode**: Comprehensive logging for troubleshooting

## 🚀 Quick Start

### 1. Basic Integration

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Website with Al Hayat GPT</title>
</head>
<body>
    <h1>Welcome to My Website</h1>
    
    <!-- Widget Container -->
    <div id="chat-widget" style="width: 100%; height: 600px;"></div>
    
    <!-- Widget SDK -->
    <script src="https://www.alhayatgpt.com/widget-sdk-stable.min.js"></script>
    
    <script>
        // Initialize widget when page loads
        document.addEventListener('DOMContentLoaded', function() {
            const widget = AlHayatGPT.createWidget({
                containerId: 'chat-widget',
                theme: 'auto',
                allowGuests: true,
                onReady: function() {
                    console.log('Al Hayat GPT Widget is ready!');
                },
                onError: function(error) {
                    console.error('Widget error:', error);
                }
            });
        });
    </script>
</body>
</html>
```

### 2. Advanced Configuration

```javascript
const widget = AlHayatGPT.createWidget({
    // Required
    containerId: 'chat-widget',
    
    // Appearance
    theme: 'auto',           // 'light', 'dark', 'auto'
    width: '100%',
    height: '600px',
    
    // Authentication
    allowGuests: true,
    usePopupAuth: true,      // Use popup for authentication (recommended)
    fallbackToGuest: true,   // Fallback to guest mode if auth fails
    
    // Behavior
    autoResize: true,        // Auto-resize based on content
    enableRetry: true,       // Enable automatic retry on failure
    retryAttempts: 3,
    retryDelay: 2000,
    
    // Debugging
    debug: false,            // Enable debug logging
    
    // Custom styling
    customStyles: {
        borderRadius: '16px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
        border: '2px solid #e0e0e0'
    },
    
    // Event handlers
    onReady: function() {
        console.log('Widget ready!');
    },
    onUserSignIn: function(user) {
        console.log('User signed in:', user);
    },
    onUserSignOut: function() {
        console.log('User signed out');
    },
    onError: function(error) {
        console.error('Widget error:', error);
    }
});
```

## 📋 Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `containerId` | string | **required** | ID of the HTML element where the widget will render |
| `theme` | string | `'auto'` | Widget theme: `'light'`, `'dark'`, or `'auto'` |
| `width` | string | `'100%'` | Widget width (CSS units) |
| `height` | string | `'600px'` | Widget height (CSS units) |
| `allowGuests` | boolean | `true` | Allow users to chat without signing in |
| `usePopupAuth` | boolean | `true` | Use popup windows for authentication (recommended) |
| `fallbackToGuest` | boolean | `true` | Fallback to guest mode if authentication fails |
| `autoResize` | boolean | `true` | Auto-resize iframe based on content |
| `enableRetry` | boolean | `true` | Enable automatic retry on failure |
| `retryAttempts` | number | `3` | Number of retry attempts |
| `retryDelay` | number | `2000` | Delay between retries (ms) |
| `debug` | boolean | `false` | Enable debug logging |
| `customStyles` | object | `{}` | Custom CSS styles for the widget container |
| `apiEndpoint` | string | `'https://www.alhayatgpt.com'` | Base URL for the widget API |

## 🎭 Event Handlers

### Available Events

```javascript
const widget = AlHayatGPT.createWidget({
    containerId: 'chat-widget',
    
    // Widget lifecycle events
    onReady: function() {
        console.log('Widget is fully loaded and ready');
    },
    
    // Authentication events
    onUserSignIn: function(user) {
        console.log('User signed in:', user);
        // user object: { id, firstName, lastName, email, timestamp }
    },
    
    onUserSignOut: function() {
        console.log('User signed out');
    },
    
    // Error handling
    onError: function(error) {
        console.error('Widget error:', error);
        // error.type: 'POPUP_BLOCKED', 'NETWORK_ERROR', 'AUTH_FAILED', etc.
    }
});
```

### Event Listener API

```javascript
// Add event listeners
widget.on('WIDGET_READY', function() {
    console.log('Widget ready event');
});

widget.on('USER_SIGNED_IN', function(user) {
    console.log('User signed in event:', user);
});

// Remove event listeners
widget.off('WIDGET_READY', handlerFunction);

// One-time event listeners
widget.once('WIDGET_READY', function() {
    console.log('This will only fire once');
});
```

## 🔧 Widget Methods

### Basic Methods

```javascript
// Update configuration
widget.updateConfig({
    theme: 'dark',
    height: '500px'
});

// Authentication
widget.signIn();           // Trigger sign-in popup
widget.signOut();          // Sign out current user

// Status checks
widget.isAuthenticated();  // Returns boolean
widget.isWidgetReady();    // Returns boolean
widget.getUser();          // Returns user object or null
widget.getVersion();       // Returns SDK version

// Communication
widget.sendMessage('CUSTOM_EVENT', { data: 'value' });

// Cleanup
widget.destroy();          // Clean up and remove widget
```

### Method Chaining

```javascript
// Many methods support chaining
widget
    .updateConfig({ theme: 'dark' })
    .on('WIDGET_READY', handleReady)
    .on('ERROR', handleError);
```

## 🎨 Styling and Themes

### Theme Configuration

```javascript
// Auto theme (follows system preference)
widget.updateConfig({ theme: 'auto' });

// Light theme
widget.updateConfig({ theme: 'light' });

// Dark theme
widget.updateConfig({ theme: 'dark' });
```

### Custom Styling

```javascript
const widget = AlHayatGPT.createWidget({
    containerId: 'chat-widget',
    customStyles: {
        borderRadius: '20px',
        boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
        border: '3px solid #4299e1',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '10px'
    }
});
```

### Responsive Design

```css
/* Container styling for responsive design */
#chat-widget {
    width: 100%;
    height: 600px;
    max-width: 100%;
    border-radius: 12px;
    overflow: hidden;
}

/* Tablet */
@media (max-width: 768px) {
    #chat-widget {
        height: 500px;
    }
}

/* Mobile */
@media (max-width: 480px) {
    #chat-widget {
        height: 400px;
    }
}
```

## 🔐 Authentication Flow

### How It Works

1. **Guest Mode**: Users can chat immediately without authentication
2. **Sign-In Trigger**: When user wants to save chats, authentication popup opens
3. **Popup Authentication**: Secure authentication happens in a popup window
4. **Cross-Origin Communication**: Auth status is communicated back to the parent window
5. **Seamless Experience**: User continues chatting with saved history

### Authentication States

```javascript
// Check authentication status
if (widget.isAuthenticated()) {
    const user = widget.getUser();
    console.log(`Welcome back, ${user.firstName}!`);
} else {
    console.log('User is in guest mode');
}

// Listen for authentication changes
widget.on('USER_SIGNED_IN', function(user) {
    // Update UI to show authenticated state
    updateUserInterface(user);
});

widget.on('USER_SIGNED_OUT', function() {
    // Update UI to show guest state
    showGuestInterface();
});
```

## 🛠️ Common Use Cases

### 1. Fixed Position Chat (Bottom Right)

```html
<div id="floating-chat"></div>

<style>
#floating-chat {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 350px;
    height: 500px;
    z-index: 1000;
    border-radius: 12px;
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}
</style>

<script>
AlHayatGPT.createWidget({
    containerId: 'floating-chat',
    theme: 'auto',
    allowGuests: true
});
</script>
```

### 2. Full-Width Embedded Chat

```html
<div id="embedded-chat"></div>

<style>
#embedded-chat {
    width: 100%;
    height: 70vh;
    margin: 20px 0;
    border-radius: 16px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
</style>

<script>
AlHayatGPT.createWidget({
    containerId: 'embedded-chat',
    theme: 'light',
    height: '70vh',
    allowGuests: true
});
</script>
```

### 3. Conditional Loading

```javascript
// Only load widget on certain conditions
if (shouldLoadWidget()) {
    const script = document.createElement('script');
    script.src = 'https://www.alhayatgpt.com/widget-sdk-stable.min.js';
    script.onload = function() {
        AlHayatGPT.createWidget({
            containerId: 'chat-widget',
            theme: 'auto'
        });
    };
    document.head.appendChild(script);
}
```

### 4. Multi-Widget Setup

```javascript
// Multiple widgets on the same page
const widgets = [
    { id: 'chat-widget-1', theme: 'light' },
    { id: 'chat-widget-2', theme: 'dark' }
].map(config => {
    return AlHayatGPT.createWidget({
        containerId: config.id,
        theme: config.theme,
        allowGuests: true
    });
});
```

## 🐛 Error Handling

### Error Types

The SDK provides detailed error types for better debugging:

```javascript
widget.onError = function(error) {
    switch (error.type) {
        case 'CONTAINER_NOT_FOUND':
            console.error('Widget container not found');
            break;
        case 'POPUP_BLOCKED':
            console.error('Authentication popup was blocked');
            showPopupBlockedMessage();
            break;
        case 'NETWORK_ERROR':
            console.error('Network connection issue');
            showNetworkErrorMessage();
            break;
        case 'AUTH_FAILED':
            console.error('Authentication failed');
            break;
        case 'TIMEOUT':
            console.error('Operation timed out');
            break;
        default:
            console.error('Unknown error:', error);
    }
};
```

### Retry Logic

```javascript
// The SDK automatically retries failed operations
const widget = AlHayatGPT.createWidget({
    containerId: 'chat-widget',
    enableRetry: true,
    retryAttempts: 5,        // Try 5 times
    retryDelay: 3000,        // Wait 3 seconds between attempts
    onError: function(error) {
        if (error.isRetrying) {
            console.log('Retrying operation...');
        } else {
            console.error('All retry attempts failed:', error);
        }
    }
});
```

## 🔍 Debugging

### Enable Debug Mode

```javascript
const widget = AlHayatGPT.createWidget({
    containerId: 'chat-widget',
    debug: true,  // Enable detailed logging
    onReady: function() {
        console.log('Widget debug info:', {
            version: widget.getVersion(),
            isReady: widget.isWidgetReady(),
            isAuthenticated: widget.isAuthenticated(),
            user: widget.getUser()
        });
    }
});
```

### Browser Compatibility Check

```javascript
// Check if browser supports the widget
if (AlHayatGPT.isSupported()) {
    console.log('Browser is fully supported');
} else {
    console.warn('Browser may have limited support');
}
```

### Manual Health Check

```javascript
// Monitor widget health
setInterval(() => {
    if (widget.isWidgetReady()) {
        console.log('Widget is responsive');
    } else {
        console.warn('Widget may be unresponsive');
    }
}, 30000); // Check every 30 seconds
```

## 🚀 Performance Optimization

### Lazy Loading

```javascript
// Load widget only when needed
function loadWidget() {
    if (typeof AlHayatGPT === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://www.alhayatgpt.com/widget-sdk-stable.min.js';
        script.async = true;
        script.onload = initWidget;
        document.head.appendChild(script);
    } else {
        initWidget();
    }
}

function initWidget() {
    AlHayatGPT.createWidget({
        containerId: 'chat-widget',
        theme: 'auto'
    });
}

// Load on user interaction
document.getElementById('chat-button').addEventListener('click', loadWidget);
```

### Memory Management

```javascript
// Properly cleanup widgets
window.addEventListener('beforeunload', function() {
    if (widget) {
        widget.destroy();
    }
});

// For SPA (Single Page Applications)
function navigateToNewPage() {
    // Cleanup current widget
    if (widget) {
        widget.destroy();
        widget = null;
    }
    
    // Navigate to new page
    // ... navigation logic
}
```

## 🔒 Security Considerations

### Origin Validation

The SDK automatically validates message origins for security:

```javascript
// All cross-window communication is validated
// Only messages from trusted origins are processed
// No configuration needed - handled automatically
```

### Popup Security

```javascript
// Popup authentication uses secure practices:
// - Validates parent origin
// - Uses secure message passing
// - Automatically closes on completion
// - Handles blocked popups gracefully
```

## 📱 Mobile Optimization

### Touch-Friendly Design

```css
/* Optimize for mobile touch */
#chat-widget {
    width: 100%;
    height: calc(100vh - 100px);
    border-radius: 0; /* Remove border radius on mobile */
}

@media (max-width: 480px) {
    #chat-widget {
        height: calc(100vh - 60px);
        position: fixed;
        top: 60px;
        left: 0;
        right: 0;
        bottom: 0;
    }
}
```

### Mobile-Specific Configuration

```javascript
// Detect mobile and adjust configuration
const isMobile = window.innerWidth < 768;

const widget = AlHayatGPT.createWidget({
    containerId: 'chat-widget',
    theme: 'auto',
    width: '100%',
    height: isMobile ? '100vh' : '600px',
    customStyles: isMobile ? {
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        borderRadius: '0'
    } : {}
});
```

## 🔄 Migration from Previous Versions

### From v1.x to v2.0.0-stable

```javascript
// Old v1.x configuration
const oldWidget = AlHayatGPT.createWidget({
    containerId: 'chat-widget',
    theme: 'auto',
    allowGuests: true
});

// New v2.0.0-stable configuration (recommended)
const newWidget = AlHayatGPT.createWidget({
    containerId: 'chat-widget',
    theme: 'auto',
    allowGuests: true,
    usePopupAuth: true,      // New: Use popup authentication
    fallbackToGuest: true,   // New: Graceful fallback
    enableRetry: true,       // New: Automatic retry
    debug: false             // New: Debug mode
});
```

### Breaking Changes

- **Authentication Flow**: Now uses popup windows instead of iframe embedding
- **Error Handling**: Enhanced error types and retry mechanisms
- **Event Names**: Some internal events renamed (backwards compatible)
- **Configuration**: New options added (all backwards compatible)

## 🆘 Troubleshooting

### Common Issues

#### 1. "Container not found" Error

```javascript
// Make sure container exists before creating widget
document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('chat-widget');
    if (container) {
        AlHayatGPT.createWidget({
            containerId: 'chat-widget'
        });
    } else {
        console.error('Chat widget container not found');
    }
});
```

#### 2. Popup Blocked Error

```javascript
const widget = AlHayatGPT.createWidget({
    containerId: 'chat-widget',
    onError: function(error) {
        if (error.type === 'POPUP_BLOCKED') {
            alert('Please allow popups for authentication');
        }
    }
});
```

#### 3. Network Connection Issues

```javascript
const widget = AlHayatGPT.createWidget({
    containerId: 'chat-widget',
    enableRetry: true,
    retryAttempts: 5,
    onError: function(error) {
        if (error.type === 'NETWORK_ERROR') {
            console.log('Network issue detected, retrying...');
        }
    }
});
```

### Support

For additional support:
- 📧 Email: support@alhayatgpt.com
- 📖 Documentation: https://www.alhayatgpt.com/docs
- 🐛 Issues: Report bugs through your support channel
- 💬 Live Chat: Use the widget on our website!

---

**Al Hayat GPT Stable Widget SDK v2.0.0** - Built for reliability, security, and cross-origin compatibility. 