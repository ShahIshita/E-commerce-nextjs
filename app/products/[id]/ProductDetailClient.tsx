'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, Link as LinkIcon, Mail, MessageCircle, MessageSquare, Share2, X } from 'lucide-react'
import { ButtonLoader } from '@/components/ui/ButtonLoader'
import { addProductToCart, isProductInCart } from '@/lib/cartClient'
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
  const [inCart, setInCart] = useState(false)
  const [copied, setCopied] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [sizeChartOpen, setSizeChartOpen] = useState(false)
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
    if (!isClothing) return []
    const baseSizes = ['S', 'M', 'L', 'XL', 'XXL', '3XL']
    const merged = Array.from(new Set([...baseSizes, ...parsed.map((size) => size.toUpperCase())]))
    return merged
  }, [isClothing, sizeValue])

  useEffect(() => {
    let mounted = true
    isProductInCart(productId).then((exists) => {
      if (mounted) {
        setInCart(exists)
      }
    })
    return () => {
      mounted = false
    }
  }, [productId])

  async function handleCopyLink() {
    const url = window.location.href
    await navigator.clipboard.writeText(url)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  function handleEmailShare() {
    const subject = encodeURIComponent(`Check this product: ${productName}`)
    const body = encodeURIComponent(`I found this on NexCart: ${window.location.href}`)
    window.open(`mailto:?subject=${subject}&body=${body}`, '_self')
  }

  function handleSmsShare() {
    const body = encodeURIComponent(`Check this product on NexCart: ${window.location.href}`)
    window.open(`sms:?body=${body}`, '_self')
  }

  function handleWhatsappShare() {
    const text = encodeURIComponent(`Check this product on NexCart: ${window.location.href}`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  const [selectedSize, setSelectedSize] = useState<string>(availableSizes[0] ?? '')
  useEffect(() => {
    if (!isClothing) {
      setSelectedSize('')
      return
    }
    if (!selectedSize && availableSizes.length > 0) {
      setSelectedSize(availableSizes[0])
      return
    }
    if (selectedSize && !availableSizes.includes(selectedSize) && availableSizes.length > 0) {
      setSelectedSize(availableSizes[0])
    }
  }, [availableSizes, isClothing, selectedSize])

  async function handleAddToCart(redirectToCheckout: boolean) {
    if (inCart && !redirectToCheckout) {
      router.push('/cart')
      return
    }
    if (isOutOfStock) return
    if (isClothing && !selectedSize) {
      alert('Please select size')
      return
    }
    setBusyAction(redirectToCheckout ? 'buy' : 'add')
    const result = await addProductToCart(productId, 1, selectedSize || null)
    setBusyAction(null)

    if ('error' in result && result.error === 'AUTH_REQUIRED') {
      router.push('/auth/login')
      return
    }
    if ('error' in result && result.error) {
      alert(result.error)
      return
    }

    setInCart(true)
    if (redirectToCheckout) {
      router.push(`/checkout?buyNow=${encodeURIComponent(productId)}`)
      return
    }
  }

  const shareButtonStyle: React.CSSProperties = {
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    backgroundColor: '#fff',
    color: '#111827',
    padding: '0.55rem 0.6rem',
    fontSize: '0.82rem',
    cursor: 'pointer',
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.25rem',
    minWidth: '86px',
  }

  return (
    <div style={{ marginTop: '1.1rem', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.8rem' }}>
        <button
          type="button"
          aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
          onClick={() => toggleWishlist(productId)}
          style={{
            border: '1px solid #e5e7eb',
            borderRadius: '50%',
            backgroundColor: '#fff',
            color: '#111827',
            width: '38px',
            height: '38px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Heart size={16} color={liked ? '#ef4444' : '#6b7280'} fill={liked ? '#ef4444' : 'transparent'} />
        </button>
        <button
          type="button"
          aria-label="Open share options"
          onClick={() => setShareOpen(true)}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            border: '1px solid #e5e7eb',
            backgroundColor: '#fff',
            color: '#111827',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Share2 size={16} />
        </button>
      </div>

      {isClothing && (
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ marginBottom: '0.45rem', fontWeight: 600 }}>
            Select Size{' '}
            <button
              type="button"
              onClick={() => setSizeChartOpen(true)}
              style={{
                color: '#2563eb',
                fontWeight: 500,
                fontSize: '0.9rem',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Size Chart
            </button>
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
          {selectedSize && (
            <p style={{ marginTop: '0.45rem', fontSize: '0.85rem', color: '#374151' }}>
              Selected size: <strong>{selectedSize}</strong>
            </p>
          )}
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
          {isOutOfStock ? 'Out of stock' : inCart ? 'Go to cart' : 'Add to cart'}
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

      {shareOpen && (
        <div
          onClick={() => setShareOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.45)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: 'min(460px, 96vw)',
              backgroundColor: '#fff',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.8rem 1rem',
                borderBottom: '1px solid #e5e7eb',
              }}
            >
              <h3 style={{ fontSize: '1rem' }}>Share Product</h3>
              <button
                type="button"
                onClick={() => setShareOpen(false)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: '0.95rem', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem' }}>
              <button type="button" onClick={handleCopyLink} style={shareButtonStyle}>
                <LinkIcon size={16} />
                {copied ? 'Copied' : 'Copy Link'}
              </button>
              <button type="button" onClick={handleWhatsappShare} style={shareButtonStyle}>
                <MessageCircle size={16} />
                WhatsApp
              </button>
              <button type="button" onClick={handleEmailShare} style={shareButtonStyle}>
                <Mail size={16} />
                Email
              </button>
              <button type="button" onClick={handleSmsShare} style={shareButtonStyle}>
                <MessageSquare size={16} />
                SMS
              </button>
            </div>
          </div>
        </div>
      )}

      {sizeChartOpen && (
        <div
          onClick={() => setSizeChartOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.45)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: 'min(820px, 96vw)',
              backgroundColor: '#fff',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.8rem 1rem',
                borderBottom: '1px solid #e5e7eb',
              }}
            >
              <h3 style={{ fontSize: '1rem' }}>Size Chart</h3>
              <button
                type="button"
                onClick={() => setSizeChartOpen(false)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '0.95rem', overflowX: 'auto' }}>
              <p style={{ marginBottom: '0.65rem', color: '#374151', fontSize: '0.95rem' }}>
                <strong>Size chart:</strong> S (36), M (38), L (40), XL (42), XXL (44), 3XL (46)
              </p>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '680px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f3f4f6' }}>
                    <th style={{ padding: '0.5rem', border: '1px solid #e5e7eb', textAlign: 'left' }}>Size</th>
                    <th style={{ padding: '0.5rem', border: '1px solid #e5e7eb', textAlign: 'left' }}>Waist</th>
                    <th style={{ padding: '0.5rem', border: '1px solid #e5e7eb', textAlign: 'left' }}>Inseam Length</th>
                    <th style={{ padding: '0.5rem', border: '1px solid #e5e7eb', textAlign: 'left' }}>Brand Size</th>
                    <th style={{ padding: '0.5rem', border: '1px solid #e5e7eb', textAlign: 'left' }}>Length</th>
                    <th style={{ padding: '0.5rem', border: '1px solid #e5e7eb', textAlign: 'left' }}>Hip</th>
                    <th style={{ padding: '0.5rem', border: '1px solid #e5e7eb', textAlign: 'left' }}>Rise</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['S', '28', '30', 'S', '39', '38', '12.8'],
                    ['M', '30', '30.5', 'M', '40', '40', '13.0'],
                    ['L', '32', '31', 'L', '41', '42', '13.4'],
                    ['XL', '34', '31.5', 'XL', '42', '44', '13.8'],
                    ['XXL', '36', '32', 'XXL', '43', '46', '14.0'],
                    ['3XL', '38', '32.5', '3XL', '44', '48', '14.4'],
                  ].map((row) => (
                    <tr key={row[0]}>
                      {row.map((cell, index) => (
                        <td key={`${row[0]}-${index}`} style={{ padding: '0.5rem', border: '1px solid #e5e7eb' }}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={{ marginTop: '0.85rem', color: '#374151', fontSize: '0.9rem' }}>
                <strong>Measurement Guideline:</strong> Waist is measured around the natural waistline, Hip at widest part.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
