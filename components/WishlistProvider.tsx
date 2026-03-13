'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabaseBrowser'

type WishlistContextValue = {
  wishlistIds: string[]
  isInWishlist: (productId: string) => boolean
  toggleWishlist: (productId: string) => void
  clearWishlist: () => void
  count: number
}

const WishlistContext = createContext<WishlistContextValue | null>(null)
const STORAGE_KEY = 'nexcart_wishlist_ids'

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistIds, setWishlistIds] = useState<string[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  
  // 1. Listen for auth changes to get userId
  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null)
    })
    
    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null)
    })
    
    return () => subscription.unsubscribe()
  }, [])

  // 2. Load wishlist initially (either from DB if logged in, or local storage)
  useEffect(() => {
    if (userId) {
      // User is logged in, fetch from database
      const fetchDbWishlist = async () => {
        const supabase = createSupabaseBrowserClient()
        const { data } = await supabase
          .from('wishlists')
          .select('product_id')
          .eq('user_id', userId)
          
        if (data) {
          const dbIds = data.map(row => row.product_id)
          setWishlistIds(dbIds)
        }
      }
      fetchDbWishlist()
    } else {
      // User is not logged in, fetch from local storage
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY)
        if (raw) {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed)) {
            setWishlistIds(parsed.filter((v) => typeof v === 'string'))
          }
        }
      } catch {
        // Ignore corrupted localStorage values.
      }
    }
  }, [userId])

  // 3. Keep localStorage updated for guest users (or as a local backup)
  useEffect(() => {
    if (!userId) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlistIds))
    }
  }, [wishlistIds, userId])

  const isInWishlist = useCallback(
    (productId: string) => wishlistIds.includes(productId),
    [wishlistIds]
  )

  const toggleWishlist = useCallback(async (productId: string) => {
    const supabase = createSupabaseBrowserClient()
    const currentlyInWishlist = wishlistIds.includes(productId)
    
    // Optimistic UI update
    setWishlistIds((prev) =>
      currentlyInWishlist 
        ? prev.filter((id) => id !== productId) 
        : [...prev, productId]
    )

    // Sync with database if logged in
    if (userId) {
      if (currentlyInWishlist) {
        // Remove from DB
        await supabase
          .from('wishlists')
          .delete()
          .match({ user_id: userId, product_id: productId })
      } else {
        // Add to DB
        await supabase
          .from('wishlists')
          .insert({ user_id: userId, product_id: productId })
      }
    }
  }, [wishlistIds, userId])

  const clearWishlist = useCallback(async () => {
    setWishlistIds([])
    
    // Clear from DB if logged in
    if (userId) {
      const supabase = createSupabaseBrowserClient()
      await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', userId)
    }
  }, [userId])

  const value = useMemo<WishlistContextValue>(
    () => ({
      wishlistIds,
      isInWishlist,
      toggleWishlist,
      clearWishlist,
      count: wishlistIds.length,
    }),
    [wishlistIds, isInWishlist, toggleWishlist, clearWishlist]
  )

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider')
  }
  return context
}
