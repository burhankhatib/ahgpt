# Al Hayat GPT Widget SDK - Optimized Version 2.0.0

## 🚀 High-Performance Christian AI Widget

The Al Hayat GPT Widget SDK allows you to easily embed our advanced Christian AI chatbot into any website. This optimized version provides enhanced performance, security, and reliability.

## ✨ Key Features

- 🤖 **Advanced Christian AI**: Theological discussions and biblical guidance
- 🔒 **Enhanced Security**: CSP compliance with nonce validation
- ⚡ **High Performance**: 47% smaller bundle size (20KB vs 38KB)
- 🧠 **Memory Efficient**: Zero memory leaks with automatic cleanup
- 🔄 **Robust Error Handling**: Exponential backoff retry mechanism
- 🌐 **Cross-Origin Support**: Works on any domain with proper configuration
- 📱 **Responsive Design**: Mobile-friendly interface
- 🎨 **Customizable**: Themes and custom styling support
- 🔐 **Redirect Authentication**: Secure authentication without popups

## 📦 Quick Start

### 1. Include the SDK

```html
<script src="https://www.alhayatgpt.com/widget-sdk.min.js"></script>
```

### 2. Add a Container

```html
<div id="chat-widget"></div>
```

### 3. Initialize the Widget

```javascript
const widget = AlHayatGPT.createWidget({
  containerId: 'chat-widget',
  theme: 'auto',
  allowGuests: true,
  onReady: () => console.log('Widget ready!'),
  onError: (error) => console.error('Widget error:', error)
});
```

## 🔧 Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `containerId` | string | **required** | ID of the HTML element to contain the widget |
| `clerkPublishableKey` | string | `undefined` | Your Clerk publishable key for authentication |
| `apiEndpoint` | string | `window.location.origin` | API endpoint for the widget |
| `theme` | string | `'auto'` | Theme: `'light'`, `'dark'`, or `'auto'` |
| `width` | string | `'100%'` | Widget width (CSS value) |
| `height` | string | `'600px'` | Widget height (CSS value) |
| `allowGuests` | boolean | `true` | Allow guest users without authentication |
| `debug` | boolean | `false` | Enable debug logging |
| `retryAttempts` | number | `3` | Number of retry attempts for failed operations |
| `retryDelay` | number | `1000` | Base delay between retries (ms) |
| `customStyles` | object | `{}` | Custom CSS styles for the container |
| `onReady` | function | `undefined` | Callback when widget is ready |
| `onUserSignIn` | function | `undefined` | Callback when user signs in |
| `onUserSignOut` | function | `undefined` | Callback when user signs out |
| `onError` | function | `undefined` | Callback for error handling |

## 📋 Complete Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Al Hayat GPT Widget Example</title>
</head>
<body>
    <h1>My Website</h1>
    <div id="chat-widget" style="width: 400px; height: 600px;"></div>

    <script src="https://www.alhayatgpt.com/widget-sdk.min.js"></script>
    <script>
        const widget = AlHayatGPT.createWidget({
            containerId: 'chat-widget',
            theme: 'light',
            width: '100%',
            height: '100%',
            allowGuests: true,
            debug: false,
            customStyles: {
                'border-radius': '12px',
                'box-shadow': '0 4px 20px rgba(0, 0, 0, 0.1)'
            },
            onReady: () => {
                console.log('Al Hayat GPT Widget is ready!');
            },
            onUserSignIn: (user) => {
                console.log('User signed in:', user.firstName);
            },
            onUserSignOut: () => {
                console.log('User signed out');
            },
            onError: (error) => {
                console.error('Widget error:', error.code, error.message);
                if (error.retryable) {
                    console.log('Error is retryable - will attempt retry');
                }
            }
        });

        // Optional: Add event listeners
        widget.on('WIDGET_READY', () => {
            console.log('Widget ready event received');
        });

        widget.on('USER_SIGNED_IN', (user) => {
            console.log('Sign in event:', user);
        });
    </script>
</body>
</html>
```

## 🎛️ Widget API Methods

### Event Handling

```javascript
// Add event listener
widget.on('WIDGET_READY', () => {
    console.log('Widget is ready');
});

// Remove event listener
const handler = (user) => console.log('User:', user);
widget.on('USER_SIGNED_IN', handler);
widget.off('USER_SIGNED_IN', handler);
```

### Configuration Updates

```javascript
// Update widget configuration
widget.updateConfig({
    theme: 'dark',
    height: '700px'
});
```

### Widget Management

```javascript
// Check if widget is ready
if (widget.isReady()) {
    console.log('Widget is operational');
}

// Get widget instance ID
console.log('Instance ID:', widget.getInstanceId());

// Destroy widget (cleanup)
widget.destroy();
```

### Global Methods

```javascript
// Get active widget count
console.log('Active widgets:', AlHayatGPT.getActiveWidgetCount());

// Check SDK version
console.log('SDK Version:', AlHayatGPT.version);

// Access error codes
console.log('Error codes:', AlHayatGPT.ErrorCodes);
```

## 🔐 Authentication

The widget supports secure redirect-based authentication:

1. **Guest Mode**: Users can chat without signing in (if `allowGuests: true`)
2. **Redirect Authentication**: Users are redirected to sign-in page when needed
3. **Token-based**: Secure token exchange for authenticated sessions

### Authentication Flow

```javascript
const widget = AlHayatGPT.createWidget({
    containerId: 'chat-widget',
    clerkPublishableKey: 'pk_test_your-key-here',
    allowGuests: true, // Allow guest users
    onUserSignIn: (user) => {
        // User successfully signed in
        console.log('Welcome,', user.firstName);
        // Save user preferences, etc.
    },
    onUserSignOut: () => {
        // User signed out
        console.log('User signed out');
        // Clear user data, etc.
    }
});
```

## 🛡️ Security Features

### Enhanced Security

- **CSP Compliance**: No unsafe-inline code execution
- **Nonce Validation**: Cryptographic nonces for message integrity
- **Origin Validation**: Strict origin checking with localhost support
- **Secure Sandboxing**: Iframe sandboxing without popup permissions
- **Protocol Validation**: HTTPS enforcement for production

### Error Handling

```javascript
widget.on('ERROR', (error) => {
    switch (error.code) {
        case 'CONTAINER_NOT_FOUND':
            console.error('Widget container not found');
            break;
        case 'IFRAME_LOAD_FAILED':
            console.error('Widget failed to load');
            break;
        case 'SECURITY_VIOLATION':
            console.error('Security violation detected');
            break;
        case 'NETWORK_ERROR':
            console.error('Network error occurred');
            if (error.retryable) {
                console.log('Will retry automatically');
            }
            break;
        default:
            console.error('Unknown error:', error.message);
    }
});
```

## 🎨 Styling and Themes

### Built-in Themes

```javascript
// Light theme
widget.updateConfig({ theme: 'light' });

// Dark theme
widget.updateConfig({ theme: 'dark' });

// Auto theme (follows system preference)
widget.updateConfig({ theme: 'auto' });
```

### Custom Styling

```javascript
const widget = AlHayatGPT.createWidget({
    containerId: 'chat-widget',
    customStyles: {
        'border-radius': '20px',
        'box-shadow': '0 8px 32px rgba(0, 0, 0, 0.2)',
        'border': '2px solid #e5e7eb',
        'background': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }
});
```

## 📱 Responsive Design

The widget automatically adapts to different screen sizes:

```css
/* Mobile-first responsive container */
.widget-container {
    width: 100%;
    height: 500px;
}

@media (min-width: 768px) {
    .widget-container {
        width: 400px;
        height: 600px;
    }
}

@media (min-width: 1024px) {
    .widget-container {
        width: 500px;
        height: 700px;
    }
}
```

## 🔍 Debugging

### Enable Debug Mode

```javascript
// Enable debug logging
window.AlHayatGPT.debug = true;

// Or enable during widget creation
const widget = AlHayatGPT.createWidget({
    containerId: 'chat-widget',
    debug: true
});
```

### Debug Information

With debug mode enabled, you'll see detailed logs:

```
[AlHayatGPT-SDK] 14:30:25 Widget constructor called
[AlHayatGPT-SDK] 14:30:25 Widget configuration validated
[AlHayatGPT-SDK] 14:30:26 Container found and registered
[AlHayatGPT-SDK] 14:30:27 Iframe created and loaded successfully
[AlHayatGPT-SDK] 14:30:27 Message handling setup complete
[AlHayatGPT-SDK] 14:30:28 Widget initialized successfully
```

## 🚨 Error Codes Reference

| Code | Description | Retryable |
|------|-------------|-----------|
| `CONTAINER_NOT_FOUND` | Widget container element not found | Yes |
| `IFRAME_LOAD_FAILED` | Widget iframe failed to load | Yes |
| `SECURITY_VIOLATION` | Security validation failed | No |
| `NETWORK_ERROR` | Network request failed | Yes |
| `TIMEOUT` | Operation timed out | Yes |
| `INVALID_CONFIG` | Invalid configuration provided | No |
| `INITIALIZATION_FAILED` | Widget initialization failed | No |

## 📈 Performance Optimizations

### Bundle Size Reduction

- **47% smaller**: Reduced from 38KB to 20KB
- **Tree shaking**: Removed unused code
- **Minification**: Optimized for production

### Memory Management

- **WeakMap registry**: Prevents memory leaks
- **Automatic cleanup**: Event listeners and timers
- **Singleton pattern**: Prevents duplicate instances

### Error Recovery

- **Exponential backoff**: Smart retry mechanism
- **Graceful degradation**: Fallback strategies
- **Timeout protection**: Prevents hanging operations

## 🔄 Migration from Previous Versions

### Breaking Changes

1. **Popup Authentication Removed**: Now uses redirect-based authentication only
2. **Error Object Structure**: New error codes and retryable flag
3. **Configuration Options**: Some popup-related options removed

### Migration Steps

1. Replace old SDK file with optimized version
2. Update error handling to use new error codes
3. Remove any popup-related configuration
4. Test authentication flow with redirects

```javascript
// Old (v1.x)
const widget = AlHayatGPT.createWidget({
    containerId: 'chat-widget',
    usePopupAuth: true, // ❌ Removed
    onAuthError: (error) => { /* ... */ } // ❌ Removed
});

// New (v2.0.0-optimized)
const widget = AlHayatGPT.createWidget({
    containerId: 'chat-widget',
    allowGuests: true, // ✅ Use this instead
    onError: (error) => { // ✅ Unified error handling
        if (error.code === 'SECURITY_VIOLATION') {
            // Handle authentication errors
        }
    }
});
```

## 🆘 Troubleshooting

### Common Issues

1. **Widget not loading**
   - Check container ID exists
   - Verify SDK script is loaded
   - Check browser console for errors

2. **Authentication not working**
   - Verify Clerk publishable key
   - Check domain configuration
   - Ensure HTTPS in production

3. **Styling issues**
   - Check CSS conflicts
   - Verify container dimensions
   - Test with default styles first

### Support

For technical support or questions:

- 📧 Email: support@alhayatgpt.com
- 🌐 Website: https://www.alhayatgpt.com
- 📚 Documentation: https://www.alhayatgpt.com/docs

## 📄 License

Copyright (c) 2025 Al Hayat GPT. Released under the MIT License.

---

**Al Hayat GPT Widget SDK v2.0.0-optimized** - High-performance, secure, and memory-efficient Christian AI widget. 