# Sanity Permissions Fix Guide

## Problem
You're seeing a "Insufficient permissions" error when trying to save chat messages. This means your Sanity API token only has read permissions, but the app needs write permissions to save chat history.

## Solution

### Step 1: Go to Sanity Dashboard
1. Visit [https://sanity.io/manage](https://sanity.io/manage)
2. Select your project (likely named "ahgpt" or similar)

### Step 2: Create a New API Token
1. Navigate to **API** → **Tokens** in the left sidebar
2. Click **Add API Token**
3. Give it a name like "AHGPT Write Token"
4. Set permissions to **Editor** or **Admin** (not Viewer)
5. Click **Save**
6. Copy the generated token

### Step 3: Update Environment Variables
1. Create a `.env.local` file in your project root if it doesn't exist
2. Add or update the following line:
   ```
   SANITY_API_TOKEN=your_new_token_here
   ```
3. Replace `your_new_token_here` with the token you copied

### Step 4: Restart the Development Server
1. Stop the current server (Ctrl+C)
2. Run `npm run dev` again

## What This Fixes
- Chat messages will now be saved to your Sanity database
- Chat history will persist between sessions
- You can share and manage your conversations
- The yellow warning banner will disappear

## Current Behavior (Without Fix)
- ✅ Chat still works - you can have conversations
- ✅ Messages appear in real-time during the session
- ❌ Messages are not saved to history (for authenticated users)
- ❌ Chat history is lost when you refresh the page
- ⚠️ Yellow warning banner appears (for authenticated users)
- ℹ️ Guest users see blue info banner explaining they need to sign in to save chats

## After Fix
- ✅ All chat functionality works
- ✅ Messages are saved to Sanity database
- ✅ Chat history persists between sessions
- ✅ You can share and manage conversations
- ✅ No warning banners

## Need Help?
If you're still having issues:
1. Check that your `.env.local` file is in the project root
2. Verify the token has Editor/Admin permissions (not Viewer)
3. Make sure you restarted the development server
4. Check the browser console for any remaining errors 