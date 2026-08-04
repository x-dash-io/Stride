import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createProtectedRoute } from '@/lib/api-protection'
import { productCreateSchema } from '@/lib/validations'
import { z } from 'zod'

type RouteContext = {
  session: { user: { id: string } }
  ip: string
}

async function handleGetById(
  request: NextRequest,
  { params }: { params: Promise<Record<string, string>> },
  routeContext: RouteContext
) {
  const { id } = await params
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      brand: true,
      category: true,
      images: { orderBy: { sortOrder: 'asc' } },
      variants: {
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          inventory: true,
        },
        orderBy: { sortOrder: 'asc' },
      },
      collections: { include: { collection: true } },
    },
  })

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  return NextResponse.json(product)
}

async function handlePutById(
  request: NextRequest,
  { params }: { params: Promise<Record<string, string>> },
  routeContext: RouteContext
) {
  const { id } = await params
  const body = await request.json()
  
  // Use a simpler schema for updates that doesn't include variants
  const updateSchema = z.object({
    name: z.string().min(3).max(255).optional(),
    slug: z.string().min(3).max(280).optional(),
    brandId: z.string().cuid().optional(),
    categoryId: z.string().cuid().optional(),
    shortDescription: z.string().max(500).optional(),
    description: z.string().optional(),
    gender: z.enum(['MEN', 'WOMEN', 'KIDS', 'UNISEX']).optional(),
    basePrice: z.number().positive().optional(),
    salePrice: z.number().positive().optional(),
    costPrice: z.number().positive().optional(),
    currency: z.string().optional(),
    weightKg: z.number().positive().optional(),
    metaTitle: z.string().max(255).optional(),
    metaDescription: z.string().optional(),
    isFeatured: z.boolean().optional(),
    isNewArrival: z.boolean().optional(),
    isBestSeller: z.boolean().optional(),
    isLimitedEdition: z.boolean().optional(),
    isTrending: z.boolean().optional(),
    status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE', 'DISCONTINUED']).optional(),
    publishedAt: z.string().datetime().optional(),
  })

  const parsed = updateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  if (parsed.data.slug) {
    const existing = await prisma.product.findFirst({
      where: { slug: parsed.data.slug, NOT: { id } },
    })
    if (existing) {
      return NextResponse.json({ error: 'Slug already in use' }, { status: 409 })
    }
  }

  const updateData = { ...parsed.data }
  if (parsed.data.status === 'ACTIVE') {
    updateData.publishedAt = new Date().toISOString()
  }
  if (parsed.data.basePrice !== undefined) updateData.basePrice = parsed.data.basePrice
  if (parsed.data.salePrice !== undefined) updateData.salePrice = parsed.data.salePrice
  if (parsed.data.costPrice !== undefined) updateData.costPrice = parsed.data.costPrice
  if (parsed.data.weightKg !== undefined) updateData.weightKg = parsed.data.weightKg

  const product = await prisma.product.update({
    where: { id },
    data: updateData,
    include: {
      brand: true,
      category: true,
      images: true,
      variants: { include: { inventory: true, images: true } },
    },
  })

  return NextResponse.json(product)
}

async function handleDeleteById(
  request: NextRequest,
  { params }: { params: Promise<Record<string, string>> },
  routeContext: RouteContext
) {
  const { id } = await params
  
  // Check if product exists
  const product = await prisma.product.findUnique({ where: { id } })
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  // Check for active orders
  const activeOrders = await prisma.order.findFirst({
    where: {
      items: { some: { productId: id } },
      status: { notIn: ['CANCELLED', 'DELIVERED', 'REFUNDED'] }
    }
  })
  if (activeOrders) {
    return NextResponse.json({ error: 'Cannot delete product with active orders' }, { status: 400 })
  }

  // Use soft delete by setting status to DISCONTINUED
  await prisma.product.update({
    where: { id },
    data: { status: 'DISCONTINUED' }
  })
  
  return NextResponse.json({ success: true })
}

export const GET = createProtectedRoute(handleGetById, { requireAuth: true, requireAdmin: true, rateLimit: 'api' })
export const PUT = createProtectedRoute(handlePutById, { requireAuth: true, requireAdmin: true, rateLimit: 'api', requireCsrf: true })
export const DELETE = createProtectedRoute(handleDeleteById, { requireAuth: true, requireAdmin: true, rateLimit: 'api', requireCsrf: true })