'use client'

import { useState, useEffect } from 'react'
import { signUpAction } from '@/lib/authActions'
import { createSupabaseBrowserClient } from '@/lib/supabaseBrowser'
import { useRouter } from 'next/navigation'
import { ButtonLoader } from '@/components/ui/ButtonLoader'

export default function Home() {
  const [showLogin, setShowLogin] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [signupError, setSignupError] = useState<string | null>(null)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [signupLoading, setSignupLoading] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        setShowLogin(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSignupLoading(true)
    setSignupError(null)

    const formData = new FormData(e.currentTarget)

    try {
      const result = await signUpAction(formData)

      if (result?.error) {
        setSignupError(result.error)
        setSignupLoading(false)
        return // Exit early on error
      } else {
        // After successful signup, user is automatically logged in
        // Refresh the session to update the UI
        const supabase = createSupabaseBrowserClient()
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
        setSignupLoading(false)
        // The page will automatically show the welcome message since user is now logged in
      }
    } catch (err) {
      // Handle unexpected errors (network issues, etc.)
      console.error('Signup error:', err)
      setSignupError('An unexpected error occurred. Please check your connection and try again.')
      setSignupLoading(false)
    }
  }

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoginLoading(true)
    setLoginError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const supabase = createSupabaseBrowserClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      if (authError.message.includes('Invalid login credentials')) {
        setLoginError('Invalid email or password. Please check your credentials and try again.')
      } else if (authError.message.includes('Email not confirmed')) {
        setLoginError('Please check your email and click the confirmation link before logging in.')
      } else if (authError.message.includes('rate limit') || authError.message.includes('too many')) {
        setLoginError('Too many login attempts. Please wait a few minutes before trying again.')
      } else {
        setLoginError(authError.message)
      }
      setLoginLoading(false)
      return
    }

    // Client-side sign-in triggers onAuthStateChange - user state and showLogin update via useEffect
    setLoginLoading(false)
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh' 
      }}>
        <div style={{ fontSize: '1.2rem', color: '#6b7280' }}>Loading...</div>
      </div>
    )
  }

  if (user) {
    return (
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '3rem 2rem',
        textAlign: 'center'
      }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: 'bold', 
          color: '#1f2937',
          marginBottom: '1rem'
        }}>
          Welcome to NexCart store
        </h1>
        <p style={{ 
          fontSize: '1.2rem', 
          color: '#6b7280',
          marginBottom: '2rem'
        }}>
          You're successfully logged in! Browse our products to get started.
        </p>
      </div>
    )
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      minHeight: '70vh',
      padding: '2rem'
    }}>
      <div style={{ 
        maxWidth: '450px', 
        width: '100%',
        backgroundColor: '#ffffff',
        padding: '2.5rem',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}>
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: 'bold', 
          color: '#1f2937',
          marginBottom: '0.5rem',
          textAlign: 'center'
        }}>
          Welcome to NexCart store
        </h1>
        <p style={{ 
          textAlign: 'center', 
          color: '#6b7280',
          marginBottom: '2rem'
        }}>
          {showLogin ? 'Login to your account' : 'Create your account to get started'}
        </p>

        {!showLogin ? (
          <>
            {signupError && (
              <div style={{
                padding: '0.875rem',
                marginBottom: '1.5rem',
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                borderRadius: '8px',
                border: '1px solid #fecaca',
                fontSize: '0.875rem'
              }}>
                <div style={{ fontWeight: '500', marginBottom: signupError.includes('rate limit') || signupError.includes('too many') || signupError.includes('exceeded') ? '0.5rem' : '0' }}>
                  {signupError}
                </div>
                {(signupError.includes('rate limit') || signupError.includes('too many') || signupError.includes('exceeded')) && (
                  <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #fecaca' }}>
                    <p style={{ margin: '0 0 0.5rem 0', fontWeight: '600', fontSize: '0.8rem' }}>💡 What you can do:</p>
                    <ul style={{ margin: '0', paddingLeft: '1.25rem', fontSize: '0.8rem', lineHeight: '1.6', marginBottom: '0.75rem' }}>
                      <li>Wait 5-10 minutes before trying again</li>
                      <li>Check your email inbox and spam folder for confirmation emails</li>
                      <li>If you already signed up, try logging in instead</li>
                    </ul>
                    <button
                      type="button"
                      onClick={() => {
                        setSignupError(null)
                        setShowLogin(true)
                      }}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        backgroundColor: '#6366f1',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6366f1'}
                    >
                      Try Logging In Instead →
                    </button>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSignup}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label htmlFor="name" style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    transition: 'border-color 0.2s',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label htmlFor="email" style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                  color: '#374151'
                }}>
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
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    transition: 'border-color 0.2s',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="password" style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Password
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
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    transition: 'border-color 0.2s',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <button
                type="submit"
                disabled={signupLoading}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  backgroundColor: signupLoading ? '#9ca3af' : '#6366f1',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: signupLoading ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  if (!signupLoading) e.currentTarget.style.backgroundColor = '#4f46e5'
                }}
                onMouseLeave={(e) => {
                  if (!signupLoading) e.currentTarget.style.backgroundColor = '#6366f1'
                }}
              >
                {signupLoading && <ButtonLoader />}
                {signupLoading ? 'Creating account...' : 'Sign Up'}
              </button>
            </form>
          </>
        ) : (
          <>
            {loginError && (
              <div style={{
                padding: '0.875rem',
                marginBottom: '1.5rem',
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                borderRadius: '8px',
                border: '1px solid #fecaca',
                fontSize: '0.875rem'
              }}>
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label htmlFor="login-email" style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Email
                </label>
                <input
                  type="email"
                  id="login-email"
                  name="email"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    transition: 'border-color 0.2s',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="login-password" style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Password
                </label>
                <input
                  type="password"
                  id="login-password"
                  name="password"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    transition: 'border-color 0.2s',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  backgroundColor: loginLoading ? '#9ca3af' : '#6366f1',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: loginLoading ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  if (!loginLoading) e.currentTarget.style.backgroundColor = '#4f46e5'
                }}
                onMouseLeave={(e) => {
                  if (!loginLoading) e.currentTarget.style.backgroundColor = '#6366f1'
                }}
              >
                {loginLoading && <ButtonLoader />}
                {loginLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <button
              onClick={() => setShowLogin(false)}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: 'transparent',
                color: '#6366f1',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f7fa'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Back to Sign Up
            </button>
          </>
        )}
      </div>
    </div>
  )
}
