import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import CartClient from './CartClient'

export default async function CartPage() {
  const user = await getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
      <h1>Shopping Cart</h1>
      <p style={{ marginBottom: '1rem', color: '#6b7280' }}>Welcome, {user.email}</p>
      <CartClient userId={user.id} />
    </div>
  )
}
