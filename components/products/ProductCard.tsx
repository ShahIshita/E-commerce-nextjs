'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Heart, ShoppingCart } from 'lucide-react'
import { useWishlist } from '@/components/WishlistProvider'
import { addProductToCart } from '@/lib/cartClient'
import { ButtonLoader } from '@/components/ui/ButtonLoader'

type ProductCardProps = {
  product: {
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
}

export default function ProductCard({ product }: ProductCardProps) {
  const { isInWishlist, toggleWishlist } = useWishlist()
  const [addingToCart, setAddingToCart] = useState(false)
  const liked = isInWishlist(product.id)

  return (
    <Link
      href={`/products/${product.id}`}
      style={{
        textDecoration: 'none',
        color: 'inherit',
        border: '1px solid #e5e7eb',
        borderRadius: '10px',
        padding: '1rem',
        backgroundColor: '#fff',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <button
        type="button"
        aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          toggleWishlist(product.id)
        }}
        style={{
          position: 'absolute',
          right: '0.65rem',
          top: '0.65rem',
          width: '34px',
          height: '34px',
          borderRadius: '50%',
          border: '1px solid #e5e7eb',
          backgroundColor: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 1,
        }}
      >
        <Heart
          size={18}
          color={liked ? '#ef4444' : '#6b7280'}
          fill={liked ? '#ef4444' : 'transparent'}
        />
      </button>

      <img
        src={product.image_url || 'https://via.placeholder.com/400x250?text=No+Image'}
        alt={product.name}
        style={{
          width: '100%',
          height: '160px',
          objectFit: 'cover',
          borderRadius: '6px',
          marginBottom: '0.75rem',
        }}
      />
      <h3 style={{ marginBottom: '0.5rem' }}>{product.name}</h3>
      <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '0.75rem' }}>
        {product.description || 'No description available'}
      </p>
      <p style={{ fontSize: '0.85rem', color: '#4b5563', marginBottom: '0.25rem' }}>
        {product.brand || 'No brand'} {product.color ? `• ${product.color}` : ''}{' '}
        {product.size ? `• ${product.size}` : ''}
      </p>
      <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>${Number(product.price).toFixed(2)}</p>
      <p style={{ fontSize: '0.85rem', color: '#4b5563' }}>Stock: {product.stock_quantity}</p>

      <button
        type="button"
        onClick={async (e) => {
          e.preventDefault()
          e.stopPropagation()
          if (addingToCart || product.stock_quantity <= 0) return

          setAddingToCart(true)
          const result = await addProductToCart(product.id, 1)
          setAddingToCart(false)

          if ('error' in result && result.error === 'AUTH_REQUIRED') {
            window.location.href = '/auth/login'
            return
          }
          if ('error' in result && result.error) {
            alert(result.error)
            return
          }
        }}
        disabled={addingToCart || product.stock_quantity <= 0}
        style={{
          marginTop: '0.6rem',
          width: '100%',
          border: 'none',
          borderRadius: '8px',
          backgroundColor: product.stock_quantity <= 0 ? '#9ca3af' : '#111827',
          color: '#fff',
          padding: '0.55rem',
          cursor: addingToCart || product.stock_quantity <= 0 ? 'not-allowed' : 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          opacity: addingToCart ? 0.8 : 1,
        }}
      >
        {addingToCart ? <ButtonLoader /> : <ShoppingCart size={16} />}
        {product.stock_quantity <= 0 ? 'Out of stock' : addingToCart ? 'Adding...' : 'Add to Cart'}
      </button>
    </Link>
  )
}
