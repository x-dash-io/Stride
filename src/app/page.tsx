import Link from 'next/link'
import { getProducts, getBrands, getBanners } from '@/lib/services/product.service'
import { ProductGrid } from '@/components/products/ProductGrid'
import { HeroProductCarousel } from '@/components/hero/HeroProductCarousel'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [featuredProducts, newArrivals, bestSellers, trendingProducts, onSaleProducts, brands, heroBanner] =
    await Promise.all([
      getProducts({ tag: 'FEATURED', limit: 8 }),
      getProducts({ tag: 'NEW_ARRIVAL', limit: 8 }),
      getProducts({ tag: 'BEST_SELLER', limit: 8 }),
      getProducts({ tag: 'TRENDING', limit: 8 }),
      getProducts({ onSale: true, limit: 8 }),
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
          <div
            className="container-max py-16 md:py-24 flex flex-col items-start"
            style={
              activeBanner.desktopImageUrl
                ? { backgroundColor: 'rgba(0, 0, 0, 0.55)' }
                : activeBanner.bgColor
                  ? { backgroundColor: activeBanner.bgColor }
                  : undefined
            }
          >
            {activeBanner.subtitle && (
              <p
                className="eyebrow"
                style={activeBanner.textColor ? { color: activeBanner.textColor } : undefined}
              >
                {activeBanner.subtitle}
              </p>
            )}
            <h2
              className="heading-section mt-2 max-w-2xl text-balance"
              style={activeBanner.textColor ? { color: activeBanner.textColor } : undefined}
            >
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
            <Link href="/products?tag=BEST_SELLER">View All Bestsellers</Link>
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
              <Link href="/products?tag=TRENDING">View All Trending</Link>
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
              <Link href="/products?tag=NEW_ARRIVAL">View All New Arrivals</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}