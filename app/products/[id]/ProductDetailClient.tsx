'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart } from 'lucide-react'
import { ButtonLoader } from '@/components/ui/ButtonLoader'
import { addProductToCart } from '@/lib/cartClient'
import { useWishlist } from '@/components/WishlistProvider'

type ProductDetailClientProps = {
  productId: string
  productName: string
  stockQuantity: number
  categoryName: string
  sizeValue: string | null
}

export default function ProductDetailClient({
  productId,
  productName,
  stockQuantity,
  categoryName,
  sizeValue,
}: ProductDetailClientProps) {
  const router = useRouter()
  const { isInWishlist, toggleWishlist } = useWishlist()
  const [busyAction, setBusyAction] = useState<'add' | 'buy' | null>(null)
  const liked = isInWishlist(productId)

  const isOutOfStock = stockQuantity <= 0
  const normalizedCategory = categoryName.toLowerCase()
  const isClothing =
    normalizedCategory.includes('cloth') ||
    normalizedCategory.includes('fashion') ||
    normalizedCategory.includes('apparel') ||
    normalizedCategory.includes('women') ||
    normalizedCategory.includes('men') ||
    normalizedCategory.includes('kids') ||
    normalizedCategory.includes('ethnic') ||
    normalizedCategory.includes('top') ||
    normalizedCategory.includes('shirt')

  const availableSizes = useMemo(() => {
    const parsed = (sizeValue ?? '')
      .split(/[,\s/|]+/g)
      .map((value) => value.trim())
      .filter(Boolean)
    if (parsed.length > 0) return parsed
    if (isClothing) return ['XS', 'S', 'M', 'L', 'XL']
    return []
  }, [isClothing, sizeValue])

  const [selectedSize, setSelectedSize] = useState<string>(availableSizes[0] ?? '')

  async function handleAddToCart(redirectToCheckout: boolean) {
    if (isOutOfStock) return
    setBusyAction(redirectToCheckout ? 'buy' : 'add')
    const result = await addProductToCart(productId, 1)
    setBusyAction(null)

    if ('error' in result && result.error === 'AUTH_REQUIRED') {
      router.push('/auth/login')
      return
    }
    if ('error' in result && result.error) {
      alert(result.error)
      return
    }

    if (redirectToCheckout) {
      router.push('/checkout')
      return
    }
    alert(`${productName} added to cart`)
  }

  return (
    <div style={{ marginTop: '1.1rem' }}>
      <button
        type="button"
        aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
        onClick={() => toggleWishlist(productId)}
        style={{
          marginBottom: '0.8rem',
          border: '1px solid #e5e7eb',
          borderRadius: '999px',
          backgroundColor: '#fff',
          color: '#111827',
          padding: '0.45rem 0.75rem',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
        }}
      >
        <Heart size={16} color={liked ? '#ef4444' : '#6b7280'} fill={liked ? '#ef4444' : 'transparent'} />
        {liked ? 'Added to Favourite' : 'Add to Favourite'}
      </button>

      {isClothing && (
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ marginBottom: '0.45rem', fontWeight: 600 }}>
            Select Size{' '}
            <span style={{ color: '#2563eb', fontWeight: 500, fontSize: '0.9rem' }}>Size Chart</span>
          </p>
          <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
            {availableSizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                style={{
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  backgroundColor: selectedSize === size ? '#e0e7ff' : '#fff',
                  color: selectedSize === size ? '#4338ca' : '#111827',
                  padding: '0.45rem 0.7rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                {size}
              </button>
            ))}
          </div>
          <div
            style={{
              marginTop: '0.6rem',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '0.55rem',
              fontSize: '0.85rem',
              color: '#4b5563',
            }}
          >
            <strong>Size chart:</strong> S (36), M (38), L (40), XL (42), XXL (44)
          </div>
        </div>
      )}

      <div
        style={{
          marginBottom: '0.85rem',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          backgroundColor: '#fff',
          padding: '0.7rem',
        }}
      >
        <p style={{ fontSize: '0.9rem', marginBottom: '0.35rem', color: '#111827' }}>
          7 days return policy
        </p>
        <p style={{ fontSize: '0.9rem', color: '#111827' }}>Cash on delivery available</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
        <button
          type="button"
          onClick={() => handleAddToCart(false)}
          disabled={isOutOfStock || busyAction !== null}
          style={{
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            backgroundColor: '#fff',
            color: '#111827',
            padding: '0.6rem',
            fontWeight: 700,
            cursor: isOutOfStock ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          {busyAction === 'add' && <ButtonLoader />}
          {isOutOfStock ? 'Out of stock' : 'Add to cart'}
        </button>

        <button
          type="button"
          onClick={() => handleAddToCart(true)}
          disabled={isOutOfStock || busyAction !== null}
          style={{
            border: 'none',
            borderRadius: '8px',
            backgroundColor: '#facc15',
            color: '#111827',
            padding: '0.6rem',
            fontWeight: 700,
            cursor: isOutOfStock ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          {busyAction === 'buy' && <ButtonLoader />}
          {isOutOfStock ? 'Out of stock' : 'Buy Now'}
        </button>
      </div>
    </div>
  )
}
