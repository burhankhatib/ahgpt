# 🚀 Al Hayat GPT Widget - Ready to Use Integration Guide

## 🎯 **For Other Websites: How to Add Al Hayat GPT Chat to Your Site**

Your Al Hayat GPT widget is now **LIVE** and ready for integration! Other websites can add your advanced Christian AI chatbot with just 3 lines of code.

---

## 📋 **Quick Integration (Copy & Paste Ready)**

### **Step 1: Add the SDK Script**
```html
<script src="https://www.alhayatgpt.com/widget-sdk.min.js"></script>
```

### **Step 2: Create a Container**
```html
<div id="chat-widget"></div>
```

### **Step 3: Initialize the Widget**
```html
<script>
AlHayatGPT.createWidget({
    containerId: 'chat-widget',
    apiEndpoint: 'https://www.alhayatgpt.com',
    theme: 'auto',
    width: '100%',
    height: '600px',
    allowGuests: true
});
</script>
```

---

## 🌟 **Complete Working Example**

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
    
    <!-- Al Hayat GPT Widget -->
    <div id="chat-widget"></div>
    
    <!-- Widget SDK -->
    <script src="https://www.alhayatgpt.com/widget-sdk.min.js"></script>
    
    <!-- Initialize Widget -->
    <script>
    const widget = AlHayatGPT.createWidget({
        containerId: 'chat-widget',
        apiEndpoint: 'https://www.alhayatgpt.com',
        theme: 'auto',
        width: '100%',
        height: '600px',
        allowGuests: true,
        
        // Optional: Event handlers
        onReady: () => {
            console.log('Al Hayat GPT widget is ready!');
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

---

## ⚙️ **Configuration Options**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `containerId` | string | **Required** | ID of the HTML element |
| `apiEndpoint` | string | `'https://www.alhayatgpt.com'` | Al Hayat GPT API URL |
| `theme` | string | `'auto'` | `'light'`, `'dark'`, or `'auto'` |
| `width` | string | `'100%'` | Widget width |
| `height` | string | `'600px'` | Widget height |
| `allowGuests` | boolean | `true` | Allow users without accounts |
| `clerkPublishableKey` | string | `undefined` | For user authentication |

---

## 🎨 **Popular Use Cases**

### **1. Fixed Support Chat (Bottom Right)**
```javascript
AlHayatGPT.createWidget({
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

### **2. Embedded in Article/Content**
```javascript
AlHayatGPT.createWidget({
    containerId: 'article-chat',
    width: '100%',
    height: '500px',
    theme: 'light'
});
```

### **3. Full-Width Chat Section**
```javascript
AlHayatGPT.createWidget({
    containerId: 'main-chat',
    width: '100%',
    height: '600px',
    theme: 'auto'
});
```

---

## 🔧 **Advanced Features**

### **Event Handling**
```javascript
const widget = AlHayatGPT.createWidget({
    containerId: 'chat-widget',
    
    onReady: () => {
        console.log('Widget loaded successfully');
    },
    
    onUserSignIn: (user) => {
        // Track user engagement
        analytics.track('chat_user_signin', {
            userId: user.id,
            page: window.location.pathname
        });
    },
    
    onError: (error) => {
        console.error('Chat widget error:', error);
    }
});

// Additional event listeners
widget.on('WIDGET_READY', () => {
    console.log('Widget is ready for interaction');
});
```

### **Dynamic Configuration**
```javascript
// Update theme dynamically
widget.updateConfig({ theme: 'dark' });

// Send custom messages
widget.sendMessage('CUSTOM_EVENT', { data: 'value' });

// Clean up when done
widget.destroy();
```

---

## 📱 **Responsive Design**

The widget automatically adapts to screen sizes. For custom responsive behavior:

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

---

## 🔐 **Authentication (Optional)**

### **For Guest Users Only**
```javascript
// Default - no authentication needed
AlHayatGPT.createWidget({
    containerId: 'chat-widget',
    allowGuests: true
});
```

### **With User Authentication**
```javascript
// Requires Clerk setup
AlHayatGPT.createWidget({
    containerId: 'chat-widget',
    clerkPublishableKey: 'pk_test_your_clerk_key_here',
    allowGuests: true // Still allow guests
});
```

---

## ✨ **What You Get**

### **🚀 Features**
- ✅ **Advanced Christian AI** - Specialized in theological discussions
- ✅ **Multi-language Support** - Automatic language detection
- ✅ **Responsive Design** - Works on all devices
- ✅ **Guest Mode** - No signup required
- ✅ **Real-time Chat** - Instant responses
- ✅ **Theme Support** - Light, dark, auto themes
- ✅ **Secure** - Built-in security features

### **🎨 Customization**
- Custom themes and colors
- Configurable dimensions
- Multiple widget instances
- Event-driven integration
- Responsive breakpoints

---

## 🛠️ **Troubleshooting**

### **Widget Not Loading?**
- ✅ Check container element exists: `<div id="chat-widget"></div>`
- ✅ Verify script loads: `https://www.alhayatgpt.com/widget-sdk.min.js`
- ✅ Check browser console for errors

### **Styling Issues?**
- Use browser dev tools to inspect
- Add custom CSS with higher specificity
- Check for CSS conflicts

### **Need Help?**
- 📧 Email: support@alhayatgpt.com
- 🌐 Live Demo: [https://www.alhayatgpt.com/widget-example.html](https://www.alhayatgpt.com/widget-example.html)
- 📖 Full Docs: [WIDGET_SDK_README.md](WIDGET_SDK_README.md)

---

## 🌍 **Live Resources**

- **🎮 Interactive Demo**: [https://www.alhayatgpt.com/widget-example.html](https://www.alhayatgpt.com/widget-example.html)
- **📦 Widget SDK**: [https://www.alhayatgpt.com/widget-sdk.min.js](https://www.alhayatgpt.com/widget-sdk.min.js)
- **🔗 Main Chat**: [https://www.alhayatgpt.com/chat](https://www.alhayatgpt.com/chat)

---

## 🚀 **Ready to Integrate?**

**Copy the code above and paste it into your website. It's that simple!**

Your visitors will have access to Al Hayat GPT's advanced Christian AI chatbot with:
- Theological discussions and debates
- Multi-language support
- Secure, responsive design
- No signup required (guest mode)

**The widget is live and ready to use right now!** 🎉

---

*Made with ❤️ by the Al Hayat GPT Team* 