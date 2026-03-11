# Profile Creation Error - Complete Fix Guide

## 🔴 Error You're Seeing

```
Profile not created by trigger. Attempting manual creation...
Failed to create profile manually: {
  code: '42501',
  details: null,
  hint: null,
  message: 'new row violates row-level security policy for table "profiles"'
}
⚠️ IMPORTANT: Profile was not created. Please run the trigger setup SQL in Supabase.
```

## 🔍 Root Cause Analysis

### The Problem

1. **Trigger Not Firing**: The database trigger `on_auth_user_created` is not executing when a user signs up
2. **RLS Blocking Manual Insert**: When code tries to create profile manually as fallback, Row Level Security (RLS) blocks it because:
   - RLS policy requires `auth.uid() = id` (user must be authenticated and inserting their own profile)
   - During signup, the user session might not be fully established yet
   - Server-side client doesn't have the right authentication context for manual insert

### Why This Happens

- The trigger function needs `SECURITY DEFINER` to bypass RLS
- If the trigger isn't set up correctly, it won't fire
- Manual fallback will ALWAYS fail due to RLS policies
- The error code `42501` means "insufficient privilege" - RLS is blocking the insert

## ✅ Complete Solution

### Step 1: Run the Fix SQL Script

1. **Open Supabase Dashboard**
   - Go to your Supabase project
   - Navigate to **SQL Editor**

2. **Run the Complete Fix Script**
   - Open the file: `supabase/COMPLETE_FIX.sql`
   - Copy the entire contents
   - Paste into Supabase SQL Editor
   - Click **Run** (or press F5)

3. **Verify the Output**
   - You should see verification queries at the end showing:
     - Trigger exists
     - Function has `SECURITY DEFINER`
     - RLS is enabled

### Step 2: Test Signup

1. Try signing up a new user
2. Check Supabase Dashboard → **Table Editor** → **profiles**
3. Profile should appear within 1-2 seconds

### Step 3: Verify Trigger is Working

Run this query in Supabase SQL Editor to verify:

```sql
-- Check trigger exists
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Check function has SECURITY DEFINER
SELECT 
  routine_name,
  security_type
FROM information_schema.routines
WHERE routine_name = 'handle_new_user';
```

Expected results:
- Trigger should exist with `event_object_table` = `users`
- Function should have `security_type` = `DEFINER`

## 🔧 What the Fix Does

The `COMPLETE_FIX.sql` script:

1. ✅ Creates/recreates the `profiles` table
2. ✅ Sets up RLS policies correctly
3. ✅ **Creates trigger function with `SECURITY DEFINER`** (bypasses RLS)
4. ✅ Grants proper permissions to the function
5. ✅ Creates the trigger on `auth.users` table
6. ✅ Verifies everything is set up correctly

## 📋 Code Changes Made

### Updated `lib/authActions.ts`

- **Removed** manual profile creation fallback (it always fails due to RLS)
- **Added** better error logging with clear instructions
- **Improved** error messages to guide users to the fix

The code now:
- Waits for trigger to execute
- Checks if profile was created
- Logs clear error messages if trigger fails
- Doesn't attempt manual creation (which would fail anyway)

## 🐛 Troubleshooting

### Issue: Trigger Still Not Working

**Check 1: Verify Trigger Exists**
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

**Check 2: Verify Function Owner**
```sql
SELECT p.proname, pg_get_userbyid(p.proowner) as owner
FROM pg_proc p
WHERE p.proname = 'handle_new_user';
```
Owner should be `postgres` or `supabase_admin`.

**Check 3: Check Postgres Logs**
- Go to Supabase Dashboard → **Logs** → **Postgres Logs**
- Look for errors when user signs up
- Filter for "handle_new_user" or "WARNING"

### Issue: Still Getting RLS Error

If you still see RLS errors after running the fix:

1. **Verify SECURITY DEFINER is set:**
   ```sql
   ALTER FUNCTION public.handle_new_user() SECURITY DEFINER;
   ```

2. **Verify search_path is set:**
   ```sql
   ALTER FUNCTION public.handle_new_user() SET search_path = public;
   ```

3. **Re-run the complete fix script**

### Issue: Profile Created But Not Immediately Visible

- Wait 2-3 seconds after signup
- Refresh the Supabase table editor
- Check if profile appears

## 📚 Additional Resources

- **Detailed Debug Guide**: See `DEBUG_TRIGGER.md`
- **Complete Fix Script**: See `supabase/COMPLETE_FIX.sql`
- **Original Migrations**: See `supabase/migrations/` folder

## ✅ Success Indicators

After running the fix, you should see:

1. ✅ No more RLS errors in console
2. ✅ Profile created automatically on signup
3. ✅ Console shows: `✅ Profile created successfully by trigger`
4. ✅ Profile visible in Supabase `profiles` table immediately after signup

## 🚨 Important Notes

- **Manual profile creation will ALWAYS fail** due to RLS - don't try it
- **The trigger MUST use SECURITY DEFINER** to bypass RLS
- **Run the complete fix script** - partial fixes won't work
- **User account is still created** even if profile fails - profile can be created manually later if needed

## 📞 Still Having Issues?

1. Check `DEBUG_TRIGGER.md` for detailed troubleshooting
2. Verify all steps in `COMPLETE_FIX.sql` ran successfully
3. Check Supabase Postgres logs for errors
4. Ensure your Supabase project is active (not paused)
