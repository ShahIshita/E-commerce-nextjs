'use client'

import Link from 'next/link'
import { Heart, ShoppingCart } from 'lucide-react'
import { useWishlist } from '@/components/WishlistProvider'

export default function NavbarIcons() {
  const { count } = useWishlist()

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
      </Link>
    </div>
  )
}
