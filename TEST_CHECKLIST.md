# Al Hayat GPT Stable Widget SDK - Test Checklist

## 🧪 Core Functionality Tests

### ✅ Widget Loading
- [ ] Widget loads without errors on localhost:3001
- [ ] SDK version shows as "2.0.0-stable"
- [ ] Browser compatibility check passes
- [ ] Container is found and prepared correctly
- [ ] Loading animation displays initially

### ✅ Authentication Flow (Key Fix)
- [ ] **Popup Authentication** - Main fix for "refused to connect" issue
  - [ ] Click "Test Authentication" button
  - [ ] Popup window opens (not iframe)
  - [ ] Sign-in page loads in popup
  - [ ] After sign-in, popup closes automatically
  - [ ] User status updates in parent window
  - [ ] No "refused to connect" errors

### ✅ Guest Mode
- [ ] Widget works without authentication
- [ ] Chat functionality available immediately
- [ ] "Guest" status displayed correctly
- [ ] Fallback works when auth fails

### ✅ Theme Switching
- [ ] Light theme applies correctly
- [ ] Dark theme applies correctly  
- [ ] Auto theme follows system preference
- [ ] Theme changes reflect immediately in iframe

### ✅ Error Handling
- [ ] Graceful error messages display
- [ ] Retry mechanism works for failed loads
- [ ] Popup blocked detection works
- [ ] Network error handling
- [ ] Timeout handling

### ✅ Cross-Origin Compatibility
- [ ] Widget works on localhost (current test)
- [ ] Test on different port (simulate third-party site)
- [ ] No CORS errors in console
- [ ] Message passing security validates origins

## 🔧 Advanced Feature Tests

### ✅ Widget Controls
- [ ] Size changes (400px, 600px, 800px) work
- [ ] Auto-resize functionality
- [ ] Widget recreation works
- [ ] Widget destruction cleans up properly
- [ ] Multiple theme switches work

### ✅ Event System
- [ ] onReady callback fires
- [ ] onUserSignIn callback fires with user data
- [ ] onUserSignOut callback fires
- [ ] onError callback fires for errors
- [ ] Custom event listeners work

### ✅ Configuration Options
- [ ] All configuration options apply correctly
- [ ] updateConfig() method works
- [ ] Custom styling applies
- [ ] Debug mode shows detailed logs

## 🚀 Production Readiness Tests

### ✅ Performance
- [ ] Widget loads within 5 seconds
- [ ] Iframe loads within 10 seconds
- [ ] No memory leaks after destroy/recreate
- [ ] Responsive on mobile viewport

### ✅ Security
- [ ] Origin validation working
- [ ] No XSS vulnerabilities
- [ ] Secure popup authentication
- [ ] No sensitive data in console logs

### ✅ Compatibility
- [ ] Works in Chrome
- [ ] Works in Safari
- [ ] Works in Firefox
- [ ] Works on mobile browsers
- [ ] Works with popup blockers (graceful fallback)

## 🔍 Debugging Tools

### ✅ Test Page Features
- [ ] Real-time status updates
- [ ] Live logging system
- [ ] System information accurate
- [ ] All control buttons functional

### ✅ Console Logs
- [ ] SDK loading messages clear
- [ ] Authentication flow logged
- [ ] Error messages descriptive
- [ ] Debug mode provides useful info

## 🌐 Cross-Domain Testing

To fully test the cross-origin fix:

1. **Test on Different Port**
   ```bash
   # In a new terminal, create a simple HTTP server on different port
   cd public
   python3 -m http.server 8080
   # Then visit: http://localhost:8080/widget-example.html
   ```

2. **Test with Different Origin**
   - Deploy to a different domain/subdomain
   - Embed widget from www.alhayatgpt.com
   - Verify no "refused to connect" errors

3. **Test Popup Scenarios**
   - Test with popup blocker enabled
   - Test popup manually closed
   - Test network issues during auth

## ✅ Success Criteria

The stable widget SDK is successful if:
- ✅ No "refused to connect" errors
- ✅ Popup authentication works seamlessly
- ✅ Graceful fallback to guest mode
- ✅ Works on third-party websites
- ✅ Enhanced error handling and recovery
- ✅ All existing functionality preserved

## 🐛 Known Issues to Monitor

- Popup blockers may prevent authentication (handled gracefully)
- iOS Safari may have popup restrictions (fallback provided)
- Network timeouts during auth (retry mechanism included)
- Container not found on slow-loading pages (DOM ready detection added)

---

**Status:** 🚀 Ready for comprehensive testing
**Version:** 2.0.0-stable  
**Last Updated:** ${new Date().toISOString()} 