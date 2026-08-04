import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createProtectedRoute } from '@/lib/api-protection'
import { shippingZoneSchema } from '@/lib/validations'

type RouteContext = {
  session: { user: { id: string } }
  ip: string
}

async function handlePutById(
  request: NextRequest,
  { params }: { params: Promise<Record<string, string>> },
  routeContext: RouteContext
) {
  try {
    const { id } = await params
    const body = await request.json()
    const parsed = shippingZoneSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const zone = await prisma.shippingZone.update({
      where: { id },
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        counties: parsed.data.counties,
        baseCost: parsed.data.baseCost,
        isActive: parsed.data.isActive,
        sortOrder: parsed.data.sortOrder,
      }
    })

    return NextResponse.json(zone)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update shipping zone' }, { status: 500 })
  }
}

async function handleDeleteById(
  request: NextRequest,
  { params }: { params: Promise<Record<string, string>> },
  routeContext: RouteContext
) {
  try {
    const { id } = await params
    await prisma.shippingZone.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete shipping zone' }, { status: 500 })
  }
}

export const PUT = createProtectedRoute(handlePutById, { requireAuth: true, requireAdmin: true, rateLimit: 'api', requireCsrf: true })
export const DELETE = createProtectedRoute(handleDeleteById, { requireAuth: true, requireAdmin: true, rateLimit: 'api', requireCsrf: true })
