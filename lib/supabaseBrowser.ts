import { createBrowserClient } from '@supabase/ssr'

/**
 * Create a browser Supabase client.
 * Note: do not create this at module scope; during `next build` the env vars may
 * be missing and Next may evaluate modules while prerendering routes.
 */
export function createSupabaseBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

