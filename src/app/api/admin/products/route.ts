import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { productCreateSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const page = Number(searchParams.get('page') || '1')
  const perPage = Number(searchParams.get('perPage') || '20')
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || ''
  const brandId = searchParams.get('brandId') || ''
  const categoryId = searchParams.get('categoryId') || ''
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
    ...(brandId && { brandId }),
    ...(categoryId && { categoryId }),
  }

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { [sort]: order },
      skip,
      take: perPage,
      include: {
        brand: { select: { id: true, name: true, slug: true } },
        category: { select: { id: true, name: true, slug: true } },
        images: { where: { isPrimary: true }, take: 1 },
        variants: {
          include: { inventory: true },
          orderBy: { sortOrder: 'asc' },
        },
        _count: { select: { variants: true } },
      },
    }),
    prisma.product.count({ where }),
  )

  const products = items.map(p => ({
    ...p,
    basePrice: Number(p.basePrice),
    salePrice: p.salePrice ? Number(p.salePrice) : null,
    costPrice: p.costPrice ? Number(p.costPrice) : null,
    totalStock: p.variants.reduce((sum, v) => sum + v.inventory.reduce((s, i) => s + i.quantityOnHand, 0), 0),
  }))

  return NextResponse.json({ items: products, total, page, perPage, totalPages: Math.ceil(total / perPage) })
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const parsed = productCreateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const data = parsed.data
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    const existing = await prisma.product.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json({ error: 'Product with this slug already exists' }, { status: 400 })
    }

    const product = await prisma.product.create({
      data: {
        ...data,
        slug,
        basePrice: data.basePrice,
        salePrice: data.salePrice,
        costPrice: data.costPrice,
        publishedAt: data.status === 'ACTIVE' ? new Date() : null,
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Create product error:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}