import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createProtectedRoute, createProtectedRouteNoParams } from '@/lib/api-protection'
import { z } from 'zod'
import { invalidateProductCaches } from '@/lib/cache-invalidation'

const categoryCreateSchema = z.object({
  name: z.string().min(2).max(255),
  slug: z.string().min(2).max(280),
  description: z.string().optional(),
  parentId: z.string().cuid().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  icon: z.string().optional().nullable(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
})

const categoryUpdateSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  slug: z.string().min(2).max(280).optional(),
  description: z.string().optional().nullable(),
  parentId: z.string().cuid().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  icon: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
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
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true },
      orderBy: { sortOrder: 'asc' },
    })
    return NextResponse.json(categories)
  }

  const category = await prisma.category.findUnique({
    where: { id },
    include: { children: true, products: { take: 5 } },
  })

  if (!category) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 })
  }

  return NextResponse.json(category)
}

async function handlePost(
  request: NextRequest,
  routeContext: RouteContext
) {
  const body = await request.json()
  const parsed = categoryCreateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  if (parsed.data.slug) {
    const existing = await prisma.category.findFirst({
      where: { slug: parsed.data.slug },
    })
    if (existing) {
      return NextResponse.json({ error: 'Slug already in use' }, { status: 409 })
    }
  }

  const category = await prisma.category.create({
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description,
      parentId: parsed.data.parentId,
      imageUrl: parsed.data.imageUrl,
      icon: parsed.data.icon,
      sortOrder: parsed.data.sortOrder,
      isActive: parsed.data.isActive,
    },
  })

  await invalidateProductCaches()

  return NextResponse.json(category, { status: 201 })
}

async function handlePut(
  request: NextRequest,
  { params }: { params: Promise<Record<string, string>> },
  routeContext: RouteContext
) {
  const { id } = await params
  const body = await request.json()
  const parsed = categoryUpdateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  if (parsed.data.slug) {
    const existing = await prisma.category.findFirst({
      where: { slug: parsed.data.slug, NOT: { id } },
    })
    if (existing) {
      return NextResponse.json({ error: 'Slug already in use' }, { status: 409 })
    }
  }

  const updateData = { ...parsed.data }
  if (updateData.parentId === '') updateData.parentId = null

  const category = await prisma.category.update({
    where: { id },
    data: updateData,
  })

  await invalidateProductCaches()

  return NextResponse.json(category)
}

async function handleDelete(
  request: NextRequest,
  { params }: { params: Promise<Record<string, string>> },
  routeContext: RouteContext
) {
  const { id } = await params

  const category = await prisma.category.findUnique({ where: { id } })
  if (!category) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 })
  }

  const childrenCount = await prisma.category.count({ where: { parentId: id } })
  const productsCount = await prisma.product.count({ where: { categoryId: id } })

  if (childrenCount > 0 || productsCount > 0) {
    return NextResponse.json(
      { error: 'Cannot delete category with children or products. Reassign them first.' },
      { status: 409 }
    )
  }

  await prisma.category.delete({ where: { id } })

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