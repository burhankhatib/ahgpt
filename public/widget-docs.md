# Al Hayat GPT Widget SDK

The Al Hayat GPT Widget SDK allows you to easily embed the Al Hayat GPT chat functionality into any website.

## Quick Start

### 1. Include the SDK

Add the widget SDK script to your HTML page:

```html
<script src="https://www.alhayatgpt.com/widget-sdk.min.js"></script>
```

### 2. Create a Container

Add a container element where you want the widget to appear:

```html
<div id="chat-widget"></div>
```

### 3. Initialize the Widget

```html
<script>
  const widget = AlHayatGPT.createWidget({
    containerId: 'chat-widget',
    theme: 'auto', // 'light', 'dark', or 'auto'
    allowGuests: true, // Allow users to chat without signing in
    onReady: () => {
      console.log('Widget is ready!');
    }
  });
</script>
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `containerId` | string | **required** | ID of the HTML element where the widget will be rendered |
| `clerkPublishableKey` | string | optional | Your Clerk publishable key for user authentication |
| `apiEndpoint` | string | `'https://www.alhayatgpt.com'` | The API endpoint for the widget |
| `theme` | string | `'auto'` | Widget theme: `'light'`, `'dark'`, or `'auto'` |
| `width` | string | `'100%'` | Widget width (CSS value) |
| `height` | string | `'600px'` | Widget height (CSS value) |
| `allowGuests` | boolean | `true` | Whether to allow guest users (without authentication) |
| `customStyles` | object | `{}` | Custom CSS styles to apply to the widget container |
| `onReady` | function | optional | Callback when widget is ready |
| `onUserSignIn` | function | optional | Callback when user signs in |
| `onUserSignOut` | function | optional | Callback when user signs out |
| `onError` | function | optional | Callback when an error occurs |

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
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
    </style>
</head>
<body>
    <h1>Welcome to My Website</h1>
    <p>Chat with our AI assistant below:</p>
    
    <div id="chat-widget"></div>

    <script src="https://www.alhayatgpt.com/widget-sdk.min.js"></script>
    <script>
        const widget = AlHayatGPT.createWidget({
            containerId: 'chat-widget',
            clerkPublishableKey: 'pk_test_your-clerk-key-here', // Optional
            theme: 'auto',
            width: '100%',
            height: '500px',
            allowGuests: true,
            customStyles: {
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            },
            onReady: () => {
                console.log('Al Hayat GPT widget is ready!');
            },
            onUserSignIn: (user) => {
                console.log('User signed in:', user.firstName);
                // You can track this event in your analytics
            },
            onUserSignOut: () => {
                console.log('User signed out');
            },
            onError: (error) => {
                console.error('Widget error:', error.message);
            }
        });
    </script>
</body>
</html>
```

## API Methods

### `widget.on(eventType, handler)`

Listen for widget events:

```javascript
widget.on('WIDGET_READY', () => {
    console.log('Widget is ready');
});

widget.on('USER_SIGNED_IN', (user) => {
    console.log('User signed in:', user);
});
```

### `widget.off(eventType, handler)`

Remove event listener:

```javascript
const handler = (user) => console.log(user);
widget.on('USER_SIGNED_IN', handler);
widget.off('USER_SIGNED_IN', handler);
```

### `widget.sendMessage(type, payload)`

Send a message to the widget:

```javascript
widget.sendMessage('CUSTOM_EVENT', {
    data: 'Hello from parent window'
});
```

### `widget.updateConfig(newConfig)`

Update widget configuration:

```javascript
widget.updateConfig({
    theme: 'dark',
    height: '700px'
});
```

### `widget.destroy()`

Remove the widget from the page:

```javascript
widget.destroy();
```

## Events

The widget emits the following events:

- `WIDGET_READY` - Widget has loaded and is ready to use
- `USER_SIGNED_IN` - User has signed in (payload contains user info)
- `USER_SIGNED_OUT` - User has signed out
- `RESIZE` - Widget wants to resize (payload contains new height)
- `ERROR` - An error occurred (payload contains error info)

## Authentication

### Guest Mode (Default)

By default, the widget allows guest users to chat without authentication:

```javascript
const widget = AlHayatGPT.createWidget({
    containerId: 'chat-widget',
    allowGuests: true // This is the default
});
```

### With Clerk Authentication

To enable user authentication, provide your Clerk publishable key:

```javascript
const widget = AlHayatGPT.createWidget({
    containerId: 'chat-widget',
    clerkPublishableKey: 'pk_test_your-clerk-key-here',
    allowGuests: true // Users can still chat as guests
});
```

## Styling

### Custom Styles

You can apply custom styles to the widget container:

```javascript
const widget = AlHayatGPT.createWidget({
    containerId: 'chat-widget',
    customStyles: {
        borderRadius: '20px',
        border: '2px solid #007bff',
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
    }
});
```

### Responsive Design

The widget is responsive by default. For mobile-friendly layouts:

```css
#chat-widget {
    width: 100%;
    height: 500px;
    max-width: 100%;
}

@media (max-width: 768px) {
    #chat-widget {
        height: 400px;
    }
}
```

## Security

The widget implements several security measures:

- **Origin Verification**: Messages are only accepted from the Al Hayat GPT domain
- **Sandboxed iframe**: The widget runs in a sandboxed iframe with limited permissions
- **HTTPS Only**: All communication is encrypted via HTTPS

## Browser Support

The widget supports all modern browsers:

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Troubleshooting

### Widget Not Loading

1. Check that the SDK script is loaded correctly
2. Verify the container element exists
3. Check browser console for errors

### Authentication Issues

1. Verify your Clerk publishable key is correct
2. Check that your domain is configured in Clerk settings
3. Ensure HTTPS is used in production

### Styling Issues

1. Check for CSS conflicts with your existing styles
2. Use browser dev tools to inspect the widget iframe
3. Apply custom styles through the `customStyles` option

## Support

For support and questions:

- Email: support@alhayatgpt.com
- Documentation: https://www.alhayatgpt.com/docs
- GitHub Issues: [Report a bug](https://github.com/your-repo/issues)

## License

This SDK is released under the MIT License. 