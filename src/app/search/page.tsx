import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { ProductGrid } from '@/components/products/ProductGrid'
import { Search as SearchIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Search | STRIDE',
  description: 'Search for your favorite footwear.',
}

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams
  const query = q || ''

  let products: any[] = []
  
  if (query.trim()) {
    products = await prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        publishedAt: { not: null, lte: new Date() },
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { shortDescription: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { brand: { name: { contains: query, mode: 'insensitive' } } },
          { category: { name: { contains: query, mode: 'insensitive' } } },
        ],
      },
      include: {
        brand: true,
        category: true,
        images: { where: { isPrimary: true }, take: 1 },
        variants: {
          where: { isActive: true },
          include: {
            inventory: { where: { quantityOnHand: { gt: 0 } } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 24,
    })
  }

  const serializedProducts = products.map((product) => ({
    ...product,
    basePrice: Number(product.basePrice),
    salePrice: product.salePrice ? Number(product.salePrice) : null,
    costPrice: product.costPrice ? Number(product.costPrice) : null,
    weightKg: product.weightKg ? Number(product.weightKg) : null,
    ratingAvg: 0,
    reviewCount: 0,
    totalStock: 0,
    soldCount: 0,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    primaryImage: product.images[0]?.url || null,
    variants: product.variants.map((v: any) => ({
      ...v,
      basePrice: Number(v.basePrice || 0),
      salePrice: v.salePrice ? Number(v.salePrice) : null,
      weightKg: v.weightKg ? Number(v.weightKg) : null,
      availableStock: v.inventory.reduce((sum: number, inv: any) => sum + inv.quantityOnHand, 0),
    })),
  }))

  return (
    <div className="container-max section-padding">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="heading-page mb-6">Search</h1>
          <form action="/search" method="GET" className="flex gap-3">
            <Input
              name="q"
              type="search"
              placeholder="Search for products, brands, categories..."
              defaultValue={query}
              className="flex-1 h-12 text-base"
              autoFocus
            />
            <Button type="submit" size="lg" className="h-12 px-6">
              <SearchIcon className="w-5 h-5" />
            </Button>
          </form>
        </div>

        {query.trim() && (
          <p className="body text-muted-foreground mb-8">
            {serializedProducts.length} result{serializedProducts.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
          </p>
        )}

        {!query.trim() ? (
          <div className="text-center py-20">
            <p className="heading-section text-muted-foreground/50 mb-4">Start typing to discover footwear</p>
            <p className="body-large text-muted-foreground max-w-md mx-auto">Search by product name, brand, category, or style.</p>
          </div>
        ) : serializedProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="heading-section text-muted-foreground/50 mb-4">No results for &ldquo;{query}&rdquo;</p>
            <p className="body-large text-muted-foreground mb-8 max-w-md mx-auto">Try a different search term or browse our full collection.</p>
            <Button variant="outline" size="lg" asChild>
              <Link href="/products">Browse All Products</Link>
            </Button>
          </div>
        ) : (
          <ProductGrid products={serializedProducts} />
        )}
      </div>
    </div>
  )
}
