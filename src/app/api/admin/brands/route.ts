import { NextRequest, NextResponse } from 'next/server'
import { withProtection } from '@/lib/api-protection'
import { prisma } from '@/lib/prisma'

async function handleListBrands(_request: NextRequest) {
  const brands = await prisma.brand.findMany({
    where: { isActive: true },
    select: { id: true, name: true, slug: true },
    orderBy: { sortOrder: 'asc' },
  })

  return NextResponse.json(brands)
}

export function GET(request: NextRequest) {
  return withProtection(request, handleListBrands, { requireAdmin: true, rateLimit: 'api' })
}
