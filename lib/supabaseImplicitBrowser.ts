import { createClient } from '@supabase/supabase-js'

/**
 * Browser client dedicated to implicit/hash auth flows.
 * Used by reset-password links that arrive as:
 * /auth/reset-password#access_token=...&refresh_token=...&type=recovery
 */
export function createSupabaseImplicitBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      flowType: 'implicit',
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  })
}
