import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createProtectedRouteNoParams } from '@/lib/api-protection'
import { shippingAddressSchema } from '@/lib/validations'

async function handleGetAddresses(
  request: NextRequest,
  routeContext: { session: { user: { id: string; name?: string | null; email?: string | null; image?: string | null; role: string } }; ip: string }
) {
  const addresses = await prisma.address.findMany({
    where: { userId: routeContext.session.user.id },
    orderBy: { isDefault: 'desc' },
  })
  return NextResponse.json(addresses)
}

async function handleCreateAddress(
  request: NextRequest,
  routeContext: { session: { user: { id: string; name?: string | null; email?: string | null; image?: string | null; role: string } }; ip: string }
) {
  const body = await request.json()
  const parsed = shippingAddressSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const data = parsed.data

  if (data.isDefault) {
    await prisma.address.updateMany({
      where: { userId: routeContext.session.user.id },
      data: { isDefault: false },
    })
  }

  const address = await prisma.address.create({
    data: {
      ...data,
      userId: routeContext.session.user.id,
    },
  })

  return NextResponse.json(address, { status: 201 })
}

export const GET = createProtectedRouteNoParams(handleGetAddresses, { requireAuth: true, rateLimit: 'api' })
export const POST = createProtectedRouteNoParams(handleCreateAddress, { requireAuth: true, rateLimit: 'api', requireCsrf: true })