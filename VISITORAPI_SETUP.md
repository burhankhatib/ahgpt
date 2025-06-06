# VisitorAPI Setup Instructions

## Overview
We've replaced HTML5 geolocation with VisitorAPI for better user experience. VisitorAPI provides location detection without requiring user permissions.

## Setup Steps

### 1. Create VisitorAPI Account
1. Visit [VisitorAPI.com](https://visitorapi.com)
2. Sign up for a free account
3. Create a new project
4. Note your Project ID

### 2. Configure Project ID
1. Open `src/utils/visitorApiDetection.ts`
2. Replace `"YOUR_PROJECT_ID_HERE"` with your actual project ID:
   ```typescript
   const DEFAULT_PROJECT_ID = "your-actual-project-id";
   ```

### 3. Domain Authorization
1. In your VisitorAPI dashboard, add your domain(s):
   - `localhost:3000` (for development)
   - Your production domain
   - Any other domains where the widget will be used

## Benefits of VisitorAPI

✅ **No User Permission Required** - Works automatically using IP geolocation  
✅ **Higher Success Rate** - Most users don't allow geolocation permissions  
✅ **Rich Data** - Provides country, city, region, currencies, languages, and device info  
✅ **Reliable** - Uses comprehensive IP database for accurate location detection  
✅ **Fast** - No waiting for GPS or user interaction  

## What Changed

### Files Updated:
- `src/utils/visitorApiDetection.ts` - New VisitorAPI utility (replaces geolocationDetection.ts)
- `src/app/chat/page.tsx` - Updated to use VisitorAPI
- `src/app/widget/chat/page.tsx` - Updated to use VisitorAPI
- `src/app/(website)/geolocation-test/page.tsx` - Now tests VisitorAPI
- `src/hooks/useUserLocation.ts` - Updated to use VisitorAPI
- `src/components/AllChats.tsx` - Updated imports
- `src/components/StatsDashboard.tsx` - Updated imports

### Old Files (can be removed after testing):
- `src/utils/geolocationDetection.ts` - Old HTML5 geolocation utility
- `src/utils/locationDetection.ts` - Old browser-only detection

## Testing

1. Visit `/geolocation-test` to test the new VisitorAPI integration
2. Check browser console for detection logs
3. Verify location data appears in dashboard

## Troubleshooting

### "Project ID not configured" Error
- Make sure you've replaced `YOUR_PROJECT_ID_HERE` with your actual project ID

### Location Detection Fails
- Check that your domain is authorized in VisitorAPI dashboard
- Verify your project ID is correct
- Check browser console for error messages

### No Location Data in Dashboard
- Location detection happens when users visit chat pages
- Check localStorage for `userLocation_*` entries
- Verify the detection is working in `/geolocation-test`

## Free Tier Limits

VisitorAPI free tier typically includes:
- 1,000 requests per month
- Basic location data
- Standard support

For higher usage, consider upgrading to a paid plan. 