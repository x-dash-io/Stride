import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { addToCartSchema, updateCartSchema } from '@/lib/validations'

async function recalculateCart(cartId: string) {
  const items = await prisma.cartItem.findMany({
    where: { cartId },
    include: { variant: true },
  })

  const subtotal = items.reduce((sum, item) => sum + Number(item.totalPrice), 0)
  const tax = subtotal * 0.16
  const shipping = subtotal >= 10000 ? 0 : 500
  const grandTotal = subtotal + tax + shipping

  await prisma.cart.update({
    where: { id: cartId },
    data: { subtotal, tax, shipping, grandTotal },
  })
}

export async function POST(request: NextRequest) {
  const session = await auth()
  const userId = session?.user?.id
  const sessionId = userId ? undefined : request.headers.get('x-session-id') || `guest-${Date.now()}`

  const formData = await request.formData()
  const parsed = addToCartSchema.safeParse({
    variantId: formData.get('variantId'),
    quantity: Number(formData.get('quantity') ?? 1),
  })

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const { variantId, quantity } = parsed.data

  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId, isActive: true },
    include: {
      product: { select: { id: true, status: true } },
      inventory: true,
    },
  })

  if (!variant || variant.product.status !== 'ACTIVE') {
    return NextResponse.json({ error: 'Product not available' }, { status: 400 })
  }

  const availableStock = variant.inventory.reduce((sum, inv) => sum + inv.quantityOnHand, 0)
  if (availableStock < quantity) {
    return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 })
  }

  let cart = await prisma.cart.findFirst({
    where: userId ? { userId } : { sessionId },
  })

  if (!cart) {
    cart = await prisma.cart.create({
      data: userId ? { userId } : { sessionId },
    })
  }

  const existingItem = await prisma.cartItem.findUnique({
    where: { cartId_variantId: { cartId: cart.id, variantId } },
  })

  const unitPrice = variant.salePrice ?? variant.basePrice ?? variant.product.basePrice

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity
    if (newQuantity > availableStock) {
      return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 })
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

  const updatedCart = await prisma.cart.findFirst({
    where: { id: cart.id },
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

  return NextResponse.json(updatedCart)
}

export async function PATCH(request: NextRequest) {
  const session = await auth()
  const userId = session?.user?.id
  const sessionId = userId ? undefined : request.headers.get('x-session-id')

  const formData = await request.formData()
  const parsed = updateCartSchema.safeParse({
    variantId: formData.get('variantId'),
    quantity: Number(formData.get('quantity')),
  })

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const { variantId, quantity } = parsed.data
  const cart = await prisma.cart.findFirst({
    where: userId ? { userId } : { sessionId },
  })

  if (!cart) {
    return NextResponse.json({ error: 'Cart not found' }, { status: 404 })
  }

  const cartItem = await prisma.cartItem.findUnique({
    where: { cartId_variantId: { cartId: cart.id, variantId } },
    include: { variant: { include: { inventory: true } } },
  })

  if (!cartItem) {
    return NextResponse.json({ error: 'Item not in cart' }, { status: 404 })
  }

  const availableStock = cartItem.variant.inventory.reduce((sum, inv) => sum + inv.quantityOnHand, 0)
  if (quantity > availableStock) {
    return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 })
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

  const updatedCart = await prisma.cart.findFirst({
    where: { id: cart.id },
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

  return NextResponse.json(updatedCart)
}

export async function DELETE(request: NextRequest) {
  const session = await auth()
  const userId = session?.user?.id
  const sessionId = userId ? undefined : request.headers.get('x-session-id')

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

  return NextResponse.json({ success: true })
}

export async function GET(request: NextRequest) {
  const session = await auth()
  const userId = session?.user?.id
  const sessionId = userId ? undefined : request.headers.get('x-session-id')

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

  return NextResponse.json(cart || { items: [], subtotal: 0, taxTotal: 0, shippingTotal: 0, grandTotal: 0 })
}