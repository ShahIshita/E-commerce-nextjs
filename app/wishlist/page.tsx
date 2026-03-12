'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabaseBrowser'
import { useWishlist } from '@/components/WishlistProvider'
import ProductCard from '@/components/products/ProductCard'

type WishlistProduct = {
  id: string
  name: string
  description: string | null
  price: number
  stock_quantity: number
  image_url: string | null
  brand: string | null
  color: string | null
  size: string | null
}

export default function WishlistPage() {
  const { wishlistIds, clearWishlist } = useWishlist()
  const [products, setProducts] = useState<WishlistProduct[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function loadWishlistProducts() {
      if (wishlistIds.length === 0) {
        setProducts([])
        return
      }

      setLoading(true)
      const supabase = createSupabaseBrowserClient()
      const { data } = await supabase
        .from('products')
        .select('id, name, description, price, stock_quantity, image_url, brand, color, size')
        .in('id', wishlistIds)

      const sorted = (data ?? []).sort(
        (a, b) => wishlistIds.indexOf(a.id) - wishlistIds.indexOf(b.id)
      )
      setProducts(
        sorted.map((p) => ({
          ...p,
          price: Number(p.price),
        }))
      )
      setLoading(false)
    }

    loadWishlistProducts()
  }, [wishlistIds])

  return (
    <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1>My Wishlist</h1>
        {wishlistIds.length > 0 && (
          <button
            onClick={clearWishlist}
            style={{
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              backgroundColor: '#fff',
              padding: '0.45rem 0.75rem',
              cursor: 'pointer',
            }}
          >
            Clear Wishlist
          </button>
        )}
      </div>

      {loading && <p style={{ color: '#6b7280' }}>Loading wishlist...</p>}

      {!loading && wishlistIds.length === 0 && (
        <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem' }}>
          <p style={{ marginBottom: '0.75rem' }}>Your wishlist is empty.</p>
          <Link href="/products" style={{ color: '#2563eb', textDecoration: 'underline' }}>
            Browse products
          </Link>
        </div>
      )}

      {!loading && products.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
            gap: '1rem',
          }}
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
