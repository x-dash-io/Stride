import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { addToCartSchema, updateCartSchema, removeFromCartSchema } from '@/lib/validations'
import { calculateTax, calculateShipping, calculateGrandTotal, calculateCartTotals } from '@/lib/pricing'
import { Result, ok, err } from '@/lib/types/result'

export interface CartTotals {
  subtotal: number
  taxTotal: number
  shippingTotal: number
  grandTotal: number
  itemCount: number
}

export interface CartWithItems {
  id: string
  userId: string | null
  sessionId: string | null
  items: CartItemWithDetails[]
  subtotal: number
  discountTotal: number
  taxTotal: number
  shippingTotal: number
  grandTotal: number
  currency: string
  expiresAt: Date
}

export interface CartItemWithDetails {
  id: string
  cartId: string
  variantId: string
  quantity: number
  unitPrice: number
  totalPrice: number
  variant: {
    id: string
    sku: string
    size: string
    sizeUs: string | null
    sizeEu: string | null
    sizeUk: string | null
    colour: string
    colourHex: string | null
    colourSwatchUrl: string | null
    material: string | null
    gender: string | null
    basePrice: number | null
    salePrice: number | null
    weightKg: number | null
    isActive: boolean
    isDefault: boolean
    sortOrder: number
    product: {
      id: string
      name: string
      slug: string
      brand: { id: string; name: string; slug: string; logoUrl: string | null }
      images: { id: string; url: string; altText: string | null; isPrimary: boolean; sortOrder: number }[]
    }
    inventory: { id: string; quantityOnHand: number; quantityReserved: number; lowStockThreshold: number }[]
  }
}

async function getOrCreateCart(userId?: string, sessionId?: string) {
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

  if (userId) {
    let cart = await prisma.cart.findFirst({ where: { userId } })
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId, expiresAt } })
    }
    return cart
  }

  if (sessionId) {
    let cart = await prisma.cart.findFirst({ where: { sessionId } })
    if (!cart) {
      cart = await prisma.cart.create({ data: { sessionId, expiresAt } })
    }
    return cart
  }

  throw new Error('No userId or sessionId provided')
}

async function recalculateCart(cartId: string) {
  const items = await prisma.cartItem.findMany({
    where: { cartId },
    include: { variant: true },
  })

  const subtotal = items.reduce((sum, item) => sum + Number(item.totalPrice), 0)
  const taxTotal = calculateTax(subtotal)
  const shippingTotal = calculateShipping(subtotal)
  const grandTotal = calculateGrandTotal(subtotal, shippingTotal, taxTotal)

  await prisma.cart.update({
    where: { id: cartId },
    data: { subtotal, taxTotal, shippingTotal, grandTotal },
  })
}

/**
 * Merges a guest (session-keyed) cart into a logged-in user's cart.
 * Quantities are summed and capped at available stock; the guest cart is
 * then deleted so its items are not lost when the user signs in.
 */
async function mergeGuestCartIntoUser(userId: string, sessionId: string): Promise<void> {
  const guestCart = await prisma.cart.findFirst({ where: { sessionId, userId: null } })
  if (!guestCart) return

  const guestItems = await prisma.cartItem.findMany({
    where: { cartId: guestCart.id },
    include: {
      variant: {
        include: {
          product: { select: { status: true, basePrice: true } },
          inventory: { select: { quantityOnHand: true } },
        },
      },
    },
  })

  const userCart = await getOrCreateCart(userId)

  for (const item of guestItems) {
    if (!item.variant.isActive || item.variant.product.status !== 'ACTIVE') continue

    const availableStock = item.variant.inventory.reduce((s, inv) => s + inv.quantityOnHand, 0)
    const unitPrice = Number(item.variant.salePrice ?? item.variant.basePrice ?? item.variant.product.basePrice)

    const existing = await prisma.cartItem.findUnique({
      where: { cartId_variantId: { cartId: userCart.id, variantId: item.variantId } },
    })

    const quantity = Math.min(existing ? existing.quantity + item.quantity : item.quantity, Math.max(availableStock, 0))
    if (quantity <= 0) continue

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity, totalPrice: unitPrice * quantity },
      })
    } else {
      await prisma.cartItem.create({
        data: { cartId: userCart.id, variantId: item.variantId, quantity, unitPrice, totalPrice: unitPrice * quantity },
      })
    }
  }

  await prisma.cartItem.deleteMany({ where: { cartId: guestCart.id } })
  await prisma.cart.delete({ where: { id: guestCart.id } })
  await recalculateCart(userCart.id)
}

export async function addToCart(
  userId: string | undefined,
  sessionId: string | undefined,
  variantId: string,
  quantity: number
): Promise<Result<{ sessionId?: string }, string>> {
  const parsed = addToCartSchema.safeParse({ variantId, quantity })
  if (!parsed.success) {
    return err(parsed.error.errors[0].message)
  }

  const { variantId: vId, quantity: qty } = parsed.data

  // A signed-in user may still have a guest cart in this browser — adopt it first
  if (userId && sessionId) {
    await mergeGuestCartIntoUser(userId, sessionId)
  }

  const variant = await prisma.productVariant.findUnique({
    where: { id: vId, isActive: true },
    include: {
      product: { select: { id: true, status: true, basePrice: true } },
      inventory: true,
    },
  })

  if (!variant || variant.product.status !== 'ACTIVE') {
    return err('Product not available')
  }

  const availableStock = variant.inventory.reduce((sum, inv) => sum + inv.quantityOnHand, 0)
  if (availableStock < qty) {
    return err('Insufficient stock')
  }

  const cart = await getOrCreateCart(userId, sessionId)

  const existingItem = await prisma.cartItem.findUnique({
    where: { cartId_variantId: { cartId: cart.id, variantId: vId } },
  })

  const unitPrice = Number(variant.salePrice ?? variant.basePrice ?? variant.product.basePrice)

  if (existingItem) {
    const newQuantity = existingItem.quantity + qty
    if (newQuantity > availableStock) {
      return err('Insufficient stock')
    }
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: newQuantity, totalPrice: unitPrice * newQuantity },
    })
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        variantId: vId,
        quantity: qty,
        unitPrice,
        totalPrice: unitPrice * qty,
      },
    })
  }

  await recalculateCart(cart.id)
  revalidatePath('/cart')
  revalidatePath('/products/[id]', 'page')

  const newSessionId = userId ? undefined : (sessionId || crypto.randomUUID())
  return ok({ sessionId: newSessionId })
}

export async function updateCartQuantity(
  userId: string | undefined,
  sessionId: string | undefined,
  variantId: string,
  quantity: number
): Promise<Result<{ sessionId?: string }, string>> {
  const parsed = updateCartSchema.safeParse({ variantId, quantity })
  if (!parsed.success) {
    return err(parsed.error.errors[0].message)
  }

  const { variantId: vId, quantity: qty } = parsed.data
  const cart = await getOrCreateCart(userId, sessionId)

  const cartItem = await prisma.cartItem.findUnique({
    where: { cartId_variantId: { cartId: cart.id, variantId: vId } },
    include: { variant: { include: { inventory: true } } },
  })

  if (!cartItem) {
    return err('Item not in cart')
  }

  const availableStock = cartItem.variant.inventory.reduce((sum, inv) => sum + inv.quantityOnHand, 0)
  if (qty > availableStock) {
    return err('Insufficient stock')
  }

  const unitPrice = Number(cartItem.unitPrice)

  if (qty <= 0) {
    await prisma.cartItem.delete({ where: { id: cartItem.id } })
  } else {
    await prisma.cartItem.update({
      where: { id: cartItem.id },
      data: { quantity: qty, totalPrice: unitPrice * qty },
    })
  }

  await recalculateCart(cart.id)
  revalidatePath('/cart')

  const newSessionId = userId ? undefined : (sessionId || crypto.randomUUID())
  return ok({ sessionId: newSessionId })
}

export async function removeFromCart(
  userId: string | undefined,
  sessionId: string | undefined,
  variantId: string
): Promise<Result<{ sessionId?: string }, string>> {
  const parsed = removeFromCartSchema.safeParse({ variantId })
  if (!parsed.success) {
    return err(parsed.error.errors[0].message)
  }

  const { variantId: vId } = parsed.data
  const cart = await getOrCreateCart(userId, sessionId)

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id, variantId: vId },
  })

  await recalculateCart(cart.id)
  revalidatePath('/cart')

  const newSessionId = userId ? undefined : (sessionId || crypto.randomUUID())
  return ok({ sessionId: newSessionId })
}

export async function clearCart(userId: string | undefined, sessionId?: string): Promise<Result<{ success: true }, string>> {
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
  return ok({ success: true })
}

export async function getCart(userId?: string, sessionId?: string): Promise<CartWithItems | null> {
  // Merge any guest cart into the signed-in user's cart (login sync)
  if (userId && sessionId) {
    await mergeGuestCartIntoUser(userId, sessionId)
  }

  const cart = await prisma.cart.findFirst({
    where: userId ? { userId } : { sessionId },
    include: {
      items: {
        include: {
          variant: {
            select: {
              id: true,
              sku: true,
              size: true,
              sizeUs: true,
              sizeEu: true,
              sizeUk: true,
              colour: true,
              colourHex: true,
              colourSwatchUrl: true,
              material: true,
              gender: true,
              basePrice: true,
              salePrice: true,
              weightKg: true,
              isActive: true,
              isDefault: true,
              sortOrder: true,
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  brand: { select: { id: true, name: true, slug: true, logoUrl: true } },
                  images: { where: { isPrimary: true }, take: 1, select: { id: true, url: true, altText: true, isPrimary: true, sortOrder: true } },
                },
              },
              inventory: { select: { id: true, quantityOnHand: true, quantityReserved: true, lowStockThreshold: true } },
            },
          },
        },
      },
    },
  })

  if (!cart) return null

return {
    ...cart,
    subtotal: Number(cart.subtotal),
    discountTotal: Number(cart.discountTotal),
    taxTotal: Number(cart.taxTotal),
    shippingTotal: Number(cart.shippingTotal),
    grandTotal: Number(cart.grandTotal),
    items: cart.items.map((item) => ({
      ...item,
      unitPrice: Number(item.unitPrice),
      totalPrice: Number(item.totalPrice),
      variant: {
        ...item.variant,
        basePrice: item.variant.basePrice ? Number(item.variant.basePrice) : null,
        salePrice: item.variant.salePrice ? Number(item.variant.salePrice) : null,
        weightKg: item.variant.weightKg ? Number(item.variant.weightKg) : null,
      },
    })),
  }
}

export function getVariantAvailableStock(variant: { inventory: { quantityOnHand: number }[] }): number {
  return variant.inventory.reduce((sum, inv) => sum + inv.quantityOnHand, 0)
}

export function getVariantUnitPrice(variant: {
  salePrice: number | null
  basePrice: number | null
  product: { basePrice: number }
}): number {
  return Number(variant.salePrice ?? variant.basePrice ?? variant.product.basePrice)
}