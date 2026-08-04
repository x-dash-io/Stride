import { Redis } from '@upstash/redis'

let redis: Redis | null = null

export function getRedisClient(): Redis | null {
  if (redis) return redis
  
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN
  
  if (!redisUrl || !redisToken) {
    console.warn('Redis not configured - caching disabled')
    return null
  }

  try {
    redis = new Redis({
      url: redisUrl,
      token: redisToken,
      enableAutoPipelining: true,
    })
    return redis
  } catch (error) {
    console.error('Failed to initialize Redis:', error)
    return null
  }
}

export async function getCache<T>(key: string): Promise<T | null> {
  const client = getRedisClient()
  if (!client) return null

  try {
    const data = await client.get<T>(key)
    return data
  } catch (error) {
    console.error('Cache get error:', error)
    return null
  }
}

export async function setCache<T>(key: string, value: T, ttlSeconds: number = 3600): Promise<void> {
  const client = getRedisClient()
  if (!client) return

  try {
    await client.set(key, value, { ex: ttlSeconds })
  } catch (error) {
    console.error('Cache set error:', error)
  }
}

export async function deleteCache(key: string): Promise<void> {
  const client = getRedisClient()
  if (!client) return

  try {
    await client.del(key)
  } catch (error) {
    console.error('Cache delete error:', error)
  }
}

export async function deleteCachePattern(pattern: string): Promise<void> {
  const client = getRedisClient()
  if (!client) return

  try {
    const keys = await client.keys(pattern)
    if (keys.length > 0) {
      await client.del(...keys)
    }
  } catch (error) {
    console.error('Cache pattern delete error:', error)
  }
}

export function generateCacheKey(prefix: string, identifier: string): string {
  return `${prefix}:${identifier}`
}

export function invalidateProductCache(productId: string): void {
  // Invalidate all product-related caches
  deleteCache(`product:${productId}`)
  deleteCachePattern(`products:*`)
  deleteCachePattern(`featured:*`)
}

export function invalidateUserCache(userId: string): void {
  deleteCache(`user:${userId}`)
  deleteCachePattern(`cart:${userId}:*`)
  deleteCachePattern(`wishlist:${userId}:*`)
}
