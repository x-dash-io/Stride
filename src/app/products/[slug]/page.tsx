import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export const revalidate = 3600
import { ProductDetailClient } from './ProductDetailClient'
import { formatPrice } from '@/lib/utils'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

async function getProductData(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug, status: 'ACTIVE', publishedAt: { not: null, lte: new Date() } },
    include: {
      brand: true,
      category: true,
      images: { orderBy: { sortOrder: 'asc' } },
      variants: {
        where: { isActive: true },
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          inventory: { where: { quantityOnHand: { gt: 0 } } },
        },
        orderBy: [{ isDefault: 'desc' }, { sortOrder: 'asc' }],
      },
      reviews: {
        where: { isApproved: true },
        include: { user: { select: { id: true, name: true, image: true } }, images: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      collections: { include: { collection: true } },
    },
  })

  if (!product) return null

  return {
    ...product,
    basePrice: Number(product.basePrice),
    salePrice: product.salePrice ? Number(product.salePrice) : null,
    costPrice: product.costPrice ? Number(product.costPrice) : null,
    weightKg: product.weightKg ? Number(product.weightKg) : null,
    ratingAvg: 0,
    reviewCount: product.reviews?.length || 0,
    totalStock: 0,
    soldCount: 0,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    images: product.images.map((img) => ({
      id: img.id,
      productId: product.id,
      variantId: img.variantId || null,
      url: img.url,
      altText: img.altText || null,
      width: img.width ?? null,
      height: img.height ?? null,
      isPrimary: img.isPrimary,
      sortOrder: img.sortOrder,
    })),
    variants: product.variants.map((v) => ({
      ...v,
      basePrice: Number(v.basePrice || 0),
      salePrice: v.salePrice ? Number(v.salePrice) : null,
      weightKg: v.weightKg ? Number(v.weightKg) : null,
      availableStock: v.inventory.reduce((sum, inv) => sum + inv.quantityOnHand, 0),
      inventory: [],
      images: (v.images || []).map((img) => ({
        id: img.id,
        productId: product.id,
        variantId: v.id,
        url: img.url,
        altText: img.altText || null,
        width: img.width ?? null,
        height: img.height ?? null,
        isPrimary: img.isPrimary,
        sortOrder: img.sortOrder,
      })),
    })),
    reviews: (product.reviews || []).map((r) => ({
      id: r.id,
      productId: product.id,
      userId: r.userId,
      user: r.user ? { id: r.user.id, name: r.user.name, image: r.user.image } : undefined,
      orderItemId: r.orderItemId || undefined,
      title: r.title || undefined,
      body: r.body,
      rating: r.rating,
      isVerifiedPurchase: r.isVerifiedPurchase,
      isFeatured: r.isFeatured,
      isApproved: r.isApproved,
      helpfulCount: r.helpfulCount,
      sizeRating: r.sizeRating || undefined,
      comfortRating: r.comfortRating || undefined,
      qualityRating: r.qualityRating || undefined,
      images: (r.images || []).map((ri) => ({
        id: ri.id,
        reviewId: r.id,
        url: ri.url,
        altText: ri.altText || undefined,
        sortOrder: ri.sortOrder,
      })),
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    })),
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductData(slug)

  if (!product) return { title: 'Product Not Found' }

  return {
    title: `${product.name} | ${product.brand.name}`,
    description: product.shortDescription || product.description?.slice(0, 160) || `Shop ${product.name} from ${product.brand.name}`,
    openGraph: {
      title: product.name,
      description: product.shortDescription || product.description?.slice(0, 160) || '',
      images: product.images[0]?.url ? [{ url: product.images[0].url }] : [],
      type: 'website',
    },
    other: {
      'product:price:amount': String(product.salePrice ?? product.basePrice),
      'product:price:currency': 'KES',
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await getProductData(slug)

  if (!product) notFound()

  return <ProductDetailClient product={product} />
}