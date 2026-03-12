import { getUser } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabaseServer'

type OrderPageProps = {
  params: { id: string }
  searchParams?: Record<string, string | string[] | undefined>
}

export default async function OrderPage({ params, searchParams }: OrderPageProps) {
  const user = await getUser()
  if (!user) redirect('/auth/login')

  const supabase = await createClient()
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, total_price, status, payment_status, created_at')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (orderError || !order) notFound()

  const { data: orderItems } = await supabase
    .from('order_items')
    .select(
      `
      id,
      quantity,
      price,
      products (
        id,
        name,
        image_url
      )
    `
    )
    .eq('order_id', order.id)

  type OrderItemRow = {
    id: string
    quantity: number
    price: number
    products: { id: string; name: string; image_url: string | null } | { id: string; name: string; image_url: string | null }[] | null
  }

  const items = ((orderItems ?? []) as OrderItemRow[]).map((row) => ({
    ...row,
    product: Array.isArray(row.products) ? row.products[0] : row.products,
  }))

  const justPlaced = searchParams?.placed === '1'

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      {justPlaced && (
        <div
          style={{
            marginBottom: '1.5rem',
            padding: '1rem',
            backgroundColor: '#dcfce7',
            border: '1px solid #22c55e',
            borderRadius: '8px',
          }}
        >
          <h2 style={{ color: '#166534', marginBottom: '0.25rem' }}>Order placed successfully</h2>
          <p style={{ color: '#15803d', fontSize: '0.9rem' }}>
            Your order #{order.id.slice(0, 8)} has been created. We will process it shortly.
          </p>
        </div>
      )}

      <h1 style={{ marginBottom: '0.5rem' }}>Order #{order.id.slice(0, 8)}</h1>
      <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
        Placed on {new Date(order.created_at).toLocaleString()} · Status: {order.status} ·
        Payment: {order.payment_status}
      </p>

      <div
        style={{
          border: '1px solid #e5e7eb',
          borderRadius: '10px',
          backgroundColor: '#fff',
          padding: '1rem',
          marginBottom: '1rem',
        }}
      >
        <h3 style={{ marginBottom: '0.75rem' }}>Items</h3>
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '64px 1fr auto',
                gap: '0.75rem',
                alignItems: 'center',
                padding: '0.5rem 0',
                borderBottom: '1px solid #f3f4f6',
              }}
            >
              <img
                src={item.product?.image_url || 'https://via.placeholder.com/64?text=No+Image'}
                alt={item.product?.name || 'Product'}
                style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 6 }}
              />
              <div>
                <p style={{ fontWeight: 600 }}>{item.product?.name ?? 'Product'}</p>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  ${Number(item.price).toFixed(2)} × {item.quantity}
                </p>
              </div>
              <p style={{ fontWeight: 600 }}>${(Number(item.price) * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>
        <p style={{ marginTop: '0.75rem', fontWeight: 700, textAlign: 'right' }}>
          Total: ${Number(order.total_price).toFixed(2)}
        </p>
      </div>

      <Link
        href="/products"
        style={{
          display: 'inline-block',
          color: '#2563eb',
          textDecoration: 'underline',
          marginRight: '1rem',
        }}
      >
        Continue shopping
      </Link>
      <Link
        href="/cart"
        style={{ display: 'inline-block', color: '#2563eb', textDecoration: 'underline' }}
      >
        View cart
      </Link>
    </div>
  )
}
