'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'

export type AddressOption = {
  id: string
  address_line: string
  city: string
  state: string
  postal_code: string
  country: string
  is_default: boolean
}

type Props = {
  addresses: AddressOption[]
  selectedAddressId: string | null
  buyNowProductId: string | null
  userEmail: string
  userName: string
}

export default function CheckoutAddressSelect({
  addresses,
  selectedAddressId,
  buyNowProductId,
  userEmail,
  userName,
}: Props) {
  const router = useRouter()
  const selected = addresses.find((a) => a.id === selectedAddressId) ?? addresses.find((a) => a.is_default) ?? addresses[0]

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value
    if (!id) return
    const params = new URLSearchParams()
    if (id) params.set('addressId', id)
    if (buyNowProductId) params.set('buyNow', buyNowProductId)
    router.push(`/checkout?${params.toString()}`)
  }

  return (
    <div className="checkout-delivery-card">
      <h3>Deliver to</h3>
      <div className="checkout-delivery-row">
        <span className="checkout-delivery-name">
          {userName}
          <span style={{ marginLeft: '0.5rem', color: '#6b7280', fontWeight: 400 }}>
            {userEmail}
          </span>
        </span>
        <span className="checkout-delivery-tag">HOME</span>
      </div>
      {addresses.length === 0 ? (
        <>
          <p className="checkout-delivery-address">
            Add your delivery address in profile to see it here. Your order will be shipped after
            you place it.
          </p>
          <Link href="/profile" className="checkout-delivery-change" style={{ marginTop: '0.5rem', display: 'inline-block' }}>
            Add address
          </Link>
        </>
      ) : (
        <>
          <div style={{ marginTop: '0.5rem', marginBottom: '0.35rem' }}>
            <label htmlFor="checkout-address-select" style={{ fontSize: '0.8rem', color: '#6b7280' }}>Select address</label>
            <select
              id="checkout-address-select"
              value={selected?.id ?? ''}
              onChange={handleChange}
              style={{
                width: '100%',
                marginTop: '0.25rem',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '0.9rem',
              }}
            >
              {addresses.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.address_line}, {a.city} {a.postal_code}
                </option>
              ))}
            </select>
          </div>
          {selected && (
            <p className="checkout-delivery-address">
              {selected.address_line}, {selected.city}
              {selected.state && `, ${selected.state}`} {selected.postal_code && selected.postal_code}
              {selected.country && `, ${selected.country}`}
            </p>
          )}
          <Link href="/profile" className="checkout-delivery-change" style={{ marginTop: '0.5rem', display: 'inline-block' }}>
            Change
          </Link>
        </>
      )}
    </div>
  )
}
