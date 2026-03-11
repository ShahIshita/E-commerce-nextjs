'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabaseServer'
import { createImplicitClient } from '@/lib/supabaseImplicit'

export interface SignupData {
  email: string
  password: string
  name: string
}

export interface LoginData {
  email: string
  password: string
}

export async function signUpAction(formData: FormData) {
  const supabase = await createClient()

  const data: SignupData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    name: formData.get('name') as string,
  }

  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        name: data.name,
      },
    },
  })

  // Log for debugging (remove in production if needed)
  if (error) {
    console.error('Signup error:', error.message, error)
  }

  if (error) {
    // Handle rate limit errors specifically
    if (error.message.includes('rate limit') || 
        error.message.includes('too many') || 
        error.message.includes('exceeded')) {
      return { 
        error: 'Too many signup attempts. Please wait 5-10 minutes before trying again, or check your email for a confirmation link if you already signed up.' 
      }
    }
    
    // Handle email already registered
    if (error.message.includes('already registered') || 
        error.message.includes('already exists') ||
        error.message.includes('User already registered')) {
      return { 
        error: 'An account with this email already exists. Please try logging in instead.' 
      }
    }
    
    // Handle invalid email format
    if (error.message.includes('Invalid email') || 
        error.message.includes('email format')) {
      return { 
        error: 'Please enter a valid email address.' 
      }
    }
    
    // Handle weak password
    if (error.message.includes('Password') && error.message.includes('weak')) {
      return { 
        error: 'Password is too weak. Please use a stronger password (at least 6 characters).' 
      }
    }
    
    // Return user-friendly error message for other errors
    return { error: error.message }
  }

  // Wait a moment for the trigger to execute and create the profile
  await new Promise(resolve => setTimeout(resolve, 2000))

  // Verify profile was created by trigger (trigger uses SECURITY DEFINER so it bypasses RLS)
  // If trigger fails, try to create profile manually as fallback
  if (authData.user) {
    try {
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', authData.user.id)
        .single()

      if (!existingProfile) {
        // Profile wasn't created by trigger - this means trigger isn't set up correctly
        console.error('❌ PROFILE CREATION FAILED - Trigger not working')
        console.error('User ID:', authData.user.id)
        console.error('Email:', data.email)
        console.error('')
        console.error('⚠️ ACTION REQUIRED:')
        console.error('1. Go to Supabase Dashboard → SQL Editor')
        console.error('2. Run the SQL from: supabase/COMPLETE_FIX.sql')
        console.error('3. This will fix the trigger so profiles are created automatically')
        console.error('')
        console.error('The user account was created successfully, but the profile needs to be created manually.')
        console.error('See DEBUG_TRIGGER.md for detailed troubleshooting steps.')
        // Don't fail signup - account is created, profile can be created manually later
      } else {
        console.log('✅ Profile created successfully by trigger')
      }
    } catch (err) {
      // Profile check failed, but account is still created
      console.error('Error checking/creating profile:', err)
      console.warn('⚠️ Profile creation failed. User account created but profile needs manual setup.')
    }
  }

  // User is automatically logged in after signup - don't sign them out
  // Return success - the page will detect the logged-in user and show welcome message
  return { success: true, user: authData.user }
}

export async function signInAction(formData: FormData) {
  const supabase = await createClient()
  
  const data: LoginData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  })

  if (error) {
    // Handle specific error cases
    if (error.message.includes('Invalid login credentials')) {
      return { error: 'Invalid email or password. Please check your credentials and try again.' }
    }
    
    if (error.message.includes('Email not confirmed')) {
      return { error: 'Please check your email and click the confirmation link before logging in.' }
    }
    
    if (error.message.includes('rate limit') || error.message.includes('too many')) {
      return { error: 'Too many login attempts. Please wait a few minutes before trying again.' }
    }
    
    return { error: error.message }
  }

  redirect('/')
}

export async function signOutAction() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error('Sign out error:', error)
    return { error: error.message }
  }
  
  // Return success - redirect will be handled on client side
  return { success: true }
}

export async function resetPasswordAction(formData: FormData) {
  // Use implicit flow client so Supabase sends token_hash (not code).
  // token_hash works from ANY browser - PKCE code requires same browser.
  const supabase = createImplicitClient()
  const email = formData.get('email') as string

  // Redirect to reset-password - Supabase appends token_hash&type=recovery
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const redirectTo = `${baseUrl}/auth/reset-password`
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })

  if (error) {
    // Handle rate limit errors (Supabase: "For security purposes, you can only request this after X seconds")
    if (
      error.message.includes('rate limit') ||
      error.message.includes('too many requests') ||
      error.message.includes('security purposes') ||
      error.message.includes('only request this after')
    ) {
      return {
        error: 'Too many password reset requests. Please wait about 60 seconds before trying again, or check your email for the reset link.',
      }
    }
    
    // Handle other errors
    if (error.message.includes('email')) {
      return { 
        error: 'If an account exists with this email, a password reset link has been sent. Please check your inbox.' 
      }
    }
    
    return { error: error.message }
  }

  return { success: true, message: 'Password reset email sent! Please check your inbox.' }
}
