'use client'

import { useState } from 'react'
import { resetPasswordAction } from '@/lib/authActions'
import Link from 'next/link'
import { ButtonLoader } from '@/components/ui/ButtonLoader'

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    const formData = new FormData(e.currentTarget)
    const result = await resetPasswordAction(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
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
      <h1 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Forgot Password</h1>

      {error && (
        <div style={{
          padding: '0.75rem',
          marginBottom: '1rem',
          backgroundColor: '#fee',
          color: '#c33',
          borderRadius: '4px',
          border: '1px solid #fcc'
        }}>
          {error}
          {(error.includes('rate limit') || error.includes('27 seconds') || error.includes('security purposes')) && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
              <p>💡 Tips:</p>
              <ul style={{ marginLeft: '1.5rem', marginTop: '0.25rem' }}>
                <li>Wait 5-10 minutes before trying again</li>
                <li>Check your spam/junk folder for previous reset emails</li>
                <li>If you just signed up, try logging in with your password first</li>
              </ul>
            </div>
          )}
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
          Password reset email sent! Please check your inbox.
        </div>
      )}

      {!success && (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem' }}>
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
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
            {loading ? 'Sending...' : 'Send Reset Link'}
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
