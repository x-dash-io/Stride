import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { getClientIp } from '@/lib/utils'
import { apiRateLimit, rateLimit } from '@/lib/rate-limit'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Add rate limiting
  const ip = getClientIp(request)
  const { success } = await rateLimit(apiRateLimit, `review-helpful:${ip}`)
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const { id } = await params

  // Check if user already voted
  const existingVote = await prisma.reviewHelpfulVote.findUnique({
    where: { reviewId_userId: { reviewId: id, userId: session.user.id } }
  })
  if (existingVote) {
    return NextResponse.json({ error: 'Already voted' }, { status: 409 })
  }

  // Use transaction for atomicity
  await prisma.$transaction([
    prisma.review.update({
      where: { id },
      data: { helpfulCount: { increment: 1 } }
    }),
    prisma.reviewHelpfulVote.create({
      data: { reviewId: id, userId: session.user.id }
    })
  ])

  return NextResponse.json({ success: true })
}
