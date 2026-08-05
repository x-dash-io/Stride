import { NextRequest, NextResponse } from 'next/server'
import { createProtectedRoute } from '@/lib/api-protection'
import { prisma } from '@/lib/prisma'

type RouteContext = {
  session: { user: { id: string } }
  ip: string
}

async function getVoteState(reviewId: string, userId: string) {
  const [vote, review] = await Promise.all([
    prisma.reviewHelpfulVote.findUnique({
      where: { reviewId_userId: { reviewId, userId } },
      select: { id: true },
    }),
    prisma.review.findUnique({
      where: { id: reviewId },
      select: { helpfulCount: true },
    }),
  ])

  return {
    hasVoted: Boolean(vote),
    helpfulCount: review?.helpfulCount ?? 0,
  }
}

async function handleGetVote(
  _request: NextRequest,
  { params }: { params: Promise<Record<string, string>> },
  routeContext: RouteContext
) {
  const { id } = await params
  const state = await getVoteState(id, routeContext.session.user.id)
  return NextResponse.json(state)
}

async function handleToggleVote(
  _request: NextRequest,
  { params }: { params: Promise<Record<string, string>> },
  routeContext: RouteContext
) {
  const { id } = await params
  const userId = routeContext.session.user.id

  const review = await prisma.review.findUnique({ where: { id }, select: { id: true } })
  if (!review) {
    return NextResponse.json({ error: 'Review not found' }, { status: 404 })
  }

  const existingVote = await prisma.reviewHelpfulVote.findUnique({
    where: { reviewId_userId: { reviewId: id, userId } },
    select: { id: true },
  })

  if (existingVote) {
    await prisma.$transaction([
      prisma.reviewHelpfulVote.delete({ where: { id: existingVote.id } }),
      prisma.review.update({
        where: { id },
        data: { helpfulCount: { decrement: 1 } },
      }),
    ])
  } else {
    await prisma.$transaction([
      prisma.reviewHelpfulVote.create({ data: { reviewId: id, userId } }),
      prisma.review.update({
        where: { id },
        data: { helpfulCount: { increment: 1 } },
      }),
    ])
  }

  const state = await getVoteState(id, userId)
  return NextResponse.json(state)
}

export const GET = createProtectedRoute(handleGetVote, { requireAuth: true, rateLimit: 'api' })
export const POST = createProtectedRoute(handleToggleVote, { requireAuth: true, rateLimit: 'api' })
