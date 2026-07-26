import Link from 'next/link'
import { getProducts, getCategories, getBrands, getBanners } from '@/lib/queries'
import { ProductGrid } from '@/components/products/ProductGrid'
import { formatPrice } from '@/lib/utils'
import { ArrowRight, ShoppingBag, Truck, Shield, RotateCcw, Headphones } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

const benefits = [
  { icon: Truck, title: 'Free Delivery', description: 'On orders over KES 10,000' },
  { icon: Shield, title: 'Secure Payment', description: 'M-Pesa & Card payments' },
  { icon: RotateCcw, title: 'Easy Returns', description: '30-day return policy' },
  { icon: Headphones, title: 'Support', description: 'Mon-Fri 8am-6pm' },
]

export default async function HomePage() {
  const [featuredProducts, newArrivals, bestSellers, categories, brands, heroBanner] = await Promise.all([
    getProducts({ featured: true, limit: 8 }),
    getProducts({ newArrival: true, limit: 8 }),
    getProducts({ bestSeller: true, limit: 8 }),
    getCategories(),
    getBrands(),
    getBanners('hero'),
  ])

  const banner = heroBanner[0]

  return (
    <div className="w-full">
      <section className="relative min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-background via-background to-muted overflow-hidden">
        {banner && (
          <div className="absolute inset-0 z-0">
            <img src={banner.desktopImageUrl} alt={banner.title || 'Hero banner'} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40" />
          </div>
        )}
        <div className="container-max relative z-10 py-20 md:py-32">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-widest text-accent mb-4">Discover Premium Footwear</p>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-balance mb-6 leading-tight">
              Step Into Luxury
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-lg leading-relaxed">
              Handcrafted shoes designed for those who demand excellence. Premium materials, impeccable construction, and timeless style.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/products" className="btn-primary text-center">
                Shop Collection
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <Link href="/about" className="btn-secondary text-center">Learn More</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container-max section-padding">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="flex items-start gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-accent flex items-center justify-center text-accent-foreground">
                <benefit.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-max section-padding">
        <div className="mb-12">
          <p className="text-sm uppercase tracking-widest text-accent mb-4">Curated Selection</p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-balance">Bestsellers</h2>
        </div>
        <ProductGrid products={bestSellers.items} />
        <div className="text-center mt-8">
          <Link href="/products?sort=popular" className="btn-secondary">View All Bestsellers</Link>
        </div>
      </section>

      <section className="container-max section-padding bg-muted/20">
        <div className="mb-12">
          <p className="text-sm uppercase tracking-widest text-accent mb-4">What's Hot</p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-balance">Trending Now</h2>
        </div>
        <ProductGrid products={newArrivals.items} />
        <div className="text-center mt-8">
          <Link href="/products?sort=newest" className="btn-secondary">View New Arrivals</Link>
        </div>
      </section>

      <section className="container-max section-padding">
        <div className="mb-12">
          <p className="text-sm uppercase tracking-widest text-accent mb-4">Shop by Category</p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-balance">Categories</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {categories.filter(c => c.isActive && !c.parentId).map((category) => (
            <Link key={category.id} href={`/products?category=${category.slug}`} className="group">
              <div className="aspect-square bg-muted rounded-lg flex items-center justify-center group-hover:bg-muted/80 transition-colors">
                <ShoppingBag className="w-12 h-12 text-muted-foreground" />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-serif font-semibold text-balance">{category.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{category.children?.length || 0} subcategories</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-max section-padding bg-primary text-primary-foreground rounded-lg p-12 md:p-16 text-center">
        <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">Join Our Community</h2>
        <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">Subscribe to get exclusive access to new collections, special discounts, and style tips from our experts.</p>
        <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" action="/api/newsletter" method="POST">
          <input type="email" name="email" placeholder="Enter your email" className="flex-1 px-4 py-3 rounded bg-primary-foreground text-primary placeholder-muted-foreground focus:outline-none" required />
          <Button type="submit" variant="secondary" className="bg-primary-foreground text-primary hover:bg-opacity-90">Subscribe</Button>
        </form>
      </section>

      <section className="container-max section-padding">
        <div className="mb-12">
          <p className="text-sm uppercase tracking-widest text-accent mb-4">Trusted Brands</p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-balance">Our Partners</h2>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-60 hover:opacity-100 transition-opacity">
          {brands.filter(b => b.isActive).slice(0, 10).map((brand) => (
            <div key={brand.id} className="flex items-center gap-2">
              {brand.logoUrl ? <img src={brand.logoUrl} alt={brand.name} className="h-8 w-auto" /> : <span className="font-medium">{brand.name}</span>}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}