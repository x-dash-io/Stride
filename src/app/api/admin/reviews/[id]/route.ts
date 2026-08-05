import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createProtectedRoute } from '@/lib/api-protection'
import { reviewModerationSchema } from '@/lib/validations'
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
  const parsed = reviewModerationSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const review = await prisma.review.findUnique({
    where: { id },
    select: { id: true, productId: true, isApproved: true, isFeatured: true },
  })
  if (!review) {
    return NextResponse.json({ error: 'Review not found' }, { status: 404 })
  }

  const data: { isApproved?: boolean; isFeatured?: boolean } = {}
  switch (parsed.data.action) {
    case 'approve':
      data.isApproved = true
      break
    case 'reject':
      data.isApproved = false
      break
    case 'feature':
      data.isFeatured = true
      break
    case 'unfeature':
      data.isFeatured = false
      break
  }

  const updated = await prisma.review.update({ where: { id }, data })

  const product = await prisma.product.findUnique({
    where: { id: review.productId },
    select: { id: true, slug: true },
  })
  if (product) await invalidateProductCaches(product.id, product.slug)

  return NextResponse.json(updated)
}

async function handleDeleteById(
  request: NextRequest,
  { params }: { params: Promise<Record<string, string>> },
  routeContext: RouteContext
) {
  const { id } = await params

  const review = await prisma.review.findUnique({
    where: { id },
    select: { id: true, productId: true },
  })
  if (!review) {
    return NextResponse.json({ error: 'Review not found' }, { status: 404 })
  }

  await prisma.review.delete({ where: { id } })

  const product = await prisma.product.findUnique({
    where: { id: review.productId },
    select: { id: true, slug: true },
  })
  if (product) await invalidateProductCaches(product.id, product.slug)

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
