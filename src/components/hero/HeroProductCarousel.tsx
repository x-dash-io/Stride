'use client'

import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import Link from 'next/link'
import { ArrowRight, ShoppingBag, Truck, ShieldCheck, RefreshCw, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { cn, formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { Product } from '@/types'

export interface ShowcaseProduct {
  id: string
  name: string
  slug?: string
  category: string
  brand?: string
  price: number
  originalPrice?: number
  badge?: string
  image?: string
  shortDescription?: string
}

const PLACEHOLDER_PRODUCTS: ShowcaseProduct[] = [
  {
    id: 'p1',
    name: 'Air Max 270',
    category: 'Sneakers',
    brand: 'Nike',
    price: 15900,
    originalPrice: 18500,
    badge: 'Best Seller',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80',
    shortDescription: 'Iconic Air Max cushioning with modern breathable mesh style for all-day comfort.',
  },
  {
    id: 'p2',
    name: 'Ultraboost 22',
    category: 'Sneakers',
    brand: 'Adidas',
    price: 18900,
    originalPrice: 22000,
    badge: 'New Arrival',
    image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=1200&q=80',
    shortDescription: 'Responsive energy-return running shoes featuring adaptive Primeknit upper.',
  },
  {
    id: 'p3',
    name: 'Classic Leather Oxford',
    category: 'Formal Shoes',
    brand: 'STRIDE Atelier',
    price: 13200,
    originalPrice: 15500,
    badge: 'Handcrafted',
    image: 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=1200&q=80',
    shortDescription: 'Handcrafted from premium full-grain leather with timeless Goodyear welt construction.',
  },
  {
    id: 'p4',
    name: '574 Core Retro',
    category: 'Sneakers',
    brand: 'New Balance',
    price: 11500,
    originalPrice: 13500,
    badge: 'Trending',
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1200&q=80',
    shortDescription: 'Quintessential retro silhouette featuring ENCAP midsole technology for maximum support.',
  },
  {
    id: 'p5',
    name: 'Nairobi Handcrafted Boot',
    category: 'Boots',
    brand: 'African Footwear Co.',
    price: 12500,
    badge: 'Limited Edition',
    image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=1200&q=80',
    shortDescription: 'Artisanal local leather boot crafted by Nairobi artisans with durable Vibram sole.',
  },
]

const AUTOPLAY_DELAY = 6000

function productBadge(product: Product): string | undefined {
  if (product.isNewArrival) return 'New Arrival'
  if (product.isBestSeller) return 'Best Seller'
  if (product.isTrending) return 'Trending'
  if (product.isLimitedEdition) return 'Limited Edition'
  return undefined
}

export function mapProductToShowcase(product: Product): ShowcaseProduct {
  const price = product.salePrice ?? product.basePrice
  const onSale = product.salePrice != null && product.salePrice < product.basePrice

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    category: product.category?.name ?? 'Featured',
    brand: product.brand.name,
    price,
    originalPrice: onSale ? product.basePrice : undefined,
    badge: productBadge(product),
    image: product.primaryImage ?? product.images[0]?.url,
    shortDescription: product.shortDescription ?? undefined,
  }
}

export function HeroProductCarousel({
  products: incomingProducts,
}: {
  products?: Product[]
}) {
  const products = useMemo(() => {
    if (incomingProducts && incomingProducts.length > 0) {
      return incomingProducts.map(mapProductToShowcase)
    }
    return PLACEHOLDER_PRODUCTS
  }, [incomingProducts])

  const [index, setIndex] = useState(0)
  const [autoplay, setAutoplay] = useState(true)
  const [direction, setDirection] = useState(0)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const carouselRef = useRef<HTMLDivElement>(null)
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const count = products.length
  const currentProduct = products[index] ?? products[0]

  const goTo = useCallback(
    (nextIndex: number, navDirection?: number) => {
      const normalized = ((nextIndex % count) + count) % count
      setDirection(navDirection ?? (normalized > index ? 1 : -1))
      setIndex(normalized)
      setAutoplay(false)

      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current)
      resumeTimerRef.current = setTimeout(() => setAutoplay(true), 10000)
    },
    [count, index]
  )

  const goNext = useCallback(() => {
    goTo(index + 1, 1)
  }, [goTo, index])

  const goPrevious = useCallback(() => {
    goTo(index - 1, -1)
  }, [goTo, index])

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(media.matches)

    const onChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
      if (event.matches) setAutoplay(false)
    }

    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (!autoplay || count <= 1 || prefersReducedMotion) return

    const timer = setInterval(() => {
      setDirection(1)
      setIndex((prev) => (prev + 1) % count)
    }, AUTOPLAY_DELAY)

    return () => clearInterval(timer)
  }, [autoplay, count, prefersReducedMotion, index])

  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current)
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (count <= 1) return
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        goNext()
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        goPrevious()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [count, goNext, goPrevious])

  const pause = () => setAutoplay(false)
  const resume = () => {
    if (!prefersReducedMotion) setAutoplay(true)
  }

  const primaryHref = currentProduct.slug ? `/products/${currentProduct.slug}` : '/products'
  const discountPercent =
    currentProduct.originalPrice && currentProduct.originalPrice > currentProduct.price
      ? Math.round((1 - currentProduct.price / currentProduct.originalPrice) * 100)
      : null

  return (
    <div
      ref={carouselRef}
      className="relative z-10 w-full min-h-[85vh] lg:min-h-[90vh] flex flex-col justify-between py-10 md:py-16 overflow-hidden bg-background"
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured luxury footwear"
      tabIndex={0}
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocus={pause}
      onBlur={resume}
    >
      {/* Subtle Background Lighting Mesh */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-radial from-accent/15 via-accent/5 to-transparent blur-[140px] opacity-75" />
        <div className="absolute top-10 right-10 w-[350px] h-[350px] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <div className="container-max w-full my-auto">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          
          {/* Left Editorial Headline Section */}
          <div className="lg:col-span-6 text-center lg:text-left z-20 flex flex-col justify-center">
            
            {/* Editorial Bold Main Title */}
            <h1 className="mb-6 text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-serif font-bold leading-[1.02] tracking-tight text-foreground text-balance">
              Crafted For <br />
              <span className="text-accent italic font-normal">Excellence</span>
            </h1>

            {/* Editorial Narrative Caption */}
            <p className="mx-auto lg:mx-0 mb-8 max-w-lg text-base sm:text-lg leading-relaxed text-muted-foreground">
              Discover iconic footwear engineered with uncompromising artistry, premium materials, and modern ergonomic support.
            </p>

            {/* Clean Editorial CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Button size="xl" asChild className="w-full sm:w-auto group relative overflow-hidden px-8 shadow-xl shadow-primary/10">
                <Link href={primaryHref}>
                  <span>Shop Collection</span>
                  <ArrowRight className="ml-2.5 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5" />
                </Link>
              </Button>

              <Button variant="outline" size="xl" asChild className="w-full sm:w-auto px-8 border-border/80 hover:bg-muted/50">
                <Link href="/products">
                  <span>Browse All Footwear</span>
                </Link>
              </Button>
            </div>
          </div>

          {/* Right Product Spotlight Stage */}
          <div className="lg:col-span-6 relative flex flex-col items-center justify-center z-10 min-h-[420px] sm:min-h-[500px]">
            
            {/* Clean Frameless Floating Stage */}
            <div className="relative w-full h-[380px] sm:h-[460px] flex items-center justify-center">
              
              {/* Product Background Glow Spotlight */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] rounded-full bg-gradient-to-tr from-accent/20 via-accent/5 to-transparent blur-[70px]" />
              </div>

              {/* Shoe Frameless Product Display */}
              {products.map((p, i) => {
                const isActive = i === index
                return (
                  <div
                    key={p.id}
                    className={cn(
                      'absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]',
                      isActive
                        ? 'opacity-100 scale-100 z-10 translate-y-0'
                        : cn(
                            'opacity-0 pointer-events-none scale-95 z-0',
                            direction >= 0 ? 'translate-x-12' : '-translate-x-12'
                          )
                    )}
                    aria-hidden={!isActive}
                  >
                    {p.image ? (
                      <div className="relative flex flex-col items-center justify-center w-full h-full p-4">
                        {/* High Resolution Floating Shoe Image */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.image}
                          alt={p.name}
                          className={cn(
                            'max-h-[300px] sm:max-h-[380px] lg:max-h-[420px] max-w-[90%] object-contain no-outline select-none filter drop-shadow-[0_25px_35px_rgba(0,0,0,0.3)] dark:drop-shadow-[0_30px_50px_rgba(0,0,0,0.7)]',
                            !prefersReducedMotion && 'float-animation'
                          )}
                        />

                        {/* Ground Shadow */}
                        <div
                          className={cn(
                            'w-[60%] sm:w-[50%] h-4 rounded-[100%] bg-black/20 dark:bg-black/60 blur-md transition-all duration-700 mt-2 pointer-events-none',
                            !prefersReducedMotion && 'animate-pulse'
                          )}
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-64 w-64 rounded-full bg-muted/40 border border-border/40 backdrop-blur-md">
                        <ShoppingBag className="h-20 w-20 text-muted-foreground/30" strokeWidth={1} />
                        <span className="mt-4 text-xs uppercase tracking-widest text-muted-foreground font-medium">
                          {p.name}
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Floating Product Spotlight Badge (Dedicated Card Overlay) */}
              <div className="absolute bottom-2 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-xs z-30 p-4 rounded-2xl border border-border/60 bg-background/85 dark:bg-background/90 backdrop-blur-xl shadow-2xl transition-all duration-500">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-accent">
                      {currentProduct.brand ?? 'STRIDE'} • {currentProduct.category}
                    </span>
                    {currentProduct.badge && (
                      <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent border border-accent/20">
                        {currentProduct.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-serif font-bold text-foreground truncate">
                    {currentProduct.name}
                  </h3>

                  <div className="flex items-baseline justify-between gap-2 border-t border-border/40 pt-2 mt-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-bold text-foreground">
                        {formatPrice(currentProduct.price)}
                      </span>
                      {currentProduct.originalPrice && (
                        <span className="text-xs text-muted-foreground line-through">
                          {formatPrice(currentProduct.originalPrice)}
                        </span>
                      )}
                      {discountPercent && (
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          -{discountPercent}%
                        </span>
                      )}
                    </div>

                    <Link
                      href={primaryHref}
                      className="inline-flex items-center text-xs font-semibold text-accent hover:underline gap-1"
                    >
                      <span>View</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Left / Right Control Buttons */}
              {count > 1 && (
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-20 flex items-center justify-between px-1 pointer-events-none">
                  <button
                    type="button"
                    onClick={goPrevious}
                    className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-background/80 text-foreground shadow-md backdrop-blur-md transition-all hover:bg-accent hover:text-accent-foreground hover:scale-105 active:scale-95 focus-visible:outline-none"
                    aria-label="Previous product"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  <button
                    type="button"
                    onClick={goNext}
                    className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-background/80 text-foreground shadow-md backdrop-blur-md transition-all hover:bg-accent hover:text-accent-foreground hover:scale-105 active:scale-95 focus-visible:outline-none"
                    aria-label="Next product"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Interactive Thumbnail Selector & Counter */}
            {count > 1 && (
              <div className="mt-4 w-full flex flex-col items-center gap-3 z-20">
                {/* Thumbnails Row */}
                <div className="flex items-center justify-center gap-2.5 max-w-full overflow-x-auto p-1 no-scrollbar">
                  {products.map((p, i) => (
                    <button
                      key={`thumb-${p.id}`}
                      type="button"
                      onClick={() => goTo(i)}
                      className={cn(
                        'relative h-12 w-12 sm:h-14 sm:w-14 rounded-xl overflow-hidden border transition-all duration-300 focus-visible:outline-none flex-shrink-0 bg-muted/40 backdrop-blur-sm',
                        i === index
                          ? 'border-accent ring-2 ring-accent/40 scale-105 shadow-md shadow-accent/10'
                          : 'border-border/60 opacity-60 hover:opacity-100 hover:border-border'
                      )}
                      aria-label={`Show ${p.name}`}
                    >
                      {p.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.image} alt={p.name} className="h-full w-full object-contain p-1 no-outline" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Progress Indicators & Count */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold tabular-nums text-muted-foreground">
                    {String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {products.map((p, i) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => goTo(i)}
                        className={cn(
                          'relative h-1.5 rounded-full transition-all duration-500 overflow-hidden',
                          i === index ? 'w-8 bg-muted' : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                        )}
                        aria-label={`Go to item ${i + 1}`}
                      >
                        {i === index && autoplay && !prefersReducedMotion && (
                          <span
                            key={`progress-${index}`}
                            className="absolute inset-0 origin-left rounded-full bg-accent hero-progress"
                            style={{ animationDuration: `${AUTOPLAY_DELAY}ms` }}
                          />
                        )}
                        {i === index && (!autoplay || prefersReducedMotion) && (
                          <span className="absolute inset-0 rounded-full bg-accent" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>
      </div>

      {/* Subtle Bottom Trust Bar */}
      <div className="w-full border-t border-border/40 pt-6 mt-8">
        <div className="container-max flex flex-wrap items-center justify-center md:justify-between gap-6 text-xs text-muted-foreground font-medium">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-accent" />
            <span>100% Authentic Footwear Guarantee</span>
          </div>
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-accent" />
            <span>Hassle-Free 30-Day Returns</span>
          </div>
        </div>
      </div>

    </div>
  )
}

export default HeroProductCarousel
