import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createProtectedRoute } from '@/lib/api-protection'
import { brandCreateSchema } from '@/lib/validations'
import { invalidateProductCaches } from '@/lib/cache-invalidation'

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
  const parsed = brandCreateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const existing = await prisma.brand.findFirst({
    where: { id: { not: id }, OR: [{ name: parsed.data.name }, { slug: parsed.data.slug }] },
  })
  if (existing) {
    return NextResponse.json({ error: 'A brand with this name or slug already exists' }, { status: 409 })
  }

  const brand = await prisma.brand.update({
    where: { id },
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description || null,
      logoUrl: parsed.data.logoUrl || null,
      coverImageUrl: parsed.data.coverImageUrl || null,
      websiteUrl: parsed.data.websiteUrl || null,
      originCountry: parsed.data.originCountry || null,
      isFeatured: parsed.data.isFeatured,
      isActive: parsed.data.isActive,
      sortOrder: parsed.data.sortOrder,
    },
  })

  const products = await prisma.product.findMany({
    where: { brandId: id, status: 'ACTIVE' },
    select: { id: true, slug: true },
  })
  for (const p of products) {
    await invalidateProductCaches(p.id, p.slug)
  }

  return NextResponse.json(brand)
}

async function handleDeleteById(
  request: NextRequest,
  { params }: { params: Promise<Record<string, string>> },
  routeContext: RouteContext
) {
  const { id } = await params

  const productCount = await prisma.product.count({ where: { brandId: id } })
  if (productCount > 0) {
    return NextResponse.json(
      { error: `Cannot delete: ${productCount} product(s) still reference this brand. Deactivate it instead.` },
      { status: 400 }
    )
  }

  await prisma.brand.delete({ where: { id } })
  return NextResponse.json({ success: true })
}

export const PUT = createProtectedRoute(handlePutById, {
  requireAuth: true,
  requireAdmin: true,
  rateLimit: 'api',
  requireCsrf: true,
})
export const DELETE = createProtectedRoute(handleDeleteById, {
  requireAuth: true,
  requireAdmin: true,
  rateLimit: 'api',
  requireCsrf: true,
})
