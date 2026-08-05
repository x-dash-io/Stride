import { Metadata } from 'next'
import Link from 'next/link'
import { getCollections } from '@/lib/services/product.service'
import { EmptyState } from '@/components/ui/empty-state'
import { LayoutGrid } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Collections | STRIDE',
  description: 'Shop curated STRIDE collections — seasonal drops, best sellers and signature styles.',
}

export default async function CollectionsIndexPage() {
  const collections = await getCollections(true)

  return (
    <div className="container-max py-12 md:py-16">
      <header className="mb-12 text-center">
        <p className="eyebrow">Curated</p>
        <h1 className="heading-section mt-2">Collections</h1>
        <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
          Hand-picked edits of the season — from daily essentials to statement drops.
        </p>
      </header>

      {collections.length === 0 ? (
        <EmptyState
          icon={LayoutGrid}
          title="No collections yet"
          description="New collections are on the way — check back soon."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection) => {
            const image = collection.products[0]?.product.images[0]?.url
            return (
              <Link
                key={collection.id}
                href={`/collections/${collection.slug}`}
                className="group block bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                <div className="aspect-[4/3] bg-muted/50 overflow-hidden">
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={image}
                      alt={collection.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground font-serif text-3xl font-bold">
                      {collection.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h2 className="font-serif font-semibold text-lg group-hover:text-accent transition-colors">
                    {collection.name}
                  </h2>
                  {collection.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{collection.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-3">
                    {collection.products.length} product{collection.products.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
