import { NextRequest, NextResponse } from 'next/server'
import { getCsrfToken } from '@/lib/csrf'
import { getClientIp } from '@/lib/utils'
import { apiRateLimit, rateLimit } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  const ip = getClientIp(request)
  const { success } = await rateLimit(apiRateLimit, `csrf:${ip}`, { limit: 10, window: '1 m' })
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const token = await getCsrfToken()
  return NextResponse.json({ csrfToken: token })
}
