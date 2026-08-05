import { Metadata } from 'next'
import { Suspense } from 'react'
import { getProducts, getCategories, getBrands, getAvailableVariantFacets } from '@/lib/services/product.service'
import { prisma } from '@/lib/prisma'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { ProductFilters } from '@/components/products/ProductFilters'
import { ProductSort } from '@/components/products/ProductSort'
import { ClearFiltersButton } from '@/components/products/ClearFiltersButton'
import { ProductGrid } from '@/components/products/ProductGrid'
import { Pagination } from '@/components/ui/pagination'
import { ProductGridSkeleton } from '@/components/skeleton-loader'

export const revalidate = 3600

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string
    brand?: string
    gender?: string
    size?: string
    color?: string
    minPrice?: string
    maxPrice?: string
    sort?: string
    page?: string
    q?: string
    trending?: string
    onSale?: string
  }>
}

export async function generateMetadata({ searchParams }: ProductsPageProps): Promise<Metadata> {
  const params = await searchParams
  const category = params.category ? params.category.replace(/-/g, ' ') : ''
  const brand = params.brand ? params.brand.replace(/-/g, ' ') : ''

  return {
    title: `${category || brand || 'All'} Products | STRIDE`,
    description: `Shop ${category || brand || 'premium footwear'} from top brands.`,
  }
}

async function getPriceRange() {
  const [min, max] = await Promise.all([
    prisma.product.aggregate({ _min: { basePrice: true }, where: { status: 'ACTIVE' } }),
    prisma.product.aggregate({ _max: { basePrice: true }, where: { status: 'ACTIVE' } }),
  ])
  return { min: min._min.basePrice ? Number(min._min.basePrice) : 0, max: max._max.basePrice ? Number(max._max.basePrice) : 50000 }
}

async function ProductsContent({ searchParams }: ProductsPageProps) {
  const params = await searchParams
  const page = Math.max(1, Number(params.page) || 1)
  const perPage = 24

  const [productsData, categories, brands, priceRange, facets] = await Promise.all([
    getProducts({
      category: params.category,
      brand: params.brand,
      gender: params.gender,
      size: params.size,
      color: params.color,
      minPrice: params.minPrice ? Number(params.minPrice) : undefined,
      maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
      sort: params.sort,
      page,
      perPage,
      query: params.q,
      trending: params.trending === '1',
      onSale: params.onSale === '1',
    }),
    getCategories(),
    getBrands(),
    getPriceRange(),
    getAvailableVariantFacets(),
  ])

  const totalPages = Math.ceil(productsData.total / perPage)
  const priceRangeMin = params.minPrice ? Number(params.minPrice) : priceRange.min
  const priceRangeMax = params.maxPrice ? Number(params.maxPrice) : priceRange.max

  const breadcrumbItems = params.category
    ? [{ label: 'Products', href: '/products' }, { label: params.category.replace(/-/g, ' ') }]
    : [{ label: 'Products' }]

  return (
    <div className="min-h-screen">
      <div className="px-6 sm:px-8 lg:px-12 py-8 lg:py-12 max-w-7xl mx-auto border-b border-border">
        <Breadcrumbs items={breadcrumbItems} />
        <h1 className="heading-page mt-4 mb-2">Our Collection</h1>
        <p className="body-large text-muted-foreground">
          Discover {productsData.total} products from our premium selection
        </p>
      </div>

      <div className="px-6 sm:px-8 lg:px-12 py-8 lg:py-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8 md:gap-12">
        <aside className="lg:col-span-1 sticky top-24 self-start">
          <ProductFilters
            categories={categories}
            brands={brands}
            availableSizes={facets.sizes}
            availableColors={facets.colors}
            selectedCategory={params.category}
            selectedBrand={params.brand}
            selectedGender={params.gender}
            selectedSize={params.size}
            selectedColor={params.color}
            priceRange={{ min: priceRangeMin, max: priceRangeMax }}
            fullPriceRange={priceRange}
          />
        </aside>

        <main className="lg:col-span-3">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
            <div className="flex items-center gap-4">
              <span className="body text-muted-foreground">
                Showing {((page - 1) * perPage) + 1}–{Math.min(page * perPage, productsData.total)} of {productsData.total} products
              </span>
            </div>
            <ProductSort currentSort={params.sort} />
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
            <div className="text-center py-16">
              <p className="body-large text-muted-foreground mb-4">No products found matching your filters.</p>
              <ClearFiltersButton />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  return (
    <Suspense fallback={<ProductGridSkeleton count={6} />}>
      <ProductsContent searchParams={searchParams} />
    </Suspense>
  )
}