import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createProtectedRoute } from '@/lib/api-protection'
import { z } from 'zod'

type RouteContext = {
  session: { user: { id: string } }
  ip: string
}

const confirmPaymentSchema = z.object({
  status: z.enum(['PAID', 'UNPAID', 'OVERDUE', 'WAIVED']),
  notes: z.string().optional().nullable(),
})

async function handlePutById(
  request: NextRequest,
  { params }: { params: Promise<Record<string, string>> },
  routeContext: RouteContext
) {
  try {
    const { id } = await params
    const body = await request.json()
    const parsed = confirmPaymentSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const updated = await prisma.subscriptionLedger.update({
      where: { id },
      data: {
        status: parsed.data.status,
        notes: parsed.data.notes,
        confirmedAt: parsed.data.status === 'PAID' || parsed.data.status === 'WAIVED' ? new Date() : null,
        confirmedBy: routeContext.session.user.id,
      }
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update billing record' }, { status: 500 })
  }
}

export const PUT = createProtectedRoute(handlePutById, { requireAuth: true, requireAdmin: true, rateLimit: 'api', requireCsrf: true })
