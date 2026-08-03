import Link from 'next/link'
import { getProducts, getCategories, getBrands, getBanners } from '@/lib/services/product.service'
import { ProductGrid } from '@/components/products/ProductGrid'
import { HeroProductCarousel } from '@/components/hero/HeroProductCarousel'
import { Button } from '@/components/ui/button'
import { NewsletterForm } from '@/components/layout/NewsletterForm'

export const dynamic = 'force-dynamic'

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
      <section className="relative min-h-[85vh] lg:min-h-[90vh] flex items-center justify-center overflow-hidden border-b border-border/40">
        <HeroProductCarousel products={heroProducts} />
      </section>

      <section className="container-max section-padding scroll-reveal">
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

      <section className="bg-muted/30 scroll-reveal">
        <div className="container-max section-padding">
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

      <section className="container-max section-padding scroll-reveal">
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

      <section className="container-max section-padding scroll-reveal">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-16 px-6 py-12">
          <div className="max-w-2xl text-center md:text-left">
            <p className="eyebrow">Stay Connected</p>
            <h2 className="heading-page mt-2 mb-4">Join Our Community</h2>
            <p className="body-large text-muted-foreground mb-6">Subscribe for exclusive access to new collections, special discounts, and style tips.</p>
            <NewsletterForm />
          </div>
        </div>
      </section>

      <section className="container-max section-padding scroll-reveal">
        <div className="mb-10">
          <p className="eyebrow">Trusted Brands</p>
          <h2 className="heading-section mt-2">Our Partners</h2>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-12 md:gap-20 opacity-60">
          {brands.filter(b => b.isActive).slice(0, 10).map((brand) => (
            <div key={brand.id} className="flex items-center gap-2 grayscale transition-all duration-300">
              {brand.logoUrl ? <img src={brand.logoUrl} alt={brand.name} className="h-8 w-auto" /> : <span className="text-sm font-medium text-muted-foreground">{brand.name}</span>}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}