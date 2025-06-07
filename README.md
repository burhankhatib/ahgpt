# 🤖 Al Hayat GPT - Advanced Christian AI Chatbot

<div align="center">

![Al Hayat GPT](https://img.shields.io/badge/Al%20Hayat%20GPT-v2.0.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)
![Clerk](https://img.shields.io/badge/Clerk-Auth-purple)
![Sanity](https://img.shields.io/badge/Sanity-CMS-red)

**The first and most advanced Christian AI chatbot that can engage in theological discussions comparing Islam and Christianity.**

[🌐 Live Demo](https://alhayatgpt.com) • [📚 Documentation](#documentation) • [🚀 Quick Start](#quick-start)

</div>

## ✨ Features

### 🎯 **Core Functionality**
- **Advanced AI Conversations**: Powered by OpenAI with specialized Christian theology knowledge
- **Real-time Chat**: Instant responses with streaming support
- **Multi-language Support**: Auto-detection and support for 20+ languages
- **Responsive Design**: Beautiful UI that works on all devices

### 🔐 **Authentication & User Management**
- **Clerk Integration**: Secure authentication with social login options
- **Guest Mode**: Anonymous chatting without registration
- **User Profiles**: Personalized experience for registered users
- **Invisible Mode**: Private conversations that don't appear in history

### 📊 **Dashboard & Analytics**
- **Admin Dashboard**: Comprehensive chat management and analytics
- **Real-time Updates**: Live chat monitoring with SanityLive
- **Export Functionality**: Download chat data in JSON or TXT format
- **User Analytics**: Detailed statistics and user behavior insights

### 🌍 **Location & Personalization**
- **Smart Location Detection**: Browser geolocation with IP fallback
- **Personalized Responses**: Context-aware AI based on user location
- **Cultural Adaptation**: Responses adapted to user's cultural context

### 🎨 **Enhanced UI/UX**
- **Rich Content Rendering**: Support for tables, lists, and formatted text
- **Clickable Suggestions**: Interactive question buttons for better engagement
- **Copy Message Feature**: Easy sharing of AI responses
- **Modal Interactions**: Detailed conversation viewing

### 🔧 **Widget & SDK**
- **Embeddable Widget**: Easy integration into any website
- **SDK Support**: Programmatic access for developers
- **Cross-domain Compatibility**: Works across different domains
- **Customizable Styling**: Adapt to your site's design

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   AI Service    │
│   (Next.js)     │◄──►│   (Next.js)     │◄──►│   (OpenAI)      │
│                 │    │                 │    │                 │
│ • Chat UI       │    │ • Authentication│    │ • GPT Models    │
│ • Dashboard     │    │ • Chat Logic    │    │ • Streaming     │
│ • Widget SDK    │    │ • User Mgmt     │    │ • Context Aware │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                        │                        
         ▼                        ▼                        
┌─────────────────┐    ┌─────────────────┐               
│   Clerk Auth    │    │   Sanity CMS    │               
│                 │    │                 │               
│ • User Auth     │    │ • Chat Storage  │               
│ • Session Mgmt  │    │ • Real-time     │               
│ • Social Login  │    │ • Analytics     │               
└─────────────────┘    └─────────────────┘               
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Sanity Studio account
- Clerk account
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/burhankhatib/ahgpt.git
   cd ahgpt
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure your environment variables:
   ```env
   # OpenAI
   OPENAI_API_KEY=your_openai_api_key
   
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   
   # Sanity CMS
   NEXT_PUBLIC_SANITY_PROJECT_ID=your_sanity_project_id
   NEXT_PUBLIC_SANITY_DATASET=production
   SANITY_API_TOKEN=your_sanity_token
   
   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Set up Sanity Studio**
   ```bash
   npm run sanity:init
   npm run sanity:deploy
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
ahgpt/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (website)/         # Main website pages
│   │   ├── admin/             # Admin dashboard
│   │   ├── api/               # API routes
│   │   ├── chat/              # Chat interface
│   │   └── widget/            # Embeddable widget
│   ├── components/            # React components
│   │   ├── ui/               # UI components
│   │   └── providers/        # Context providers
│   ├── contexts/             # React contexts
│   ├── hooks/                # Custom hooks
│   ├── lib/                  # Utility libraries
│   ├── sanity/               # Sanity configuration
│   ├── sdk/                  # Widget SDK
│   ├── types/                # TypeScript types
│   └── utils/                # Utility functions
├── public/                   # Static assets
├── scripts/                  # Build scripts
└── docs/                     # Documentation
```

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Sanity CMS
npm run sanity:dev      # Start Sanity Studio
npm run sanity:build    # Build Sanity Studio
npm run sanity:deploy   # Deploy Sanity Studio

# Code Quality
npm run lint            # Run ESLint
npm run type-check      # Run TypeScript checks

# Widget SDK
npm run build:widget    # Build widget SDK
npm run optimize:widget # Optimize widget bundle
```

### Key Technologies

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, CSS Modules
- **Authentication**: Clerk
- **Database**: Sanity CMS with real-time updates
- **AI**: OpenAI GPT with streaming
- **State Management**: React Context + Zustand
- **Forms**: React Hook Form + Zod validation

## 🌐 Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Configure environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy

### Manual Deployment

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm run start
   ```

## 📚 API Reference

### Chat API

```typescript
POST /api/chat
Content-Type: application/json

{
  "messages": [
    {
      "role": "user",
      "content": "Your question here",
      "firstName": "User Name",
      "email": "user@example.com"
    }
  ]
}
```

### Widget Integration

```html
<!-- Basic Widget Integration -->
<div id="ahgpt-widget"></div>
<script src="https://alhayatgpt.com/widget-sdk.js"></script>
<script>
  AlHayatGPT.init({
    containerId: 'ahgpt-widget',
    domain: 'your-domain.com'
  });
</script>
```

## 🔧 Configuration

### Widget Customization

```javascript
AlHayatGPT.init({
  containerId: 'ahgpt-widget',
  domain: 'your-domain.com',
  theme: 'light', // 'light' | 'dark'
  position: 'bottom-right', // Widget position
  language: 'auto', // Auto-detect or specify
  height: '600px',
  width: '400px'
});
```

### Environment Configuration

See `CONFIGURATION.md` for detailed environment setup instructions.

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Write tests for your changes
5. Run the test suite: `npm test`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for providing the AI capabilities
- **Clerk** for authentication services
- **Sanity** for content management
- **Vercel** for hosting and deployment
- **Next.js** team for the amazing framework

## 📞 Support

- **Documentation**: Check our [documentation](docs/)
- **Issues**: [GitHub Issues](https://github.com/burhankhatib/ahgpt/issues)
- **Email**: support@alhayatgpt.com
- **Website**: [alhayatgpt.com](https://alhayatgpt.com)

---

<div align="center">

**Made with ❤️ for the Christian community**

[⭐ Star this project](https://github.com/burhankhatib/ahgpt) if you find it helpful!

</div>

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
