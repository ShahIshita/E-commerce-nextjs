'use client'

import Link from 'next/link'
import { Heart } from 'lucide-react'
import { useWishlist } from '@/components/WishlistProvider'

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
    </Link>
  )
}
