'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { shippingAddressSchema, paymentSchema } from '@/lib/validations'
import { initiateStkPush } from '@/lib/mpesa'
import { verifyCsrfToken } from '@/lib/csrf'

export async function submitShippingAddress(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Unauthorized' }

  const parsed = shippingAddressSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.errors[0].message }

  const { phone, city, country, label, firstName, lastName, addressLine1, state, addressLine2, postalCode } = parsed.data

  const address = await prisma.address.create({
    data: {
      userId: session.user.id,
      phone,
      city,
      country,
      label,
      firstName,
      lastName,
      addressLine1,
      state,
      addressLine2: addressLine2 || null,
      postalCode,
      isDefault: true,
      isShipping: true,
    },
  })

  return { success: true, addressId: address.id }
}

export async function processPayment(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Unauthorized' }

  const csrfToken = formData.get('_csrf') as string | null
  if (!(await verifyCsrfToken(csrfToken))) return { error: 'Invalid CSRF token' }

  const parsed = paymentSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.errors[0].message }

  const { paymentMethod, phoneNumber } = parsed.data

  const cart = await prisma.cart.findFirst({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          variant: {
            include: { product: { select: { id: true, name: true, brand: true, images: true } } },
          },
        },
      },
    },
  })

  if (!cart || cart.items.length === 0) {
    return { error: 'Cart is empty' }
  }

  const address = await prisma.address.findFirst({
    where: { userId: session.user.id, isDefault: true, isShipping: true },
  })

  if (!address) return { error: 'No shipping address found' }

  const order = await prisma.$transaction(async (tx) => {
    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`

    const newOrder = await tx.order.create({
      data: {
        orderNumber,
        userId: session.user.id,
        email: session.user.email!,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        paymentMethod,
        currency: 'KES',
        subtotal: cart.subtotal,
        discountTotal: cart.discountTotal,
        taxTotal: cart.taxTotal,
        shippingTotal: cart.shippingTotal,
        grandTotal: cart.grandTotal,
        shippingAddressId: address.id,
        billingAddressId: address.id,
        items: {
          create: cart.items.map((item) => ({
            productId: item.variant.product.id,
            variantId: item.variantId,
            productName: item.variant.product.name,
            variantSku: item.variant.sku,
            size: item.variant.size,
            colour: item.variant.colour,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            productImage: item.variant.product.images[0]?.url,
          })),
        },
      },
    })

    for (const item of cart.items) {
      const inventory = await tx.inventory.findFirst({
        where: { variantId: item.variantId, quantityOnHand: { gte: item.quantity } },
      })
      if (!inventory) throw new Error(`Insufficient stock for ${item.variant.sku}`)

      await tx.inventory.update({
        where: { id: inventory.id },
        data: { quantityReserved: { increment: item.quantity } },
      })
    }

    return newOrder
  })

  if (paymentMethod === 'MPESA_STK_PUSH') {
    if (!phoneNumber) return { error: 'Phone number required for M-Pesa' }

    const stkResponse = await initiateStkPush({
      phoneNumber,
      amount: Math.round(Number(order.grandTotal) * 100),
      accountReference: order.orderNumber,
      transactionDesc: `Payment for order ${order.orderNumber}`,
    })

    if (stkResponse.ResponseCode !== '0') {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'CANCELLED', paymentStatus: 'FAILED' },
      })
      return { error: stkResponse.ResponseDescription || 'M-Pesa payment initiation failed' }
    }

    await prisma.paymentTransaction.create({
      data: {
        orderId: order.id,
        transactionId: stkResponse.CheckoutRequestID,
        paymentMethod: 'MPESA_STK_PUSH',
        amount: order.grandTotal,
        currency: 'KES',
        status: 'PENDING',
        gatewayResponse: stkResponse as unknown as Prisma.InputJsonValue,
      },
    })

    return { success: true, orderId: order.id, checkoutRequestId: stkResponse.CheckoutRequestID }
  }

  if (paymentMethod === 'CASH_ON_DELIVERY') {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'CONFIRMED', paymentStatus: 'PENDING' },
    })
  }

  await clearCart(session.user.id)
  revalidatePath('/cart')
  revalidatePath('/account/orders')

  return { success: true, orderId: order.id }
}

async function clearCart(userId: string) {
  const cart = await prisma.cart.findFirst({ where: { userId } })
  if (cart) {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })
    await prisma.cart.update({ where: { id: cart.id }, data: { subtotal: 0, taxTotal: 0, shippingTotal: 0, grandTotal: 0 } })
  }
}