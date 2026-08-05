import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createProtectedRouteNoParams } from '@/lib/api-protection'
import { collectionCreateSchema } from '@/lib/validations'
import { invalidateProductCaches } from '@/lib/cache-invalidation'

type RouteContext = {
  session: { user: { id: string } }
  ip: string
}

function toDate(value?: string | null): Date | null {
  return value ? new Date(value) : null
}

async function handlePost(request: NextRequest, routeContext: RouteContext) {
  const body = await request.json()
  const parsed = collectionCreateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const existing = await prisma.collection.findUnique({ where: { slug: parsed.data.slug } })
  if (existing) {
    return NextResponse.json({ error: 'A collection with this slug already exists' }, { status: 409 })
  }

  const collection = await prisma.$transaction(async (tx) => {
    const created = await tx.collection.create({
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

    if (parsed.data.productIds.length > 0) {
      await tx.productCollection.createMany({
        data: parsed.data.productIds.map((productId, i) => ({
          productId,
          collectionId: created.id,
          sortOrder: i,
        })),
        skipDuplicates: true,
      })
    }

    return created
  })

  for (const productId of parsed.data.productIds) {
    const p = await prisma.product.findUnique({ where: { id: productId }, select: { id: true, slug: true } })
    if (p) await invalidateProductCaches(p.id, p.slug)
  }

  return NextResponse.json(collection, { status: 201 })
}

export const POST = createProtectedRouteNoParams(handlePost, {
  requireAuth: true,
  requireAdmin: true,
  rateLimit: 'api',
  requireCsrf: true,
})
