# Troubleshooting Signup Issues

## Issue: User not automatically logged in after signup

### Cause: Email Confirmation Enabled

If Supabase has **email confirmation** enabled, users won't be automatically logged in after signup. They need to click the confirmation link in their email first.

### Solution: Disable Email Confirmation (for development)

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Settings**
3. Under **Email Auth**, find **"Enable email confirmations"**
4. **Disable** it for development/testing
5. Save the changes

### Alternative: Keep Email Confirmation Enabled

If you want to keep email confirmation enabled:
- Users will receive an email with a confirmation link
- They need to click the link before they can log in
- After clicking the link, they'll be redirected back to your app and logged in

## Issue: Profile not being created in database

### Check 1: Verify Database Tables Exist

1. Go to Supabase Dashboard → **Table Editor**
2. Check if `profiles` table exists
3. If not, run the SQL migrations:
   - `supabase/migrations/001_create_profiles_table.sql`
   - `supabase/migrations/002_create_profiles_trigger.sql`
   - `supabase/migrations/003_fix_rls_for_trigger.sql` (if RLS issues)

### Check 2: Verify Trigger Exists

1. Go to Supabase Dashboard → **Database** → **Functions**
2. Check if `handle_new_user` function exists
3. Verify it has `SECURITY DEFINER` set
4. Go to **Database** → **Triggers**
5. Check if `on_auth_user_created` trigger exists and is enabled

### Check 3: Fix RLS Issue

If you see "new row violates row-level security policy":
1. The trigger should bypass RLS (it uses SECURITY DEFINER)
2. Run the migration: `supabase/migrations/003_fix_rls_for_trigger.sql`
3. This recreates the trigger with proper permissions

### Check 4: Check Trigger Logs

1. Go to Supabase Dashboard → **Logs** → **Postgres Logs**
2. Look for any errors when a user signs up
3. Common issues:
   - Trigger not firing (check if it's enabled)
   - Missing columns in profiles table
   - Function permissions issue

### Check 5: Manual Verification

1. Sign up a new user
2. Go to Supabase Dashboard → **Table Editor** → **profiles**
3. Check if profile was created
4. If not, check **Authentication** → **Users** to see if user was created
5. If user exists but profile doesn't, the trigger isn't working - run migration 003

## Issue: "Creating account..." stuck

### Possible Causes:

1. **Network issue**: Check your internet connection
2. **Supabase connection**: Verify your `.env.local` has correct credentials
3. **Rate limiting**: Too many signup attempts - wait a few minutes
4. **Email already exists**: Try a different email address

### Debug Steps:

1. Open browser DevTools (F12)
2. Check **Console** tab for errors
3. Check **Network** tab for failed requests
4. Look for specific error messages

## Quick Fix Checklist

- [ ] Email confirmation is disabled (for auto-login)
- [ ] Profiles table exists in Supabase
- [ ] Trigger `on_auth_user_created` exists
- [ ] Function `handle_new_user` exists
- [ ] `.env.local` has correct Supabase credentials
- [ ] No errors in browser console
- [ ] No errors in Supabase logs

## Testing Signup Flow

1. Fill out the signup form
2. Click "Sign Up"
3. **If email confirmation is disabled**: You should be automatically logged in
4. **If email confirmation is enabled**: Check your email and click the confirmation link
5. After login, check Supabase Dashboard → **Table Editor** → **profiles** table
6. You should see your profile with name, email, and phone

## Still Having Issues?

1. Check Supabase Dashboard → **Authentication** → **Users** to see if the user was created
2. Check Supabase Dashboard → **Table Editor** → **profiles** to see if profile exists
3. Check browser console for JavaScript errors
4. Check Supabase logs for database errors
