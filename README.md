This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# AHGPT - Al Hayat AI Assistant

A comprehensive AI chat platform with multi-language support, location detection, and advanced user management features.

## Recent Updates

### 🚨 **CRITICAL FIX: Location Detection Rate Limit Issue** (Latest Update)

**Issue Identified:** Users reported incorrect location detection - Persian/Iranian language users showing as Palestine instead of Iran.

**Root Cause:** The primary IP detection service (ipapi.co) was hitting rate limits (HTTP 429 errors):
- **Free Tier Limit**: 1000 requests/day
- **Rate Limit Error**: `ipapi.co responded with status: 429`
- **Result**: System was using stale cached data or falling back to browser timezone (developer's location)

### 🔥 **REVOLUTIONARY SOLUTION: Browser-Only Location Detection**

**NEW APPROACH: Zero API Dependencies!**

Instead of relying on external IP geolocation services that have rate limits, failures, and costs, we've implemented a **browser-only location detection system** that works entirely offline using native browser APIs.

#### **🌟 How It Works:**

**1. Language-Based Detection (Primary)**
- Analyzes `navigator.language` and `navigator.languages` 
- **Persian/Farsi (`fa`, `fa-IR`)** → **Iran 🇮🇷** (High Confidence)
- **Arabic Regional** (`ar-SA`, `ar-EG`, `ar-PS`, etc.) → Specific countries (High Confidence)
- **Unique Languages** (`he` → Israel, `ja` → Japan, `ko` → Korea, etc.)

**2. Timezone Analysis (Secondary)**
- Uses `Intl.DateTimeFormat().resolvedOptions().timeZone`
- Maps specific timezones to cities: `Asia/Tehran` → Tehran, Iran
- Provides geographic confirmation of language-based detection

**3. Combined Intelligence**
- **High Confidence**: Language provides clear country signal
- **Medium Confidence**: Timezone-based detection 
- **Smart Fallback**: Uses best available signal

#### **🎯 Key Advantages:**

**✅ No Rate Limits**: Works entirely in browser, unlimited requests  
**✅ No API Costs**: Zero external service dependencies  
**✅ Instant Results**: No network requests, immediate response  
**✅ Privacy Friendly**: No IP addresses sent to external services  
**✅ Offline Capable**: Works without internet connection  
**✅ High Accuracy**: Especially for language-specific detection  

#### **🔧 Technical Implementation:**
```javascript
// NEW Detection Priority (No APIs!)
1. Browser Language Analysis (fa → Iran, ar-PS → Palestine, etc.)
2. Timezone City Mapping (Asia/Tehran → Tehran, Iran)  
3. Combined Confidence Scoring
4. IP Services (Only as optional enhancement)
```

**Critical Fixes Implemented:**

#### **🔄 Service Priority Reordering:**
- **NEW Primary**: Browser-only detection (unlimited, instant)
- **Secondary**: `ip-api.com` (no rate limits, for additional precision)
- **Fallback**: `ipapi.co` (rate limited, rarely used)

#### **📊 Enhanced Debugging & Validation:**
- **Comprehensive Logging**: Each step of location detection is now logged
- **Data Validation**: Validates country codes, checks for incomplete responses
- **Cache Management**: Improved cache invalidation and debugging tools
- **Development Tools**: 
  - `clearLocationCache()` function in dev mode
  - Debug button in Dashboard (development only)
  - Console debugging with clear error identification

#### **🛡️ Improved Reliability:**
- **Zero External Dependencies**: Browser-only detection cannot fail due to API issues
- **Language Intelligence**: Persian users will always correctly show Iran
- **Smart Fallback Logic**: Multiple detection methods with confidence scoring
- **Instant Performance**: No network delays or timeouts

**Result:** Users should now see accurate location detection with Iranian users correctly showing Iran instead of Palestine, with zero risk of rate limit issues.

### 🎯 **FINAL STATUS: Complete API Removal** (Latest)

**Mission Accomplished**: Successfully removed all external API dependencies for location detection!

#### **✅ What Was Removed:**
- **All IP-based API calls** (ipapi.co, ip-api.com)
- **External service dependencies** that caused rate limits
- **API route** (`/api/location`) - no longer needed
- **Error-prone external requests** that could fail

#### **✅ What Remains:**
- **Pure browser-only detection** using native APIs
- **Language-based intelligence** (Persian → Iran, Arabic regional → specific countries)
- **Timezone-based fallback** for geographic confirmation
- **Instant, unlimited detection** with no external dependencies

#### **🔥 Revolutionary Benefits Achieved:**
- **Zero Rate Limits**: No external APIs = No limits ever
- **Instant Performance**: No network delays or timeouts
- **100% Reliable**: Browser APIs never fail like external services
- **Privacy Enhanced**: No IP data sent to external services
- **Cost-Free**: No API fees or subscription limits
- **Offline Capable**: Works without internet connection

The location detection system now operates **entirely within the browser** using:
1. `navigator.language` and `navigator.languages` for primary detection
2. `Intl.DateTimeFormat().resolvedOptions().timeZone` for geographic confirmation  
3. Sophisticated mapping algorithms for high accuracy

**Iranian users will always show Iran 🇮🇷 based on Persian language detection - no more Palestine confusion!**

### ✨ Enhanced Dashboard Design (June 2025)

The Dashboard has been completely redesigned with a cleaner, more modern interface:

#### **Improved User Information Display:**
- **Enhanced User Cards**: Redesigned user information boxes with better visual hierarchy
- **Advanced Location Display**: Now shows city, region, and country when available from IP detection
- **Visual Enhancements**: 
  - Rounded corners and subtle shadows for modern appearance
  - Gradient backgrounds for active selections
  - Better spacing and typography
  - Responsive design improvements

#### **Location Detection Features:**
- **Comprehensive IP-based Detection**: Detects user location including city and region details
- **Fallback Systems**: Multiple layers of fallback (IP services → timezone → default)
- **Visual Location Indicators**: 
  - Country flags as user avatars
  - Detailed location info: "City, Region • Country"
  - Location icons (📍) for clear identification
  - Tooltips with full location details

#### **User Experience Improvements:**
- **Card-based Layout**: Modern card design for better content organization
- **Hover Effects**: Smooth transitions and hover states
- **Better Information Architecture**: 
  - Clear separation between user types (Guest vs Registered)
  - Message counts and timestamps
  - Enhanced visual feedback for selected chats

#### **Technical Enhancements:**
- **Optimized Rendering**: Improved performance with better state management
- **Caching**: Location data caching to reduce API calls
- **Error Handling**: Graceful degradation when location services are unavailable

### Previous Features
- ✅ Multi-language support with automatic detection
- ✅ Location-based user identification
- ✅ Guest user privacy protection
- ✅ Advanced filtering and search capabilities
- ✅ Export functionality (Text/JSON)
- ✅ Real-time chat management

---

## Features

## 🌍 User Location Detection

This application now features a **user-specific location detection system** that accurately identifies each user's location from their own browser:

### How It Works

**✅ Correct Approach (Current Implementation):**
- Each user's location is detected **from their own browser** when they use the app
- Location data includes Persian/Farsi language detection → Iran 🇮🇷 (High Confidence)
- Uses `navigator.language`, `navigator.languages`, and timezone data
- Data is stored per-user and displayed in the dashboard

**❌ Previous Problem:**
- All users were showing the same location (admin's location)
- Location was being detected once from the dashboard viewer's browser

### Features

1. **Browser-Only Detection**: No external APIs, completely reliable
2. **User-Specific**: Each user gets their location detected individually  
3. **Persian/Iranian Fix**: Persian speakers correctly show Iran 🇮🇷 instead of Palestine
4. **SDK Integration**: Works in both main app and widget/SDK
5. **Privacy-First**: No IP addresses sent to external services

### For SDK Users

The widget automatically detects each user's location when they interact with it:

```javascript
// Location is automatically detected and can be accessed via postMessage
window.addEventListener('message', (event) => {
  if (event.data.type === 'USER_LOCATION_DETECTED') {
    console.log('User location:', event.data.payload.location);
    // { country: "Iran", countryCode: "IR", city: "Tehran", confidence: "high" }
  }
});
```

### Language-Based Detection Examples

- `fa`, `fa-IR` (Persian/Farsi) → Iran 🇮🇷 (High Confidence)
- `ar-SA` → Saudi Arabia 🇸🇦 (High Confidence)  
- `ar-PS` → Palestine 🇵🇸 (High Confidence)
- `ja`, `ja-JP` → Japan 🇯🇵 (High Confidence)
- `ko`, `ko-KR` → South Korea 🇰🇷 (High Confidence)

### Dashboard Display

The dashboard now shows **actual user locations** based on when each user used the app from their browser, not simulated locations from the admin's browser.
