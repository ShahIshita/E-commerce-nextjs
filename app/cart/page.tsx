import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function CartPage() {
  const user = await getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Shopping Cart</h1>
      <p>Welcome, {user.email}</p>
      <p>Cart page will go here</p>
    </div>
  )
}
