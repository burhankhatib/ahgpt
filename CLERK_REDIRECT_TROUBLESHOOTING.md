# Clerk Redirect Loop Troubleshooting Guide

## Problem
External websites using your widget are getting this error:
```
clerk.alhayatgpt.com redirected you too many times.
```

## Root Cause
This happens when **Clerk Dashboard is misconfigured** with incorrect domain settings.

## ✅ IMMEDIATE FIX (Critical Steps)

### Step 1: Check Your Clerk Dashboard Configuration

1. **Login to [Clerk Dashboard](https://dashboard.clerk.com)**
2. **Select your project**
3. **Go to "Configure" → "Domains"**

### Step 2: Verify Required Clerk Subdomains

**✅ REQUIRED Clerk subdomains (DO NOT REMOVE):**
- `clerk.alhayatgpt.com` - Frontend API
- `accounts.alhayatgpt.com` - Account portal
- `clkmail.alhayatgpt.com` - Email services
- `clk._domainkey.alhayatgpt.com` - Domain key 1
- `clk2._domainkey.alhayatgpt.com` - Domain key 2

**✅ Also keep:**
- `www.alhayatgpt.com` (your main domain)

**❌ REMOVE any OTHER unknown subdomains that aren't required by Clerk**

### Step 3: Configure Redirect URLs

In Clerk Dashboard → **"Paths"** section:

**✅ Set these URLs:**
```
Sign-in URL: https://www.alhayatgpt.com/sign-in
Sign-up URL: https://www.alhayatgpt.com/sign-up
After sign-in URL: https://www.alhayatgpt.com/chat
After sign-up URL: https://www.alhayatgpt.com/chat
```

**❌ DO NOT use subdomains in any URL**

### Step 4: Update Environment Variables

Make sure your `.env.local` has:
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key
CLERK_SECRET_KEY=sk_test_your_actual_secret
NEXT_PUBLIC_DOMAIN=www.alhayatgpt.com
```

## 🔧 Advanced Troubleshooting

### Test Widget Integration Code

Give your users this **corrected integration code**:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Widget Test</title>
</head>
<body>
    <div id="chat-widget"></div>
    
    <script src="https://www.alhayatgpt.com/widget-sdk.min.js"></script>
    <script>
        const widget = AlHayatGPT.createWidget({
            containerId: 'chat-widget',
            clerkPublishableKey: 'pk_test_YOUR_ACTUAL_KEY_HERE', // Use your real key
            theme: 'auto',
            allowGuests: true,
            onReady: () => {
                console.log('✅ Widget ready!');
            },
            onError: (error) => {
                console.error('❌ Widget error:', error);
            }
        });
    </script>
</body>
</html>
```

### Verify Your Setup

1. **Test locally first:**
   ```bash
   npm run dev
   ```
   Visit: `http://localhost:3000/test-widget.html`

2. **Test on your domain:**
   Visit: `https://www.alhayatgpt.com/test-widget.html`

3. **If both work, the issue is in external site integration**

## 🚨 Common Mistakes That Cause This Error

### ❌ Mistake 1: Wrong Clerk Keys
```javascript
// DON'T use example keys
clerkPublishableKey: 'your_clerk_key_here'

// ✅ USE your actual key
clerkPublishableKey: 'pk_test_actual1234567890abcdef'
```

### ❌ Mistake 2: Subdomain Configuration
```
// ✅ REQUIRED Clerk subdomains (must exist):
clerk.alhayatgpt.com ✅
accounts.alhayatgpt.com ✅
clkmail.alhayatgpt.com ✅
clk._domainkey.alhayatgpt.com ✅
clk2._domainkey.alhayatgpt.com ✅

// ✅ Also required:
www.alhayatgpt.com ✅

// ❌ DON'T add unknown subdomains like:
api.alhayatgpt.com ❌
```

### ❌ Mistake 3: Wrong SDK URL
```html
<!-- DON'T use subdomains -->
<script src="https://clerk.alhayatgpt.com/widget-sdk.min.js"></script> ❌

<!-- ✅ USE main domain -->
<script src="https://www.alhayatgpt.com/widget-sdk.min.js"></script> ✅
```

## 🔍 Debugging Steps

### Step 1: Check Browser Console
Look for these error patterns:
```
- "clerk.alhayatgpt.com redirected you too many times"
- "Failed to load iframe"
- "CORS errors"
```

### Step 2: Check Network Tab
1. Open **Developer Tools** → **Network**
2. Look for **failed requests** to clerk.alhayatgpt.com
3. These should **not exist** - if they do, Clerk is misconfigured

### Step 3: Test Without Authentication
```javascript
// Test widget WITHOUT Clerk first
const widget = AlHayatGPT.createWidget({
    containerId: 'chat-widget',
    // clerkPublishableKey: 'pk_test_...', // Comment this out
    theme: 'auto',
    allowGuests: true
});
```

If this works but adding `clerkPublishableKey` breaks it, the issue is **definitely Clerk configuration**.

## 📋 Verification Checklist

- [ ] Removed all subdomains from Clerk Dashboard
- [ ] Set correct redirect URLs in Clerk Dashboard  
- [ ] Updated `.env.local` with correct values
- [ ] Tested widget locally
- [ ] Tested widget on your main domain
- [ ] Provided users with correct integration code
- [ ] Verified Clerk keys are real (not examples)

## 🆘 Still Having Issues?

### Check These Files on Your Server:

1. **`next.config.ts`** - Should have the redirect rules
2. **`src/middleware.ts`** - Should handle subdomain redirects
3. **`src/utils/domain-config.ts`** - Should exist and be properly configured

### Quick Test Commands:
```bash
# Rebuild and deploy
npm run build
npm run deploy

# Test the widget SDK directly
curl -I https://www.alhayatgpt.com/widget-sdk.min.js
```

### Contact Your Users With:

**"Please use this exact code and replace `pk_test_...` with your actual Clerk key:**

```html
<script src="https://www.alhayatgpt.com/widget-sdk.min.js"></script>
<script>
const widget = AlHayatGPT.createWidget({
    containerId: 'chat-widget',
    clerkPublishableKey: 'pk_test_YOUR_ACTUAL_CLERK_KEY',
    theme: 'auto',
    allowGuests: true
});
</script>
```

**If you're using the example key `your_clerk_key_here`, that's the problem!"**

---

## 🎯 Summary

The redirect loop happens because:
1. **Clerk Dashboard has wrong domain configuration**
2. **External sites are using example keys instead of real ones**
3. **Subdomain redirects are happening when they shouldn't**

Fix your Clerk Dashboard settings first, then provide users with the correct integration code using their real Clerk keys. 