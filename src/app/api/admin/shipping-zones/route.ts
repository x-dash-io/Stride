import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createProtectedRouteNoParams } from '@/lib/api-protection'
import { shippingZoneSchema } from '@/lib/validations'

type RouteContext = {
  session: { user: { id: string } }
  ip: string
}

async function handleGet(
  request: NextRequest,
  routeContext: RouteContext
) {
  try {
    const zones = await prisma.shippingZone.findMany({
      orderBy: { sortOrder: 'asc' }
    })
    return NextResponse.json(zones)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch shipping zones' }, { status: 500 })
  }
}

async function handlePost(
  request: NextRequest,
  routeContext: RouteContext
) {
  try {
    const body = await request.json()
    const parsed = shippingZoneSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const zone = await prisma.shippingZone.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        counties: parsed.data.counties,
        baseCost: parsed.data.baseCost,
        isActive: parsed.data.isActive,
        sortOrder: parsed.data.sortOrder,
      }
    })

    return NextResponse.json(zone, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create shipping zone' }, { status: 500 })
  }
}

export const GET = createProtectedRouteNoParams(handleGet, { requireAuth: true, requireAdmin: true, rateLimit: 'api' })
export const POST = createProtectedRouteNoParams(handlePost, { requireAuth: true, requireAdmin: true, rateLimit: 'api', requireCsrf: true })
