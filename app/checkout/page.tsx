import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabaseServer'

export default async function CheckoutPage() {
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

  const total = (items ?? []).reduce(
    (sum, item) => sum + Number(item.products?.price ?? 0) * item.quantity,
    0
  )

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>Checkout</h1>
      <p style={{ color: '#6b7280', marginBottom: '1rem' }}>Welcome, {user.email}</p>

      {(!items || items.length === 0) && (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#fff', padding: '1rem' }}>
          <p style={{ marginBottom: '0.6rem' }}>No items in cart for checkout.</p>
          <Link href="/products" style={{ color: '#2563eb', textDecoration: 'underline' }}>
            Continue shopping
          </Link>
        </div>
      )}

      {items && items.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1rem' }}>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {items.map((item) => {
              const product = item.products
              return (
                <div
                  key={item.id}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '10px',
                    backgroundColor: '#fff',
                    padding: '0.85rem',
                    display: 'grid',
                    gridTemplateColumns: '90px 1fr',
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
                      {product?.name || 'Unavailable Product'}
                    </h3>
                    <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                      ${Number(product?.price ?? 0).toFixed(2)} x {item.quantity}
                    </p>
                    {item.selected_size && (
                      <p style={{ color: '#374151', fontSize: '0.85rem' }}>
                        Size: <strong>{item.selected_size}</strong>
                      </p>
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
            <h3 style={{ marginBottom: '0.8rem' }}>Payment Summary</h3>
            <p style={{ marginBottom: '0.5rem' }}>Items: {items.length}</p>
            <p style={{ marginBottom: '0.8rem' }}>
              Total: <strong>${total.toFixed(2)}</strong>
            </p>
            <button
              type="button"
              style={{
                width: '100%',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: '#16a34a',
                color: '#fff',
                padding: '0.65rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Place Order
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
