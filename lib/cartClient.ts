'use client'

import { createSupabaseBrowserClient } from '@/lib/supabaseBrowser'

type CartResult =
  | { success: true }
  | { error: string }
  | { error: 'AUTH_REQUIRED' }

function emitCartChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('cart:changed'))
  }
}

export async function getOrCreateCartId(): Promise<{ cartId?: string; error?: string }> {
  const supabase = createSupabaseBrowserClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'AUTH_REQUIRED' }
  }

  const { data: existingCart, error: existingCartError } = await supabase
    .from('carts')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (existingCartError) {
    return { error: existingCartError.message }
  }

  if (existingCart?.id) {
    return { cartId: existingCart.id }
  }

  const { data: createdCart, error: createError } = await supabase
    .from('carts')
    .insert({ user_id: user.id })
    .select('id')
    .single()

  if (createError || !createdCart?.id) {
    return { error: createError?.message || 'Failed to create cart' }
  }

  return { cartId: createdCart.id }
}

export async function addProductToCart(productId: string, quantity = 1): Promise<CartResult> {
  const cartResult = await getOrCreateCartId()
  if (cartResult.error) {
    return { error: cartResult.error as 'AUTH_REQUIRED' | string }
  }

  const cartId = cartResult.cartId
  if (!cartId) {
    return { error: 'Cart not found' }
  }

  const supabase = createSupabaseBrowserClient()
  const { data: existingItem, error: existingItemError } = await supabase
    .from('cart_items')
    .select('id, quantity')
    .eq('cart_id', cartId)
    .eq('product_id', productId)
    .maybeSingle()

  if (existingItemError) {
    return { error: existingItemError.message }
  }

  if (existingItem) {
    const { error: updateError } = await supabase
      .from('cart_items')
      .update({ quantity: existingItem.quantity + quantity })
      .eq('id', existingItem.id)

    if (updateError) {
      return { error: updateError.message }
    }
    emitCartChanged()
    return { success: true }
  }

  const { error: insertError } = await supabase
    .from('cart_items')
    .insert({ cart_id: cartId, product_id: productId, quantity })

  if (insertError) {
    return { error: insertError.message }
  }

  emitCartChanged()
  return { success: true }
}
