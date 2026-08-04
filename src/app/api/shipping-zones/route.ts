import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getClientIp } from '@/lib/utils'
import { apiRateLimit, rateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const ip = getClientIp(request)
  const { success } = await rateLimit(apiRateLimit, `public:${ip}`)
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  try {
    const zones = await prisma.shippingZone.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    })

    // Convert Decimals to numbers for safety in client components
    const serializedZones = zones.map(zone => ({
      id: zone.id,
      name: zone.name,
      description: zone.description,
      counties: zone.counties,
      baseCost: Number(zone.baseCost),
    }))

    return NextResponse.json(serializedZones)
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch shipping zones' }, { status: 500 })
  }
}
