import { deleteCachePattern } from './cache'

export async function invalidateProductCaches(productId?: string, slug?: string) {
  // Invalidate all product-related caches
  await deleteCachePattern('products:*')
  
  if (productId) {
    await deleteCachePattern(`product:${productId}`)
  }
  
  if (slug) {
    await deleteCachePattern(`product:${slug}`)
  }
  
  // Invalidate featured/homepage caches
  await deleteCachePattern('featured:*')
  await deleteCachePattern('home:*')
}

export async function invalidateCartCaches(userId?: string) {
  if (userId) {
    await deleteCachePattern(`cart:${userId}:*`)
  } else {
    await deleteCachePattern('cart:*')
  }
}

export async function invalidateWishlistCaches(userId?: string) {
  if (userId) {
    await deleteCachePattern(`wishlist:${userId}:*`)
  } else {
    await deleteCachePattern('wishlist:*')
  }
}

export async function invalidateCategoryCaches() {
  await deleteCachePattern('categories:*')
  await deleteCachePattern('brands:*')
}

export async function invalidateAllCaches() {
  await deleteCachePattern('*')
}
