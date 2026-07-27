import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createProtectedRouteNoParams } from '@/lib/api-protection'
import { productCreateSchema } from '@/lib/validations'

type RouteContext = {
  session: { user: { id: string; name?: string | null; email?: string | null; image?: string | null; role: string } }
  ip: string
}

async function handleGet(
  request: NextRequest,
  routeContext: RouteContext
) {
  const { searchParams } = new URL(request.url)
  const page = Math.max(1, Number(searchParams.get('page') || '1'))
  const perPage = Math.min(50, Number(searchParams.get('perPage') || '20'))
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status')
  const categoryId = searchParams.get('categoryId')
  const brandId = searchParams.get('brandId')
  const sort = searchParams.get('sort') || 'createdAt'
  const order = searchParams.get('order') || 'desc'

  const skip = (page - 1) * perPage

  const where = {
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { slug: { contains: search, mode: 'insensitive' as const } },
        { sku: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
    ...(status && { status: status as any }),
    ...(categoryId && { categoryId }),
    ...(brandId && { brandId }),
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { [sort]: order },
      skip,
      take: perPage,
      include: {
        brand: { select: { id: true, name: true, slug: true, logoUrl: true } },
        category: { select: { id: true, name: true, slug: true } },
        images: { where: { isPrimary: true }, take: 1 },
        variants: {
          where: { isActive: true },
          include: { inventory: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    }),
    prisma.product.count({ where }),
  ])

  return NextResponse.json({
    items: products,
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  })
}

async function handlePost(
  request: NextRequest,
  routeContext: RouteContext
) {
  const body = await request.json()
  const parsed = productCreateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const existingSlug = await prisma.product.findUnique({ where: { slug: parsed.data.slug } })
  if (existingSlug) {
    return NextResponse.json({ error: 'Product with this slug already exists' }, { status: 409 })
  }

  const product = await prisma.product.create({
    data: {
      ...parsed.data,
      basePrice: parsed.data.basePrice,
      salePrice: parsed.data.salePrice,
      costPrice: parsed.data.costPrice,
      weightKg: parsed.data.weightKg,
    },
    include: {
      brand: { select: { id: true, name: true, slug: true, logoUrl: true } },
      category: { select: { id: true, name: true, slug: true } },
      images: true,
      variants: { include: { inventory: true, images: true } },
    },
  })

  return NextResponse.json(product, { status: 201 })
}

export const GET = createProtectedRouteNoParams(handleGet, { requireAuth: true, requireAdmin: true, rateLimit: 'api' })
export const POST = createProtectedRouteNoParams(handlePost, { requireAuth: true, requireAdmin: true, rateLimit: 'api', requireCsrf: true })