# Domain and Clerk Configuration Fix Guide

## Issues Fixed
1. ✅ **Redirect Loop**: `clerk.alhayatgpt.com redirected you too many times`
2. ✅ **DNS Error**: `api.alhayatgpt.com's server IP address could not be found`
3. ✅ **Widget SDK**: Updated to use proper domain configuration

## Required Environment Variables

Create a `.env.local` file in your project root with the following configuration:

```bash
# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_clerk_key_here
CLERK_SECRET_KEY=sk_test_your_actual_clerk_secret_key_here

# Domain Configuration - Use your main domain, not subdomains
NEXT_PUBLIC_CLERK_DOMAIN=alhayatgpt.com
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# API Configuration - Use your main domain
NEXT_PUBLIC_API_URL=https://www.alhayatgpt.com
NEXT_PUBLIC_DOMAIN=www.alhayatgpt.com

# Sanity Configuration
NEXT_PUBLIC_SANITY_PROJECT_ID=your_sanity_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_sanity_token_here

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Widget Configuration
NEXT_PUBLIC_WIDGET_ENDPOINT=https://www.alhayatgpt.com
```

## Step-by-Step Setup

### 1. Get Your Clerk Keys

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your project
3. Go to **API Keys** section
4. Copy the **Publishable Key** (starts with `pk_test_` or `pk_live_`)
5. Copy the **Secret Key** (starts with `sk_test_` or `sk_live_`)

### 2. Configure Clerk Domain Settings

In your Clerk Dashboard:

1. Go to **Domains** section
2. Add your domain: `www.alhayatgpt.com`
3. **IMPORTANT**: Do NOT add subdomains like `clerk.alhayatgpt.com` or `api.alhayatgpt.com`
4. Set redirect URLs:
   - **Sign-in URL**: `https://www.alhayatgpt.com/sign-in`
   - **Sign-up URL**: `https://www.alhayatgpt.com/sign-up`
   - **After sign-in**: `https://www.alhayatgpt.com/chat`
   - **After sign-up**: `https://www.alhayatgpt.com/chat`

### 3. DNS Configuration

**CRITICAL**: Make sure your DNS only has these records:

```
Type    Name    Value
A       @       your_server_ip
CNAME   www     alhayatgpt.com
```

**DO NOT ADD**:
- `clerk.alhayatgpt.com`
- `api.alhayatgpt.com`

These subdomains are causing the issues!

### 4. Deploy Changes

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Deploy to your hosting platform
npm run deploy
```

## Verification Steps

### 1. Check Local Development
```bash
npm run dev
```
Visit `http://localhost:3000` and verify:
- ✅ Chat works without authentication
- ✅ Sign-in redirects properly
- ✅ No console errors about domains

### 2. Check Production
Visit `https://www.alhayatgpt.com` and verify:
- ✅ No redirect loops
- ✅ Clerk sign-in works
- ✅ Widget SDK loads properly

### 3. Test Widget Integration
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
            clerkPublishableKey: 'your_actual_clerk_key_here',
            theme: 'auto',
            allowGuests: true,
            onReady: () => console.log('Widget ready!'),
            onError: (error) => console.error('Widget error:', error)
        });
    </script>
</body>
</html>
```

## Common Issues & Solutions

### Issue: Still getting redirect loops
**Solution**: 
1. Clear browser cache and cookies
2. Check Clerk dashboard domain settings
3. Verify `.env.local` has correct values
4. Restart your development server

### Issue: Widget not loading
**Solution**:
1. Check browser console for errors
2. Verify CDN URL: `https://www.alhayatgpt.com/widget-sdk.min.js`
3. Check network tab for failed requests
4. Ensure your domain is properly configured

### Issue: Authentication not working
**Solution**:
1. Verify Clerk keys in `.env.local`
2. Check Clerk dashboard domain configuration
3. Ensure no subdomain conflicts
4. Test with a fresh browser/incognito mode

## Security Notes

1. **Never commit `.env.local`** to version control
2. Use different Clerk keys for development and production
3. Regularly rotate your API keys
4. Monitor Clerk dashboard for unusual activity

## Support

If you continue having issues:

1. Check the browser console for specific error messages
2. Review Clerk dashboard logs
3. Verify all environment variables are set correctly
4. Test with a minimal HTML page first

---

✅ **After following this guide, your SDK should work perfectly without domain or authentication issues!** 