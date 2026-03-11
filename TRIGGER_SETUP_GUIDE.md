# Trigger Setup Guide - Fix Profile Creation Issue

## Problem
You're seeing: "Profile not created by trigger. Please check trigger setup in Supabase."

This means the database trigger isn't working, so profiles aren't being created automatically when users sign up.

## Solution: Run the Setup SQL

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase Dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Run the Setup Script
Copy and paste the entire contents of `supabase/SETUP_TRIGGER.sql` into the SQL Editor and click **Run**.

Or copy this SQL directly:

```sql
-- Complete Trigger Setup Script
-- Run this in Supabase SQL Editor to ensure the trigger works correctly

-- Step 1: Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Step 2: Create the function with SECURITY DEFINER (bypasses RLS)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, phone, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    NULL, -- Phone is optional, set to NULL
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the user creation
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Step 3: Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### Step 3: Verify Setup
After running the SQL, you should see:
- ✅ Success message
- ✅ Verification queries showing the trigger and function exist

### Step 4: Test
1. Sign up a new user
2. Check Supabase Dashboard → **Table Editor** → **profiles**
3. You should see the new profile with name, email, and created_at

## Verify Trigger is Working

### Check Trigger Exists:
```sql
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

### Check Function Exists:
```sql
SELECT 
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines
WHERE routine_name = 'handle_new_user';
```

Both queries should return results.

## Troubleshooting

### If trigger still doesn't work:

1. **Check RLS Policies:**
   - Go to **Table Editor** → **profiles** → **Policies**
   - Make sure policies allow the trigger function to insert

2. **Check Function Permissions:**
   - Go to **Database** → **Functions**
   - Find `handle_new_user`
   - Verify it has `SECURITY DEFINER` set

3. **Check Trigger Status:**
   - Go to **Database** → **Triggers**
   - Find `on_auth_user_created`
   - Make sure it's **enabled**

4. **Check Logs:**
   - Go to **Logs** → **Postgres Logs**
   - Look for errors when a user signs up
   - Check for any trigger execution errors

## Manual Profile Creation (Temporary Fix)

If the trigger still doesn't work, you can manually create profiles for existing users:

```sql
-- Create profile for a specific user (replace USER_ID with actual user ID)
INSERT INTO public.profiles (id, name, email, phone, created_at)
SELECT 
  id,
  raw_user_meta_data->>'name' as name,
  email,
  NULL as phone,
  created_at
FROM auth.users
WHERE id = 'USER_ID_HERE'
ON CONFLICT (id) DO NOTHING;
```

## Still Having Issues?

1. Make sure the `profiles` table exists (run `001_create_profiles_table.sql` first)
2. Check that RLS is enabled but the function has SECURITY DEFINER
3. Verify your Supabase project is active (not paused)
4. Check browser console and Supabase logs for specific error messages
