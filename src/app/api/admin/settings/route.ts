import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createProtectedRouteNoParams } from '@/lib/api-protection'
import { storeSettingsSchema } from '@/lib/validations'

type RouteContext = {
  session: { user: { id: string } }
  ip: string
}

async function handleGet(
  request: NextRequest,
  routeContext: RouteContext
) {
  try {
    let settings = await prisma.storeSettings.findUnique({
      where: { id: 'singleton' }
    })
    
    if (!settings) {
      settings = await prisma.storeSettings.create({
        data: {
          id: 'singleton',
          storeName: 'STRIDE',
        }
      })
    }
    
    return NextResponse.json(settings)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch store settings' }, { status: 500 })
  }
}

async function handlePut(
  request: NextRequest,
  routeContext: RouteContext
) {
  try {
    const body = await request.json()
    const parsed = storeSettingsSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const settings = await prisma.storeSettings.upsert({
      where: { id: 'singleton' },
      create: {
        id: 'singleton',
        ...parsed.data,
      },
      update: parsed.data,
    })

    return NextResponse.json(settings)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update store settings' }, { status: 500 })
  }
}

export const GET = createProtectedRouteNoParams(handleGet, { requireAuth: true, requireAdmin: true, rateLimit: 'api' })
export const PUT = createProtectedRouteNoParams(handlePut, { requireAuth: true, requireAdmin: true, rateLimit: 'api', requireCsrf: true })
