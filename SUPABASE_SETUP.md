# Supabase Project Setup Guide

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in the form:
   - **Project name**: `e-commerce-next`
   - **Database password**: 
     - Click "Generate a password" OR
     - Create your own strong password (save it securely!)
     - Example: `MyEcommerce2024!@#SecurePass`
   - **Region**: Select closest to your users
   - **Security Settings**:
     - ✅ **Enable Data API**: Keep checked (required)
     - ✅ **Enable automatic RLS**: Check this (important for security)

4. Click "Create new project"
5. Wait 1-2 minutes for project to be created

## Step 2: Get Your API Keys

After your project is created:

1. Go to your project dashboard
2. Click on **Settings** (gear icon) in the left sidebar
3. Click on **API** in the settings menu
4. You'll see two important values:

   - **Project URL**: Copy this (looks like `https://xxxxx.supabase.co`)
   - **anon/public key**: Copy this (long string starting with `eyJ...`)

## Step 3: Configure Environment Variables

1. Copy `env.template` to `.env.local`:
   ```bash
   cp env.template .env.local
   ```

2. Open `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. Replace the placeholder values with your actual:
   - `NEXT_PUBLIC_SUPABASE_URL` = Your Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Your anon/public key

## Step 4: Set Up Database Tables

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the SQL from `supabase/migrations/001_create_profiles_table.sql`
4. Click **Run** (or press Ctrl+Enter)
5. Copy and paste the SQL from `supabase/migrations/002_create_profiles_trigger.sql`
6. Click **Run** again

## Step 5: Configure Auth Redirect URLs (for Password Reset)

For "Forgot Password" to work, add these URLs in Supabase:

1. Go to **Authentication** → **URL Configuration**
2. Add to **Redirect URLs**:
   - `http://localhost:3000/auth/reset-password`
   - For production: `https://yourdomain.com/auth/reset-password`
3. Set **Site URL** to your app URL (e.g. `http://localhost:3000` for dev)

## Step 6: Verify Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Test the connection:
   - Visit `http://localhost:3000/api/test`
   - Check the browser console and terminal for connection status

3. Test authentication:
   - Visit `http://localhost:3000/auth/signup`
   - Create a test account
   - Check Supabase dashboard → **Table Editor** → **profiles** table
   - You should see your new profile record!

## Troubleshooting

### "Missing Supabase environment variables" error
- Make sure `.env.local` exists and has correct values
- Restart your dev server after adding environment variables

### "relation does not exist" error
- Make sure you ran the SQL migrations in Step 4
- Check that the `profiles` table exists in Supabase dashboard

### Connection test fails
- Verify your `NEXT_PUBLIC_SUPABASE_URL` is correct (no trailing slash)
- Verify your `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
- Check that your Supabase project is active (not paused)

## Important Notes

- **Never commit `.env.local`** - it's already in `.gitignore`
- **Database password** is different from API keys - you only need API keys for this app
- **anon/public key** is safe to use in client-side code (it's public)
- Keep your **service_role key** secret (don't use it in client-side code)
