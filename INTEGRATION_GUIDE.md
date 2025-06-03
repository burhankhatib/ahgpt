# 🚀 Al Hayat GPT Widget Integration Guide

## Quick Start (3 Steps)

### Step 1: Include the Widget SDK
Add this script tag to your HTML:

```html
<script src="https://www.alhayatgpt.com/widget-sdk.min.js"></script>
```

### Step 2: Create a Container
Add a div where you want the chat widget to appear:

```html
<div id="chat-widget"></div>
```

### Step 3: Initialize the Widget
Add this JavaScript code:

```html
<script>
const widget = AlHayatGPT.createWidget({
    containerId: 'chat-widget',
    clerkPublishableKey: 'pk_test_your_clerk_key_here', // Optional: for user authentication
    apiEndpoint: 'https://www.alhayatgpt.com',
    theme: 'auto', // 'light', 'dark', or 'auto'
    width: '100%',
    height: '600px',
    allowGuests: true // Allow users to chat without signing in
});
</script>
```

## Complete Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Website with Al Hayat GPT</title>
    <style>
        #chat-widget {
            max-width: 800px;
            margin: 20px auto;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
    </style>
</head>
<body>
    <h1>Welcome to My Website</h1>
    <p>Chat with our AI assistant below:</p>
    
    <!-- Widget Container -->
    <div id="chat-widget"></div>
    
    <!-- Widget SDK -->
    <script src="https://www.alhayatgpt.com/widget-sdk.min.js"></script>
    
    <!-- Initialize Widget -->
    <script>
    const widget = AlHayatGPT.createWidget({
        containerId: 'chat-widget',
        clerkPublishableKey: 'pk_test_your_clerk_key_here',
        apiEndpoint: 'https://www.alhayatgpt.com',
        theme: 'auto',
        width: '100%',
        height: '600px',
        allowGuests: true,
        
        // Event handlers (optional)
        onReady: () => {
            console.log('Chat widget is ready!');
        },
        
        onUserSignIn: (user) => {
            console.log('User signed in:', user.firstName);
        },
        
        onError: (error) => {
            console.error('Widget error:', error);
        }
    });
    </script>
</body>
</html>
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `containerId` | string | **Required** | ID of the container element |
| `clerkPublishableKey` | string | `undefined` | Clerk key for authentication |
| `apiEndpoint` | string | `'https://www.alhayatgpt.com'` | Your API base URL |
| `theme` | string | `'auto'` | Theme: 'light', 'dark', 'auto' |
| `width` | string | `'100%'` | Widget width |
| `height` | string | `'600px'` | Widget height |
| `allowGuests` | boolean | `true` | Allow guest users |

## Common Use Cases

### 1. Fixed Position Support Widget
```javascript
const supportWidget = AlHayatGPT.createWidget({
    containerId: 'support-chat',
    height: '400px',
    customStyles: {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '350px',
        zIndex: '1000'
    }
});
```

### 2. Embedded in Content
```javascript
const contentWidget = AlHayatGPT.createWidget({
    containerId: 'article-chat',
    width: '100%',
    height: '500px',
    theme: 'light'
});
```

### 3. Multiple Widgets
```javascript
// Main chat
const mainChat = AlHayatGPT.createWidget({
    containerId: 'main-chat',
    height: '600px'
});

// Quick help
const quickHelp = AlHayatGPT.createWidget({
    containerId: 'quick-help',
    height: '300px',
    theme: 'dark'
});
```

## Event Handling

```javascript
const widget = AlHayatGPT.createWidget({
    containerId: 'chat-widget',
    
    // Lifecycle events
    onReady: () => {
        console.log('Widget ready');
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

// Additional event listeners
widget.on('WIDGET_READY', () => {
    console.log('Widget ready event');
});

widget.on('USER_SIGNED_IN', (userData) => {
    // Sync with your user system
    syncUserWithBackend(userData);
});
```

## Responsive Design

The widget is automatically responsive. For custom responsive behavior:

```css
/* Desktop */
#chat-widget {
    width: 100%;
    height: 600px;
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
        margin: 0 -10px;
    }
}
```

## Authentication Setup

### With Clerk (Recommended)
1. Get your Clerk publishable key from [Clerk Dashboard](https://dashboard.clerk.dev)
2. Add your domain to Clerk's allowed origins
3. Use the key in widget configuration:

```javascript
const widget = AlHayatGPT.createWidget({
    containerId: 'chat-widget',
    clerkPublishableKey: 'pk_test_your_actual_key_here'
});
```

### Guest Mode Only
```javascript
const widget = AlHayatGPT.createWidget({
    containerId: 'chat-widget',
    allowGuests: true
    // Don't include clerkPublishableKey
});
```

## API Methods

```javascript
// Update configuration
widget.updateConfig({
    theme: 'dark',
    allowGuests: false
});

// Send custom messages
widget.sendMessage('CUSTOM_EVENT', {
    message: 'Hello from parent!'
});

// Clean up
widget.destroy();
```

## Troubleshooting

### Widget not loading?
- Check that the container element exists
- Verify the SDK script loads before initialization
- Check browser console for errors

### Authentication not working?
- Verify your Clerk publishable key
- Ensure your domain is configured in Clerk
- Check that you're using HTTPS in production

### Styling issues?
- Use browser dev tools to inspect styles
- Add custom CSS with higher specificity
- Check for CSS conflicts

## Security Features

- ✅ Cross-domain authentication via Clerk
- ✅ Origin validation for security
- ✅ HTTPS enforcement in production
- ✅ Secure iframe sandboxing
- ✅ CSRF protection

## Support

- 📖 Full Documentation: [WIDGET_SDK_README.md](WIDGET_SDK_README.md)
- 🌐 Live Demo: [https://www.alhayatgpt.com/widget-example.html](https://www.alhayatgpt.com/widget-example.html)
- 📧 Email: support@alhayatgpt.com
- 💬 Discord: [Join our community](https://discord.gg/your-invite)

---

**Ready to integrate? Copy the code above and replace the Clerk key with your actual key!** 🚀 