'use server'

import { createClient } from '@/lib/supabaseServer'
import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export type PlaceOrderResult =
  | { success: true; orderId: string }
  | { success: false; error: string }

/**
 * Creates an order from current cart items, then clears those items from the cart.
 * If buyNowProductId is set, only that product's cart line is converted; otherwise all cart items.
 */
export async function placeOrder(buyNowProductId?: string | null): Promise<PlaceOrderResult> {
  const user = await getUser()
  if (!user) {
    redirect('/auth/login')
  }

  const supabase = await createClient()

  const { data: cart, error: cartError } = await supabase
    .from('carts')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (cartError || !cart?.id) {
    return { success: false, error: 'Cart not found' }
  }

  const { data: rows, error: itemsError } = await supabase
    .from('cart_items')
    .select(
      `
      id,
      quantity,
      product_id,
      products (
        id,
        price
      )
    `
    )
    .eq('cart_id', cart.id)

  if (itemsError) {
    return { success: false, error: itemsError.message }
  }

  type Row = {
    id: string
    quantity: number
    product_id: string
    products: { id: string; price: number } | { id: string; price: number }[] | null
  }

  let items = (rows ?? []) as Row[]
  if (buyNowProductId) {
    items = items.filter((row) => {
      const p = Array.isArray(row.products) ? row.products[0] : row.products
      return p?.id === buyNowProductId
    })
  }

  if (items.length === 0) {
    return { success: false, error: 'No items to order' }
  }

  const orderLines: { cart_item_id: string; product_id: string; quantity: number; price: number }[] = []
  let totalPrice = 0

  for (const row of items) {
    const product = Array.isArray(row.products) ? row.products[0] : row.products
    if (!product) continue
    const price = Number(product.price)
    if (!Number.isFinite(price) || price < 0) continue
    const qty = Math.max(1, Math.floor(Number(row.quantity)))
    orderLines.push({
      cart_item_id: row.id,
      product_id: row.product_id,
      quantity: qty,
      price,
    })
    totalPrice += price * qty
  }

  if (orderLines.length === 0) {
    return { success: false, error: 'No valid items to order' }
  }

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      total_price: totalPrice,
      status: 'placed',
      payment_status: 'pending',
    })
    .select('id')
    .single()

  if (orderError || !order?.id) {
    return { success: false, error: orderError?.message ?? 'Failed to create order' }
  }

  const { error: insertItemsError } = await supabase.from('order_items').insert(
    orderLines.map((line) => ({
      order_id: order.id,
      product_id: line.product_id,
      quantity: line.quantity,
      price: line.price,
    }))
  )

  if (insertItemsError) {
    return { success: false, error: insertItemsError.message }
  }

  const cartItemIdsToRemove = items.map((i) => i.id)
  if (cartItemIdsToRemove.length > 0) {
    await supabase.from('cart_items').delete().in('id', cartItemIdsToRemove)
  }

  return { success: true, orderId: order.id }
}
