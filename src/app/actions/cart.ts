'use server'

import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { addToCartSchema, updateCartSchema, removeFromCartSchema } from '@/lib/validations'
import {
  addToCart as serviceAddToCart,
  updateCartQuantity as serviceUpdateCartQuantity,
  removeFromCart as serviceRemoveFromCart,
  clearCart as serviceClearCart,
  getCart as serviceGetCart,
} from '@/lib/services/cart.service'

export async function addToCart(formData: FormData) {
  const session = await auth()
  const userId = session?.user?.id

  const parsed = addToCartSchema.safeParse({
    variantId: formData.get('variantId'),
    quantity: Number(formData.get('quantity') ?? 1),
  })
  if (!parsed.success) return { error: parsed.error.errors[0].message }

  const clientSessionId = (formData.get('sessionId') as string) || undefined
  const sessionId = userId ? undefined : (clientSessionId || crypto.randomUUID())

  const result = await serviceAddToCart(userId, sessionId, parsed.data.variantId, parsed.data.quantity)

  if (!result.ok) return { error: result.error }

  revalidatePath('/cart')
  revalidatePath('/products/[id]', 'page')

  return { success: true, sessionId: result.value?.sessionId }
}

export async function updateCartQuantity(formData: FormData) {
  const session = await auth()
  const userId = session?.user?.id

  const parsed = updateCartSchema.safeParse({
    variantId: formData.get('variantId'),
    quantity: Number(formData.get('quantity')),
  })
  if (!parsed.success) return { error: parsed.error.errors[0].message }

  const clientSessionId = (formData.get('sessionId') as string) || undefined
  const sessionId = userId ? undefined : (clientSessionId || crypto.randomUUID())

  const result = await serviceUpdateCartQuantity(userId, sessionId, parsed.data.variantId, parsed.data.quantity)

  if (!result.ok) return { error: result.error }

  revalidatePath('/cart')

  return { success: true, sessionId: result.value?.sessionId }
}

export async function removeFromCart(formData: FormData) {
  const session = await auth()
  const userId = session?.user?.id

  const parsed = removeFromCartSchema.safeParse({
    variantId: formData.get('variantId'),
  })
  if (!parsed.success) return { error: parsed.error.errors[0].message }

  const clientSessionId = (formData.get('sessionId') as string) || undefined
  const sessionId = userId ? undefined : (clientSessionId || crypto.randomUUID())

  const result = await serviceRemoveFromCart(userId, sessionId, parsed.data.variantId)

  if (!result.ok) return { error: result.error }

  revalidatePath('/cart')

  return { success: true, sessionId: result.value?.sessionId }
}

export async function clearCartAction(sessionId?: string) {
  const session = await auth()
  const userId = session?.user?.id
  const resolvedSessionId = userId ? undefined : sessionId

  await serviceClearCart(userId, resolvedSessionId)

  revalidatePath('/cart')
  return { success: true }
}

export async function getCartAction(sessionId?: string) {
  const session = await auth()
  const userId = session?.user?.id
  const resolvedSessionId = userId ? undefined : sessionId

  return serviceGetCart(userId, resolvedSessionId)
}
