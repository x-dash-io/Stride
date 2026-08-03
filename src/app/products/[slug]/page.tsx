import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { getProductBySlug } from '@/lib/services/product.service'

export const revalidate = 3600
import { ProductDetailClient } from './ProductDetailClient'
import { ProductDetailSkeleton } from '@/components/skeleton-loader'
import { formatPrice } from '@/lib/utils'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)

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

async function ProductContent({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) notFound()

  return <ProductDetailClient product={product} />
}

export default async function ProductPage({ params }: ProductPageProps) {
  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      <ProductContent params={params} />
    </Suspense>
  )
}