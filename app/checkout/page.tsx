import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabaseServer'
import CheckoutSummary from './CheckoutSummary'
import CheckoutAddressSelect from './CheckoutAddressSelect'

type CheckoutPageProps = {
  searchParams?: Record<string, string | string[] | undefined>
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const user = await getUser()
  const supabase = await createClient()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: cart } = await supabase
    .from('carts')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  let items:
    | {
        id: string
        quantity: number
        selected_size: string | null
        products: { id: string; name: string; price: number; image_url: string | null } | null
      }[]
    | null = null

  if (cart?.id) {
    const { data } = await supabase
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
      .eq('cart_id', cart.id)
    items = ((data ?? []) as any[]).map((row) => ({
      ...row,
      products: Array.isArray(row.products) ? row.products[0] : row.products,
    }))
  }

  const buyNowProductId = (searchParams?.buyNow as string) || ''
  const addressIdParam = (searchParams?.addressId as string) || ''

  const { data: addressesData } = await supabase
    .from('addresses')
    .select('id, address_line, city, state, postal_code, country, phone_number, is_default')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false })
  type AddressRow = { id: string; address_line: string; city: string; state: string; postal_code: string; country: string; phone_number?: string; is_default: boolean }
  const addresses = (addressesData ?? []) as AddressRow[]
  const selectedAddressId = addressIdParam && addresses.some((a) => a.id === addressIdParam) ? addressIdParam : (addresses.find((a) => a.is_default)?.id ?? addresses[0]?.id ?? null)

  const checkoutItems = buyNowProductId
    ? (items ?? []).filter((item) => item.products?.id === buyNowProductId)
    : (items ?? [])

  const total = checkoutItems.reduce(
    (sum, item) => sum + Number(item.products?.price ?? 0) * item.quantity,
    0
  )

  const userName = user.email?.split('@')[0] ?? 'Customer'
  const deliveryBy = new Date()
  deliveryBy.setDate(deliveryBy.getDate() + 5)

  return (
    <div className="checkout-page-wrap">
      <div className="checkout-page-inner">
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem', color: '#111827' }}>
          Checkout
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
          Review your order and place it securely.
        </p>

        {checkoutItems.length === 0 && (
          <div
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              backgroundColor: '#fff',
              padding: '1.5rem',
            }}
          >
            <p style={{ marginBottom: '0.6rem' }}>No items in cart for checkout.</p>
            <Link href="/products" style={{ color: '#2563eb', textDecoration: 'underline' }}>
              Continue shopping
            </Link>
          </div>
        )}

        {checkoutItems.length > 0 && (
          <div className="checkout-layout-new">
            <div className="checkout-left">
              <CheckoutAddressSelect
                addresses={addresses}
                selectedAddressId={selectedAddressId}
                buyNowProductId={buyNowProductId || null}
                userEmail={user.email ?? ''}
                userName={userName}
              />

              {checkoutItems.map((item) => {
                const product = item.products
                const lineTotal = Number(product?.price ?? 0) * item.quantity
                return (
                  <div key={item.id} className="checkout-item-card-new">
                    <img
                      src={product?.image_url || 'https://via.placeholder.com/200x150?text=No+Image'}
                      alt={product?.name || 'Product'}
                    />
                    <div>
                      <p className="checkout-item-name">{product?.name || 'Unavailable Product'}</p>
                      {item.selected_size && (
                        <p className="checkout-item-meta">Size: {item.selected_size}</p>
                      )}
                      <p className="checkout-item-price-row">
                        ${Number(product?.price ?? 0).toFixed(2)} × {item.quantity}
                        <strong style={{ marginLeft: '0.5rem' }}>${lineTotal.toFixed(2)}</strong>
                      </p>
                      <p className="checkout-item-delivery">
                        Delivery by {deliveryBy.toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                      <div className="checkout-item-actions">
                        <Link href="/cart">Remove</Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="checkout-sidebar">
              <CheckoutSummary
                total={total}
                itemCount={checkoutItems.length}
                buyNowProductId={buyNowProductId || null}
                addressId={selectedAddressId}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
