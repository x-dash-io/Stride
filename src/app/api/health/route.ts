import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const start = performance.now()

  try {
    await prisma.$queryRaw`SELECT 1`
    const dbLatency = Math.round(performance.now() - start)

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
      environment: process.env.NODE_ENV,
      db: { status: 'connected', latencyMs: dbLatency },
      uptime: process.uptime(),
    })
  } catch {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        version: process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
        environment: process.env.NODE_ENV,
        db: { status: 'disconnected' },
      },
      { status: 503 }
    )
  }
}
