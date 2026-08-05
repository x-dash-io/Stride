import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createProtectedRouteNoParams } from '@/lib/api-protection'
import { bannerCreateSchema } from '@/lib/validations'

type RouteContext = {
  session: { user: { id: string } }
  ip: string
}

function toDate(value?: string | null): Date | null {
  return value ? new Date(value) : null
}

async function handlePost(request: NextRequest, routeContext: RouteContext) {
  const body = await request.json()
  const parsed = bannerCreateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const banner = await prisma.banner.create({
    data: {
      title: parsed.data.title || null,
      subtitle: parsed.data.subtitle || null,
      ctaText: parsed.data.ctaText || null,
      ctaUrl: parsed.data.ctaUrl || null,
      desktopImageUrl: parsed.data.desktopImageUrl,
      mobileImageUrl: parsed.data.mobileImageUrl || null,
      bgColor: parsed.data.bgColor || null,
      textColor: parsed.data.textColor || null,
      placement: parsed.data.placement,
      isActive: parsed.data.isActive,
      sortOrder: parsed.data.sortOrder,
      startsAt: toDate(parsed.data.startsAt),
      endsAt: toDate(parsed.data.endsAt),
    },
  })

  return NextResponse.json(banner, { status: 201 })
}

export const POST = createProtectedRouteNoParams(handlePost, {
  requireAuth: true,
  requireAdmin: true,
  rateLimit: 'api',
  requireCsrf: true,
})
