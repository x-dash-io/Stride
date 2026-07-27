import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { shippingAddressSchema, paymentSchema } from '@/lib/validations'
import { initiateStkPush } from '@/lib/mpesa'
import { verifyCsrfToken } from '@/lib/csrf'
import { ok, err, Result } from '@/lib/types/result'

export async function submitShippingAddress(formData: FormData): Promise<Result<{ addressId: string }, string>> {
  const session = await auth()
  if (!session?.user?.id) return err('Unauthorized')

  const parsed = shippingAddressSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return err(parsed.error.errors[0].message)

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

  return ok({ addressId: address.id })
}

interface ProcessPaymentInput {
  paymentMethod: 'MPESA_STK_PUSH' | 'MPESA_PAYBILL' | 'CASH_ON_DELIVERY'
  phoneNumber?: string
  csrfToken?: string
}

export async function processPayment(input: ProcessPaymentInput): Promise<Result<{ orderId: string; checkoutRequestId?: string }, string>> {
  const session = await auth()
  if (!session?.user?.id) return err('Unauthorized')

  if (input.csrfToken && !(await verifyCsrfToken(input.csrfToken))) {
    return err('Invalid CSRF token')
  }

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
    return err('Cart is empty')
  }

  const address = await prisma.address.findFirst({
    where: { userId: session.user.id, isDefault: true, isShipping: true },
  })

  if (!address) return err('No shipping address found')

  const order = await prisma.$transaction(async (tx) => {
    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`

    const newOrder = await tx.order.create({
      data: {
        orderNumber,
        userId: session.user.id,
        email: session.user.email!,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        paymentMethod: input.paymentMethod,
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

  if (input.paymentMethod === 'MPESA_STK_PUSH') {
    if (!input.phoneNumber) return err('Phone number required for M-Pesa')

    const stkResponse = await initiateStkPush({
      phoneNumber: input.phoneNumber,
      amount: Math.round(Number(order.grandTotal) * 100),
      accountReference: order.orderNumber,
      transactionDesc: `Payment for order ${order.orderNumber}`,
    })

    if (stkResponse.ResponseCode !== '0') {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'CANCELLED', paymentStatus: 'FAILED' },
      })
      return err(stkResponse.ResponseDescription || 'M-Pesa payment initiation failed')
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

    return ok({ orderId: order.id, checkoutRequestId: stkResponse.CheckoutRequestID })
  }

  if (input.paymentMethod === 'CASH_ON_DELIVERY') {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'CONFIRMED', paymentStatus: 'PENDING' },
    })
  }

  await clearCart(session.user.id)
  revalidatePath('/cart')
  revalidatePath('/account/orders')

  return ok({ orderId: order.id })
}

async function clearCart(userId: string) {
  const cart = await prisma.cart.findFirst({ where: { userId } })
  if (cart) {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })
    await prisma.cart.update({ where: { id: cart.id }, data: { subtotal: 0, taxTotal: 0, shippingTotal: 0, grandTotal: 0 } })
  }
}

export async function getUserOrders(page = 1, perPage = 10): Promise<Result<{ items: any[]; total: number }, string>> {
  const session = await auth()
  if (!session?.user?.id) return err('Unauthorized')

  const skip = (page - 1) * perPage
  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      skip,
      take: perPage,
      include: { items: { include: { variant: true } } },
    }),
    prisma.order.count({ where: { userId: session.user.id } }),
  ])

  return ok({ items, total })
}

export async function getOrderDetails(orderId: string): Promise<Result<any, string>> {
  const session = await auth()
  if (!session?.user?.id) return err('Unauthorized')

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: session.user.id },
    include: {
      items: { include: { variant: { include: { product: true } } } },
      statusHistory: { orderBy: { createdAt: 'asc' } },
      payments: true,
      shippingAddress: true,
      billingAddress: true,
    },
  })

  if (!order) return err('Order not found')
  return ok(order)
}

export async function cancelOrder(orderId: string, csrfToken?: string): Promise<Result<{ success: true }, string>> {
  const session = await auth()
  if (!session?.user?.id) return err('Unauthorized')

  if (!(await verifyCsrfToken(csrfToken ?? null))) return err('Invalid CSRF token')

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: session.user.id },
    include: { items: true },
  })

  if (!order) return err('Order not found')
  if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
    return err('Order cannot be cancelled at this stage')
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED', paymentStatus: 'REFUNDED' },
    })

    await tx.orderStatusHistory.create({
      data: { orderId, fromStatus: order.status, toStatus: 'CANCELLED', note: 'Cancelled by customer' },
    })

    for (const item of order.items) {
      const inventory = await tx.inventory.findFirst({
        where: { variantId: item.variantId, quantityReserved: { gte: item.quantity } },
      })
      if (inventory) {
        await tx.inventory.update({
          where: { id: inventory.id },
          data: { quantityReserved: { decrement: item.quantity } },
        })
      }
    }
  })

  revalidatePath('/account/orders')
  return ok({ success: true })
}