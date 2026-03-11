'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import { createSupabaseBrowserClient } from '@/lib/supabaseBrowser'

export default function NavbarWrapper() {
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const isAuthRoute = pathname?.startsWith('/auth/')

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes (fires immediately on client-side auth like signInWithPassword)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // On auth pages: always show minimal navbar (Login/Signup links only, no Products/user/Logout)
  if (isAuthRoute) {
    return <Navbar minimal />
  }

  // On other pages: show full navbar only when user is logged in
  if (!loading && user) {
    return <Navbar />
  }

  // When not logged in on non-auth pages: show minimal navbar so users can navigate to Login/Signup
  if (!loading) {
    return <Navbar minimal />
  }

  return null
}
