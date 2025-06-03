# Al Hayat GPT Widget Integration Guide

## Overview

The Al Hayat GPT Widget is a powerful, embeddable chat interface that brings advanced Christian AI conversations to any website. It's easy to integrate and highly customizable.

## Quick Start

### 1. Basic Integration

Add this code to your website:

```html
<!-- Include the Widget SDK -->
<script src="https://www.alhayatgpt.com/widget-sdk.min.js"></script>

<!-- Create a container for the widget -->
<div id="chat-widget"></div>

<!-- Initialize the widget -->
<script>
  AlHayatGPT.createWidget({
    containerId: 'chat-widget',
    theme: 'auto',
    onReady: () => console.log('Widget is ready!'),
    onError: (e) => console.error('Widget error:', e)
  });
</script>
```

### 2. Complete Example

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
    <script src="https://www.alhayatgpt.com/widget-sdk.min.js"></script>
    
    <script>
        // Initialize widget when page loads
        document.addEventListener('DOMContentLoaded', function() {
            AlHayatGPT.createWidget({
                containerId: 'chat-widget',
                theme: 'auto',
                width: '100%',
                height: '600px',
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

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `containerId` | string | **required** | ID of the HTML element where the widget will render |
| `theme` | string | `'auto'` | Widget theme: `'light'`, `'dark'`, or `'auto'` |
| `width` | string | `'100%'` | Widget width (CSS units) |
| `height` | string | `'600px'` | Widget height (CSS units) |
| `allowGuests` | boolean | `true` | Allow users to chat without signing in |
| `apiEndpoint` | string | `'https://www.alhayatgpt.com'` | Base URL for the widget API |
| `clerkPublishableKey` | string | `undefined` | Custom Clerk key for authentication |
| `customStyles` | object | `{}` | Custom CSS styles for the widget container |

## Event Handlers

### Available Events

```javascript
AlHayatGPT.createWidget({
    containerId: 'chat-widget',
    
    // Called when widget is fully loaded and ready
    onReady: function() {
        console.log('Widget is ready!');
    },
    
    // Called when a user signs in
    onUserSignIn: function(user) {
        console.log('User signed in:', user);
        // user object: { id, firstName, lastName, email }
    },
    
    // Called when a user signs out
    onUserSignOut: function() {
        console.log('User signed out');
    },
    
    // Called when an error occurs
    onError: function(error) {
        console.error('Widget error:', error);
    }
});
```

## Advanced Configuration

### Custom Styling

```javascript
const widget = AlHayatGPT.createWidget({
    containerId: 'chat-widget',
    theme: 'light',
    customStyles: {
        borderRadius: '16px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
        border: '2px solid #e0e0e0'
    }
});
```

### Responsive Design

```html
<style>
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
    }
}
</style>
```

## Widget Methods

### Basic Methods

```javascript
const widget = AlHayatGPT.createWidget({ /* config */ });

// Update widget configuration
widget.updateConfig({
    theme: 'dark',
    height: '500px'
});

// Listen to custom events
widget.on('WIDGET_READY', function() {
    console.log('Widget ready event');
});

// Remove event listener
widget.off('WIDGET_READY', handlerFunction);

// Send message to widget
widget.sendMessage('CUSTOM_EVENT', { data: 'value' });

// Destroy widget
widget.destroy();
```

## Common Use Cases

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
    theme: 'auto'
});
</script>
```

### 2. Inline Content Widget

```html
<div class="article-content">
    <h1>My Article</h1>
    <p>Article content...</p>
    
    <!-- Embedded chat widget -->
    <div id="article-chat" style="margin: 40px 0;"></div>
    
    <p>More content...</p>
</div>

<script>
AlHayatGPT.createWidget({
    containerId: 'article-chat',
    width: '100%',
    height: '400px',
    theme: 'light'
});
</script>
```

### 3. Multiple Widgets

```html
<!-- Main chat -->
<div id="main-chat"></div>

<!-- Quick help -->
<div id="quick-help"></div>

<script>
// Main conversation widget
const mainChat = AlHayatGPT.createWidget({
    containerId: 'main-chat',
    height: '600px'
});

// Quick help widget
const quickHelp = AlHayatGPT.createWidget({
    containerId: 'quick-help',
    height: '300px',
    theme: 'dark'
});
</script>
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Security

The widget implements several security measures:

- **Origin Validation**: Messages are validated to prevent XSS attacks
- **HTTPS Required**: Widget requires HTTPS in production
- **Content Security Policy**: Proper CSP headers for iframe security
- **Sandboxing**: Iframe is properly sandboxed

## Troubleshooting

### Widget Not Loading

**Problem**: Widget container is empty or shows error

**Solutions**:
1. Ensure the container element exists before initializing
2. Check browser console for JavaScript errors
3. Verify the SDK script is loaded successfully
4. Check network connectivity to `www.alhayatgpt.com`

```javascript
// Debug initialization
document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('chat-widget');
    if (!container) {
        console.error('Container element not found');
        return;
    }
    
    if (typeof AlHayatGPT === 'undefined') {
        console.error('Widget SDK not loaded');
        return;
    }
    
    AlHayatGPT.createWidget({
        containerId: 'chat-widget',
        onReady: () => console.log('Success!'),
        onError: (e) => console.error('Error:', e)
    });
});
```

### Styling Issues

**Problem**: Widget doesn't match your site's design

**Solutions**:
1. Use `customStyles` option
2. Override CSS with higher specificity
3. Adjust theme setting

```css
/* Override widget styles */
#chat-widget iframe {
    border-radius: 20px !important;
    box-shadow: 0 15px 35px rgba(0,0,0,0.1) !important;
}
```

### Performance Optimization

**Best Practices**:
1. Load widget SDK asynchronously
2. Initialize widget after page load
3. Use `loading="lazy"` for below-fold widgets

```html
<!-- Async loading -->
<script async src="https://www.alhayatgpt.com/widget-sdk.min.js"></script>

<script>
// Wait for SDK to load
function waitForSDK() {
    if (typeof AlHayatGPT !== 'undefined') {
        // Initialize widget
        AlHayatGPT.createWidget({ /* config */ });
    } else {
        setTimeout(waitForSDK, 100);
    }
}

// Start checking after page load
window.addEventListener('load', waitForSDK);
</script>
```

## Support

For technical support or questions:

- **Documentation**: Visit our [integration guide](https://www.alhayatgpt.com/docs)
- **Email**: support@alhayatgpt.com
- **Website**: https://www.alhayatgpt.com

## Examples

See live examples at:
- Basic integration: https://www.alhayatgpt.com/widget-example.html
- Test page: https://www.alhayatgpt.com/test 