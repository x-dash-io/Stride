import { NextRequest, NextResponse } from 'next/server'
import { requireDeliveryAccess } from '@/lib/authz'
import { prisma } from '@/lib/prisma'
import { isStaffRole } from '@/lib/roles'

/**
 * GET /api/delivery/orders
 * Returns orders assigned to this delivery agent (or all if admin).
 * Filters to SHIPPED / IN_TRANSIT by default.
 */
export async function GET(request: NextRequest) {
  const session = await requireDeliveryAccess()

  const isAdmin = isStaffRole(session.user.role)
  const statusParam = request.nextUrl.searchParams.get('status')
  const statuses = statusParam
    ? statusParam.split(',')
    : ['SHIPPED', 'IN_TRANSIT']

  const where: Record<string, unknown> = {
    status: { in: statuses },
  }

  // Non-admins only see their assigned orders
  if (!isAdmin) {
    where.deliveryAgentId = session.user.id
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      shippingAddress: true,
      user: { select: { name: true, phone: true, email: true } },
      items: {
        take: 3,
        include: {
          variant: { include: { product: { select: { name: true } } } },
        },
      },
      payments: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
    orderBy: { updatedAt: 'desc' },
    take: 50,
  })

  return NextResponse.json({ orders })
}
