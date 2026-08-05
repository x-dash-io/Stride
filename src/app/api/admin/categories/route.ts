import { NextRequest, NextResponse } from 'next/server'
import { withProtection } from '@/lib/api-protection'
import { prisma } from '@/lib/prisma'

async function handleListCategories(_request: NextRequest) {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    select: { id: true, name: true, slug: true },
    orderBy: { sortOrder: 'asc' },
  })

  return NextResponse.json(categories)
}

export function GET(request: NextRequest) {
  return withProtection(request, handleListCategories, { requireAdmin: true, rateLimit: 'api' })
}
