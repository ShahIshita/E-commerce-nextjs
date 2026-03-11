'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabaseBrowser'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    const next = searchParams.get('next') || '/auth/reset-password'

    async function handleCallback() {
      // 1. Check hash fragment: #access_token=...&refresh_token=...&type=recovery
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get('access_token')
      const hashType = hashParams.get('type')

      if (accessToken && hashType === 'recovery') {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: hashParams.get('refresh_token') || '',
        })
        if (error) {
          router.replace(`/auth/reset-password?error=${encodeURIComponent(error.message)}`)
          return
        }
        router.replace(next)
        return
      }

      // 2. Check query params: ?token_hash=...&type=recovery
      const tokenHash = searchParams.get('token_hash')
      const queryType = searchParams.get('type')

      if (tokenHash && queryType === 'recovery') {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'recovery',
        })
        if (error) {
          router.replace(`/auth/reset-password?error=${encodeURIComponent(error.message)}`)
          return
        }
        router.replace(next)
        return
      }

      setError('No valid token found. Please use the link from your email.')
    }

    handleCallback()
  }, [router, searchParams])

  if (error) {
    return (
      <div style={{ maxWidth: '400px', margin: '2rem auto', padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#dc2626', marginBottom: '1rem' }}>{error}</p>
        <a href="/auth/forgot-password" style={{ color: '#6366f1', textDecoration: 'underline' }}>
          Request a new reset link
        </a>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
      <div style={{ fontSize: '1rem', color: '#6b7280' }}>Verifying...</div>
    </div>
  )
}

/**
 * Auth callback page - handles redirects from Supabase (password reset, email confirmation).
 * Supports both hash fragment (implicit) and query params (PKCE) token formats.
 * Add http://localhost:3000/auth/callback to Supabase Redirect URLs if using this.
 */
export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
        <div style={{ fontSize: '1rem', color: '#6b7280' }}>Verifying...</div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}
