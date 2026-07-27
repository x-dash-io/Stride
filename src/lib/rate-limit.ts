import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

function createRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('Redis not configured — rate limiting disabled')
    }
    return null
  }
  return new Redis({ url, token })
}

const redis = createRedis()

const noopLimiter = {
  limit: async () => ({ success: true, remaining: 999, reset: Date.now() + 60000 }),
} as unknown as Ratelimit

export const authRateLimit = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, '1 m'), prefix: 'ratelimit:auth' })
  : noopLimiter

export const apiRateLimit = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(100, '1 m'), prefix: 'ratelimit:api' })
  : noopLimiter

export const paymentRateLimit = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, '1 m'), prefix: 'ratelimit:payment' })
  : noopLimiter

export async function rateLimit(
  rateLimiter: Ratelimit,
  identifier: string
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const { success, remaining, reset } = await rateLimiter.limit(identifier)
  return { success, remaining, reset }
}