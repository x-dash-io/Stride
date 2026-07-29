'use client'

import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import Link from 'next/link'
import { ArrowRight, ShoppingBag, Truck, ChevronLeft, ChevronRight } from 'lucide-react'
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
  { id: 'p1', name: 'Aria Leather Oxford', category: 'Formal', brand: 'STRIDE Atelier', price: 8900, badge: 'Best Seller' },
  { id: 'p2', name: 'Cirrus Runner', category: 'Athletic', brand: 'STRIDE Sport', price: 6200, badge: 'New' },
  { id: 'p3', name: 'Marlow Chelsea Boot', category: 'Boots', brand: 'STRIDE Atelier', price: 11500 },
  { id: 'p4', name: 'Sable Suede Loafer', category: 'Casual', brand: 'STRIDE Atelier', price: 7400, badge: 'Trending' },
]

const AUTOPLAY_DELAY = 5000

function productBadge(product: Product): string | undefined {
  if (product.isNewArrival) return 'New'
  if (product.isBestSeller) return 'Best Seller'
  if (product.isTrending) return 'Trending'
  if (product.isLimitedEdition) return 'Limited'
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
  const product = products[index] ?? products[0]
  const hasRealProducts = Boolean(incomingProducts?.length)

  const goTo = useCallback((nextIndex: number, navDirection?: number) => {
    const normalized = ((nextIndex % count) + count) % count
    setDirection(navDirection ?? (normalized > index ? 1 : -1))
    setIndex(normalized)
    setAutoplay(false)

    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current)
    resumeTimerRef.current = setTimeout(() => setAutoplay(true), 10000)
  }, [count, index])

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

  const primaryHref = product.slug ? `/products/${product.slug}` : '/products'
  const transitionMs = prefersReducedMotion ? 0 : 700

  return (
    <div
      ref={carouselRef}
      className="container-max relative z-10 w-full py-16 md:py-24 lg:py-0"
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured products"
      tabIndex={0}
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocus={pause}
      onBlur={resume}
    >
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-10 xl:gap-16">
        <div className="text-center lg:text-left">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6 animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              {!prefersReducedMotion && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              )}
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            New Collection Now Live
          </div>

          <h1 className="mb-6 text-5xl font-serif font-bold leading-[1.1] text-balance md:text-6xl lg:text-7xl animate-fade-in-up delay-100">
            Step Into
            <br />
            <span className="text-accent">Timeless Style</span>
          </h1>

          <p className="mx-auto mb-8 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl lg:mx-0 animate-fade-in-up delay-200">
            Discover footwear crafted for those who demand excellence. Premium
            materials, impeccable construction, and timeless design for every
            step of your journey.
          </p>

          <div
            key={product.id}
            className="mb-8 animate-fade-in-up delay-300"
            aria-live="polite"
            aria-atomic="true"
          >
            <div className="inline-flex flex-col items-center gap-1 lg:items-start">
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
                {product.brand ? `${product.brand} · ` : ''}
                {product.category}
                {product.badge ? ` · ${product.badge}` : ''}
              </span>
              <span className="text-2xl font-serif font-semibold">{product.name}</span>
              {product.shortDescription && (
                <span className="mt-1 max-w-md text-sm text-muted-foreground lg:text-base">
                  {product.shortDescription}
                </span>
              )}
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-lg font-bold text-primary">{formatPrice(product.price)}</span>
                {product.originalPrice != null && (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mb-10 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start animate-fade-in-up delay-400">
            <Button size="xl" asChild className="group relative overflow-hidden">
              <Link href={primaryHref}>
                {hasRealProducts && product.slug ? 'View Details' : 'Shop Collection'}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button variant="outline" size="xl" asChild>
              <Link href="/products">Browse All</Link>
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground lg:justify-start animate-fade-in-up delay-500">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-accent" />
              <span>Free Shipping Over KES 10,000</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="h-4 w-px bg-muted" />
              <span>30-Day Returns</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="h-4 w-px bg-muted" />
              <span>Secure Checkout</span>
            </div>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="relative mx-auto flex h-[360px] w-full items-center justify-center md:h-[460px] lg:h-[560px]">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="h-2/3 w-2/3 rounded-full bg-accent/10 blur-[100px]" />
            </div>
            <div className="absolute right-1/4 top-1/4 h-16 w-16 rounded-full bg-primary/10 blur-2xl pointer-events-none" />
            <div className="absolute bottom-1/4 left-1/4 h-24 w-24 rounded-full bg-accent/10 blur-2xl pointer-events-none" />

            <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-2 sm:px-4">
              {count > 1 && (
                <>
                  <button
                    type="button"
                    onClick={goPrevious}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-background/80 text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="Previous product"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <span className="rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs font-medium tabular-nums text-muted-foreground backdrop-blur-sm">
                    {String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
                  </span>
                  <button
                    type="button"
                    onClick={goNext}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-background/80 text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="Next product"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            <div className="relative h-full w-full overflow-hidden rounded-[2rem] border border-border/40 bg-gradient-to-br from-muted/40 via-background/20 to-muted/20 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.25)]">
              {products.map((p, i) => (
                <div
                  key={p.id}
                  className={cn(
                    'absolute inset-0 flex items-center justify-center p-6 md:p-10',
                    !prefersReducedMotion && 'transition-all ease-[cubic-bezier(0.16,1,0.3,1)]',
                    i === index
                      ? 'z-10 opacity-100 scale-100 translate-x-0'
                      : cn(
                          'pointer-events-none opacity-0 scale-[0.97]',
                          direction >= 0 ? 'translate-x-6' : '-translate-x-6'
                        )
                  )}
                  style={{ transitionDuration: `${transitionMs}ms` }}
                  aria-hidden={i !== index}
                >
                  {p.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.image}
                      alt={p.name}
                      className={cn(
                        'max-h-full max-w-full object-contain drop-shadow-[0_35px_60px_rgba(0,0,0,0.25)]',
                        !prefersReducedMotion && 'float-animation'
                      )}
                    />
                  ) : (
                    <div
                      className={cn(
                        'relative flex h-4/5 w-4/5 items-center justify-center rounded-[2rem] border border-border/40 bg-gradient-to-br from-muted to-muted/40 shadow-2xl',
                        !prefersReducedMotion && 'float-animation'
                      )}
                    >
                      <ShoppingBag className="h-20 w-20 text-muted-foreground/30 md:h-28 md:w-28" strokeWidth={1} />
                      {p.badge && (
                        <span className="absolute right-4 top-4 rounded-full bg-accent px-3 py-1 text-xs font-medium uppercase tracking-wide text-accent-foreground shadow">
                          {p.badge}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {count > 1 && (
              <div className="absolute -bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-2 lg:bottom-0">
                {products.map((p, i) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => goTo(i)}
                    className={cn(
                      'group relative h-1.5 overflow-hidden rounded-full transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                      i === index
                        ? 'w-10 bg-muted-foreground/20'
                        : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                    )}
                    aria-label={`Show ${p.name}`}
                    aria-current={i === index ? 'true' : undefined}
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
            )}
          </div>

          {count > 1 && (
            <div className="mt-8 hidden items-center justify-center gap-3 lg:flex">
              {products.map((p, i) => (
                <button
                  key={`thumb-${p.id}`}
                  type="button"
                  onClick={() => goTo(i)}
                  className={cn(
                    'relative h-16 w-16 overflow-hidden rounded-xl border transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    i === index
                      ? 'border-accent ring-2 ring-accent/30 scale-105'
                      : 'border-border/50 opacity-60 hover:opacity-100 hover:border-border'
                  )}
                  aria-label={`Show ${p.name}`}
                >
                  {p.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted/50">
                      <ShoppingBag className="h-5 w-5 text-muted-foreground/40" strokeWidth={1.5} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default HeroProductCarousel
