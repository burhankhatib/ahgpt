# Al Hayat GPT Widget SDK

The **Al Hayat GPT Widget SDK** allows you to easily embed our advanced Christian AI chatbot into any website with full authentication support via Clerk.

## 🚀 Quick Start

### Option 1: CDN (Recommended)

```html
<!-- Include the SDK -->
<script src="https://www.alhayatgpt.com/widget-sdk.min.js"></script>

<!-- Create a container -->
<div id="chat-widget"></div>

<script>
const widget = AlHayatGPT.createWidget({
    containerId: 'chat-widget',
    clerkPublishableKey: 'pk_test_your_clerk_key_here',
    apiEndpoint: 'https://www.alhayatgpt.com',
    theme: 'auto',
    width: '100%',
    height: '600px',
    allowGuests: true
});
</script>
```

### Option 2: NPM Package (Coming Soon)

```bash
npm install @alhayat/widget-sdk
```

```javascript
import AlHayatGPT from '@alhayat/widget-sdk';

const widget = AlHayatGPT.createWidget({
    containerId: 'chat-widget',
    // ... configuration
});
```

## 📋 Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `containerId` | `string` | **Required** | ID of the HTML element to contain the widget |
| `clerkPublishableKey` | `string` | `undefined` | Your Clerk publishable key for authentication |
| `apiEndpoint` | `string` | `'https://www.alhayatgpt.com'` | Base URL of your Al Hayat GPT API |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'auto'` | Widget theme |
| `width` | `string` | `'100%'` | Widget width (CSS value) |
| `height` | `string` | `'600px'` | Widget height (CSS value) |
| `allowGuests` | `boolean` | `true` | Allow guest users to chat without signing in |
| `customStyles` | `object` | `{}` | Custom CSS styles for the container |

## 🎯 Event Handlers

### Configuration Events

```javascript
const widget = AlHayatGPT.createWidget({
    containerId: 'chat-widget',
    
    // Widget lifecycle events
    onReady: () => {
        console.log('Widget is ready!');
    },
    
    // Authentication events
    onUserSignIn: (user) => {
        console.log('User signed in:', user);
        // user: { id, firstName, lastName, email }
    },
    
    onUserSignOut: () => {
        console.log('User signed out');
    },
    
    // Error handling
    onError: (error) => {
        console.error('Widget error:', error);
    }
});
```

### Custom Event Listeners

```javascript
// Listen for specific events
widget.on('WIDGET_READY', () => {
    console.log('Widget ready event received');
});

widget.on('USER_SIGNED_IN', (userData) => {
    console.log('User data:', userData);
});

widget.on('RESIZE', (dimensions) => {
    console.log('Widget resized:', dimensions);
});

// Remove event listeners
widget.off('WIDGET_READY', handlerFunction);
```

## 🔧 API Methods

### Send Messages

```javascript
// Send custom messages to the widget
widget.sendMessage('CUSTOM_EVENT', {
    message: 'Hello from parent window!',
    data: { key: 'value' }
});
```

### Update Configuration

```javascript
// Update widget configuration dynamically
widget.updateConfig({
    theme: 'dark',
    allowGuests: false
});
```

### Destroy Widget

```javascript
// Clean up the widget
widget.destroy();
```

## 🎨 Styling & Customization

### Basic Styling

```javascript
const widget = AlHayatGPT.createWidget({
    containerId: 'chat-widget',
    customStyles: {
        borderRadius: '16px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        border: '1px solid #e0e0e0'
    }
});
```

### CSS Customization

```css
/* Target the widget container */
#chat-widget {
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0,0,0,0.12);
}

/* Responsive design */
@media (max-width: 768px) {
    #chat-widget {
        height: 500px;
        border-radius: 12px;
    }
}
```

## 🔐 Authentication Setup

### With Clerk Authentication

1. **Get your Clerk publishable key** from the [Clerk Dashboard](https://dashboard.clerk.dev)

2. **Configure the widget:**

```javascript
const widget = AlHayatGPT.createWidget({
    containerId: 'chat-widget',
    clerkPublishableKey: 'pk_test_your_actual_key_here',
    onUserSignIn: (user) => {
        // Handle user sign-in
        console.log('Welcome,', user.firstName);
    }
});
```

### Guest Mode Only

```javascript
const widget = AlHayatGPT.createWidget({
    containerId: 'chat-widget',
    allowGuests: true,
    // Don't provide clerkPublishableKey for guest-only mode
});
```

## 🌍 Multi-language Support

The widget automatically detects and supports multiple languages:

- **Automatic Language Detection**: Detects user input language
- **RTL Support**: Full support for Arabic, Hebrew, and other RTL languages
- **Multilingual Welcome**: Rotating welcome messages in different languages

```javascript
// The widget automatically adapts to the user's language
// No additional configuration needed
```

## 📱 Responsive Design

The widget is fully responsive and adapts to different screen sizes:

```javascript
const widget = AlHayatGPT.createWidget({
    containerId: 'chat-widget',
    width: '100%',
    height: '600px', // Will adapt on mobile
});
```

### Mobile Optimization

```css
/* Mobile-specific styles */
@media (max-width: 480px) {
    #chat-widget {
        height: 400px;
        border-radius: 0;
        border-left: none;
        border-right: none;
    }
}
```

## 🔒 Security Features

### Origin Validation

The widget automatically validates message origins for security:

```javascript
// Messages are only accepted from trusted origins
// No additional configuration needed
```

### Secure Authentication

- **Cross-domain authentication** via Clerk
- **Secure token handling**
- **HTTPS enforcement**
- **CSRF protection**

## 🚨 Error Handling

### Common Error Scenarios

```javascript
const widget = AlHayatGPT.createWidget({
    containerId: 'chat-widget',
    onError: (error) => {
        switch (error.message) {
            case 'Container not found':
                console.error('Check that the containerId exists');
                break;
            case 'Authentication failed':
                console.error('Check your Clerk configuration');
                break;
            default:
                console.error('Widget error:', error);
        }
    }
});
```

### Graceful Degradation

```javascript
try {
    const widget = AlHayatGPT.createWidget({
        containerId: 'chat-widget',
        // ... configuration
    });
} catch (error) {
    // Fallback: show a contact form or alternative
    document.getElementById('chat-widget').innerHTML = `
        <div style="padding: 20px; text-align: center;">
            <p>Chat temporarily unavailable</p>
            <a href="/contact">Contact us here</a>
        </div>
    `;
}
```

## 🔧 Advanced Usage

### Multiple Widgets

```javascript
// Create multiple widget instances
const chatWidget = AlHayatGPT.createWidget({
    containerId: 'main-chat',
    height: '600px'
});

const supportWidget = AlHayatGPT.createWidget({
    containerId: 'support-chat',
    height: '400px',
    theme: 'dark'
});
```

### Dynamic Widget Creation

```javascript
function createChatWidget(containerId, config = {}) {
    return AlHayatGPT.createWidget({
        containerId,
        clerkPublishableKey: 'pk_test_your_key',
        ...config,
        onReady: () => {
            console.log(`Widget ${containerId} is ready`);
        }
    });
}

// Create widgets dynamically
const widget1 = createChatWidget('chat-1', { theme: 'light' });
const widget2 = createChatWidget('chat-2', { theme: 'dark' });
```

### Integration with Existing Auth

```javascript
// If you have existing authentication
const widget = AlHayatGPT.createWidget({
    containerId: 'chat-widget',
    onUserSignIn: (user) => {
        // Sync with your existing user system
        syncUserWithBackend(user);
    }
});

function syncUserWithBackend(user) {
    fetch('/api/sync-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    });
}
```

## 📊 Analytics & Tracking

### Built-in Analytics

The widget includes built-in analytics tracking:

```javascript
// Analytics are automatically tracked:
// - Message sent/received
// - User sign-in/out
// - Widget interactions
// - Error events
```

### Custom Analytics

```javascript
const widget = AlHayatGPT.createWidget({
    containerId: 'chat-widget',
    onUserSignIn: (user) => {
        // Track with your analytics
        gtag('event', 'chat_signin', {
            user_id: user.id
        });
    }
});
```

## 🌐 CDN & Hosting

### CDN Usage

```html
<!-- Latest version -->
<script src="https://www.alhayatgpt.com/widget-sdk.min.js"></script>

<!-- Specific version (recommended for production) -->
<script src="https://www.alhayatgpt.com/widget-sdk-v1.0.0.min.js"></script>
```

### Self-Hosting

1. Download the widget SDK files
2. Host them on your CDN
3. Update the script src accordingly

## 🔄 Migration Guide

### From iframe to Widget SDK

**Before (iframe):**
```html
<iframe src="https://www.alhayatgpt.com/chat" width="100%" height="600px"></iframe>
```

**After (Widget SDK):**
```html
<script src="https://www.alhayatgpt.com/widget-sdk.min.js"></script>
<div id="chat-widget"></div>
<script>
AlHayatGPT.createWidget({
    containerId: 'chat-widget',
    width: '100%',
    height: '600px'
});
</script>
```

## 🐛 Troubleshooting

### Common Issues

1. **Widget not loading**
   - Check that the container element exists
   - Verify the script is loaded before creating the widget
   - Check browser console for errors

2. **Authentication not working**
   - Verify your Clerk publishable key
   - Check that your domain is configured in Clerk
   - Ensure HTTPS is used in production

3. **Styling issues**
   - Check for CSS conflicts
   - Use browser dev tools to inspect styles
   - Try adding `!important` to custom styles

### Debug Mode

```javascript
const widget = AlHayatGPT.createWidget({
    containerId: 'chat-widget',
    debug: true, // Enable debug logging
    onError: (error) => {
        console.error('Debug info:', error);
    }
});
```

## 📞 Support

- **Documentation**: [https://www.alhayatgpt.com/docs](https://www.alhayatgpt.com/docs)
- **GitHub Issues**: [https://github.com/your-repo/issues](https://github.com/your-repo/issues)
- **Email Support**: support@alhayatgpt.com
- **Discord Community**: [Join our Discord](https://discord.gg/your-invite)

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔄 Changelog

### v1.0.0
- Initial release
- Basic widget functionality
- Clerk authentication integration
- Multi-language support
- Responsive design
- Cross-domain messaging

---

**Made with ❤️ by the Al Hayat GPT Team** 