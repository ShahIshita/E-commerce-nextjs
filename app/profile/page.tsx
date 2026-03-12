'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabaseBrowser'
import Toast from '@/components/Toast'
import AddressSection from './AddressSection'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [userName, setUserName] = useState('')
  const [loading, setLoading] = useState(true)
  const [changePasswordError, setChangePasswordError] = useState<string | null>(null)
  const [changePasswordSuccess, setChangePasswordSuccess] = useState(false)
  const [changePasswordLoading, setChangePasswordLoading] = useState(false)
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.push('/auth/login')
        return
      }
      setUser(session.user)
      const { data } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', session.user.id)
        .single()
      setUserName(data?.name || session.user.email?.split('@')[0] || 'User')
      setLoading(false)
    })
  }, [router])

  async function handleChangePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setChangePasswordLoading(true)
    setChangePasswordError(null)
    setChangePasswordSuccess(false)

    const formData = new FormData(e.currentTarget)
    const oldPassword = formData.get('oldPassword') as string
    const newPassword = formData.get('newPassword') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (newPassword !== confirmPassword) {
      setChangePasswordError('New password and confirm password do not match')
      setChangePasswordLoading(false)
      return
    }

    if (newPassword.length < 6) {
      setChangePasswordError('New password must be at least 6 characters')
      setChangePasswordLoading(false)
      return
    }

    if (oldPassword === newPassword) {
      setChangePasswordError('New password must be different from old password')
      setChangePasswordLoading(false)
      return
    }

    const supabase = createSupabaseBrowserClient()
    const email = user?.email

    if (!email) {
      setChangePasswordError('Could not find your email. Please log in again.')
      setChangePasswordLoading(false)
      return
    }

    // Verify old password by re-authenticating
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: oldPassword,
    })

    if (signInError) {
      if (signInError.message.includes('Invalid login credentials')) {
        setChangePasswordError('Current password is incorrect')
      } else {
        setChangePasswordError(signInError.message)
      }
      setChangePasswordLoading(false)
      return
    }

    // Update to new password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (updateError) {
      setChangePasswordError(updateError.message)
      setChangePasswordLoading(false)
      return
    }

    setChangePasswordSuccess(true)
    setChangePasswordLoading(false)
    setShowToast(true)
    ;(e.target as HTMLFormElement).reset()
  }

  const handleToastClose = useCallback(() => setShowToast(false), [])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
        <div style={{ fontSize: '1.2rem', color: '#6b7280' }}>Loading...</div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ marginBottom: '2rem', fontSize: '1.75rem', fontWeight: 'bold', color: '#1f2937' }}>
        Profile
      </h1>

      <div
        style={{
          marginBottom: '2rem',
          padding: '1.5rem',
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
        }}
      >
        <h2 style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: '600', color: '#374151' }}>
          Account Info
        </h2>
        <p style={{ margin: '0.25rem 0', color: '#6b7280' }}>
          <strong style={{ color: '#374151' }}>Name:</strong> {userName}
        </p>
        <p style={{ margin: '0.25rem 0', color: '#6b7280' }}>
          <strong style={{ color: '#374151' }}>Email:</strong> {user?.email}
        </p>
      </div>

      <div
        style={{
          padding: '1.5rem',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
        }}
      >
        <h2 style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: '600', color: '#374151' }}>
          Change Password
        </h2>

        {changePasswordError && (
          <div
            style={{
              padding: '0.75rem',
              marginBottom: '1rem',
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              borderRadius: '6px',
              border: '1px solid #fecaca',
              fontSize: '0.875rem',
            }}
          >
            {changePasswordError}
          </div>
        )}


        <form onSubmit={handleChangePassword}>
          <div style={{ marginBottom: '1rem' }}>
            <label
              htmlFor="oldPassword"
              style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}
            >
              Current Password
            </label>
            <input
              type="password"
              id="oldPassword"
              name="oldPassword"
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '1rem',
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label
              htmlFor="newPassword"
              style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}
            >
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              required
              minLength={6}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '1rem',
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label
              htmlFor="confirmPassword"
              style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}
            >
              Confirm New Password
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
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '1rem',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={changePasswordLoading}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: changePasswordLoading ? '#9ca3af' : '#6366f1',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: changePasswordLoading ? 'not-allowed' : 'pointer',
              opacity: changePasswordLoading ? 0.7 : 1,
            }}
          >
            {changePasswordLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      <Toast
        message="Password changed successfully"
        visible={showToast}
        onClose={handleToastClose}
      />

      <div style={{ marginTop: '2rem' }}>
        <AddressSection userId={user.id} />
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <Link
          href="/"
          style={{
            color: '#6366f1',
            textDecoration: 'none',
            fontWeight: '500',
            fontSize: '0.875rem',
          }}
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  )
}
