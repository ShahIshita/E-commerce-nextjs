# Reset Password Flow - Complete Debug Analysis & Implementation

## Issue Summary

The reset password page gets stuck on "Verifying reset token..." and never shows the password input fields.

The email link format received:
```
http://localhost:3000/auth/reset-password#access_token=eyJ...&expires_at=1773228993&expires_in=3600&refresh_token=w7hrm2ywh33z&sb=&token_type=bearer&type=recovery
```

## Root Cause Analysis

### 1. **URL Token Format - Hash Fragment (Implicit Flow)**
The link contains tokens in the **hash fragment** (`#access_token=...`) which is correct for implicit flow.

### 2. **Code Flow Verification**
Looking at `reset-password/page.tsx` lines 48-67:
```typescript
const hashParams = new URLSearchParams(window.location.hash.substring(1))
const accessToken = hashParams.get('access_token')
const hashType = hashParams.get('type')

if (accessToken && hashType === 'recovery') {
  const { error } = await withRetry(() =>
    supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: hashParams.get('refresh_token') || '',
    })
  )
  if (error) {
    setError('Invalid or expired reset link. Please request a new password reset.')
    return
  }
  setSessionReady(true)
  window.history.replaceState(null, '', window.location.pathname)
  return
}
```

The code **should** work with this URL format. The issue is likely one of:

### Possible Causes

#### A. **Supabase Client Configuration**
The `createSupabaseBrowserClient()` uses `@supabase/ssr` which defaults to PKCE flow. This might interfere with processing implicit flow tokens.

**Evidence:**
- `@supabase/ssr@0.1.0` installed
- `lib/supabaseBrowser.ts` uses `createBrowserClient` from `@supabase/ssr`
- This sets `flowType: 'pkce'` by default (line 113 in index.mjs)

**Problem:** When a PKCE-configured client receives implicit flow tokens in the hash, it might not process them correctly.

#### B. **Token Expiry**
The `expires_at` in the URL is `1773228993` (Unix timestamp).
- This equals: March 9, 2026, 08:16:33 UTC
- Current date (per system): March 11, 2026
- **The token is EXPIRED** (expired 2 days ago)

#### C. **Missing refresh_token or Malformed Token**
- `refresh_token=w7hrm2ywh33z` looks unusually short
- Typical Supabase refresh tokens are much longer JWT-like strings
- This might be a truncated or invalid token

## Debugging Steps Already Added

I've added comprehensive logging to the `verifyToken()` function:

```typescript
console.log('🔍 DEBUG: Starting token verification')
console.log('🔍 Full URL:', window.location.href)
console.log('🔍 Hash:', window.location.hash)
console.log('🔍 Hash params:', {
  hasAccessToken: !!accessToken,
  accessTokenLength: accessToken?.length,
  hasRefreshToken: !!refreshToken,
  type: hashType
})
console.log('🔍 setSession result:', { 
  hasSession: !!data?.session, 
  hasUser: !!data?.user,
  error: error?.message 
})
```

## Solution Implementation

### 1. **Use a Pure Supabase Client for Implicit Flow**

The browser client from `@supabase/ssr` is configured for PKCE, which may not handle implicit flow tokens properly. We need a client explicitly configured for implicit flow.

**File:** `lib/supabaseBrowser.ts`

**Current:**
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createSupabaseBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
```

**ISSUE:** `createBrowserClient` from `@supabase/ssr` defaults to `flowType: 'pkce'`

**FIX - Option 1: Force Implicit Flow (Recommended for this specific use case)**
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createSupabaseBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  // Configure for implicit flow to handle reset password tokens
  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      flowType: 'implicit', // Explicitly use implicit flow
      detectSessionInUrl: true, // Auto-detect and handle tokens in URL
      persistSession: true,
    }
  })
}
```

**FIX - Option 2: Use Pure Supabase Client (Alternative)**
Create a separate client just for reset password:

**File:** `lib/supabaseImplicitBrowser.ts`
```typescript
import { createClient } from '@supabase/supabase-js'

export function createImplicitBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      flowType: 'implicit',
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
    },
  })
}
```

Then update `reset-password/page.tsx`:
```typescript
import { createImplicitBrowserClient } from '@/lib/supabaseImplicitBrowser'

// In the component:
const supabase = createImplicitBrowserClient()
```

### 2. **Let Supabase Handle URL Detection Automatically**

Instead of manually parsing the hash, let Supabase's built-in session detection handle it:

**File:** `app/auth/reset-password/page.tsx`

**Replace the entire `verifyToken()` function with:**
```typescript
async function verifyToken() {
  console.log('🔍 Starting token verification')
  console.log('🔍 Full URL:', window.location.href)
  
  try {
    // Supabase client with detectSessionInUrl: true automatically
    // processes tokens in the URL hash and sets the session
    await new Promise((r) => setTimeout(r, 500)) // Wait for auto-detection
    
    const { data: { session }, error } = await supabase.auth.getSession()
    
    console.log('🔍 Session check:', { 
      hasSession: !!session, 
      userId: session?.user?.id,
      error: error?.message 
    })
    
    if (session) {
      console.log('✅ Session established!')
      setSessionReady(true)
      // Clean up URL
      window.history.replaceState(null, '', window.location.pathname)
    } else {
      console.error('❌ No session found')
      setError('Invalid or expired reset link. Please request a new password reset.')
    }
  } catch (err) {
    console.error('❌ Verification error:', err)
    setError('An error occurred while verifying your reset link. Please try again.')
  }
}
```

### 3. **Alternative: Manual Token Exchange**

If automatic detection doesn't work, manually exchange the tokens:

```typescript
async function verifyToken() {
  console.log('🔍 Starting manual token verification')
  
  try {
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const accessToken = hashParams.get('access_token')
    const refreshToken = hashParams.get('refresh_token')
    const tokenType = hashParams.get('type')
    
    console.log('🔍 Tokens found:', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      type: tokenType
    })
    
    if (!accessToken || tokenType !== 'recovery') {
      setError('Invalid reset link format. Please request a new password reset.')
      return
    }
    
    if (!refreshToken) {
      console.warn('⚠️ No refresh token - might cause issues')
    }
    
    // Set the session with the tokens
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken || '',
    })
    
    console.log('🔍 setSession result:', {
      hasSession: !!data?.session,
      hasUser: !!data?.user,
      error: error?.message,
      errorDetails: error
    })
    
    if (error) {
      console.error('❌ setSession failed:', error)
      // Check for specific error types
      if (error.message.includes('expired')) {
        setError('This reset link has expired. Please request a new password reset.')
      } else if (error.message.includes('invalid')) {
        setError('Invalid reset link. Please request a new password reset.')
      } else {
        setError(`Error: ${error.message}. Please request a new password reset.`)
      }
      return
    }
    
    if (!data?.session) {
      console.error('❌ No session created despite no error')
      setError('Could not establish session. Please request a new password reset.')
      return
    }
    
    console.log('✅ Session created successfully!')
    setSessionReady(true)
    window.history.replaceState(null, '', window.location.pathname)
    
  } catch (err) {
    console.error('❌ Unexpected error:', err)
    setError('An unexpected error occurred. Please try again or request a new reset link.')
  }
}
```

## Testing Instructions

### 1. **Check Browser Console**
Open Developer Tools (F12) → Console tab
Look for the debug logs starting with 🔍, ✅, or ❌

### 2. **Request a Fresh Reset Link**
The token in your current link appears to be expired. Request a new one:
1. Go to `/auth/forgot-password`
2. Enter your email
3. Wait 60 seconds (rate limit)
4. Check your email for a NEW link
5. Open the new link and check console logs

### 3. **Verify Supabase Configuration**
In Supabase Dashboard → Authentication → URL Configuration:
- Redirect URLs should include: `http://localhost:3000/auth/reset-password`
- Site URL should be: `http://localhost:3000`

### 4. **Check Email Template**
Supabase Dashboard → Authentication → Email Templates → Reset Password
Ensure it uses:
```
{{ .ConfirmationURL }}
```
or
```
{{ .SiteURL }}/auth/reset-password#access_token={{ .Token }}&refresh_token={{ .RefreshToken }}&type=recovery
```

## Expected Console Output (Success)

```
🔍 Starting token verification
🔍 Full URL: http://localhost:3000/auth/reset-password#access_token=...
🔍 Tokens found: {hasAccessToken: true, hasRefreshToken: true, type: "recovery"}
🔍 setSession result: {hasSession: true, hasUser: true, error: undefined}
✅ Session created successfully!
```

## Expected Console Output (Expired Token)

```
🔍 Starting token verification
🔍 Full URL: http://localhost:3000/auth/reset-password#access_token=...
🔍 Tokens found: {hasAccessToken: true, hasRefreshToken: true, type: "recovery"}
🔍 setSession result: {hasSession: false, hasUser: false, error: "Token has expired"}
❌ setSession failed: AuthApiError: Token has expired
```

## Next Steps

1. ✅ **Added detailed logging** - Check browser console
2. ⏳ **Request new reset link** - Old token is expired
3. ⏳ **Try the link** - Check console for specific error
4. ⏳ **Apply fix** - Based on console output, we'll know which fix to apply

The logging will tell us exactly what's failing!
