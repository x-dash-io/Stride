import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!id) {
    return NextResponse.json({ error: 'Review ID is required' }, { status: 400 })
  }

  try {
    const updated = await prisma.review.update({
      where: { id },
      data: { helpfulCount: { increment: 1 } },
      select: { id: true, helpfulCount: true },
    })
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Failed to increment helpful count:', error)
    return NextResponse.json({ error: 'Review not found' }, { status: 404 })
  }
}
