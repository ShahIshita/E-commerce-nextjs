# Supabase Database Migrations

This directory contains SQL migration files for setting up the database schema.

## Setup Instructions

1. **Create the profiles table:**
   - Run the SQL from `migrations/001_create_profiles_table.sql` in your Supabase SQL Editor
   - This creates the profiles table with the required fields and Row Level Security policies

2. **Create the trigger for automatic profile creation:**
   - Run the SQL from `migrations/002_create_profiles_trigger.sql` in your Supabase SQL Editor
   - This creates a trigger that automatically inserts a profile record when a new user signs up

3. **Fix RLS issues (if you get "row-level security policy" errors):**
   - Run the SQL from `migrations/003_fix_rls_for_trigger.sql` in your Supabase SQL Editor
   - This ensures the trigger has proper permissions to bypass RLS

## Manual Setup via Supabase Dashboard

### Step 1: Create Profiles Table

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the following SQL:

```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);
```

### Step 2: Create Trigger for Auto Profile Creation

Run the following SQL in the SQL Editor:

```sql
-- Function to handle new user signup and create profile
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
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger to automatically create profile when a new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### Step 3: Fix RLS Issues (If Needed)

If you encounter "new row violates row-level security policy" errors, run this SQL:

```sql
-- Drop and recreate the trigger function with proper permissions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recreate the function with SECURITY DEFINER (this bypasses RLS)
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
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

## Verification

After running the migrations:

1. Sign up a new user through the `/auth/signup` page
2. Check the `profiles` table in Supabase to verify the profile was created automatically
3. The profile should have the same `id` as the user's auth ID
