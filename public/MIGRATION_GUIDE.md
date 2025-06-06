# 🚀 Migration Guide: Updating to Optimized SDK v2.0.0

## ⚠️ Important: Required Changes for Existing Users

If you're currently using the Al Hayat GPT Widget SDK on your website, you **must** make these changes to continue using the widget properly.

## 📋 Quick Migration Checklist

- [ ] Update SDK script URL
- [ ] Remove popup authentication configuration
- [ ] Update error handling code
- [ ] Test authentication flow
- [ ] Verify widget functionality

## 🔄 Step-by-Step Migration

### 1. Update the SDK Script URL

**Old (v1.x):**
```html
<script src="https://www.alhayatgpt.com/widget-sdk.js"></script>
<!-- OR -->
<script src="https://www.alhayatgpt.com/widget-sdk-stable.js"></script>
```

**New (v2.0.0-optimized):**
```html
<script src="https://www.alhayatgpt.com/widget-sdk.min.js"></script>
```

### 2. Remove Popup Authentication Configuration

**❌ Old Configuration (REMOVE THESE):**
```javascript
const widget = AlHayatGPT.createWidget({
    containerId: 'chat-widget',
    usePopupAuth: true,        // ❌ REMOVE - No longer supported
    fallbackToGuest: true,     // ❌ REMOVE - Use allowGuests instead
    onAuthError: (error) => {  // ❌ REMOVE - Use onError instead
        console.error('Auth error:', error);
    }
});
```

**✅ New Configuration:**
```javascript
const widget = AlHayatGPT.createWidget({
    containerId: 'chat-widget',
    allowGuests: true,         // ✅ Use this instead of fallbackToGuest
    onError: (error) => {      // ✅ Unified error handling
        console.error('Widget error:', error.code, error.message);
        if (error.retryable) {
            console.log('Error is retryable - will attempt retry');
        }
    }
});
```

### 3. Update Error Handling

**❌ Old Error Handling:**
```javascript
widget.on('AUTH_ERROR', (error) => {
    if (error.type === 'POPUP_BLOCKED') {
        alert('Please allow popups for authentication');
    }
});
```

**✅ New Error Handling:**
```javascript
widget.on('ERROR', (error) => {
    switch (error.code) {
        case 'SECURITY_VIOLATION':
            console.error('Authentication or security issue');
            // Handle authentication errors here
            break;
        case 'CONTAINER_NOT_FOUND':
            console.error('Widget container not found');
            break;
        case 'NETWORK_ERROR':
            console.error('Network error occurred');
            if (error.retryable) {
                console.log('Will retry automatically');
            }
            break;
        default:
            console.error('Widget error:', error.message);
    }
});
```

### 4. Authentication Flow Changes

**Before (Popup Authentication):**
- Users clicked sign-in → popup window opened
- Authentication happened in popup
- Popup closed automatically

**Now (Redirect Authentication):**
- Users click sign-in → redirected to sign-in page
- Authentication happens on the main page
- User is redirected back with authentication token

**No code changes needed** - the widget handles this automatically!

### 5. Complete Migration Example

**❌ Old Implementation:**
```html
<!DOCTYPE html>
<html>
<head>
    <title>My Website</title>
</head>
<body>
    <div id="chat-widget"></div>
    
    <!-- Old SDK -->
    <script src="https://www.alhayatgpt.com/widget-sdk.js"></script>
    <script>
        const widget = AlHayatGPT.createWidget({
            containerId: 'chat-widget',
            usePopupAuth: true,           // ❌ Remove
            fallbackToGuest: true,        // ❌ Remove
            onReady: () => console.log('Ready'),
            onAuthError: (error) => {     // ❌ Remove
                if (error.type === 'POPUP_BLOCKED') {
                    alert('Please allow popups');
                }
            }
        });
        
        // Old error handling
        widget.on('AUTH_ERROR', (error) => {  // ❌ Remove
            console.error('Auth failed:', error);
        });
    </script>
</body>
</html>
```

**✅ New Implementation:**
```html
<!DOCTYPE html>
<html>
<head>
    <title>My Website</title>
</head>
<body>
    <div id="chat-widget"></div>
    
    <!-- New optimized SDK -->
    <script src="https://www.alhayatgpt.com/widget-sdk.min.js"></script>
    <script>
        const widget = AlHayatGPT.createWidget({
            containerId: 'chat-widget',
            allowGuests: true,            // ✅ New option
            clerkPublishableKey: 'your-key', // Optional for auth
            onReady: () => console.log('Ready'),
            onError: (error) => {         // ✅ Unified error handling
                console.error('Widget error:', error.code, error.message);
                if (error.retryable) {
                    console.log('Will retry automatically');
                }
            }
        });
        
        // New error handling
        widget.on('ERROR', (error) => {   // ✅ New error handling
            console.error('Error:', error.code);
        });
    </script>
</body>
</html>
```

## 🆕 New Features & Benefits

### Performance Improvements
- **47% smaller bundle size** (38KB → 20KB)
- **Faster loading** and initialization
- **Better memory management** with automatic cleanup

### Enhanced Security
- **No popup blockers** - authentication works on all browsers
- **CSP compliance** - works with strict Content Security Policies
- **Enhanced origin validation** with cryptographic nonces

### Better Error Handling
- **Retry mechanism** with exponential backoff
- **Detailed error codes** for better debugging
- **Graceful degradation** when errors occur

## 🔍 Testing Your Migration

### 1. Basic Functionality Test
```javascript
// Test widget creation
const widget = AlHayatGPT.createWidget({
    containerId: 'chat-widget',
    debug: true, // Enable for testing
    onReady: () => console.log('✅ Widget ready'),
    onError: (error) => console.error('❌ Error:', error)
});

// Test widget methods
console.log('Widget ready:', widget.isReady());
console.log('Instance ID:', widget.getInstanceId());
```

### 2. Authentication Test
```javascript
const widget = AlHayatGPT.createWidget({
    containerId: 'chat-widget',
    clerkPublishableKey: 'your-clerk-key',
    allowGuests: true,
    onUserSignIn: (user) => {
        console.log('✅ User signed in:', user.firstName);
    },
    onUserSignOut: () => {
        console.log('✅ User signed out');
    }
});
```

### 3. Error Handling Test
```javascript
// Test error handling
widget.on('ERROR', (error) => {
    console.log('Error code:', error.code);
    console.log('Error message:', error.message);
    console.log('Is retryable:', error.retryable);
});
```

## 🚨 Common Migration Issues

### Issue 1: Widget Not Loading
**Symptoms:** Console error "AlHayatGPT is not defined"
**Solution:** Make sure you've updated the script URL to the new SDK

### Issue 2: Authentication Popup Errors
**Symptoms:** Console errors about popup methods
**Solution:** Remove all `usePopupAuth` and popup-related configuration

### Issue 3: Error Handling Not Working
**Symptoms:** Old error handlers not being called
**Solution:** Update to use the new unified `onError` callback and error codes

### Issue 4: Configuration Errors
**Symptoms:** Console warnings about unknown configuration options
**Solution:** Remove deprecated options like `usePopupAuth`, `fallbackToGuest`

## 📞 Support During Migration

If you encounter issues during migration:

1. **Enable Debug Mode:**
   ```javascript
   const widget = AlHayatGPT.createWidget({
       containerId: 'chat-widget',
       debug: true // This will show detailed logs
   });
   ```

2. **Check Browser Console:** Look for error messages and warnings

3. **Test in Private/Incognito Mode:** This helps identify caching issues

4. **Contact Support:**
   - 📧 Email: support@alhayatgpt.com
   - Include your browser console logs
   - Mention you're migrating to the optimized SDK

## ⏱️ Migration Timeline

**Recommended Timeline:**
- **Week 1-2:** Update and test on development/staging environment
- **Week 3:** Deploy to production during low-traffic period
- **Week 4:** Monitor and address any issues

**Urgent Migration:** If you need to migrate immediately:
1. Update script URL
2. Remove popup configuration
3. Test basic functionality
4. Deploy and monitor

## 🎉 Migration Complete!

Once you've completed these steps:

✅ Your widget will be **47% faster** to load  
✅ **Zero popup blockers** will interfere  
✅ **Better error handling** will improve user experience  
✅ **Enhanced security** will protect your users  
✅ **Automatic retries** will handle network issues  

---

**Need help?** Contact us at support@alhayatgpt.com with "SDK Migration" in the subject line. 