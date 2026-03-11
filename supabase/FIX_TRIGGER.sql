-- Fix trigger - Safe to run even if trigger already exists
-- This will drop and recreate the trigger with proper permissions

-- Drop trigger first (CASCADE handles any dependencies)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;

-- Drop function (CASCADE handles any dependencies)
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

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
