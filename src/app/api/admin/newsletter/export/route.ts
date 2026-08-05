import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createProtectedRouteNoParams } from '@/lib/api-protection'

async function handleGet(_request: NextRequest) {
  const subscriptions = await prisma.newsletterSubscription.findMany({
    orderBy: { createdAt: 'desc' },
  })

  const csv = [
    'email,subscribed,createdAt,updatedAt',
    ...subscriptions.map(s => `"${s.email}",${s.subscribed},${s.createdAt.toISOString()},${s.updatedAt.toISOString()}`),
  ].join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="newsletter-subscribers.csv"',
    },
  })
}

export const GET = createProtectedRouteNoParams(handleGet, {
  requireAuth: true,
  requireAdmin: true,
  rateLimit: 'api',
})