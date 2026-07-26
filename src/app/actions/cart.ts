'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { addToCartSchema, updateCartSchema, removeFromCartSchema } from '@/lib/validations'

async function recalculateCart(cartId: string) {
  const items = await prisma.cartItem.findMany({
    where: { cartId },
    include: { variant: true },
  })

  const subtotal = items.reduce((sum, item) => sum + Number(item.totalPrice), 0)
  const taxTotal = subtotal * 0.16
  const shippingTotal = subtotal >= 10000 ? 0 : 500
  const grandTotal = subtotal + taxTotal + shippingTotal

  await prisma.cart.update({
    where: { id: cartId },
    data: { subtotal, taxTotal, shippingTotal, grandTotal },
  })
}

async function getOrCreateCart(userId?: string, sessionId?: string) {
  if (userId) {
    let cart = await prisma.cart.findFirst({ where: { userId } })
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } })
    }
    return cart
  }
  if (sessionId) {
    let cart = await prisma.cart.findFirst({ where: { sessionId } })
    if (!cart) {
      cart = await prisma.cart.create({ data: { sessionId } })
    }
    return cart
  }
  throw new Error('No userId or sessionId provided')
}

export async function addToCart(formData: FormData) {
  const session = await auth()
  const userId = session?.user?.id

  const parsed = addToCartSchema.safeParse({
    variantId: formData.get('variantId'),
    quantity: Number(formData.get('quantity') ?? 1),
  })

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const { variantId, quantity } = parsed.data

  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId, isActive: true },
    include: {
      product: { select: { id: true, status: true, basePrice: true } },
      inventory: true,
    },
  })

  if (!variant || variant.product.status !== 'ACTIVE') {
    return { error: 'Product not available' }
  }

  const availableStock = variant.inventory.reduce((sum, inv) => sum + inv.quantityOnHand, 0)
  if (availableStock < quantity) {
    return { error: 'Insufficient stock' }
  }

  const sessionId = userId ? undefined : crypto.randomUUID()
  const cart = await getOrCreateCart(userId, sessionId)

  const existingItem = await prisma.cartItem.findUnique({
    where: { cartId_variantId: { cartId: cart.id, variantId } },
  })

  const unitPrice = variant.salePrice ?? variant.basePrice ?? variant.product.basePrice

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity
    if (newQuantity > availableStock) {
      return { error: 'Insufficient stock' }
    }
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: newQuantity, totalPrice: Number(unitPrice) * newQuantity },
    })
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        variantId,
        quantity,
        unitPrice: Number(unitPrice),
        totalPrice: Number(unitPrice) * quantity,
      },
    })
  }

  await recalculateCart(cart.id)
  revalidatePath('/cart')
  revalidatePath('/products/[id]', 'page')

  return { success: true }
}

export async function updateCartQuantity(formData: FormData) {
  const session = await auth()
  const userId = session?.user?.id

  const parsed = updateCartSchema.safeParse({
    variantId: formData.get('variantId'),
    quantity: Number(formData.get('quantity')),
  })

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const { variantId, quantity } = parsed.data
  const sessionId = userId ? undefined : crypto.randomUUID()
  const cart = await getOrCreateCart(userId, sessionId)

  const cartItem = await prisma.cartItem.findUnique({
    where: { cartId_variantId: { cartId: cart.id, variantId } },
    include: { variant: { include: { inventory: true } } },
  })

  if (!cartItem) {
    return { error: 'Item not in cart' }
  }

  const availableStock = cartItem.variant.inventory.reduce((sum, inv) => sum + inv.quantityOnHand, 0)
  if (quantity > availableStock) {
    return { error: 'Insufficient stock' }
  }

  const unitPrice = Number(cartItem.unitPrice)
  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: cartItem.id } })
  } else {
    await prisma.cartItem.update({
      where: { id: cartItem.id },
      data: { quantity, totalPrice: unitPrice * quantity },
    })
  }

  await recalculateCart(cart.id)
  revalidatePath('/cart')

  return { success: true }
}

export async function removeFromCart(formData: FormData) {
  const session = await auth()
  const userId = session?.user?.id

  const parsed = removeFromCartSchema.safeParse({
    variantId: formData.get('variantId'),
  })

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const { variantId } = parsed.data
  const sessionId = userId ? undefined : crypto.randomUUID()
  const cart = await getOrCreateCart(userId, sessionId)

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id, variantId },
  })

  await recalculateCart(cart.id)
  revalidatePath('/cart')

  return { success: true }
}

export async function clearCartAction() {
  const session = await auth()
  const userId = session?.user?.id
  const sessionId = userId ? undefined : crypto.randomUUID()

  const cart = await prisma.cart.findFirst({
    where: userId ? { userId } : { sessionId },
  })

  if (cart) {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })
    await prisma.cart.update({
      where: { id: cart.id },
      data: { subtotal: 0, taxTotal: 0, shippingTotal: 0, grandTotal: 0 },
    })
  }

  revalidatePath('/cart')
  return { success: true }
}

export async function getCartAction() {
  const session = await auth()
  const userId = session?.user?.id
  const sessionId = userId ? undefined : crypto.randomUUID()

  const cart = await prisma.cart.findFirst({
    where: userId ? { userId } : { sessionId },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: { include: { brand: true, images: { where: { isPrimary: true }, take: 1 } } },
              inventory: true,
            },
          },
        },
      },
    },
  })

  return cart
}