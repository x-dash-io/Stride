import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { ProductGrid } from '@/components/products/ProductGrid'
import { Search as SearchIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

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
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold mb-4">Search</h1>
          <form action="/search" method="GET" className="flex gap-2">
            <Input
              name="q"
              type="search"
              placeholder="Search for products..."
              defaultValue={query}
              className="flex-1"
              autoFocus
            />
            <Button type="submit">
              <SearchIcon className="w-4 h-4" />
            </Button>
          </form>
        </div>

        {query.trim() && (
          <p className="text-muted-foreground mb-6">
            {serializedProducts.length} result{serializedProducts.length !== 1 ? 's' : ''} for "{query}"
          </p>
        )}

        {!query.trim() ? (
          <div className="text-center py-16">
            <SearchIcon className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">Enter a search term to find products</p>
          </div>
        ) : serializedProducts.length === 0 ? (
          <div className="text-center py-16">
            <SearchIcon className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-lg text-muted-foreground mb-4">No products found for "{query}"</p>
            <Button variant="outline" asChild>
              <a href="/products">Browse All Products</a>
            </Button>
          </div>
        ) : (
          <ProductGrid products={serializedProducts} />
        )}
      </div>
    </div>
  )
}
