import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getBrandBySlug, getProducts } from '@/lib/services/product.service'
import { ProductGrid } from '@/components/products/ProductGrid'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface BrandPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const { slug } = await params
  const brand = await getBrandBySlug(slug)
  return {
    title: brand ? `${brand.name} | STRIDE` : 'Brand | STRIDE',
    description: brand?.description ?? undefined,
  }
}

export default async function BrandDetailPage({ params }: BrandPageProps) {
  const { slug } = await params
  const brand = await getBrandBySlug(slug)

  if (!brand) {
    notFound()
  }

  const { items: products } = await getProducts({ brand: brand.slug, limit: 48 })

  return (
    <div className="container-max py-12 md:py-16">
      <Link href="/products" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-6">
        <ArrowLeft className="w-4 h-4" /> All Products
      </Link>

      <header className="mb-12 max-w-3xl">
        {brand.logoUrl && (
          <img
            src={brand.logoUrl}
            alt={brand.name}
            className="h-16 w-auto mb-4"
          />
        )}
        <h1 className="heading-section">{brand.name}</h1>
        {brand.description && (
          <p className="text-muted-foreground mt-4 text-lg leading-relaxed">{brand.description}</p>
        )}
        <p className="text-sm text-muted-foreground mt-6">
          {products.length} product{products.length !== 1 ? 's' : ''}
        </p>
      </header>

      <ProductGrid products={products} />

      <div className="text-center mt-10">
        <Button variant="outline" size="lg" asChild>
          <Link href="/products">Browse All Products</Link>
        </Button>
      </div>
    </div>
  )
}