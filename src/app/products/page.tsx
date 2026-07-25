import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { ProductFilters } from '@/components/products/ProductFilters'
import { ProductGrid } from '@/components/products/ProductGrid'
import { Pagination } from '@/components/ui/pagination'

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string
    brand?: string
    minPrice?: string
    maxPrice?: string
    sort?: string
    page?: string
    q?: string
  }>
}

export async function generateMetadata({ searchParams }: ProductsPageProps): Promise<Metadata> {
  const params = await searchParams
  const category = params.category ? params.category.replace(/-/g, ' ') : ''
  const brand = params.brand ? params.brand.replace(/-/g, ' ') : ''

  return {
    title: `${category || brand || 'All'} Products | STRIDE`,
    description: `Shop ${category || brand || 'premium footwear'} from top brands. Free delivery on orders over KES 10,000.`,
  }
}

async function getProducts(params: {
  category?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
  sort?: string
  page: number
  perPage: number
  query?: string
}) {
  const { category, brand, minPrice, maxPrice, sort, page, perPage, query } = params
  const skip = (page - 1) * perPage

  const where = {
    status: 'ACTIVE' as const,
    publishedAt: { not: null, lte: new Date() },
    ...(category && { category: { slug: category } }),
    ...(brand && { brand: { slug: brand } }),
    ...(minPrice !== undefined && { basePrice: { gte: minPrice } }),
    ...(maxPrice !== undefined && { basePrice: { lte: maxPrice } }),
    ...(query && {
      OR: [
        { name: { contains: query, mode: 'insensitive' as const } },
        { description: { contains: query, mode: 'insensitive' as const } },
        { brand: { name: { contains: query, mode: 'insensitive' as const } } },
      ],
    }),
  }

  const orderBy = (() => {
    switch (sort) {
      case 'price-asc': return { basePrice: 'asc' as const }
      case 'price-desc': return { basePrice: 'desc' as const }
      case 'popular': return { soldCount: 'desc' as const }
      case 'rating': return { ratingAvg: 'desc' as const }
      default: return { createdAt: 'desc' as const }
    }
  })()

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: perPage,
      include: {
        brand: { select: { id: true, name: true, slug: true, logoUrl: true } },
        category: { select: { id: true, name: true, slug: true } },
        images: { where: { isPrimary: true }, take: 1 },
        variants: {
          where: { isActive: true },
          include: { inventory: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    }),
    prisma.product.count({ where }),
  ])

  const products = items.map(product => ({
    ...product,
    basePrice: Number(product.basePrice),
    salePrice: product.salePrice ? Number(product.salePrice) : null,
    variants: product.variants.map(v => ({
      ...v,
      basePrice: Number(v.basePrice || 0),
      salePrice: v.salePrice ? Number(v.salePrice) : null,
      availableStock: v.inventory.reduce((sum, inv) => sum + inv.quantityOnHand, 0),
    })),
    primaryImage: product.images[0]?.url,
  }))

  return { items: products, total }
}

async function getCategories() {
  return prisma.category.findMany({
    where: { isActive: true, parentId: null },
    include: { children: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } } },
    orderBy: { sortOrder: 'asc' },
  })
}

async function getBrands() {
  return prisma.brand.findMany({
    where: { isActive: true },
    orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }],
  })
}

async function getPriceRange() {
  const [min, max] = await Promise.all([
    prisma.product.aggregate({ _min: { basePrice: true }, where: { status: 'ACTIVE' } }),
    prisma.product.aggregate({ _max: { basePrice: true }, where: { status: 'ACTIVE' } }),
  ])
  return { min: min._min.basePrice ? Number(min._min.basePrice) : 0, max: max._max.basePrice ? Number(max._max.basePrice) : 50000 }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams
  const page = Math.max(1, Number(params.page) || 1)
  const perPage = 24

  const [productsData, categories, brands, priceRange] = await Promise.all([
    getProducts({
      category: params.category,
      brand: params.brand,
      minPrice: params.minPrice ? Number(params.minPrice) : undefined,
      maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
      sort: params.sort,
      page,
      perPage,
      query: params.q,
    }),
    getCategories(),
    getBrands(),
    getPriceRange(),
  ])

  const totalPages = Math.ceil(productsData.total / perPage)
  const priceRangeMin = params.minPrice ? Number(params.minPrice) : priceRange.min
  const priceRangeMax = params.maxPrice ? Number(params.maxPrice) : priceRange.max

  return (
    <div className="min-h-screen">
      <div className="container-max py-8 border-b border-border">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-2">Our Collection</h1>
        <p className="text-muted-foreground">
          Discover {productsData.total} products from our premium selection
        </p>
      </div>

      <div className="container-max py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <ProductFilters
            categories={categories}
            brands={brands}
            selectedCategory={params.category}
            selectedBrand={params.brand}
            priceRange={{ min: priceRangeMin, max: priceRangeMax }}
            fullPriceRange={priceRange}
          />
        </aside>

        <main className="lg:col-span-3">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Showing {((page - 1) * perPage) + 1}–{Math.min(page * perPage, productsData.total)} of {productsData.total} products
              </span>
            </div>
            <select
              defaultValue={params.sort || 'newest'}
              onChange={(e) => {
                const url = new URL(window.location.href)
                url.searchParams.set('sort', e.target.value)
                url.searchParams.delete('page')
                window.location.href = url.toString()
              }}
              className="input-base text-sm w-auto"
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          {productsData.items.length > 0 ? (
            <>
              <ProductGrid products={productsData.items} />
              {totalPages > 1 && (
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  baseUrl="/products"
                  searchParams={params}
                />
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground mb-4">No products found matching your filters.</p>
              <button
                onClick={() => {
                  window.location.href = '/products'
                }}
                className="btn-primary"
              >
                Clear Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}