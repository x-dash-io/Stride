import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createProtectedRouteNoParams } from '@/lib/api-protection'
import { brandCreateSchema } from '@/lib/validations'

type RouteContext = {
  session: { user: { id: string } }
  ip: string
}

async function handleGet(request: NextRequest, routeContext: RouteContext) {
  const brands = await prisma.brand.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { sortOrder: 'asc' },
  })
  return NextResponse.json(brands)
}

async function handlePost(request: NextRequest, routeContext: RouteContext) {
  const body = await request.json()
  const parsed = brandCreateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const existing = await prisma.brand.findFirst({
    where: { OR: [{ name: parsed.data.name }, { slug: parsed.data.slug }] },
  })
  if (existing) {
    return NextResponse.json({ error: 'A brand with this name or slug already exists' }, { status: 409 })
  }

  const brand = await prisma.brand.create({
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description || null,
      logoUrl: parsed.data.logoUrl || null,
      coverImageUrl: parsed.data.coverImageUrl || null,
      websiteUrl: parsed.data.websiteUrl || null,
      originCountry: parsed.data.originCountry || null,
      isFeatured: parsed.data.isFeatured,
      isActive: parsed.data.isActive,
      sortOrder: parsed.data.sortOrder,
    },
  })

  return NextResponse.json(brand, { status: 201 })
}

export const GET = createProtectedRouteNoParams(handleGet, { requireAuth: true, requireAdmin: true, rateLimit: 'api' })
export const POST = createProtectedRouteNoParams(handlePost, {
  requireAuth: true,
  requireAdmin: true,
  rateLimit: 'api',
  requireCsrf: true,
})
