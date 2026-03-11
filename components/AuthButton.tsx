'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabaseBrowser'

interface AuthButtonProps {
  /** When true (on auth pages), show Login/Signup links instead of user/Logout */
  minimal?: boolean
}

export default function AuthButton({ minimal = false }: AuthButtonProps) {
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState<string>('')
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        // Get user name from profile
        const { data } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', session.user.id)
          .single()
        setUserName(data?.name || session.user.email?.split('@')[0] || 'User')
      }
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', session.user.id)
          .single()
        setUserName(data?.name || session.user.email?.split('@')[0] || 'User')
      } else {
        setUserName('')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    setIsLoggingOut(true)
    
    try {
      const supabase = createSupabaseBrowserClient()
      
      // Sign out on client side - this clears cookies and session
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Sign out error:', error)
        // Even if there's an error, proceed with redirect
      }
      
      // Small delay to ensure cookies are cleared
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Force a full page reload using window.location.href
      // This ensures:
      // 1. All client state is cleared
      // 2. Middleware runs with cleared session
      // 3. Server components re-render with no user
      // 4. No race conditions with router.push
      window.location.href = '/'
      
    } catch (error) {
      console.error('Logout error:', error)
      // On any error, force redirect anyway
      window.location.href = '/'
    }
    
    // Note: setIsLoggingOut(false) won't execute because window.location.href causes navigation
  }

  if (loading) {
    return <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Loading...</div>
  }

  // On auth pages (minimal mode), always show Login/Signup links - never show user/Logout
  if (minimal) {
    return (
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Link
          href="/auth/login"
          style={{
            color: pathname === '/auth/login' ? '#6366f1' : '#374151',
            textDecoration: 'none',
            fontWeight: '500',
            fontSize: '0.875rem',
            transition: 'color 0.2s',
          }}
        >
          Login
        </Link>
        <Link
          href="/auth/signup"
          style={{
            color: pathname === '/auth/signup' ? '#6366f1' : '#374151',
            textDecoration: 'none',
            fontWeight: '500',
            fontSize: '0.875rem',
            transition: 'color 0.2s',
          }}
        >
          Sign Up
        </Link>
      </div>
    )
  }

  if (user) {
    const initials = userName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)

    return (
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {/* Profile Icon with Name - links to profile page */}
        <Link
          href="/profile"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#f3f4f6',
            borderRadius: '9999px',
            textDecoration: 'none',
            color: 'inherit',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#e5e7eb'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6'
          }}
        >
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#6366f1',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.875rem',
            fontWeight: '600'
          }}>
            {initials}
          </div>
          <span style={{ 
            color: '#374151', 
            fontWeight: '500',
            fontSize: '0.875rem'
          }}>
            {userName}
          </span>
        </Link>

        {/* Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: isLoggingOut ? '#9ca3af' : '#ef4444',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: isLoggingOut ? 'not-allowed' : 'pointer',
            fontWeight: '500',
            fontSize: '0.875rem',
            transition: 'background-color 0.2s',
            opacity: isLoggingOut ? 0.7 : 1
          }}
          onMouseEnter={(e) => {
            if (!isLoggingOut) {
              e.currentTarget.style.backgroundColor = '#dc2626'
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoggingOut) {
              e.currentTarget.style.backgroundColor = '#ef4444'
            }
          }}
        >
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    )
  }

  return null
}
