# Clerk Authentication Integration

## Overview
AHGPT now has comprehensive Clerk authentication integration that controls when chats are synced to the Sanity database. The system provides different experiences for authenticated users vs. guest users.

## Authentication States

### 🔐 **Authenticated Users (Signed in with Clerk)**
- ✅ Full chat functionality
- ✅ Messages saved to Sanity database
- ✅ Chat history persists between sessions
- ✅ Can share and manage conversations
- ✅ Access to sidebar with chat history
- ✅ Can delete individual chats or all chats

### 👤 **Guest Users (Not signed in)**
- ✅ Can chat with AI (full conversation functionality)
- ✅ Real-time streaming responses
- ✅ Messages appear immediately during session
- ❌ Messages are NOT saved to database
- ❌ Chat history is lost on page refresh
- ℹ️ Blue info banner explains they need to sign in to save chats
- ✅ Can start new chats from sidebar
- ❌ No access to chat history or sharing features

## Visual Indicators

### For Guest Users
```
ℹ️ You're chatting as a guest. Sign in to save your conversation history.
```
- Blue info banner at the top of chat page
- Sidebar shows "New Chat (Guest)" button
- Clear explanation of what signing in provides

### For Authenticated Users with Permission Issues
```
⚠️ Your conversation will continue but won't be saved to history due to permissions.
```
- Yellow warning banner when Sanity permissions are insufficient
- Chat continues to work, but no database sync

## Code Implementation

### ChatContext Changes
- `createNewChat()`: Creates chats for both authenticated and guest users
- `addMessage()`: Only syncs to Sanity if `user && user.id !== 'guest'`
- Guest users get full local chat functionality without database operations

### Chat Page Changes
- Added `useUser()` hook to detect authentication state
- Shows appropriate banners based on user state and permission issues
- Maintains full functionality regardless of authentication state

### Sidebar Changes
- `SignedIn`: Full chat management features
- `SignedOut`: "New Chat (Guest)" button + explanation of sign-in benefits

## User Experience Flow

### Guest User Journey
1. **Arrives at chat page** → Sees blue info banner
2. **Can immediately start chatting** → Full AI conversation functionality
3. **Sees "New Chat (Guest)" in sidebar** → Can start fresh conversations
4. **Page refresh** → Loses current conversation (expected behavior)
5. **Signs in** → Gets access to full features and history saving

### Authenticated User Journey
1. **Signs in** → Full access to all features
2. **Chats are automatically saved** → Persistent history
3. **Can manage chat history** → View, share, delete conversations
4. **Sidebar shows full chat list** → Easy navigation between conversations

## Benefits of This Approach

### 🚀 **Immediate Usability**
- No authentication barrier to start chatting
- Guest users can evaluate the product immediately
- Smooth onboarding experience

### 🔒 **Clear Value Proposition**
- Users understand what they get by signing in
- No confusion about feature availability
- Transparent about data persistence

### 🛡️ **Privacy Conscious**
- Guest conversations are never stored
- Users control when their data is saved
- Clear distinction between temporary and persistent chats

### 🔧 **Robust Error Handling**
- Graceful fallback when Sanity permissions fail
- Chat continues working even with backend issues
- Clear user communication about system state

## Technical Details

### Authentication Check
```typescript
// Only sync to Sanity if user is authenticated with Clerk
if (user && user.id !== 'guest') {
    // Save to database
} else {
    // Local-only chat for guests
}
```

### User State Detection
```typescript
const { user } = useUser(); // Clerk hook
// user is null for guests
// user has valid data for authenticated users
```

### Visual Feedback
```typescript
{!user && (
    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mx-4 mt-4">
        <p>You're chatting as a guest. Sign in to save your conversation history.</p>
    </div>
)}
```

## Configuration

### Environment Variables
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk public key
- `CLERK_SECRET_KEY`: Clerk secret key
- `SANITY_API_TOKEN`: Sanity token with write permissions (for authenticated users)

### Clerk Setup
- Authentication is handled by Clerk components (`SignedIn`, `SignedOut`, `UserButton`, `SignInButton`)
- User data is accessed via `useUser()` hook
- No additional configuration needed for guest mode

## Future Enhancements

### Potential Improvements
1. **Local Storage for Guests**: Save guest chats locally for session persistence
2. **Migration on Sign-in**: Convert guest chats to saved chats when user signs in
3. **Anonymous Analytics**: Track guest usage without storing personal data
4. **Rate Limiting**: Implement different limits for guests vs. authenticated users

### Current Limitations
- Guest chats are lost on page refresh (by design)
- No offline functionality for guests
- No chat export for guest conversations

## Troubleshooting

### Common Issues
1. **"Permission denied" errors**: Check Sanity token permissions
2. **User not detected**: Verify Clerk environment variables
3. **Chats not saving**: Ensure user is properly authenticated

### Debug Steps
1. Check browser console for authentication state
2. Verify Clerk user object in React DevTools
3. Monitor network requests to Sanity API
4. Check server logs for permission errors 