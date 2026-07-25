import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
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
    variants: product.variants.map((v) => ({
      ...v,
      basePrice: Number(v.basePrice || 0),
      salePrice: v.salePrice ? Number(v.salePrice) : null,
      availableStock: v.inventory.reduce((sum, inv) => sum + inv.quantityOnHand, 0),
      inventory: undefined,
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