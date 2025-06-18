# CORS Error Fix Guide

## Problem Identified ✅

**Error**: `Access to fetch at 'http://localhost:8000/api/v1/programs/1' from origin 'http://localhost:3000' has been blocked by CORS policy`

**Root Cause**: CORS (Cross-Origin Resource Sharing) configuration issue between frontend (localhost:3000) and backend (localhost:8000)

## Immediate Fix Steps

### 1. Quick Emergency Fix (Try First)
1. **Copy and paste** the content of `emergency-cors-fix.js` into your browser console
2. **Run**: `emergencyFix()`
3. **Follow the output** - it will diagnose and attempt to fix the issue
4. **Try saving again** after the fix completes

### 2. Restart Backend Server
1. **Stop the backend server** (Ctrl+C in the terminal)
2. **Navigate to backend directory**:
   ```bash
   cd C:\university\fitness-coach
   ```
3. **Restart the server**:
   ```bash
   python -m uvicorn app.main:app --reload --port 8000
   ```
4. **Wait for**: "Application startup complete" message
5. **Try saving your program again**

### 3. Verify Backend is Running
1. **Open a new browser tab**
2. **Go to**: http://localhost:8000
3. **Should see**: Welcome message with API info
4. **If not working**: Backend isn't running - follow step 2

## What Was Fixed

### 1. CORS Configuration Enhanced
- **Explicit origins**: Added specific localhost URLs to CORS settings
- **Method permissions**: Explicitly allowed PUT, POST, GET, DELETE, OPTIONS
- **Header permissions**: Ensured all required headers are allowed

### 2. Token Storage Fixed
- **Multiple key check**: API client now checks multiple possible token keys
- **Automatic sync**: Copies token to standard location if found elsewhere
- **Better error messages**: More specific error messages for auth issues

### 3. Enhanced Error Handling
- **Network error detection**: Better detection of CORS vs other network issues
- **Specific messages**: Clear instructions when backend isn't running
- **Debug information**: Detailed logging for troubleshooting

## Testing the Fix

### Quick Test Commands (Browser Console)
```javascript
// Test 1: Check if backend is running
fetch('http://localhost:8000/')
  .then(r => r.json())
  .then(data => console.log('✅ Backend running:', data))
  .catch(e => console.log('❌ Backend issue:', e.message))

// Test 2: Check authentication
fetch('http://localhost:8000/api/v1/auth/me', {
  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('auth_token') }
})
  .then(r => r.json())
  .then(data => console.log('✅ Auth working:', data))
  .catch(e => console.log('❌ Auth issue:', e.message))

// Test 3: Run emergency fix
emergencyFix()
```

## Prevention for Future

### Always Check These First:
1. **Backend running**: localhost:8000 should be accessible
2. **Frontend running**: localhost:3000 should be your app
3. **Token valid**: Check browser console for auth errors
4. **CORS enabled**: Backend must allow requests from frontend

### If CORS Errors Persist:
1. **Clear browser cache**: Hard refresh (Ctrl+Shift+R)
2. **Check firewall**: Windows firewall might block localhost connections
3. **Try different browser**: Rule out browser-specific issues
4. **Check antivirus**: Some antivirus software blocks localhost requests

## Emergency Recovery

If nothing works:
1. **Copy your program changes** to a text file (don't lose your work!)
2. **Close both servers**
3. **Restart in this order**:
   - Start backend first: `python -m uvicorn app.main:app --reload --port 8000`
   - Wait 10 seconds
   - Start frontend: `npm run dev` (port 3000)
   - Wait for both to fully load
4. **Login again** if necessary
5. **Paste your changes back** and try saving

## Success Indicators

You'll know it's fixed when:
- ✅ No CORS errors in browser console
- ✅ Save button works without "Failed to save program" message
- ✅ Program changes are persisted
- ✅ No red network errors in DevTools

The CORS fix should resolve the save issue immediately! 🎯
