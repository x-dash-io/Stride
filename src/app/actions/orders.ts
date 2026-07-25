'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getUserOrders(page = 1, perPage = 10) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Unauthorized' }

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

  return { items, total }
}

export async function getOrderDetails(orderId: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Unauthorized' }

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

  if (!order) return { error: 'Order not found' }
  return order
}

export async function cancelOrder(orderId: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Unauthorized' }

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: session.user.id },
    include: { items: true },
  })

  if (!order) return { error: 'Order not found' }
  if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
    return { error: 'Order cannot be cancelled at this stage' }
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
  return { success: true }
}