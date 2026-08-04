import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createProtectedRouteNoParams } from '@/lib/api-protection'
import { getBillingStatus } from '@/lib/services/billing.service'
import { z } from 'zod'

type RouteContext = {
  session: { user: { id: string } }
  ip: string
}

// Validation schema for submitting payment reference
const submitPaymentSchema = z.object({
  invoiceId: z.string().cuid(),
  mpesaRef: z.string().min(6, 'Reference must be at least 6 characters').regex(/^[A-Z0-9]+$/, 'Must be alphanumeric UPPERCASE'),
  notes: z.string().optional(),
})

async function handleGet(
  request: NextRequest,
  routeContext: RouteContext
) {
  try {
    const status = await getBillingStatus()
    
    const invoices = await prisma.subscriptionLedger.findMany({
      orderBy: { periodStart: 'desc' }
    })

    // Convert Decimals to numbers for client components serialization safety
    const serializedInvoices = invoices.map(inv => ({
      ...inv,
      amountKes: Number(inv.amountKes),
    }))

    return NextResponse.json({
      status,
      invoices: serializedInvoices,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch billing status' }, { status: 500 })
  }
}

async function handlePost(
  request: NextRequest,
  routeContext: RouteContext
) {
  try {
    const body = await request.json()
    const parsed = submitPaymentSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const invoice = await prisma.subscriptionLedger.findUnique({
      where: { id: parsed.data.invoiceId }
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    const updated = await prisma.subscriptionLedger.update({
      where: { id: parsed.data.invoiceId },
      data: {
        mpesaRef: parsed.data.mpesaRef.toUpperCase(),
        notes: parsed.data.notes || null,
        // Wait, does it immediately clear suspension when they submit?
        // Let's keep it UNPAID/OVERDUE until manager confirms it, but maybe add a note "Under Review"
      }
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to submit payment' }, { status: 500 })
  }
}

export const GET = createProtectedRouteNoParams(handleGet, { requireAuth: true, requireAdmin: true, rateLimit: 'api' })
export const POST = createProtectedRouteNoParams(handlePost, { requireAuth: true, requireAdmin: true, rateLimit: 'api', requireCsrf: true })
