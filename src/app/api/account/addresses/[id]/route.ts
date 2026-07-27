import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createProtectedRoute } from '@/lib/api-protection'
import { z } from 'zod'

const updateAddressSchema = z.object({
  label: z.string().optional(),
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  phone: z.string().min(6).optional(),
  addressLine1: z.string().min(5).optional(),
  addressLine2: z.string().optional(),
  city: z.string().min(2).optional(),
  state: z.string().min(2).optional(),
  postalCode: z.string().min(2).optional(),
  country: z.string().optional(),
  isDefault: z.boolean().optional(),
  isBilling: z.boolean().optional(),
  isShipping: z.boolean().optional(),
})

type RouteContext = {
  session: { user: { id: string } }
  ip: string
}

async function handleGetAddress(
  request: NextRequest,
  { params }: { params: Promise<Record<string, string>> },
  routeContext: RouteContext
) {
  const { id } = await params
  const address = await prisma.address.findFirst({
    where: { id, userId: routeContext.session.user.id },
  })

  if (!address) {
    return NextResponse.json({ error: 'Address not found' }, { status: 404 })
  }

  return NextResponse.json(address)
}

async function handleUpdateAddress(
  request: NextRequest,
  { params }: { params: Promise<Record<string, string>> },
  routeContext: RouteContext
) {
  const { id } = await params
  const address = await prisma.address.findFirst({
    where: { id, userId: routeContext.session.user.id },
  })

  if (!address) {
    return NextResponse.json({ error: 'Address not found' }, { status: 404 })
  }

  const body = await request.json()
  const parsed = updateAddressSchema.safeParse(body)

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

  const updated = await prisma.address.update({
    where: { id },
    data,
  })

  return NextResponse.json(updated)
}

async function handleDeleteAddress(
  request: NextRequest,
  { params }: { params: Promise<Record<string, string>> },
  routeContext: RouteContext
) {
  const { id } = await params
  const address = await prisma.address.findFirst({
    where: { id, userId: routeContext.session.user.id },
  })

  if (!address) {
    return NextResponse.json({ error: 'Address not found' }, { status: 404 })
  }

  await prisma.address.delete({ where: { id } })
  return NextResponse.json({ success: true })
}

export const GET = createProtectedRoute(handleGetAddress, { requireAuth: true, rateLimit: 'api' })
export const PUT = createProtectedRoute(handleUpdateAddress, { requireAuth: true, rateLimit: 'api', requireCsrf: true })
export const DELETE = createProtectedRoute(handleDeleteAddress, { requireAuth: true, rateLimit: 'api', requireCsrf: true })