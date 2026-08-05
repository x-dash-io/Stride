import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createProtectedRoute } from '@/lib/api-protection'
import { orderUpdateSchema } from '@/lib/validations'

type RouteContext = {
  session: { user: { id: string } }
  ip: string
}

async function handlePutById(
  request: NextRequest,
  { params }: { params: Promise<Record<string, string>> },
  routeContext: RouteContext
) {
  const { id } = await params
  const body = await request.json()
  const parsed = orderUpdateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const order = await prisma.order.findUnique({ where: { id } })
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.order.update({
      where: { id },
      data: {
        ...(parsed.data.status !== order.status && { status: parsed.data.status }),
        ...(parsed.data.paymentStatus && parsed.data.paymentStatus !== order.paymentStatus && {
          paymentStatus: parsed.data.paymentStatus,
        }),
      },
    })

    if (parsed.data.status !== order.status) {
      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          fromStatus: order.status,
          toStatus: parsed.data.status,
          note: parsed.data.note || null,
          changedBy: routeContext.session.user.id,
        },
      })
    }

    return result
  })

  return NextResponse.json(updated)
}

export const PUT = createProtectedRoute(handlePutById, {
  requireAuth: true,
  requireAdmin: true,
  rateLimit: 'api',
  requireCsrf: true,
})
