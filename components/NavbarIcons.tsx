'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Heart, ShoppingCart } from 'lucide-react'
import { useWishlist } from '@/components/WishlistProvider'
import { createSupabaseBrowserClient } from '@/lib/supabaseBrowser'

export default function NavbarIcons() {
  const { count } = useWishlist()
  const [cartCount, setCartCount] = useState(0)

  const loadCartCount = useCallback(async () => {
    const supabase = createSupabaseBrowserClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setCartCount(0)
      return
    }

    const { count: nextCount } = await supabase
      .from('cart_items')
      .select('id, carts!inner(user_id)', { count: 'exact', head: true })
      .eq('carts.user_id', user.id)

    setCartCount(nextCount ?? 0)
  }, [])

  useEffect(() => {
    loadCartCount()
    const onCartChanged = () => loadCartCount()
    window.addEventListener('cart:changed', onCartChanged)
    return () => window.removeEventListener('cart:changed', onCartChanged)
  }, [loadCartCount])

  return (
    <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
      <Link
        href="/wishlist"
        style={{
          position: 'relative',
          width: '36px',
          height: '36px',
          borderRadius: '999px',
          border: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#374151',
        }}
      >
        <Heart size={18} />
        {count > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-6px',
              right: '-6px',
              minWidth: '18px',
              height: '18px',
              borderRadius: '999px',
              backgroundColor: '#ef4444',
              color: '#fff',
              fontSize: '0.7rem',
              lineHeight: '18px',
              textAlign: 'center',
              fontWeight: 700,
              padding: '0 4px',
            }}
          >
            {count}
          </span>
        )}
      </Link>

      <Link
        href="/cart"
        style={{
          position: 'relative',
          width: '36px',
          height: '36px',
          borderRadius: '999px',
          border: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#374151',
        }}
      >
        <ShoppingCart size={18} />
        {cartCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-6px',
              right: '-6px',
              minWidth: '18px',
              height: '18px',
              borderRadius: '999px',
              backgroundColor: '#2563eb',
              color: '#fff',
              fontSize: '0.7rem',
              lineHeight: '18px',
              textAlign: 'center',
              fontWeight: 700,
              padding: '0 4px',
            }}
          >
            {cartCount}
          </span>
        )}
      </Link>
    </div>
  )
}
