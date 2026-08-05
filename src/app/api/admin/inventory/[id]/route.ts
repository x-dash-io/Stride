import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createProtectedRoute } from '@/lib/api-protection'
import { inventoryAdjustSchema } from '@/lib/validations'

type RouteContext = {
  session: { user: { id: string } }
  ip: string
}

async function handlePatchById(
  request: NextRequest,
  { params }: { params: Promise<Record<string, string>> },
  routeContext: RouteContext
) {
  const { id } = await params
  const body = await request.json()
  const parsed = inventoryAdjustSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const inventory = await prisma.inventory.findUnique({ where: { id } })
  if (!inventory) {
    return NextResponse.json({ error: 'Inventory record not found' }, { status: 404 })
  }

  const updated = await prisma.inventory.update({
    where: { id },
    data: {
      quantityOnHand: Math.max(0, inventory.quantityOnHand + parsed.data.delta),
    },
  })

  return NextResponse.json(updated)
}

export const PATCH = createProtectedRoute(handlePatchById, {
  requireAuth: true,
  requireAdmin: true,
  rateLimit: 'api',
  requireCsrf: true,
})
