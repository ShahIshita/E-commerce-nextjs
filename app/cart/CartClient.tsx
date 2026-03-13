'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabaseBrowser'
import { ButtonLoader } from '@/components/ui/ButtonLoader'
import { useWishlist } from '@/components/WishlistProvider'
import DeliveryAddressSelector from '@/components/checkout/DeliveryAddressSelector'

type CartItemRow = {
  id: string
  quantity: number
  selected_size: string | null
  products:
    | {
        id: string
        name: string
        price: number
        image_url: string | null
      }
    | {
        id: string
        name: string
        price: number
        image_url: string | null
      }[]
    | null
}

type NormalizedCartItemRow = {
  id: string
  quantity: number
  selected_size: string | null
  products: {
    id: string
    name: string
    price: number
    image_url: string | null
  } | null
}

type AddressOption = { id: string; address_line: string; city: string; state: string; postal_code: string; country: string; is_default: boolean }

type CartClientProps = {
  userId: string
}

export default function CartClient({ userId }: CartClientProps) {
  const [cartId, setCartId] = useState<string | null>(null)
  const [items, setItems] = useState<NormalizedCartItemRow[]>([])
  const [addresses, setAddresses] = useState<AddressOption[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('')
  const [loading, setLoading] = useState(true)
  const [busyItemId, setBusyItemId] = useState<string | null>(null)

  const supabase = createSupabaseBrowserClient()
  const { isInWishlist, toggleWishlist } = useWishlist()

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserEmail(user.email || '')
        const { data: profile } = await supabase.from('profiles').select('name').eq('id', user.id).maybeSingle()
        setUserName(profile?.name || user.email?.split('@')[0] || 'Customer')
      }
    }
    loadUser()
  }, [supabase])

  const loadCart = useCallback(async () => {
    setLoading(true)

    let activeCartId: string | null = null
    const { data: existingCart, error: cartError } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle()

    if (cartError) {
      console.error(cartError)
      setLoading(false)
      return
    }

    if (existingCart?.id) {
      activeCartId = existingCart.id
    } else {
      const { data: createdCart, error: createError } = await supabase
        .from('carts')
        .insert({ user_id: userId })
        .select('id')
        .single()

      if (createError || !createdCart?.id) {
        console.error(createError)
        setLoading(false)
        return
      }
      activeCartId = createdCart.id
    }

    setCartId(activeCartId)

    const { data: rows, error: rowsError } = await supabase
      .from('cart_items')
      .select(
        `
        id,
        quantity,
        selected_size,
        products (
          id,
          name,
          price,
          image_url
        )
      `
      )
      .eq('cart_id', activeCartId)

    if (rowsError) {
      console.error(rowsError)
      setLoading(false)
      return
    }

    const normalized = ((rows ?? []) as CartItemRow[]).map<NormalizedCartItemRow>((row) => {
      const relation = Array.isArray(row.products) ? row.products[0] : row.products
      return {
        ...row,
        products: relation
          ? {
              ...relation,
              price: Number(relation.price),
            }
          : null,
      }
    })

    setItems(normalized)
    setLoading(false)
  }, [supabase, userId])

  const loadAddresses = useCallback(async () => {
    const { data } = await supabase
      .from('addresses')
      .select('id, address_line, city, state, postal_code, country, is_default')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
    const list = (data ?? []) as AddressOption[]
    setAddresses(list)
    if (list.length > 0) {
      setSelectedAddressId((prev) =>
        prev && list.some((a) => a.id === prev) ? prev : list.find((a) => a.is_default)?.id ?? list[0].id
      )
    }
  }, [supabase, userId])

  useEffect(() => {
    loadCart()
  }, [loadCart])

  useEffect(() => {
    loadAddresses()
  }, [loadAddresses])

  async function updateQuantity(itemId: string, nextQuantity: number) {
    if (nextQuantity <= 0) {
      return removeItem(itemId)
    }
    setBusyItemId(itemId)
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity: nextQuantity })
      .eq('id', itemId)
    setBusyItemId(null)
    if (error) {
      alert(error.message)
      return
    }
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity: nextQuantity } : item))
    )
    window.dispatchEvent(new Event('cart:changed'))
  }

  async function removeItem(itemId: string) {
    setBusyItemId(itemId)
    const { error } = await supabase.from('cart_items').delete().eq('id', itemId)
    setBusyItemId(null)
    if (error) {
      alert(error.message)
      return
    }
    setItems((prev) => prev.filter((item) => item.id !== itemId))
    window.dispatchEvent(new Event('cart:changed'))
  }

  const total = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.products?.price ?? 0) * item.quantity, 0),
    [items]
  )

  if (loading) {
    return <p style={{ color: '#6b7280' }}>Loading cart...</p>
  }

  if (!cartId || items.length === 0) {
    return (
      <div
        style={{
          border: '1px solid #e5e7eb',
          backgroundColor: '#fff',
          borderRadius: '10px',
          padding: '1rem',
        }}
      >
        <p style={{ marginBottom: '0.75rem' }}>Your cart is empty.</p>
        <Link href="/products" style={{ color: '#2563eb', textDecoration: 'underline' }}>
          Continue shopping
        </Link>
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1rem' }}>
      <div style={{ display: 'grid', gap: '0.75rem', alignContent: 'start' }}>
        <DeliveryAddressSelector
          addresses={addresses}
          selectedAddressId={selectedAddressId}
          onAddressSelect={setSelectedAddressId}
          userEmail={userEmail}
          userName={userName}
          onAddressAdded={(addr) => setAddresses((prev) => [addr, ...prev])}
        />

        {items.map((item) => {
          const product = item.products
          const isBusy = busyItemId === item.id
          const price = Number(product?.price ?? 0)
          const inWishlist = product?.id ? isInWishlist(product.id) : false

          const handleSaveForLater = async () => {
            if (product?.id && !inWishlist) {
              await toggleWishlist(product.id)
            }
          }

          return (
            <div
              key={item.id}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                backgroundColor: '#fff',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Top part: Image and Details */}
              <div style={{ padding: '1rem', display: 'flex', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', width: '110px' }}>
                  <img
                    src={product?.image_url || 'https://via.placeholder.com/200x150?text=No+Image'}
                    alt={product?.name || 'Product'}
                    style={{ width: '100px', height: '100px', objectFit: 'contain', borderRadius: '4px' }}
                  />
                  
                  {/* Quantity controls */}
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      overflow: 'hidden',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={isBusy || item.quantity <= 1}
                      style={{
                        width: '28px',
                        height: '28px',
                        backgroundColor: '#f9fafb',
                        border: 'none',
                        borderRight: '1px solid #d1d5db',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                      }}
                    >
                      -
                    </button>
                    <span style={{ minWidth: '32px', textAlign: 'center', fontSize: '0.9rem', backgroundColor: '#fff' }}>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={isBusy}
                      style={{
                        width: '28px',
                        height: '28px',
                        backgroundColor: '#f9fafb',
                        border: 'none',
                        borderLeft: '1px solid #d1d5db',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div style={{ flex: 1, paddingTop: '0.25rem' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 500 }}>
                    {product?.id ? (
                      <Link href={`/products/${product.id}`} style={{ color: '#111827', textDecoration: 'none' }}>
                        {product?.name || 'Unavailable Product'}
                      </Link>
                    ) : (
                      product?.name || 'Unavailable Product'
                    )}
                  </h3>
                  {item.selected_size && (
                    <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                      Size: {item.selected_size}
                    </p>
                  )}
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.75rem' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827' }}>
                      ${(price * item.quantity).toFixed(2)}
                    </span>
                    <span style={{ fontSize: '0.9rem', color: '#16a34a', fontWeight: 500 }}>
                      Available offers applied
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom part: Action buttons row */}
              <div 
                style={{ 
                  display: 'flex', 
                  borderTop: '1px solid #e5e7eb',
                }}
              >
                <button
                  onClick={handleSaveForLater}
                  disabled={inWishlist}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRight: '1px solid #e5e7eb',
                    cursor: inWishlist ? 'default' : 'pointer',
                    fontWeight: 500,
                    color: inWishlist ? '#9ca3af' : '#374151',
                    fontSize: '0.9rem',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseOver={(e) => !inWishlist && (e.currentTarget.style.backgroundColor = '#f9fafb')}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {inWishlist ? 'Saved in Wishlist' : 'Save for later'}
                </button>
                
                <button
                  onClick={() => removeItem(item.id)}
                  disabled={isBusy}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRight: '1px solid #e5e7eb',
                    cursor: isBusy ? 'wait' : 'pointer',
                    fontWeight: 500,
                    color: '#374151',
                    fontSize: '0.9rem',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {isBusy && <ButtonLoader />}
                  Remove
                </button>

                {product?.id ? (
                  <Link
                    href={`/checkout?buyNow=${product.id}${selectedAddressId ? `&addressId=${encodeURIComponent(selectedAddressId)}` : ''}`}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 500,
                      color: '#2563eb',
                      fontSize: '0.9rem',
                      textAlign: 'center',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    Buy this now
                  </Link>
                ) : (
                  <div style={{ flex: 1 }}></div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div
        style={{
          border: '1px solid #e5e7eb',
          borderRadius: '10px',
          backgroundColor: '#fff',
          padding: '1rem',
          alignSelf: 'start',
        }}
      >
        <h3 style={{ marginBottom: '0.8rem' }}>Order Summary</h3>

        {!addresses.length && (
          <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.5rem' }}>
            <Link href="/profile" style={{ color: '#2563eb' }}>Add address</Link> for checkout.
          </p>
        )}
        <p style={{ marginBottom: '0.5rem' }}>Items: {items.length}</p>
        <p style={{ marginBottom: '0.8rem' }}>
          Total: <strong>${total.toFixed(2)}</strong>
        </p>
        <Link
          href={selectedAddressId ? `/checkout?addressId=${encodeURIComponent(selectedAddressId)}` : '/checkout'}
          style={{
            display: 'inline-block',
            width: '100%',
            textAlign: 'center',
            textDecoration: 'none',
            border: 'none',
            borderRadius: '8px',
            backgroundColor: '#facc15',
            color: '#111827',
            padding: '0.6rem',
            fontWeight: 700,
          }}
        >
          Buy Now
        </Link>
      </div>
    </div>
  )
}
