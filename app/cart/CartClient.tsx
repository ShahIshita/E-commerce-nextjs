'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabaseBrowser'
import { ButtonLoader } from '@/components/ui/ButtonLoader'

type CartItemRow = {
  id: string
  quantity: number
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
  products: {
    id: string
    name: string
    price: number
    image_url: string | null
  } | null
}

type CartClientProps = {
  userId: string
}

export default function CartClient({ userId }: CartClientProps) {
  const [cartId, setCartId] = useState<string | null>(null)
  const [items, setItems] = useState<NormalizedCartItemRow[]>([])
  const [loading, setLoading] = useState(true)
  const [busyItemId, setBusyItemId] = useState<string | null>(null)

  const supabase = createSupabaseBrowserClient()

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

  useEffect(() => {
    loadCart()
  }, [loadCart])

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
      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {items.map((item) => {
          const product = item.products
          const isBusy = busyItemId === item.id
          const price = Number(product?.price ?? 0)

          return (
            <div
              key={item.id}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                backgroundColor: '#fff',
                padding: '0.85rem',
                display: 'grid',
                gridTemplateColumns: '90px 1fr auto',
                gap: '0.85rem',
                alignItems: 'center',
              }}
            >
              <img
                src={product?.image_url || 'https://via.placeholder.com/200x150?text=No+Image'}
                alt={product?.name || 'Product'}
                style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: '8px' }}
              />
              <div>
                <h3 style={{ marginBottom: '0.25rem', fontSize: '1rem' }}>
                  {product?.id ? (
                    <Link href={`/products/${product.id}`} style={{ color: '#111827', textDecoration: 'none' }}>
                      {product?.name || 'Unavailable Product'}
                    </Link>
                  ) : (
                    product?.name || 'Unavailable Product'
                  )}
                </h3>
                <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>${price.toFixed(2)} each</p>
                {product?.id && (
                  <Link
                    href={`/products/${product.id}`}
                    style={{ fontSize: '0.85rem', color: '#2563eb', textDecoration: 'underline' }}
                  >
                    View product details
                  </Link>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    gap: '0.4rem',
                    alignItems: 'center',
                    marginBottom: '0.5rem',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={isBusy || item.quantity <= 1}
                    style={{
                      width: '28px',
                      height: '28px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      backgroundColor: '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    -
                  </button>
                  <span style={{ minWidth: '22px', textAlign: 'center' }}>{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={isBusy}
                    style={{
                      width: '28px',
                      height: '28px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      backgroundColor: '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  disabled={isBusy}
                  style={{
                    border: 'none',
                    borderRadius: '6px',
                    backgroundColor: '#ef4444',
                    color: '#fff',
                    padding: '0.45rem 0.7rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  {isBusy && <ButtonLoader />}
                  Remove
                </button>
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
        <p style={{ marginBottom: '0.5rem' }}>Items: {items.length}</p>
        <p style={{ marginBottom: '0.8rem' }}>
          Total: <strong>${total.toFixed(2)}</strong>
        </p>
        <Link
          href="/checkout"
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
