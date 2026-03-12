'use client'

import Link from 'next/link'

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
        overflow: 'hidden',
      }}
    >
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
