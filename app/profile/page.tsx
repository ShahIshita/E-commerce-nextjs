'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabaseBrowser'
import Toast from '@/components/Toast'
import AddressSection from './AddressSection'

type Tab = 'profile' | 'orders' | 'password' | 'address'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('profile')

  // Profile Form States
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [gender, setGender] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)

  // Password States
  const [changePasswordError, setChangePasswordError] = useState<string | null>(null)
  const [changePasswordLoading, setChangePasswordLoading] = useState(false)
  
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const supabase = createSupabaseBrowserClient()

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.push('/auth/login')
        return
      }
      setUser(session.user)
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
      
      if (data) {
        setFirstName(data.first_name || '')
        setLastName(data.last_name || '')
        setGender(data.gender || '')
        setPhoneNumber(data.phone_number || '')
      }
      setLoading(false)
    })
  }, [router, supabase])

  async function handleSaveProfile() {
    setSavingProfile(true)
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        first_name: firstName,
        last_name: lastName,
        gender: gender,
        phone_number: phoneNumber,
        name: `${firstName} ${lastName}`.trim()
      })

    setSavingProfile(false)
    if (error) {
      alert(error.message)
      return
    }
    setIsEditingProfile(false)
    setToastMessage('Profile updated successfully')
    setShowToast(true)
  }

  async function handleChangePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setChangePasswordLoading(true)
    setChangePasswordError(null)

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

    const email = user?.email
    if (!email) {
      setChangePasswordError('Could not find your email. Please log in again.')
      setChangePasswordLoading(false)
      return
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: oldPassword,
    })

    if (signInError) {
      setChangePasswordError('Current password is incorrect')
      setChangePasswordLoading(false)
      return
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (updateError) {
      setChangePasswordError(updateError.message)
      setChangePasswordLoading(false)
      return
    }

    setChangePasswordLoading(false)
    setToastMessage('Password changed successfully')
    setShowToast(true)
    ;(e.target as HTMLFormElement).reset()
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleToastClose = useCallback(() => setShowToast(false), [])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <p style={{ color: '#6b7280' }}>Loading profile...</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1rem', display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
      
      {/* Sidebar Layout */}
      <div style={{ width: '250px', backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280' }}>Welcome,</p>
          <p style={{ margin: 0, fontWeight: 600, color: '#111827', wordBreak: 'break-all' }}>{user?.email}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {[
            { id: 'profile', label: 'My profile' },
            { id: 'orders', label: 'Order page' },
            { id: 'password', label: 'Change password' },
            { id: 'address', label: 'Save address' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as Tab)}
              style={{
                textAlign: 'left',
                padding: '1rem',
                backgroundColor: activeTab === t.id ? '#eff6ff' : 'transparent',
                border: 'none',
                borderBottom: '1px solid #e5e7eb',
                color: activeTab === t.id ? '#2563eb' : '#374151',
                fontWeight: activeTab === t.id ? 600 : 400,
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              {t.label}
            </button>
          ))}
          <button
            onClick={handleLogout}
            style={{
              textAlign: 'left',
              padding: '1rem',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#dc2626',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '2rem', minHeight: '500px' }}>
        
        {/* TAB: My Profile */}
        {activeTab === 'profile' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#111827' }}>Personal Information</h2>
              <button 
                onClick={() => isEditingProfile ? handleSaveProfile() : setIsEditingProfile(true)}
                disabled={savingProfile}
                style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, cursor: 'pointer' }}
              >
                {savingProfile ? 'Saving...' : isEditingProfile ? 'Save' : 'Edit'}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
              <div>
                <input 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={!isEditingProfile}
                  placeholder="First Name"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '4px', backgroundColor: !isEditingProfile ? '#f9fafb' : '#fff' }}
                />
              </div>
              <div>
                <input 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={!isEditingProfile}
                  placeholder="Last Name"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '4px', backgroundColor: !isEditingProfile ? '#f9fafb' : '#fff' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: '#374151' }}>Your Gender</p>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: isEditingProfile ? 'pointer' : 'default' }}>
                  <input type="radio" name="gender" value="Male" checked={gender === 'Male'} onChange={(e) => setGender(e.target.value)} disabled={!isEditingProfile} />
                  Male
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: isEditingProfile ? 'pointer' : 'default' }}>
                  <input type="radio" name="gender" value="Female" checked={gender === 'Female'} onChange={(e) => setGender(e.target.value)} disabled={!isEditingProfile} />
                  Female
                </label>
              </div>
            </div>

            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#111827' }}>Email Address</h3>
            <div style={{ marginBottom: '2rem' }}>
              <input 
                value={user?.email || ''}
                readOnly
                disabled
                style={{ width: '100%', maxWidth: '300px', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '4px', backgroundColor: '#f9fafb', color: '#6b7280' }}
              />
            </div>

            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#111827' }}>Mobile Number</h3>
            <div>
              <input 
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={!isEditingProfile}
                placeholder="+91"
                style={{ width: '100%', maxWidth: '300px', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '4px', backgroundColor: !isEditingProfile ? '#f9fafb' : '#fff' }}
              />
            </div>
            
            {isEditingProfile && (
              <div style={{ marginTop: '1.5rem' }}>
                <button 
                  onClick={() => setIsEditingProfile(false)}
                  style={{ padding: '0.6rem 1rem', border: '1px solid #d1d5db', borderRadius: '6px', background: '#fff', cursor: 'pointer', marginRight: '1rem' }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB: Order page */}
        {activeTab === 'orders' && (
          <div>
            <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', color: '#111827' }}>Order History</h2>
            <p style={{ color: '#6b7280' }}>You have no past orders yet.</p>
          </div>
        )}

        {/* TAB: Change Password */}
        {activeTab === 'password' && (
          <div style={{ maxWidth: '400px' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', color: '#111827' }}>Change Password</h2>
            
            {changePasswordError && (
              <div style={{ padding: '0.75rem', marginBottom: '1rem', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '6px', border: '1px solid #fecaca', fontSize: '0.875rem' }}>
                {changePasswordError}
              </div>
            )}

            <form onSubmit={handleChangePassword}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#374151' }}>Current Password</label>
                <input type="password" name="oldPassword" required style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '6px' }} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#374151' }}>New Password</label>
                <input type="password" name="newPassword" required minLength={6} style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '6px' }} />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#374151' }}>Confirm New Password</label>
                <input type="password" name="confirmPassword" required minLength={6} style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '6px' }} />
              </div>

              <button type="submit" disabled={changePasswordLoading} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 500, cursor: changePasswordLoading ? 'wait' : 'pointer' }}>
                {changePasswordLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        )}

        {/* TAB: Save Address */}
        {activeTab === 'address' && (
          <div>
            <AddressSection userId={user.id} />
          </div>
        )}
      </div>

      <Toast message={toastMessage} visible={showToast} onClose={handleToastClose} />
    </div>
  )
}
