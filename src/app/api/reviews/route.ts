import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createProtectedRouteNoParams } from '@/lib/api-protection'
import { reviewSchema } from '@/lib/validations'

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
    where: { productId, userId: routeContext.session.user.id, orderItemId: null },
  })
  if (existing) {
    return NextResponse.json({ error: 'You have already reviewed this product' }, { status: 409 })
  }

  const review = await prisma.review.create({
    data: {
      productId,
      userId: routeContext.session.user.id,
      rating,
      body: reviewBody.trim(),
      title,
      sizeRating,
      comfortRating,
      qualityRating,
      isApproved: false,
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
  })

  return NextResponse.json(review, { status: 201 })
}

export const POST = createProtectedRouteNoParams(handleCreateReview, { requireAuth: true, rateLimit: 'api', requireCsrf: true })