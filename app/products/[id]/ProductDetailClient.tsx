'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ButtonLoader } from '@/components/ui/ButtonLoader'
import { addProductToCart } from '@/lib/cartClient'

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
  const [quantity, setQuantity] = useState(1)
  const [busyAction, setBusyAction] = useState<'add' | 'buy' | null>(null)

  const isOutOfStock = stockQuantity <= 0
  const normalizedCategory = categoryName.toLowerCase()
  const isClothing =
    normalizedCategory.includes('cloth') ||
    normalizedCategory.includes('fashion') ||
    normalizedCategory.includes('wear') ||
    normalizedCategory.includes('apparel') ||
    normalizedCategory.includes('top') ||
    normalizedCategory.includes('shirt') ||
    Boolean(sizeValue)

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
    const result = await addProductToCart(productId, quantity)
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

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
        <span style={{ fontWeight: 600 }}>Qty</span>
        <button
          type="button"
          onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
          disabled={isOutOfStock || busyAction !== null}
          style={{
            width: '32px',
            height: '32px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            backgroundColor: '#fff',
            cursor: 'pointer',
          }}
        >
          -
        </button>
        <span style={{ minWidth: '24px', textAlign: 'center' }}>{quantity}</span>
        <button
          type="button"
          onClick={() => setQuantity((prev) => Math.min(Math.max(1, stockQuantity), prev + 1))}
          disabled={isOutOfStock || busyAction !== null || quantity >= stockQuantity}
          style={{
            width: '32px',
            height: '32px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            backgroundColor: '#fff',
            cursor: 'pointer',
          }}
        >
          +
        </button>
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
