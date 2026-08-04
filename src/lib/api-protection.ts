import { auth } from '@/lib/auth'
import { verifyCsrfToken } from '@/lib/csrf'
import { apiRateLimit, authRateLimit, paymentRateLimit, rateLimit } from '@/lib/rate-limit'
import { NextRequest, NextResponse } from 'next/server'
import { getClientIp } from '@/lib/utils'
import { isStaffRole, ADMIN_ROLE } from '@/lib/roles'

export type RateLimitType = 'api' | 'auth' | 'payment'

export interface ProtectedRouteOptions {
  requireAuth?: boolean
  requireAdmin?: boolean
  rateLimit?: RateLimitType
  requireCsrf?: boolean
}

interface RouteContext {
  session: NonNullable<Awaited<ReturnType<typeof auth>>>
  ip: string
}

// Simplified: use a single params type that works for all routes
type ParamsType = Promise<Record<string, string>>

type HandlerWithParams = (
  request: NextRequest,
  context: { params: ParamsType },
  routeContext: RouteContext
) => Promise<NextResponse>

type HandlerWithoutParams = (
  request: NextRequest,
  routeContext: RouteContext
) => Promise<NextResponse>

type Handler = HandlerWithParams | HandlerWithoutParams

export async function withProtection(
  request: NextRequest,
  handler: Handler,
  options: ProtectedRouteOptions = {},
  params?: ParamsType
): Promise<NextResponse> {
  const { requireAuth = true, requireAdmin = false, rateLimit: rateLimitType = 'api', requireCsrf = false } = options

  const ip = getClientIp(request)

  const limiter = rateLimitType === 'auth' ? authRateLimit : rateLimitType === 'payment' ? paymentRateLimit : apiRateLimit
  const { success, remaining, reset } = await rateLimit(limiter, ip)

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)),
          'X-RateLimit-Remaining': String(remaining),
          'X-RateLimit-Reset': String(reset),
        },
      }
    )
  }

  const session = await auth()

  if (requireAuth && !session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (requireAdmin && !isStaffRole(session?.user?.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (requireAdmin && session?.user?.role === ADMIN_ROLE) {
    const pathname = new URL(request.url).pathname
    const isBillingOrSettings = pathname.startsWith('/api/admin/billing') || pathname.startsWith('/api/admin/subscription')
    if (!isBillingOrSettings) {
      const { getBillingStatus } = await import('@/lib/services/billing.service')
      const billing = await getBillingStatus()
      if (billing.isSuspended) {
        return NextResponse.json({ error: 'Subscription suspended. Please clear outstanding dues at /admin/subscription' }, { status: 402 })
      }
    }
  }

  if (requireCsrf) {
    const csrfToken = request.headers.get('x-csrf-token') || new URL(request.url).searchParams.get('_csrf')
    const valid = await verifyCsrfToken(csrfToken)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
    }
  }

  const routeContext: RouteContext = { session: session!, ip }

  let response: NextResponse
  if (params) {
    response = await (handler as HandlerWithParams)(request, { params }, routeContext)
  } else {
    response = await (handler as HandlerWithoutParams)(request, routeContext)
  }

  response.headers.set('X-RateLimit-Remaining', String(remaining))
  response.headers.set('X-RateLimit-Reset', String(reset))

  return response
}

export function createProtectedRoute(
  handler: HandlerWithParams,
  options: ProtectedRouteOptions = {}
) {
  return async function(
    request: NextRequest,
    { params }: { params: ParamsType }
  ) {
    return withProtection(request, handler, options, params)
  }
}

export function createProtectedRouteNoParams(
  handler: HandlerWithoutParams,
  options: ProtectedRouteOptions = {}
) {
  return async function(request: NextRequest) {
    return withProtection(request, handler, options)
  }
}