import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createProtectedRoute, createProtectedRouteNoParams } from '@/lib/api-protection'
import { z } from 'zod'
import { invalidateProductCaches } from '@/lib/cache-invalidation'

const warehouseCreateSchema = z.object({
  name: z.string().min(2).max(255),
  code: z.string().min(2).max(280),
  city: z.string().optional(),
  country: z.string().optional(),
  isActive: z.boolean().default(true),
})

const warehouseUpdateSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  code: z.string().min(2).max(280).optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  isActive: z.boolean().optional(),
})

type RouteContext = {
  session: { user: { id: string } }
  ip: string
}

async function handleGet(
  request: NextRequest,
  { params }: { params: Promise<Record<string, string>> },
  routeContext: RouteContext
) {
  const { id } = await params

  if (id === 'list' || !id) {
    const warehouses = await prisma.warehouse.findMany({
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(warehouses)
  }

  const warehouse = await prisma.warehouse.findUnique({
    where: { id },
  })

  if (!warehouse) {
    return NextResponse.json({ error: 'Warehouse not found' }, { status: 404 })
  }

  return NextResponse.json(warehouse)
}

async function handlePost(
  request: NextRequest,
  routeContext: RouteContext
) {
  const body = await request.json()
  const parsed = warehouseCreateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  if (parsed.data.code) {
    const existing = await prisma.warehouse.findFirst({
      where: { code: parsed.data.code },
    })
    if (existing) {
      return NextResponse.json({ error: 'Code already in use' }, { status: 409 })
    }
  }

  const warehouse = await prisma.warehouse.create({
    data: {
      name: parsed.data.name,
      code: parsed.data.code,
      city: parsed.data.city || '',
      country: parsed.data.country || '',
      isActive: parsed.data.isActive,
    },
  })

  await invalidateProductCaches()

  return NextResponse.json(warehouse, { status: 201 })
}

async function handlePut(
  request: NextRequest,
  { params }: { params: Promise<Record<string, string>> },
  routeContext: RouteContext
) {
  const { id } = await params
  const body = await request.json()
  const parsed = warehouseUpdateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  if (parsed.data.code) {
    const existing = await prisma.warehouse.findFirst({
      where: { code: parsed.data.code, NOT: { id } },
    })
    if (existing) {
      return NextResponse.json({ error: 'Code already in use' }, { status: 409 })
    }
  }

  const updateData: any = {}
  if (parsed.data.name !== undefined) updateData.name = parsed.data.name
  if (parsed.data.code !== undefined) updateData.code = parsed.data.code
  if (parsed.data.city !== undefined) updateData.city = parsed.data.city || null
  if (parsed.data.country !== undefined) updateData.country = parsed.data.country || null
  if (parsed.data.isActive !== undefined) updateData.isActive = parsed.data.isActive

  const warehouse = await prisma.warehouse.update({
    where: { id },
    data: updateData,
  })

  await invalidateProductCaches()

  return NextResponse.json(warehouse)
}

async function handleDelete(
  request: NextRequest,
  { params }: { params: Promise<Record<string, string>> },
  routeContext: RouteContext
) {
  const { id } = await params

  const warehouse = await prisma.warehouse.findUnique({ where: { id } })
  if (!warehouse) {
    return NextResponse.json({ error: 'Warehouse not found' }, { status: 404 })
  }

  // Check if any inventory references this warehouse
  const inventoryCount = await prisma.inventory.count({ where: { warehouseId: id } })
  if (inventoryCount > 0) {
    return NextResponse.json(
      { error: 'Cannot delete warehouse with existing inventory. Reassign inventory first.' },
      { status: 409 }
    )
  }

  await prisma.warehouse.delete({ where: { id } })

  await invalidateProductCaches()

  return NextResponse.json({ success: true })
}

export const GET = createProtectedRoute(handleGet, {
  requireAuth: true,
  requireAdmin: true,
  rateLimit: 'api',
})

export const POST = createProtectedRouteNoParams(handlePost, {
  requireAuth: true,
  requireAdmin: true,
  rateLimit: 'api',
  requireCsrf: true,
})

export const PUT = createProtectedRoute(handlePut, {
  requireAuth: true,
  requireAdmin: true,
  rateLimit: 'api',
  requireCsrf: true,
})

export const DELETE = createProtectedRoute(handleDelete, {
  requireAuth: true,
  requireAdmin: true,
  rateLimit: 'api',
  requireCsrf: true,
})