import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function CheckoutPage() {
  const user = await getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Checkout</h1>
      <p>Welcome, {user.email}</p>
      <p>Checkout page will go here</p>
    </div>
  )
}
