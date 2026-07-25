import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { productCreateSchema } from '@/lib/validations'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

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

  return NextResponse.json({
    ...product,
    basePrice: Number(product.basePrice),
    salePrice: product.salePrice ? Number(product.salePrice) : null,
    costPrice: product.costPrice ? Number(product.costPrice) : null,
    variants: product.variants.map(v => ({
      ...v,
      basePrice: Number(v.basePrice || 0),
      salePrice: v.salePrice ? Number(v.salePrice) : null,
    })),
  })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const body = await request.json()
    const parsed = productCreateSchema.partial().safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const data = parsed.data
    const updateData: any = { ...data }

    if (data.slug) {
      const existing = await prisma.product.findFirst({
        where: { slug: data.slug, NOT: { id } },
      })
      if (existing) {
        return NextResponse.json({ error: 'Slug already in use' }, { status: 400 })
      }
    }

    if (data.status === 'ACTIVE') {
      updateData.publishedAt = new Date()
    }

    if (data.basePrice !== undefined) updateData.basePrice = data.basePrice
    if (data.salePrice !== undefined) updateData.salePrice = data.salePrice
    if (data.costPrice !== undefined) updateData.costPrice = data.costPrice

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Update product error:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    await prisma.product.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete product error:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}