import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
import { ok, err, Result } from '@/lib/types/result'

export interface ProductFilters {
  category?: string
  brand?: string
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
  gender: string
  status: string
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
  publishedAt: Date | null
  createdAt: Date
  updatedAt: Date
  brand: { id: string; name: string; slug: string; logoUrl: string | null }
  category: { id: string; name: string; slug: string } | null
  images: { url: string }[]
  variants: ProductVariantListItem[]
}

export interface ProductVariantListItem {
  id: string
  sku: string
  size: string
  sizeUs: string | null
  sizeEu: string | null
  sizeUk: string | null
  colour: string
  colourHex: string | null
  colourSwatchUrl: string | null
  material: string | null
  gender: string | null
  basePrice: number | null
  salePrice: number | null
  weightKg: number | null
  isActive: boolean
  isDefault: boolean
  sortOrder: number
  images: ProductImage[]
  inventory: { quantityOnHand: number }[]
  availableStock: number
}

export interface ProductImage {
  id: string
  url: string
  altText: string | null
  width: number | null
  height: number | null
  isPrimary: boolean
  sortOrder: number
}

export interface ProductDetail {
  id: string
  name: string
  slug: string
  shortDescription: string | null
  description: string | null
  gender: string
  status: string
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
  metaTitle: string | null
  metaDescription: string | null
  publishedAt: Date | null
  createdAt: Date
  updatedAt: Date
  brand: { id: string; name: string; slug: string; logoUrl: string | null }
  category: { id: string; name: string; slug: string } | null
  images: ProductImage[]
  variants: ProductVariantDetail[]
  reviews: ProductReview[]
  collections: { collection: { id: string; name: string; slug: string } }[]
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
  gender: string | null
  basePrice: number | null
  salePrice: number | null
  weightKg: number | null
  isActive: boolean
  isDefault: boolean
  sortOrder: number
  images: ProductImage[]
  inventory: { quantityOnHand: number }[]
  availableStock: number
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
  images: { id: string; url: string; altText: string | null; sortOrder: number }[]
  createdAt: Date
  updatedAt: Date
}

export async function getProducts(params: ProductFilters): Promise<PaginatedProducts> {
  const {
    category, brand, minPrice, maxPrice, sort,
    page = 1, perPage = 24, query, featured, newArrival, bestSeller, trending, onSale, limit
  } = params

  const skip = (page - 1) * perPage
  const take = limit ?? perPage

  const where: Prisma.ProductWhereInput = {
    status: 'ACTIVE',
    publishedAt: { not: null, lte: new Date() },
    ...(category && { category: { slug: category } }),
    ...(brand && { brand: { slug: brand } }),
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
        { description: { contains: query, mode: 'insensitive' } },
        { brand: { name: { contains: query, mode: 'insensitive' } } },
      ],
    }),
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput = (() => {
    switch (sort) {
      case 'price-asc': return { basePrice: 'asc' }
      case 'price-desc': return { basePrice: 'desc' }
      case 'popular': return { soldCount: 'desc' }
      case 'rating': return { ratingAvg: 'desc' }
      case 'newest': return { createdAt: 'desc' }
      default: return { createdAt: 'desc' }
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
        images: { where: { isPrimary: true }, take: 1, select: { url: true } },
        variants: {
          where: { isActive: true },
          select: {
            id: true,
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
            inventory: { select: { quantityOnHand: true } },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    }),
    prisma.product.count({ where }),
  ])

  const items = products.map((p) => ({
    ...p,
    basePrice: Number(p.basePrice),
    salePrice: p.salePrice ? Number(p.salePrice) : null,
    costPrice: p.costPrice ? Number(p.costPrice) : null,
    weightKg: p.weightKg ? Number(p.weightKg) : null,
    variants: p.variants.map((v) => ({
      ...v,
      basePrice: v.basePrice ? Number(v.basePrice) : null,
      salePrice: v.salePrice ? Number(v.salePrice) : null,
      weightKg: v.weightKg ? Number(v.weightKg) : null,
      availableStock: v.inventory.reduce((sum, inv) => sum + inv.quantityOnHand, 0),
    })),
    images: p.images.map((img) => ({ url: img.url })),
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    publishedAt: p.publishedAt,
  }))

  return { items, total, page, perPage, totalPages: Math.ceil(total / perPage) }
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
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
          images: { orderBy: { sortOrder: 'asc' }, select: { id: true, url: true, altText: true, isPrimary: true, sortOrder: true, width: true, height: true } },
          inventory: { select: { quantityOnHand: true } },
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

  return {
    ...product,
    basePrice: Number(product.basePrice),
    salePrice: product.salePrice ? Number(product.salePrice) : null,
    costPrice: product.costPrice ? Number(product.costPrice) : null,
    weightKg: product.weightKg ? Number(product.weightKg) : null,
    variants: product.variants.map((v) => ({
      ...v,
      basePrice: v.basePrice ? Number(v.basePrice) : null,
      salePrice: v.salePrice ? Number(v.salePrice) : null,
      weightKg: v.weightKg ? Number(v.weightKg) : null,
      availableStock: v.inventory.reduce((sum, inv) => sum + inv.quantityOnHand, 0),
    })),
  }
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
          images: { orderBy: { sortOrder: 'asc' }, select: { id: true, url: true, altText: true, isPrimary: true, sortOrder: true, width: true, height: true } },
          inventory: { select: { quantityOnHand: true } },
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

  return {
    ...product,
    basePrice: Number(product.basePrice),
    salePrice: product.salePrice ? Number(product.salePrice) : null,
    costPrice: product.costPrice ? Number(product.costPrice) : null,
    weightKg: product.weightKg ? Number(product.weightKg) : null,
    variants: product.variants.map((v) => ({
      ...v,
      basePrice: v.basePrice ? Number(v.basePrice) : null,
      salePrice: v.salePrice ? Number(v.salePrice) : null,
      weightKg: v.weightKg ? Number(v.weightKg) : null,
      availableStock: v.inventory.reduce((sum, inv) => sum + inv.quantityOnHand, 0),
    })),
  }
}

export async function getCategories() {
  return prisma.category.findMany({
    where: { isActive: true, parentId: null },
    include: { children: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } } },
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