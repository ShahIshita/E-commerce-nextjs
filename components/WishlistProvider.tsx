'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

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

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        setWishlistIds(parsed.filter((v) => typeof v === 'string'))
      }
    } catch {
      // Ignore corrupted localStorage values.
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlistIds))
  }, [wishlistIds])

  const isInWishlist = useCallback(
    (productId: string) => wishlistIds.includes(productId),
    [wishlistIds]
  )

  const toggleWishlist = useCallback((productId: string) => {
    setWishlistIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    )
  }, [])

  const clearWishlist = useCallback(() => {
    setWishlistIds([])
  }, [])

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
