'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { placeOrder } from './actions'
import { ButtonLoader } from '@/components/ui/ButtonLoader'
import { Shield, Tag } from 'lucide-react'

type CheckoutSummaryProps = {
  total: number
  itemCount: number
  buyNowProductId: string | null
  addressId?: string | null
}

export default function CheckoutSummary({
  total,
  itemCount,
  buyNowProductId,
  addressId = null,
}: CheckoutSummaryProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handlePlaceOrder() {
    setError(null)
    setLoading(true)
    try {
      const result = await placeOrder(buyNowProductId || undefined, addressId || undefined)
      if (result.success) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('cart:changed'))
        }
        router.push(`/orders/${result.orderId}?placed=1`)
        router.refresh()
        return
      }
      setError(result.error)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="checkout-price-details">
        <h3>Price Details</h3>
        <div className="checkout-price-row">
          <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <div className="checkout-price-row">
          <span>Delivery</span>
          <span style={{ color: '#059669' }}>Free</span>
        </div>
        <div className="checkout-price-row total">
          <span>Total Amount</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      <div className="checkout-savings">
        <Tag size={18} aria-hidden />
        <span>You&apos;re all set! Free delivery on this order.</span>
      </div>

      <div className="checkout-security">
        <Shield size={16} aria-hidden />
        <span>Safe and secure payments. Easy returns. 100% Authentic products.</span>
      </div>

      {error && (
        <p style={{ color: '#dc2626', fontSize: '0.875rem', margin: 0 }}>{error}</p>
      )}

      <div className="checkout-place-order-bar">
        <div className="checkout-place-order-total">${total.toFixed(2)}</div>
        <button
          type="button"
          className="checkout-place-order-btn"
          onClick={handlePlaceOrder}
          disabled={loading}
        >
          {loading && <ButtonLoader />}
          {loading ? 'Placing order...' : 'Place Order'}
        </button>
      </div>
    </>
  )
}
