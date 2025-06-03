# Al Hayat GPT Widget SDK Installation Guide

This guide provides step-by-step instructions for implementing the Al Hayat GPT Widget SDK on different types of websites.

## Table of Contents
1. [Normal HTML Website](#1-normal-html-website)
2. [WordPress](#2-wordpress)
3. [Next.js](#3-nextjs)
4. [Additional Resources](#additional-resources)

---

## 1. Normal HTML Website

### Basic Implementation

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Website with Al Hayat GPT</title>
    
    <!-- Widget Styles -->
    <style>
        #chat-widget-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 350px;
            height: 500px;
            z-index: 1000;
            transition: all 0.3s ease;
        }
        
        @media (max-width: 768px) {
            #chat-widget-container {
                width: 100%;
                height: 100%;
                bottom: 0;
                right: 0;
                border-radius: 0;
            }
        }
    </style>
</head>
<body>
    <h1>Welcome to My Website</h1>
    <p>This is a sample page with the Al Hayat GPT widget.</p>
    
    <!-- Widget Container -->
    <div id="chat-widget-container"></div>
    
    <!-- Widget SDK -->
    <script src="https://www.alhayatgpt.com/widget-sdk.min.js"></script>
    
    <!-- Widget Initialization -->
    <script>
        window.addEventListener('AlHayatGPTSDKReady', function() {
            const widget = AlHayatGPT.createWidget({
                containerId: "chat-widget-container",
                clerkPublishableKey: "your-clerk-key", // Replace with your Clerk key
                theme: "auto",
                onReady: function() {
                    console.log("Widget is ready!");
                }
            });
        });
    </script>
</body>
</html>
```

### Advanced Implementation with Authentication

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Website with Al Hayat GPT</title>
    
    <!-- Widget Styles -->
    <style>
        #chat-widget-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 350px;
            height: 500px;
            z-index: 1000;
            transition: all 0.3s ease;
        }
        
        @media (max-width: 768px) {
            #chat-widget-container {
                width: 100%;
                height: 100%;
                bottom: 0;
                right: 0;
                border-radius: 0;
            }
        }
    </style>
</head>
<body>
    <h1>Welcome to My Website</h1>
    <p>This is a sample page with the Al Hayat GPT widget.</p>
    
    <!-- Widget Container -->
    <div id="chat-widget-container"></div>
    
    <!-- Widget SDK -->
    <script src="https://www.alhayatgpt.com/widget-sdk.min.js"></script>
    
    <!-- Widget Initialization -->
    <script>
        window.addEventListener('AlHayatGPTSDKReady', function() {
            const widget = AlHayatGPT.createWidget({
                containerId: "chat-widget-container",
                clerkPublishableKey: "your-clerk-key", // Replace with your Clerk key
                theme: "auto",
                onReady: function() {
                    console.log("Widget is ready!");
                },
                onUserSignIn: function(user) {
                    console.log("User signed in:", user);
                },
                onUserSignOut: function() {
                    console.log("User signed out");
                },
                onError: function(error) {
                    console.error("Widget error:", error);
                }
            });
            
            // Listen for custom events
            widget.on("MESSAGE_SENT", function(payload) {
                console.log("Message sent:", payload);
            });
            
            widget.on("MESSAGE_RECEIVED", function(payload) {
                console.log("Message received:", payload);
            });
        });
    </script>
</body>
</html>
```

---

## 2. WordPress

### Using a Custom HTML Block

1. Go to your WordPress admin panel
2. Edit the page where you want to add the widget
3. Add a "Custom HTML" block
4. Paste the following code:

```html
<!-- Widget Container -->
<div id="chat-widget-container"></div>

<!-- Widget SDK -->
<script src="https://www.alhayatgpt.com/widget-sdk.min.js"></script>

<!-- Widget Initialization -->
<script>
    window.addEventListener('AlHayatGPTSDKReady', function() {
        const widget = AlHayatGPT.createWidget({
            containerId: "chat-widget-container",
            clerkPublishableKey: "your-clerk-key", // Replace with your Clerk key
            theme: "auto",
            onReady: function() {
                console.log("Widget is ready!");
            }
        });
    });
</script>
```

### Using a Custom Plugin

1. Create a new file named `alhayat-gpt-widget.php` in your WordPress plugins directory
2. Paste the following code:

```php
<?php
/*
Plugin Name: Al Hayat GPT Widget
Description: Adds the Al Hayat GPT Widget to your WordPress site
Version: 1.0
Author: Your Name
*/

function alhayat_gpt_widget_enqueue_scripts() {
    // Enqueue the widget SDK
    wp_enqueue_script('alhayat-gpt-widget', 'https://www.alhayatgpt.com/widget-sdk.min.js', array(), '1.0', true);
    
    // Enqueue the widget initialization script
    wp_enqueue_script('alhayat-gpt-widget-init', plugin_dir_url(__FILE__) . 'widget-init.js', array('alhayat-gpt-widget'), '1.0', true);
    
    // Add the widget container to the footer
    add_action('wp_footer', 'alhayat_gpt_widget_container');
}
add_action('wp_enqueue_scripts', 'alhayat_gpt_widget_enqueue_scripts');

function alhayat_gpt_widget_container() {
    echo '<div id="chat-widget-container"></div>';
}
```

3. Create a new file named `widget-init.js` in the same directory:

```javascript
window.addEventListener('AlHayatGPTSDKReady', function() {
    const widget = AlHayatGPT.createWidget({
        containerId: "chat-widget-container",
        clerkPublishableKey: "your-clerk-key", // Replace with your Clerk key
        theme: "auto",
        onReady: function() {
            console.log("Widget is ready!");
        }
    });
});
```

4. Activate the plugin in your WordPress admin panel

### Using a Theme's `functions.php`

1. Go to your WordPress admin panel
2. Navigate to Appearance > Theme Editor
3. Select your theme's `functions.php` file
4. Add the following code:

```php
function alhayat_gpt_widget_enqueue_scripts() {
    // Enqueue the widget SDK
    wp_enqueue_script('alhayat-gpt-widget', 'https://www.alhayatgpt.com/widget-sdk.min.js', array(), '1.0', true);
    
    // Enqueue the widget initialization script
    wp_enqueue_script('alhayat-gpt-widget-init', get_template_directory_uri() . '/widget-init.js', array('alhayat-gpt-widget'), '1.0', true);
    
    // Add the widget container to the footer
    add_action('wp_footer', 'alhayat_gpt_widget_container');
}
add_action('wp_enqueue_scripts', 'alhayat_gpt_widget_enqueue_scripts');

function alhayat_gpt_widget_container() {
    echo '<div id="chat-widget-container"></div>';
}
```

5. Create a new file named `widget-init.js` in your theme directory:

```javascript
window.addEventListener('AlHayatGPTSDKReady', function() {
    const widget = AlHayatGPT.createWidget({
        containerId: "chat-widget-container",
        clerkPublishableKey: "your-clerk-key", // Replace with your Clerk key
        theme: "auto",
        onReady: function() {
            console.log("Widget is ready!");
        }
    });
});
```

---

## 3. Next.js

### Basic Implementation

1. Create a new component for the widget:

```jsx
// components/AlHayatGPTWidget.jsx
import { useEffect } from 'react';

export default function AlHayatGPTWidget() {
    useEffect(() => {
        // Load the widget SDK
        const script = document.createElement('script');
        script.src = 'https://www.alhayatgpt.com/widget-sdk.min.js';
        script.async = true;
        document.body.appendChild(script);

        // Initialize the widget when the SDK is ready
        script.onload = () => {
            window.addEventListener('AlHayatGPTSDKReady', () => {
                const widget = window.AlHayatGPT.createWidget({
                    containerId: "chat-widget-container",
                    clerkPublishableKey: "your-clerk-key", // Replace with your Clerk key
                    theme: "auto",
                    onReady: () => {
                        console.log("Widget is ready!");
                    }
                });
            });
        };

        // Clean up
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    return <div id="chat-widget-container" />;
}
```

2. Use the component in your page:

```jsx
// pages/index.js
import AlHayatGPTWidget from '../components/AlHayatGPTWidget';

export default function Home() {
    return (
        <div>
            <h1>Welcome to My Website</h1>
            <p>This is a sample page with the Al Hayat GPT widget.</p>
            <AlHayatGPTWidget />
        </div>
    );
}
```

### Advanced Implementation with Authentication

1. Create a new component for the widget:

```jsx
// components/AlHayatGPTWidget.jsx
import { useEffect, useRef } from 'react';

export default function AlHayatGPTWidget() {
    const widgetRef = useRef(null);

    useEffect(() => {
        // Load the widget SDK
        const script = document.createElement('script');
        script.src = 'https://www.alhayatgpt.com/widget-sdk.min.js';
        script.async = true;
        document.body.appendChild(script);

        // Initialize the widget when the SDK is ready
        script.onload = () => {
            window.addEventListener('AlHayatGPTSDKReady', () => {
                widgetRef.current = window.AlHayatGPT.createWidget({
                    containerId: "chat-widget-container",
                    clerkPublishableKey: "your-clerk-key", // Replace with your Clerk key
                    theme: "auto",
                    onReady: () => {
                        console.log("Widget is ready!");
                    },
                    onUserSignIn: (user) => {
                        console.log("User signed in:", user);
                    },
                    onUserSignOut: () => {
                        console.log("User signed out");
                    },
                    onError: (error) => {
                        console.error("Widget error:", error);
                    }
                });

                // Listen for custom events
                widgetRef.current.on("MESSAGE_SENT", (payload) => {
                    console.log("Message sent:", payload);
                });

                widgetRef.current.on("MESSAGE_RECEIVED", (payload) => {
                    console.log("Message received:", payload);
                });
            });
        };

        // Clean up
        return () => {
            if (widgetRef.current) {
                widgetRef.current.destroy();
            }
            document.body.removeChild(script);
        };
    }, []);

    return <div id="chat-widget-container" />;
}
```

2. Use the component in your page:

```jsx
// pages/index.js
import AlHayatGPTWidget from '../components/AlHayatGPTWidget';

export default function Home() {
    return (
        <div>
            <h1>Welcome to My Website</h1>
            <p>This is a sample page with the Al Hayat GPT widget.</p>
            <AlHayatGPTWidget />
        </div>
    );
}
```

### Using a Custom Hook

1. Create a new hook for the widget:

```jsx
// hooks/useAlHayatGPTWidget.js
import { useEffect, useRef } from 'react';

export default function useAlHayatGPTWidget(options) {
    const widgetRef = useRef(null);

    useEffect(() => {
        // Load the widget SDK
        const script = document.createElement('script');
        script.src = 'https://www.alhayatgpt.com/widget-sdk.min.js';
        script.async = true;
        document.body.appendChild(script);

        // Initialize the widget when the SDK is ready
        script.onload = () => {
            window.addEventListener('AlHayatGPTSDKReady', () => {
                widgetRef.current = window.AlHayatGPT.createWidget({
                    containerId: "chat-widget-container",
                    ...options
                });
            });
        };

        // Clean up
        return () => {
            if (widgetRef.current) {
                widgetRef.current.destroy();
            }
            document.body.removeChild(script);
        };
    }, [options]);

    return widgetRef.current;
}
```

2. Use the hook in your component:

```jsx
// components/AlHayatGPTWidget.jsx
import useAlHayatGPTWidget from '../hooks/useAlHayatGPTWidget';

export default function AlHayatGPTWidget() {
    const widget = useAlHayatGPTWidget({
        clerkPublishableKey: "your-clerk-key", // Replace with your Clerk key
        theme: "auto",
        onReady: () => {
            console.log("Widget is ready!");
        }
    });

    return <div id="chat-widget-container" />;
}
```

3. Use the component in your page:

```jsx
// pages/index.js
import AlHayatGPTWidget from '../components/AlHayatGPTWidget';

export default function Home() {
    return (
        <div>
            <h1>Welcome to My Website</h1>
            <p>This is a sample page with the Al Hayat GPT widget.</p>
            <AlHayatGPTWidget />
        </div>
    );
}
```

---

## Additional Resources

- [Al Hayat GPT Widget SDK Documentation](https://www.alhayatgpt.com/docs/widget-sdk)
- [Clerk Authentication Documentation](https://clerk.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [WordPress Documentation](https://wordpress.org/documentation/)

## Configuration Options

The widget supports the following configuration options:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `containerId` | string | required | The ID of the container element |
| `clerkPublishableKey` | string | undefined | Your Clerk publishable key for authentication |
| `theme` | string | "auto" | The theme of the widget ("light", "dark", or "auto") |
| `width` | string | "100%" | The width of the widget |
| `height` | string | "600px" | The height of the widget |
| `allowGuests` | boolean | true | Whether to allow guest users |
| `onReady` | function | undefined | Callback when the widget is ready |
| `onUserSignIn` | function | undefined | Callback when a user signs in |
| `onUserSignOut` | function | undefined | Callback when a user signs out |
| `onError` | function | undefined | Callback when an error occurs |

## Event Handling

The widget supports the following events:

| Event | Description |
|-------|-------------|
| `WIDGET_READY` | Fired when the widget is ready |
| `USER_SIGNED_IN` | Fired when a user signs in |
| `USER_SIGNED_OUT` | Fired when a user signs out |
| `RESIZE` | Fired when the widget is resized |
| `ERROR` | Fired when an error occurs |
| `MESSAGE_SENT` | Fired when a message is sent |
| `MESSAGE_RECEIVED` | Fired when a message is received |

## Troubleshooting

### Common Issues and Solutions

#### "Failed to initialize Al Hayat GPT widget after multiple attempts"

This error typically occurs when:

1. **Container element not found**: Make sure the container element exists in the DOM before initializing the widget.
   ```javascript
   // Wait for DOM to be ready
   document.addEventListener('DOMContentLoaded', function() {
       const widget = AlHayatGPT.createWidget({
           containerId: "chat-widget-container"
       });
   });
   ```

2. **Network connectivity issues**: Ensure the widget endpoint is accessible.
   ```javascript
   // Test connectivity
   fetch('https://www.alhayatgpt.com/widget/chat')
       .then(response => console.log('Widget endpoint accessible'))
       .catch(error => console.error('Network issue:', error));
   ```

3. **CORS issues**: If testing locally, make sure to test on a proper HTTP server, not file:// protocol.

#### "AlHayatGPT is not defined"

This means the SDK script hasn't loaded yet:

```javascript
// Wait for SDK to load
window.addEventListener('AlHayatGPTSDKReady', function() {
    const widget = AlHayatGPT.createWidget({
        containerId: "chat-widget-container"
    });
});
```

#### Widget not displaying

1. Check if the container has proper styling:
   ```css
   #chat-widget-container {
       width: 350px;
       height: 500px;
       position: fixed;
       bottom: 20px;
       right: 20px;
       z-index: 1000;
   }
   ```

2. Verify the container ID matches exactly:
   ```html
   <div id="chat-widget-container"></div>
   ```

#### Widget iframe not loading

1. Check browser security settings and popup blockers
2. Verify the domain is accessible
3. Check for Content Security Policy (CSP) restrictions

### Configuration Options for Error Handling

You can customize the retry behavior:

```javascript
const widget = AlHayatGPT.createWidget({
    containerId: "chat-widget-container",
    retryAttempts: 5,        // Default: 3
    retryDelay: 3000,        // Default: 2000ms
    onError: function(error) {
        console.error('Widget error:', error);
        // Handle error (show fallback UI, etc.)
    }
});
```

### General Troubleshooting Steps

1. Check the browser console for error messages
2. Ensure the container ID exists in your HTML
3. Verify that the SDK script loaded correctly
4. Make sure your Clerk publishable key is correct (if using authentication)
5. Test with a simple HTML page first
6. Ensure you're not blocking third-party cookies or iframes
7. Check your website's Content Security Policy (CSP) settings

### Testing the Widget

You can test the widget with this simple HTML page:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Widget Test</title>
</head>
<body>
    <div id="test-container" style="width:350px;height:500px;border:1px solid #ccc;"></div>
    <script src="https://www.alhayatgpt.com/widget-sdk.min.js"></script>
    <script>
        window.addEventListener('AlHayatGPTSDKReady', function() {
            console.log('SDK loaded, version:', AlHayatGPT.version);
            const widget = AlHayatGPT.createWidget({
                containerId: "test-container",
                onReady: () => console.log('Widget ready!'),
                onError: (error) => console.error('Widget error:', error)
            });
        });
    </script>
</body>
</html>
```

## Support

For additional support, please contact:
- Email: support@alhayatgpt.com
- Website: https://www.alhayatgpt.com/support 