'use client'

import { useState, useEffect, useRef } from 'react'
import { createSupabaseImplicitBrowserClient } from '@/lib/supabaseImplicitBrowser'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ButtonLoader } from '@/components/ui/ButtonLoader'

/** Retry helper for AbortError (Supabase auth lock issue) - retries up to 2 times */
async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 2
): Promise<T> {
  try {
    return await fn()
  } catch (err) {
    const isAbortError = err instanceof Error && (
      err.name === 'AbortError' ||
      err.message?.includes('Lock broken') ||
      err.message?.includes('steal')
    )
    if (isAbortError && retries > 0) {
      await new Promise((r) => setTimeout(r, 500))
      return withRetry(fn, retries - 1)
    }
    throw err
  }
}

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage: string
): Promise<T> {
  return await Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs)
    ),
  ])
}

export default function ResetPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)
  const router = useRouter()
  const verifiedRef = useRef(false)

  useEffect(() => {
    if (verifiedRef.current) return
    verifiedRef.current = true

    const supabase = createSupabaseImplicitBrowserClient()

    async function verifyToken() {
      // Brief delay to reduce race with NavbarWrapper/AuthButton getSession (avoids lock contention)
      await new Promise((r) => setTimeout(r, 100))

      try {
        // 1. Check hash fragment (implicit flow): #access_token=...&refresh_token=...&type=recovery
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        const hashType = hashParams.get('type')

        if (accessToken && hashType === 'recovery') {
          const { error } = await withTimeout(
            withRetry(() =>
              supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken || '',
              })
            ),
            12000,
            'Token verification timed out'
          )

          if (error) {
            setError('Invalid or expired reset link. Please request a new password reset.')
            return
          }

          setSessionReady(true)
          window.history.replaceState(null, '', window.location.pathname)
          return
        }

        // 2. Check query params (PKCE flow): ?token_hash=...&type=recovery
        const searchParams = new URLSearchParams(window.location.search)
        const tokenHash = searchParams.get('token_hash')
        const queryType = searchParams.get('type')

        if (tokenHash && queryType === 'recovery') {
          const { error } = await withTimeout(
            withRetry(() =>
              supabase.auth.verifyOtp({
                token_hash: tokenHash,
                type: 'recovery',
              })
            ),
            12000,
            'Token verification timed out'
          )
          if (error) {
            setError('Invalid or expired reset link. Please request a new password reset.')
            return
          }
          setSessionReady(true)
          window.history.replaceState(null, '', window.location.pathname)
          return
        }

        // 2b. Check PKCE auth code: ?code=... (Supabase PKCE flow)
        const code = searchParams.get('code')
        if (code) {
          const { error: exchangeError } = await withTimeout(
            withRetry(() => supabase.auth.exchangeCodeForSession(code)),
            12000,
            'Token verification timed out'
          )
          if (exchangeError) {
            if (
              exchangeError.message?.includes('code_verifier') ||
              exchangeError.message?.includes('pkce_code_verifier')
            ) {
              setError(
                'This reset link was opened in a different browser or device. Please request a new password reset from the same browser where you requested it.'
              )
            } else {
              setError('Invalid or expired reset link. Please request a new password reset.')
            }
            return
          }
          setSessionReady(true)
          window.history.replaceState(null, '', window.location.pathname)
          return
        }

        // 3. Check for error in URL (e.g. from auth callback)
        const urlError = searchParams.get('error')
        if (urlError) {
          setError(decodeURIComponent(urlError))
          return
        }

        // 4. Check if user already has a session (e.g. from callback)
        const { data: { session } } = await withTimeout(
          withRetry(() => supabase.auth.getSession()),
          12000,
          'Session lookup timed out'
        )

        if (session) {
          setSessionReady(true)
        } else {
          setError('No valid reset token found. Please use the link from your email.')
        }
      } catch (err) {
        console.error('Reset token verification error:', err)
        setError(
          err instanceof Error &&
          (
            err.name === 'AbortError' ||
            err.message?.includes('Lock') ||
            err.message?.includes('timed out')
          )
            ? 'Verification failed due to a temporary issue. Please try again or request a new reset link.'
            : 'An unexpected error occurred. Please request a new reset link.'
        )
      }
    }

    verifyToken()
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    const formData = new FormData(e.currentTarget)
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    const supabase = createSupabaseImplicitBrowserClient()
    
    // Verify session exists before updating password
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setError('Session expired. Please request a new password reset link.')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
      // Sign out after password reset
      await supabase.auth.signOut()
      setTimeout(() => {
        router.push('/auth/login')
      }, 2000)
    }
  }

  return (
    <div style={{ 
      maxWidth: '400px', 
      margin: '2rem auto', 
      padding: '2rem',
      border: '1px solid #ddd',
      borderRadius: '8px'
    }}>
      <h1 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Reset Password</h1>

      {error && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{
            padding: '0.75rem',
            marginBottom: '0.75rem',
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            borderRadius: '6px',
            border: '1px solid #fecaca',
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
          <div style={{ textAlign: 'center' }}>
            <Link
              href="/auth/forgot-password"
              style={{
                color: '#6366f1',
                textDecoration: 'underline',
                fontWeight: '500',
                fontSize: '0.875rem'
              }}
            >
              Request a new reset link
            </Link>
          </div>
        </div>
      )}

      {success && (
        <div style={{
          padding: '0.75rem',
          marginBottom: '1rem',
          backgroundColor: '#efe',
          color: '#3c3',
          borderRadius: '4px',
          border: '1px solid #cfc'
        }}>
          Password updated successfully! Redirecting to login...
        </div>
      )}

      {!sessionReady && !error && (
        <div style={{
          padding: '0.75rem',
          marginBottom: '1rem',
          backgroundColor: '#eef',
          color: '#336',
          borderRadius: '4px',
          border: '1px solid #ccf'
        }}>
          Verifying reset token...
        </div>
      )}

      {!success && sessionReady && (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem' }}>
              New Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              minLength={6}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '0.5rem' }}>
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              required
              minLength={6}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#333',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            {loading && <ButtonLoader />}
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      )}

      <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
        <Link 
          href="/auth/login"
          style={{ color: '#333', textDecoration: 'underline' }}
        >
          Back to Login
        </Link>
      </div>
    </div>
  )
}
