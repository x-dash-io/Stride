import Link from 'next/link'
import { getProducts, getCategories, getBrands, getBanners } from '@/lib/services/product.service'
import { ProductGrid } from '@/components/products/ProductGrid'
import { HeroProductCarousel } from '@/components/hero/HeroProductCarousel'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [featuredProducts, newArrivals, bestSellers, trendingProducts, onSaleProducts, categories, brands, heroBanner] =
    await Promise.all([
      getProducts({ featured: true, limit: 8 }),
      getProducts({ newArrival: true, limit: 8 }),
      getProducts({ bestSeller: true, limit: 8 }),
      getProducts({ trending: true, limit: 8 }),
      getProducts({ onSale: true, limit: 8 }),
      getCategories(),
      getBrands(),
      getBanners('hero'),
    ])

  const heroProducts =
    featuredProducts.items.length > 0
      ? featuredProducts.items.slice(0, 6)
      : bestSellers.items.length > 0
        ? bestSellers.items.slice(0, 6)
        : newArrivals.items.slice(0, 6)

  const activeBanner = heroBanner.find(
    (b) =>
      (!b.startsAt || new Date(b.startsAt) <= new Date()) &&
      (!b.endsAt || new Date(b.endsAt) >= new Date())
  )

  return (
    <div className="w-full">
      <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden border-b border-border/40">
        <HeroProductCarousel products={heroProducts} />
      </section>

      {activeBanner && (
        <section
          className="relative overflow-hidden border-b border-border/40"
          style={
            activeBanner.desktopImageUrl
              ? { backgroundImage: `url(${activeBanner.desktopImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
              : { backgroundColor: activeBanner.bgColor || undefined }
          }
        >
          <div className={`${activeBanner.desktopImageUrl ? 'bg-black/55' : ''} container-max py-16 md:py-24 flex flex-col items-start`}>
            {activeBanner.subtitle && (
              <p className="eyebrow text-white">{activeBanner.subtitle}</p>
            )}
            <h2 className="heading-section mt-2 text-white max-w-2xl text-balance">
              {activeBanner.title}
            </h2>
            {activeBanner.ctaText && activeBanner.ctaUrl && (
              <div className="mt-8">
                <Button size="lg" asChild>
                  <Link href={activeBanner.ctaUrl}>{activeBanner.ctaText}</Link>
                </Button>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="container-max min-h-[100dvh] flex flex-col justify-center scroll-reveal py-20">
        <div className="mb-10">
          <p className="eyebrow">Curated Selection</p>
          <h2 className="heading-section mt-2">Bestsellers</h2>
        </div>
        <ProductGrid products={bestSellers.items} />
        <div className="text-center mt-8">
          <Button variant="outline" size="lg" asChild>
            <Link href="/products?sort=popular">View All Bestsellers</Link>
          </Button>
        </div>
      </section>

      {trendingProducts.items.length > 0 && (
        <section className="container-max min-h-[100dvh] flex flex-col justify-center scroll-reveal py-20">
          <div className="mb-10">
            <p className="eyebrow">Hot Right Now</p>
            <h2 className="heading-section mt-2">Trending</h2>
          </div>
          <ProductGrid products={trendingProducts.items} />
          <div className="text-center mt-8">
            <Button variant="outline" size="lg" asChild>
              <Link href="/products?trending=1">View All Trending</Link>
            </Button>
          </div>
        </section>
      )}

      {onSaleProducts.items.length > 0 && (
        <section className="bg-muted/30 scroll-reveal min-h-[100dvh] flex flex-col justify-center">
          <div className="container-max py-20">
            <div className="mb-10">
              <p className="eyebrow">Deals</p>
              <h2 className="heading-section mt-2">On Sale</h2>
            </div>
            <ProductGrid products={onSaleProducts.items} />
            <div className="text-center mt-8">
              <Button variant="outline" size="lg" asChild>
                <Link href="/products?onSale=1">View All Deals</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      <section className="bg-muted/30 scroll-reveal min-h-[100dvh] flex flex-col justify-center">
        <div className="container-max py-20">
          <div className="mb-10">
            <p className="eyebrow">New In</p>
            <h2 className="heading-section mt-2">New Arrivals</h2>
          </div>
          <ProductGrid products={newArrivals.items} />
          <div className="text-center mt-8">
            <Button variant="outline" size="lg" asChild>
              <Link href="/products?sort=newest">View All New Arrivals</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container-max min-h-[100dvh] flex flex-col justify-center scroll-reveal py-20">
        <div className="mb-10">
          <p className="eyebrow">Shop by Category</p>
          <h2 className="heading-section mt-2">Categories</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {categories.filter(c => c.isActive && !c.parentId).slice(0, 10).map((category, i) => (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              className={`group scroll-reveal-delay-${Math.min(i + 1, 5)}`}
            >
              <div className="aspect-square bg-muted/50 rounded-xl flex items-center justify-center group-hover:bg-muted/80 transition-colors">
                <div className="text-center p-4">
                  <h3 className="font-serif font-semibold text-balance text-base">{category.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{category.children?.length || 0} styles</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}