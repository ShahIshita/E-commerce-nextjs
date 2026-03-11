import { createClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase client with implicit flow (no PKCE).
 * Use this ONLY for resetPasswordForEmail - it makes Supabase send token_hash
 * in the redirect URL instead of code, so the reset link works from ANY browser
 * (phone, different device, email app's in-app browser, etc.).
 *
 * The PKCE flow requires the code verifier in the same browser where the reset
 * was requested, which often fails when users open the email link elsewhere.
 */
export function createImplicitClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      flowType: 'implicit',
    },
  })
}
