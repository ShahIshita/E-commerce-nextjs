# Debug Guide: Profile Creation Trigger Issue

## Error Analysis

**Error Code:** `42501`  
**Error Message:** `new row violates row-level security policy for table "profiles"`

### Root Cause

1. **Trigger Not Firing**: The database trigger `on_auth_user_created` is not executing when a user signs up
2. **RLS Blocking Manual Insert**: When code tries to create profile manually, RLS policy blocks it because:
   - The policy requires `auth.uid() = id`
   - During signup, the user session might not be fully established yet
   - Server-side client might not have the right authentication context

### Why SECURITY DEFINER Should Work But Doesn't

`SECURITY DEFINER` functions should bypass RLS, but they might fail if:
- Function owner doesn't have proper permissions
- Function is not created correctly
- Trigger is not properly attached
- Search path is incorrect

## Complete Solution

### Step 1: Run the Complete Fix SQL

Run `supabase/COMPLETE_FIX.sql` in Supabase SQL Editor. This script:
- ✅ Creates/recreates the profiles table
- ✅ Sets up RLS policies correctly
- ✅ Creates the trigger function with SECURITY DEFINER
- ✅ Grants proper permissions
- ✅ Creates the trigger
- ✅ Verifies everything is set up

### Step 2: Verify Trigger is Working

After running the SQL, check:

1. **Trigger Exists:**
   ```sql
   SELECT * FROM information_schema.triggers 
   WHERE trigger_name = 'on_auth_user_created';
   ```
   Should return 1 row.

2. **Function Has SECURITY DEFINER:**
   ```sql
   SELECT routine_name, security_type 
   FROM information_schema.routines 
   WHERE routine_name = 'handle_new_user';
   ```
   `security_type` should be `DEFINER`.

3. **Function Owner:**
   ```sql
   SELECT p.proname, pg_get_userbyid(p.proowner) as owner
   FROM pg_proc p
   WHERE p.proname = 'handle_new_user';
   ```
   Owner should be `postgres` or `supabase_admin`.

### Step 3: Test Signup

1. Sign up a new user
2. Immediately check Supabase Dashboard → **Table Editor** → **profiles**
3. Profile should appear within 1-2 seconds

### Step 4: Check Trigger Logs

If profile still isn't created:

1. Go to Supabase Dashboard → **Logs** → **Postgres Logs**
2. Filter for "handle_new_user" or "WARNING"
3. Look for any errors when user signs up

## Common Issues & Fixes

### Issue 1: Trigger Not Firing

**Symptoms:** No profile created, no errors in logs

**Fix:**
```sql
-- Check if trigger is enabled
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- If disabled, enable it (shouldn't happen, but just in case)
ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created;
```

### Issue 2: Function Permission Error

**Symptoms:** Error about insufficient privileges

**Fix:** Run this to grant permissions:
```sql
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon;
```

### Issue 3: RLS Still Blocking

**Symptoms:** Trigger runs but RLS blocks the insert

**Fix:** The function MUST have SECURITY DEFINER. Verify:
```sql
ALTER FUNCTION public.handle_new_user() SECURITY DEFINER;
```

### Issue 4: Search Path Issue

**Symptoms:** Function can't find the profiles table

**Fix:** Ensure search_path is set:
```sql
ALTER FUNCTION public.handle_new_user() SET search_path = public;
```

## Manual Profile Creation (Last Resort)

If trigger still doesn't work, you can manually create profiles for existing users:

```sql
-- Create profiles for all users without profiles
INSERT INTO public.profiles (id, name, email, phone, created_at)
SELECT 
  u.id,
  COALESCE(u.raw_user_meta_data->>'name', ''),
  u.email,
  NULL,
  u.created_at
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO NOTHING;
```

## Verification Checklist

After running `COMPLETE_FIX.sql`:

- [ ] Trigger `on_auth_user_created` exists
- [ ] Function `handle_new_user` exists
- [ ] Function has `SECURITY DEFINER` set
- [ ] Function owner is `postgres` or `supabase_admin`
- [ ] RLS is enabled on profiles table
- [ ] RLS policies exist for SELECT, UPDATE, INSERT
- [ ] Test signup creates profile automatically
- [ ] No errors in Postgres logs

## Still Not Working?

1. **Check Supabase Project Status:**
   - Make sure project is not paused
   - Check if you're on the free tier (has limitations)

2. **Check Function Definition:**
   ```sql
   SELECT pg_get_functiondef(oid) 
   FROM pg_proc 
   WHERE proname = 'handle_new_user';
   ```
   Verify SECURITY DEFINER is in the definition.

3. **Check Trigger Definition:**
   ```sql
   SELECT pg_get_triggerdef(oid) 
   FROM pg_trigger 
   WHERE tgname = 'on_auth_user_created';
   ```

4. **Contact Support:**
   - Check Supabase status page
   - Review Supabase documentation
   - Check Supabase Discord/forums
