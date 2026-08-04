import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
import { ok, err, Result } from '@/lib/types/result'
import { CACHE_TAGS } from '@/lib/cache-tags'
import { getCache, setCache, generateCacheKey } from '@/lib/cache'

export interface ProductFilters {
  category?: string
  brand?: string
  gender?: string
  size?: string
  color?: string
  minPrice?: number
  maxPrice?: number
  sort?: string
  page?: number
  perPage?: number
  query?: string
  featured?: boolean
  newArrival?: boolean
  bestSeller?: boolean
  trending?: boolean
  onSale?: boolean
  limit?: number
}

export interface PaginatedProducts {
  items: ProductListItem[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

export interface ProductListItem {
  id: string
  name: string
  slug: string
  shortDescription: string | null
  gender: 'MEN' | 'WOMEN' | 'KIDS' | 'UNISEX'
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED'
  isFeatured: boolean
  isNewArrival: boolean
  isBestSeller: boolean
  isLimitedEdition: boolean
  isTrending: boolean
  basePrice: number
  salePrice: number | null
  costPrice: number | null
  currency: string
  weightKg: number | null
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  ratingAvg: number
  reviewCount: number
  totalStock: number
  soldCount: number
  primaryImage: string | null
  brand: { id: string; name: string; slug: string; logoUrl: string | null }
  category: { id: string; name: string; slug: string } | null
  images: ProductImage[]
  variants: ProductVariantListItem[]
}

export interface ProductVariantListItem {
  id: string
  productId: string
  sku: string
  size: string
  sizeUs: string | null
  sizeEu: string | null
  sizeUk: string | null
  colour: string
  colourHex: string | null
  colourSwatchUrl: string | null
  material: string | null
  gender: 'MEN' | 'WOMEN' | 'KIDS' | 'UNISEX' | null
  basePrice: number | null
  salePrice: number | null
  weightKg: number | null
  isActive: boolean
  isDefault: boolean
  sortOrder: number
  images: ProductImage[]
  inventory: { id: string; variantId: string; warehouseId: string; quantityOnHand: number; quantityReserved: number; lowStockThreshold: number; reorderPoint: number | null; reorderQuantity: number | null; locationAisle: string | null; locationShelf: string | null }[]
  availableStock: number
}

export interface ProductImage {
  id: string
  productId: string
  variantId: string | null
  url: string
  altText: string | null
  width: number | null
  height: number | null
  isPrimary: boolean
  sortOrder: number
}

export interface ProductVariantDetail {
  id: string
  productId: string
  sku: string
  size: string
  sizeUs: string | null
  sizeEu: string | null
  sizeUk: string | null
  colour: string
  colourHex: string | null
  colourSwatchUrl: string | null
  material: string | null
  gender: 'MEN' | 'WOMEN' | 'KIDS' | 'UNISEX' | null
  basePrice: number | null
  salePrice: number | null
  weightKg: number | null
  isActive: boolean
  isDefault: boolean
  sortOrder: number
  images: ProductImage[]
  inventory: { id: string; variantId: string; warehouseId: string; quantityOnHand: number; quantityReserved: number; lowStockThreshold: number; reorderPoint: number | null; reorderQuantity: number | null; locationAisle: string | null; locationShelf: string | null }[]
  availableStock: number
}

export interface ProductDetail {
  id: string
  name: string
  slug: string
  shortDescription: string | null
  description: string | null
  gender: 'MEN' | 'WOMEN' | 'KIDS' | 'UNISEX'
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED'
  isFeatured: boolean
  isNewArrival: boolean
  isBestSeller: boolean
  isLimitedEdition: boolean
  isTrending: boolean
  basePrice: number
  salePrice: number | null
  costPrice: number | null
  currency: string
  weightKg: number | null
  ratingAvg: number
  reviewCount: number
  totalStock: number
  soldCount: number
  primaryImage: string | null
  metaTitle: string | null
  metaDescription: string | null
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  brand: { id: string; name: string; slug: string; logoUrl: string | null }
  category: { id: string; name: string; slug: string } | null
  images: ProductImage[]
  variants: ProductVariantDetail[]
  reviews: ProductReview[]
  collections: { collection: { id: string; name: string; slug: string } }[]
}

export interface ProductReview {
  id: string
  productId: string
  userId: string
  user: { id: string; name: string | null; image: string | null }
  orderItemId: string | null
  title: string | null
  body: string
  rating: number
  isVerifiedPurchase: boolean
  isFeatured: boolean
  isApproved: boolean
  helpfulCount: number
  sizeRating: number | null
  comfortRating: number | null
  qualityRating: number | null
  images: { id: string; reviewId: string; url: string; altText: string | null; sortOrder: number }[]
  createdAt: string
  updatedAt: string
}

export async function getRatingAggregations(productIds: string[]): Promise<Map<string, { avg: number; count: number }>> {
  if (productIds.length === 0) return new Map()

  const aggregations = await prisma.review.groupBy({
    by: ['productId'],
    where: { productId: { in: productIds }, isApproved: true },
    _avg: { rating: true },
    _count: { rating: true },
  })

  const map = new Map<string, { avg: number; count: number }>()
  for (const agg of aggregations) {
    map.set(agg.productId, {
      avg: Math.round((agg._avg.rating ?? 0) * 10) / 10,
      count: agg._count.rating,
    })
  }
  return map
}

export async function getProducts(params: ProductFilters): Promise<PaginatedProducts> {
  const {
    category, brand, gender, size, color, minPrice, maxPrice, sort,
    page = 1, perPage = 24, query, featured, newArrival, bestSeller, trending, onSale, limit
  } = params

  // Generate cache key
  const cacheKey = generateCacheKey('products', JSON.stringify(params))
  
  // Try to get from cache
  const cached = await getCache<PaginatedProducts>(cacheKey)
  if (cached) {
    return cached
  }

  const skip = (page - 1) * perPage
  const take = limit ?? perPage

  const categorySlug = category ? category.toLowerCase().trim() : undefined
  const brandSlug = brand ? brand.toLowerCase().trim() : undefined

  const where: Prisma.ProductWhereInput = {
    status: 'ACTIVE',
    publishedAt: { not: null, lte: new Date() },
    ...(categorySlug && {
      category: {
        OR: [
          { slug: { equals: categorySlug, mode: 'insensitive' } },
          { parent: { slug: { equals: categorySlug, mode: 'insensitive' } } },
        ],
      },
    }),
    ...(brandSlug && { brand: { slug: { equals: brandSlug, mode: 'insensitive' } } }),
    ...(gender && { gender: gender.toUpperCase() as 'MEN' | 'WOMEN' | 'KIDS' | 'UNISEX' }),
    ...(size && { variants: { some: { size, isActive: true } } }),
    ...(color && { variants: { some: { colour: { contains: color, mode: 'insensitive' }, isActive: true } } }),
    ...(minPrice !== undefined && { basePrice: { gte: minPrice } }),
    ...(maxPrice !== undefined && { basePrice: { lte: maxPrice } }),
    ...(featured && { isFeatured: true }),
    ...(newArrival && { isNewArrival: true }),
    ...(bestSeller && { isBestSeller: true }),
    ...(trending && { isTrending: true }),
    ...(onSale && { salePrice: { not: null } }),
    ...(query && {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { shortDescription: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { brand: { name: { contains: query, mode: 'insensitive' } } },
        { category: { name: { contains: query, mode: 'insensitive' } } },
      ],
    }),
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput[] = (() => {
    switch (sort) {
      case 'price-asc': return [{ basePrice: 'asc' }]
      case 'price-desc': return [{ basePrice: 'desc' }]
      case 'popular': return [{ isTrending: 'desc' }, { isBestSeller: 'desc' }, { createdAt: 'desc' }]
      case 'rating': return [{ isFeatured: 'desc' }, { createdAt: 'desc' }]
      case 'newest': return [{ createdAt: 'desc' }]
      default: return [{ createdAt: 'desc' }]
    }
  })()

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take,
      select: {
        id: true,
        name: true,
        slug: true,
        shortDescription: true,
        gender: true,
        status: true,
        isFeatured: true,
        isNewArrival: true,
        isBestSeller: true,
        isLimitedEdition: true,
        isTrending: true,
        basePrice: true,
        salePrice: true,
        costPrice: true,
        currency: true,
        weightKg: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        brand: { select: { id: true, name: true, slug: true, logoUrl: true } },
        category: { select: { id: true, name: true, slug: true } },
        images: { orderBy: { sortOrder: 'asc' }, select: { id: true, url: true, altText: true, isPrimary: true, sortOrder: true, width: true, height: true, variantId: true } },
        variants: {
          where: { isActive: true },
          select: {
            id: true,
            productId: true,
            sku: true,
            size: true,
            sizeUs: true,
            sizeEu: true,
            sizeUk: true,
            colour: true,
            colourHex: true,
            colourSwatchUrl: true,
            material: true,
            gender: true,
            basePrice: true,
            salePrice: true,
            weightKg: true,
            isActive: true,
            isDefault: true,
            sortOrder: true,
            images: { orderBy: { sortOrder: 'asc' }, select: { id: true, url: true, altText: true, isPrimary: true, sortOrder: true, width: true, height: true } },
            inventory: { select: { id: true, variantId: true, warehouseId: true, quantityOnHand: true, quantityReserved: true, lowStockThreshold: true, reorderPoint: true, reorderQuantity: true, locationAisle: true, locationShelf: true } },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    }),
    prisma.product.count({ where }),
  ])

  const productIds = products.map((p) => p.id)
  const ratings = await getRatingAggregations(productIds)

  // Calculate sold count from order items
  const salesData = await prisma.orderItem.groupBy({
    by: ['variantId'],
    where: {
      variant: { productId: { in: productIds } },
      order: { status: { notIn: ['CANCELLED', 'REFUNDED'] } },
    },
    _sum: { quantity: true },
  })

  const salesByVariant = new Map(
    salesData.map((s) => [s.variantId, s._sum.quantity || 0])
  )

  const items = products.map((p) => {
    const r = ratings.get(p.id)
    const totalSold = p.variants.reduce(
      (sum, v) => sum + (salesByVariant.get(v.id) || 0),
      0
    )
    return {
      ...p,
      basePrice: Number(p.basePrice),
      salePrice: p.salePrice ? Number(p.salePrice) : null,
      costPrice: p.costPrice ? Number(p.costPrice) : null,
      weightKg: p.weightKg ? Number(p.weightKg) : null,
      ratingAvg: r?.avg ?? 0,
      reviewCount: r?.count ?? 0,
      totalStock: p.variants.reduce((sum, v) => sum + v.inventory.reduce((s, inv) => s + inv.quantityOnHand, 0), 0),
      soldCount: totalSold,
      variants: p.variants.map((v) => ({
        ...v,
        basePrice: v.basePrice ? Number(v.basePrice) : null,
        salePrice: v.salePrice ? Number(v.salePrice) : null,
        weightKg: v.weightKg ? Number(v.weightKg) : null,
        availableStock: v.inventory.reduce((sum, inv) => sum + inv.quantityOnHand, 0),
        images: (v.images || []).map((img) => ({
          ...img,
          productId: p.id,
          variantId: v.id,
          altText: img.altText ?? null,
          width: img.width ?? null,
          height: img.height ?? null,
        })),
      })),
      primaryImage: p.images.find((img) => img.isPrimary)?.url ?? p.images[0]?.url ?? null,
      images: p.images.map((img) => ({
        ...img,
        productId: p.id,
        variantId: img.variantId ?? null,
        altText: img.altText ?? null,
        width: img.width ?? null,
        height: img.height ?? null,
      })),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      publishedAt: p.publishedAt?.toISOString() ?? null,
    }
  })

  const result = { items, total, page, perPage, totalPages: Math.ceil(total / perPage) }
  
  // Cache the result for 5 minutes
  await setCache(cacheKey, result, 300)
  
  return result
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  // Generate cache key
  const cacheKey = generateCacheKey('product', slug)
  
  // Try to get from cache
  const cached = await getCache<ProductDetail>(cacheKey)
  if (cached) {
    return cached
  }

  const product = await prisma.product.findUnique({
    where: { slug, status: 'ACTIVE', publishedAt: { not: null, lte: new Date() } },
    select: {
      id: true,
      name: true,
      slug: true,
      shortDescription: true,
      description: true,
      gender: true,
      status: true,
      isFeatured: true,
      isNewArrival: true,
      isBestSeller: true,
      isLimitedEdition: true,
      isTrending: true,
      basePrice: true,
      salePrice: true,
      costPrice: true,
      currency: true,
      weightKg: true,
      metaTitle: true,
      metaDescription: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
      brand: { select: { id: true, name: true, slug: true, logoUrl: true } },
      category: { select: { id: true, name: true, slug: true } },
      images: { orderBy: { sortOrder: 'asc' }, select: { id: true, url: true, altText: true, isPrimary: true, sortOrder: true, width: true, height: true, variantId: true } },
      variants: {
        where: { isActive: true },
        select: {
          id: true,
          productId: true,
          sku: true,
          size: true,
          sizeUs: true,
          sizeEu: true,
          sizeUk: true,
          colour: true,
          colourHex: true,
          colourSwatchUrl: true,
          material: true,
          gender: true,
          basePrice: true,
          salePrice: true,
          weightKg: true,
          isActive: true,
          isDefault: true,
          sortOrder: true,
          images: { orderBy: { sortOrder: 'asc' }, select: { id: true, url: true, altText: true, isPrimary: true, sortOrder: true, width: true, height: true, variantId: true } },
          inventory: { select: { id: true, variantId: true, warehouseId: true, quantityOnHand: true, quantityReserved: true, lowStockThreshold: true, reorderPoint: true, reorderQuantity: true, locationAisle: true, locationShelf: true } },
        },
        orderBy: [{ isDefault: 'desc' }, { sortOrder: 'asc' }],
      },
      reviews: {
        where: { isApproved: true },
        include: { user: { select: { id: true, name: true, image: true } }, images: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      collections: { include: { collection: { select: { id: true, name: true, slug: true } } } },
    },
  })

  if (!product) return null

  const rating = await getRatingAggregations([product.id])
  const r = rating.get(product.id)
  const allVariantsStock = product.variants.reduce((sum, v) => sum + v.inventory.reduce((s, inv) => s + inv.quantityOnHand, 0), 0)

  // Calculate sold count from order items
  const salesData = await prisma.orderItem.groupBy({
    by: ['variantId'],
    where: {
      variantId: { in: product.variants.map(v => v.id) },
      order: { status: { notIn: ['CANCELLED', 'REFUNDED'] } },
    },
    _sum: { quantity: true },
  })

  const totalSold = salesData.reduce((sum, s) => sum + (s._sum.quantity || 0), 0)

  const result = {
    ...product,
    basePrice: Number(product.basePrice),
    salePrice: product.salePrice ? Number(product.salePrice) : null,
    costPrice: product.costPrice ? Number(product.costPrice) : null,
    weightKg: product.weightKg ? Number(product.weightKg) : null,
    ratingAvg: r?.avg ?? 0,
    reviewCount: r?.count ?? 0,
    totalStock: allVariantsStock,
    soldCount: totalSold,
    primaryImage: product.images.find((img) => img.isPrimary)?.url ?? product.images[0]?.url ?? null,
    publishedAt: product.publishedAt?.toISOString() ?? null,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    images: (product.images || []).map((img) => ({
      ...img,
      productId: product.id,
      variantId: img.variantId ?? null,
      altText: img.altText ?? null,
      width: img.width ?? null,
      height: img.height ?? null,
    })),
    variants: product.variants.map((v) => ({
      ...v,
      basePrice: v.basePrice ? Number(v.basePrice) : null,
      salePrice: v.salePrice ? Number(v.salePrice) : null,
      weightKg: v.weightKg ? Number(v.weightKg) : null,
      availableStock: v.inventory.reduce((sum, inv) => sum + inv.quantityOnHand, 0),
      images: (v.images || []).map((img) => ({
        ...img,
        productId: product.id,
        variantId: v.id,
        altText: img.altText ?? null,
        width: img.width ?? null,
        height: img.height ?? null,
      })),
    })),
    reviews: (product.reviews || []).map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      images: (r.images || []).map((ri) => ({
        id: ri.id,
        reviewId: r.id,
        url: ri.url,
        altText: ri.altText ?? null,
        sortOrder: ri.sortOrder,
      })),
    })),
  }
  
  // Cache the result for 10 minutes (product details change less frequently)
  await setCache(cacheKey, result, 600)
  
  return result
}

export async function getProductById(id: string): Promise<ProductDetail | null> {
  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      slug: true,
      shortDescription: true,
      description: true,
      gender: true,
      status: true,
      isFeatured: true,
      isNewArrival: true,
      isBestSeller: true,
      isLimitedEdition: true,
      isTrending: true,
      basePrice: true,
      salePrice: true,
      costPrice: true,
      currency: true,
      weightKg: true,
      metaTitle: true,
      metaDescription: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
      brand: { select: { id: true, name: true, slug: true, logoUrl: true } },
      category: { select: { id: true, name: true, slug: true } },
      images: { orderBy: { sortOrder: 'asc' }, select: { id: true, url: true, altText: true, isPrimary: true, sortOrder: true, width: true, height: true, variantId: true } },
      variants: {
        where: { isActive: true },
        select: {
          id: true,
          productId: true,
          sku: true,
          size: true,
          sizeUs: true,
          sizeEu: true,
          sizeUk: true,
          colour: true,
          colourHex: true,
          colourSwatchUrl: true,
          material: true,
          gender: true,
          basePrice: true,
          salePrice: true,
          weightKg: true,
          isActive: true,
          isDefault: true,
          sortOrder: true,
          images: { orderBy: { sortOrder: 'asc' }, select: { id: true, url: true, altText: true, isPrimary: true, sortOrder: true, width: true, height: true, variantId: true } },
          inventory: { select: { id: true, variantId: true, warehouseId: true, quantityOnHand: true, quantityReserved: true, lowStockThreshold: true, reorderPoint: true, reorderQuantity: true, locationAisle: true, locationShelf: true } },
        },
        orderBy: [{ isDefault: 'desc' }, { sortOrder: 'asc' }],
      },
      reviews: {
        where: { isApproved: true },
        include: { user: { select: { id: true, name: true, image: true } }, images: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      collections: { include: { collection: { select: { id: true, name: true, slug: true } } } },
    },
  })

  if (!product) return null

  const rating = await getRatingAggregations([product.id])
  const r = rating.get(product.id)
  const allVariantsStock = product.variants.reduce((sum, v) => sum + v.inventory.reduce((s, inv) => s + inv.quantityOnHand, 0), 0)

  // Calculate sold count from order items
  const salesData = await prisma.orderItem.groupBy({
    by: ['variantId'],
    where: {
      variantId: { in: product.variants.map(v => v.id) },
      order: { status: { notIn: ['CANCELLED', 'REFUNDED'] } },
    },
    _sum: { quantity: true },
  })

  const totalSold = salesData.reduce((sum, s) => sum + (s._sum.quantity || 0), 0)

  return {
    ...product,
    basePrice: Number(product.basePrice),
    salePrice: product.salePrice ? Number(product.salePrice) : null,
    costPrice: product.costPrice ? Number(product.costPrice) : null,
    weightKg: product.weightKg ? Number(product.weightKg) : null,
    ratingAvg: r?.avg ?? 0,
    reviewCount: r?.count ?? 0,
    totalStock: allVariantsStock,
    soldCount: totalSold,
    primaryImage: product.images.find((img) => img.isPrimary)?.url ?? product.images[0]?.url ?? null,
    publishedAt: product.publishedAt?.toISOString() ?? null,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    images: (product.images || []).map((img) => ({
      ...img,
      productId: product.id,
      variantId: img.variantId ?? null,
      altText: img.altText ?? null,
      width: img.width ?? null,
      height: img.height ?? null,
    })),
    variants: product.variants.map((v) => ({
      ...v,
      basePrice: v.basePrice ? Number(v.basePrice) : null,
      salePrice: v.salePrice ? Number(v.salePrice) : null,
      weightKg: v.weightKg ? Number(v.weightKg) : null,
      availableStock: v.inventory.reduce((sum, inv) => sum + inv.quantityOnHand, 0),
      images: (v.images || []).map((img) => ({
        ...img,
        productId: product.id,
        variantId: v.id,
        altText: img.altText ?? null,
        width: img.width ?? null,
        height: img.height ?? null,
      })),
    })),
    reviews: (product.reviews || []).map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      images: (r.images || []).map((ri) => ({
        id: ri.id,
        reviewId: r.id,
        url: ri.url,
        altText: ri.altText ?? null,
        sortOrder: ri.sortOrder,
      })),
    })),
  }
}

export async function getCategories() {
  return prisma.category.findMany({
    where: { isActive: true, parentId: null },
    include: {
      children: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
      _count: {
        select: { products: true },
      },
    },
    orderBy: { sortOrder: 'asc' },
  })
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({
    where: { slug, isActive: true },
    include: { children: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } } },
  })
}

export async function getBrands() {
  return prisma.brand.findMany({
    where: { isActive: true },
    orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }],
  })
}

/**
 * Returns distinct sizes and colours available across all active, published products.
 * Used to populate the Size and Color filter facets.
 */
export async function getAvailableVariantFacets(): Promise<{
  sizes: string[]
  colors: Array<{ name: string; hex: string | null }>
}> {
  const variants = await prisma.productVariant.findMany({
    where: {
      isActive: true,
      product: { status: 'ACTIVE', publishedAt: { not: null, lte: new Date() } },
    },
    select: { size: true, colour: true, colourHex: true },
    distinct: ['size', 'colour'],
    orderBy: { size: 'asc' },
  })

  // Deduplicate sizes (sorted by numeric EU size)
  const sizeSet = new Map<string, number>()
  for (const v of variants) {
    const n = parseFloat(v.size)
    if (!sizeSet.has(v.size)) sizeSet.set(v.size, isNaN(n) ? 999 : n)
  }
  const sizes = [...sizeSet.entries()]
    .sort((a, b) => a[1] - b[1])
    .map(([s]) => s)

  // Deduplicate colors by name
  const colorMap = new Map<string, string | null>()
  for (const v of variants) {
    if (!colorMap.has(v.colour)) colorMap.set(v.colour, v.colourHex)
  }
  const colors = [...colorMap.entries()].map(([name, hex]) => ({ name, hex }))

  return { sizes, colors }
}

export async function getBrandBySlug(slug: string) {
  return prisma.brand.findUnique({ where: { slug, isActive: true } })
}

export async function getCollections(activeOnly = true) {
  return prisma.collection.findMany({
    where: activeOnly
      ? { isActive: true, startDate: { lte: new Date() }, OR: [{ endDate: null }, { endDate: { gte: new Date() } }] }
      : {},
    include: { products: { include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } } }, orderBy: { sortOrder: 'asc' } } },
    orderBy: { sortOrder: 'asc' },
  })
}

export async function getBanners(placement?: string) {
  return prisma.banner.findMany({
    where: { isActive: true, ...(placement && { placement }) },
    orderBy: { sortOrder: 'asc' },
  })
}

export async function getCmsPage(slug: string) {
  return prisma.cmsPage.findUnique({ where: { slug, isPublished: true } })
}