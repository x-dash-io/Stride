'use client'

import Link from 'next/link'
import { mockProducts } from '@/lib/data/products'
import { Star } from 'lucide-react'

export default function HomePage() {
  // Get featured products (bestsellers and trending)
  const featured = mockProducts.filter((p) => p.tags.includes('bestseller')).slice(0, 4)
  const trending = mockProducts.filter((p) => p.tags.includes('trending')).slice(0, 4)

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 right-10 w-96 h-96 bg-accent rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-accent rounded-full filter blur-3xl"></div>
        </div>

        <div className="container-max relative z-10 py-20 md:py-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <p className="text-sm uppercase tracking-widest text-accent mb-4">
                Discover Premium Footwear
              </p>
              <h1 className="text-5xl md:text-7xl font-serif font-bold text-balance mb-6 leading-tight">
                Step Into Luxury
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-lg leading-relaxed">
                Handcrafted shoes designed for those who demand excellence. Premium materials, impeccable construction, and timeless style.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/products"
                  className="btn-primary text-center"
                >
                  Shop Collection
                </Link>
                <Link
                  href="/about"
                  className="btn-secondary text-center"
                >
                  Learn More
                </Link>
              </div>
            </div>

            {/* Right Image */}
            <div className="hidden md:flex items-center justify-center">
              <div className="w-full aspect-square bg-gradient-to-br from-muted to-muted/50 rounded-lg flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <div className="text-6xl mb-4">👟</div>
                  <p>Premium Footwear</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container-max section-padding">
        <div className="mb-12">
          <p className="text-sm uppercase tracking-widest text-accent mb-4">
            Curated Selection
          </p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-balance">
            Bestsellers
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featured.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="product-card"
            >
              <div className="aspect-square bg-muted flex items-center justify-center text-4xl">
                👟
              </div>
              <div className="p-6">
                <p className="text-xs uppercase tracking-wider text-accent mb-2">
                  {product.brand}
                </p>
                <h3 className="text-lg font-serif font-semibold mb-2 text-balance">
                  {product.name}
                </h3>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating)
                            ? 'fill-accent text-accent'
                            : 'text-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({product.reviewCount})
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  {product.salePrice ? (
                    <>
                      <span className="text-2xl font-bold text-primary">
                        ${product.salePrice}
                      </span>
                      <span className="text-sm line-through text-muted-foreground">
                        ${product.price}
                      </span>
                    </>
                  ) : (
                    <span className="text-2xl font-bold text-primary">
                      ${product.price}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending */}
      <section className="container-max section-padding bg-muted/20">
        <div className="mb-12">
          <p className="text-sm uppercase tracking-widest text-accent mb-4">
            What&apos;s Hot
          </p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-balance">
            Trending Now
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {trending.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="product-card"
            >
              <div className="aspect-square bg-muted flex items-center justify-center text-4xl">
                👟
              </div>
              <div className="p-6">
                <p className="text-xs uppercase tracking-wider text-accent mb-2">
                  {product.brand}
                </p>
                <h3 className="text-lg font-serif font-semibold mb-2 text-balance">
                  {product.name}
                </h3>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating)
                            ? 'fill-accent text-accent'
                            : 'text-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({product.reviewCount})
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  {product.salePrice ? (
                    <>
                      <span className="text-2xl font-bold text-primary">
                        ${product.salePrice}
                      </span>
                      <span className="text-sm line-through text-muted-foreground">
                        ${product.price}
                      </span>
                    </>
                  ) : (
                    <span className="text-2xl font-bold text-primary">
                      ${product.price}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container-max section-padding">
        <div className="bg-primary text-primary-foreground rounded-lg p-12 md:p-16 text-center">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
            Join Our Community
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Subscribe to get exclusive access to new collections, special discounts, and style tips from our experts.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded bg-primary-foreground text-primary placeholder-muted-foreground focus:outline-none"
            />
            <button className="btn-secondary bg-primary-foreground text-primary hover:bg-opacity-90">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
