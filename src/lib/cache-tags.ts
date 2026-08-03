export const CACHE_TAGS = {
  products: 'products',
  categories: 'categories',
  brands: 'brands',
  banners: 'banners',
  cart: 'cart',
  orders: 'orders',
  wishlist: 'wishlist',
  reviews: 'reviews',
} as const

export function withRevalidate(...tags: string[]) {
  return { next: { tags } }
}
