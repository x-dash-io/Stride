import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createProtectedRoute } from '@/lib/api-protection'
import { collectionCreateSchema } from '@/lib/validations'
import { invalidateProductCaches } from '@/lib/cache-invalidation'

type RouteContext = {
  session: { user: { id: string } }
  ip: string
}

function toDate(value?: string | null): Date | null {
  return value ? new Date(value) : null
}

async function handlePutById(
  request: NextRequest,
  { params }: { params: Promise<Record<string, string>> },
  routeContext: RouteContext
) {
  const { id } = await params
  const body = await request.json()
  const parsed = collectionCreateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const existing = await prisma.collection.findFirst({
    where: { slug: parsed.data.slug, NOT: { id } },
  })
  if (existing) {
    return NextResponse.json({ error: 'A collection with this slug already exists' }, { status: 409 })
  }

  const collection = await prisma.$transaction(async (tx) => {
    const updated = await tx.collection.update({
      where: { id },
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description || null,
        bannerUrl: parsed.data.bannerUrl || null,
        bannerMobileUrl: parsed.data.bannerMobileUrl || null,
        isActive: parsed.data.isActive,
        isFeatured: parsed.data.isFeatured,
        startDate: toDate(parsed.data.startDate),
        endDate: toDate(parsed.data.endDate),
        sortOrder: parsed.data.sortOrder,
      },
    })

    await tx.productCollection.deleteMany({ where: { collectionId: id } })
    if (parsed.data.productIds.length > 0) {
      await tx.productCollection.createMany({
        data: parsed.data.productIds.map((productId, i) => ({
          productId,
          collectionId: id,
          sortOrder: i,
        })),
        skipDuplicates: true,
      })
    }

    return updated
  })

  const products = await prisma.product.findMany({
    where: { id: { in: parsed.data.productIds } },
    select: { id: true, slug: true },
  })
  for (const p of products) {
    await invalidateProductCaches(p.id, p.slug)
  }

  return NextResponse.json(collection)
}

async function handleDeleteById(
  request: NextRequest,
  { params }: { params: Promise<Record<string, string>> },
  routeContext: RouteContext
) {
  const { id } = await params
  await prisma.collection.delete({ where: { id } })
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
