import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createProtectedRouteNoParams } from '@/lib/api-protection'
import { reviewSchema } from '@/lib/validations'
import { invalidateProductCaches } from '@/lib/cache-invalidation'

type RouteContext = {
  session: { user: { id: string; name?: string | null; email?: string | null; image?: string | null; role: string } }
  ip: string
}

async function handleCreateReview(
  request: NextRequest,
  routeContext: RouteContext
) {
  const body = await request.json()
  const parsed = reviewSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const { productId, rating, body: reviewBody, title, sizeRating, comfortRating, qualityRating } = parsed.data

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true },
  })
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  const existing = await prisma.review.findFirst({
    where: { productId, userId: routeContext.session.user.id },
  })
  if (existing) {
    return NextResponse.json({ error: 'You have already reviewed this product' }, { status: 409 })
  }

  const userOrderItem = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: {
        userId: routeContext.session.user.id,
        status: { in: ['DELIVERED', 'SHIPPED', 'CONFIRMED'] },
      },
    },
    select: { id: true },
  })

  const review = await prisma.review.create({
    data: {
      productId,
      userId: routeContext.session.user.id,
      orderItemId: userOrderItem?.id || null,
      rating,
      body: reviewBody.trim(),
      title,
      sizeRating,
      comfortRating,
      qualityRating,
      isVerifiedPurchase: Boolean(userOrderItem),
      isApproved: false,
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
  })

  // New review changes the rating shown on the storefront — drop stale product caches
  await invalidateProductCaches(productId)

  return NextResponse.json(review, { status: 201 })
}

export const POST = createProtectedRouteNoParams(handleCreateReview, { requireAuth: true, rateLimit: 'api', requireCsrf: true })