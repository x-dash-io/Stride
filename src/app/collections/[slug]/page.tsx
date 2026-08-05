import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getCollectionBySlug, getProducts } from '@/lib/services/product.service'
import { ProductGrid } from '@/components/products/ProductGrid'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CalendarDays } from 'lucide-react'
import { format } from 'date-fns'

export const dynamic = 'force-dynamic'

interface CollectionDetailPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: CollectionDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const collection = await getCollectionBySlug(slug)
  return {
    title: collection ? `${collection.name} | STRIDE` : 'Collection | STRIDE',
    description: collection?.description ?? undefined,
  }
}

export default async function CollectionDetailPage({ params }: CollectionDetailPageProps) {
  const { slug } = await params
  const collection = await getCollectionBySlug(slug)

  if (!collection) {
    notFound()
  }

  const { items: products } = await getProducts({ collectionSlug: collection.slug, limit: 48 })

  const now = new Date()
  const isUpcoming = collection.startDate ? collection.startDate > now : false
  const isEnded = collection.endDate ? collection.endDate < now : false

  return (
    <div className="container-max py-12 md:py-16">
      <Link href="/collections" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-6">
        <ArrowLeft className="w-4 h-4" /> All Collections
      </Link>

      <header className="mb-12 max-w-3xl">
        <h1 className="heading-section">{collection.name}</h1>
        {collection.description && (
          <p className="text-muted-foreground mt-4 text-lg leading-relaxed">{collection.description}</p>
        )}
        <div className="flex flex-wrap gap-3 mt-6 text-sm text-muted-foreground">
          <span>{products.length} products</span>
          {collection.startDate && (
            <span className="flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4" />
              {isEnded ? 'Ended' : isUpcoming ? `Starts ${format(collection.startDate, 'MMM d')}` : `Since ${format(collection.startDate, 'MMM d, yyyy')}`}
              {collection.endDate && !isEnded && ` — ends ${format(collection.endDate, 'MMM d, yyyy')}`}
            </span>
          )}
        </div>
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
