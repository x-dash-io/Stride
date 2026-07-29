import Link from 'next/link'
import { getProducts, getCategories, getBrands, getBanners } from '@/lib/queries'
import { ProductGrid } from '@/components/products/ProductGrid'
import { HeroCarousel } from '@/components/hero-carousel'
import { HeroProductCarousel } from '@/components/hero/HeroProductCarousel'
import { Button } from '@/components/ui/button'
import { Truck } from 'lucide-react'
import { NewsletterForm } from '@/components/layout/NewsletterForm'

export default async function HomePage() {
  const [featuredProducts, newArrivals, bestSellers, categories, brands, heroBanner] = await Promise.all([
    getProducts({ featured: true, limit: 8 }),
    getProducts({ newArrival: true, limit: 8 }),
    getProducts({ bestSeller: true, limit: 8 }),
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

  return (
    <div className="w-full">
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {heroBanner.length > 0 ? (
          <HeroCarousel banners={heroBanner} />
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_40%_20%,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_80%,_var(--tw-gradient-stops))] from-accent/5 via-transparent to-transparent" />
            </div>

            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-1/2 -left-1/2 w-full h-full max-w-[600px] max-h-[600px] rounded-full bg-accent/5 blur-[150px] animate-pulse-slow" />
              <div className="absolute -bottom-1/4 -right-1/4 w-full h-full max-w-[400px] max-h-[400px] rounded-full bg-primary/5 blur-[120px] animate-pulse-slow delay-1000" />
            </div>

            <HeroProductCarousel products={heroProducts} />

            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce-slow hidden lg:block">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/20 bg-background/80 backdrop-blur-sm">
                <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </div>
          </>
        )}
      </section>

      <section className="container-max section-padding scroll-reveal">
        <div className="mb-10">
          <p className="eyebrow">Curated Selection</p>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-balance mt-2">Bestsellers</h2>
        </div>
        <ProductGrid products={bestSellers.items} />
        <div className="text-center mt-8">
          <Button variant="outline" size="lg" asChild>
            <Link href="/products?sort=popular">View All Bestsellers</Link>
          </Button>
        </div>
      </section>

      <section className="bg-muted/30 scroll-reveal">
        <div className="container-max section-padding">
          <div className="mb-10">
            <p className="eyebrow">New In</p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-balance mt-2">New Arrivals</h2>
          </div>
          <ProductGrid products={newArrivals.items} />
          <div className="text-center mt-8">
            <Button variant="outline" size="lg" asChild>
              <Link href="/products?sort=newest">View All New Arrivals</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container-max section-padding scroll-reveal">
        <div className="mb-10">
          <p className="eyebrow">Shop by Category</p>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-balance mt-2">Categories</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {categories.filter(c => c.isActive && !c.parentId).slice(0, 10).map((category, i) => (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              className={`group scroll-reveal-delay-${Math.min(i + 1, 5)}`}
            >
              <div className="aspect-square bg-muted/50 rounded-xl flex items-center justify-center group-hover:bg-muted/80 transition-colors overflow-hidden">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Truck className="w-7 h-7 text-accent" />
                  </div>
                </div>
              </div>
              <div className="p-3 md:p-4">
                <h3 className="font-serif font-semibold text-balance text-base">{category.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{category.children?.length || 0} styles</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-max section-padding scroll-reveal">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 px-6 py-16 md:p-20 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.03%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <p className="text-xs uppercase tracking-[0.15em] text-accent/80 mb-4 animate-fade-in-up">Stay Connected</p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary-foreground mb-4 animate-fade-in-up delay-100">Join Our Community</h2>
            <p className="text-primary-foreground/80 mb-8 text-lg animate-fade-in-up delay-200">Subscribe for exclusive access to new collections, special discounts, and style tips.</p>
            <NewsletterForm />
          </div>
        </div>
      </section>

      <section className="container-max section-padding scroll-reveal">
        <div className="mb-10">
          <p className="eyebrow">Trusted Brands</p>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-balance mt-2">Our Partners</h2>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-60 hover:opacity-100 transition-opacity duration-500">
          {brands.filter(b => b.isActive).slice(0, 10).map((brand) => (
            <div key={brand.id} className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all duration-300">
              {brand.logoUrl ? <img src={brand.logoUrl} alt={brand.name} className="h-8 w-auto" /> : <span className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">{brand.name}</span>}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}