'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, ArrowRight, ShoppingBag } from 'lucide-react'
import { Product } from '@/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'

interface ProductHeroCarouselProps {
  products: Product[]
}

const TRANSITION_DURATION = 800
const AUTO_PLAY_DELAY = 6000

export function ProductHeroCarousel({ products }: ProductHeroCarouselProps) {
  if (!products || products.length === 0) return null

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)
  const [direction, setDirection] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const carouselRef = useRef<HTMLDivElement>(null)

  const goTo = useCallback((index: number) => {
    if (isTransitioning || index === currentIndex) return
    setDirection(index > currentIndex ? 1 : -1)
    setIsTransitioning(true)
    setCurrentIndex(index)
    setIsAutoPlay(false)
    setTimeout(() => {
      setIsTransitioning(false)
      setTimeout(() => setIsAutoPlay(true), 3000)
    }, TRANSITION_DURATION)
  }, [currentIndex, isTransitioning])

  const goToPrevious = useCallback(() => {
    goTo(currentIndex === 0 ? products.length - 1 : currentIndex - 1)
  }, [currentIndex, products.length, goTo])

  const goToNext = useCallback(() => {
    goTo((currentIndex + 1) % products.length)
  }, [currentIndex, products.length, goTo])

  // Auto-play
  useEffect(() => {
    if (!isAutoPlay || products.length <= 1) return
    const interval = setInterval(() => {
      if (!isTransitioning) {
        setDirection(1)
        setCurrentIndex((prev) => (prev + 1) % products.length)
      }
    }, AUTO_PLAY_DELAY)
    return () => clearInterval(interval)
  }, [isAutoPlay, products.length, isTransitioning])

  // Pause on hover
  useEffect(() => {
    const carousel = carouselRef.current
    if (!carousel) return

    const handleMouseEnter = () => setIsAutoPlay(false)
    const handleMouseLeave = () => setIsAutoPlay(true)

    carousel.addEventListener('mouseenter', handleMouseEnter)
    carousel.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      carousel.removeEventListener('mouseenter', handleMouseEnter)
      carousel.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrevious()
      if (e.key === 'ArrowRight') goToNext()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [goToPrevious, goToNext])

  if (products.length === 0) return null

  const currentProduct = products[currentIndex]
  const prevProduct = products[currentIndex === 0 ? products.length - 1 : currentIndex - 1]
  const nextProduct = products[(currentIndex + 1) % products.length]

  return (
    <div
      ref={carouselRef}
      className="relative w-full h-[90vh] min-h-[700px] max-h-[900px] flex items-center justify-center overflow-hidden bg-background"
      role="region"
      aria-label="Featured products carousel"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 max-w-[500px] max-h-[500px] rounded-full bg-accent/5 blur-[150px] animate-pulse-slow" />
        <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 max-w-[400px] max-h-[400px] rounded-full bg-primary/5 blur-[120px] animate-pulse-slow delay-1000" />
      </div>

      {/* Product Slides */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        {products.map((product, index) => {
          const isActive = index === currentIndex
          const isPrev = index === (currentIndex === 0 ? products.length - 1 : currentIndex - 1)
          const isNext = index === (currentIndex + 1) % products.length
          const primaryImage = product.images[0]?.url
          const allImages = product.images.filter(img => img.url)
          const displayImages = allImages.length > 0 ? allImages : [{ url: '/placeholder-product.jpg', alt: product.name }]
          
          return (
            <div
              key={product.id}
              className={cn(
                'absolute inset-0 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
                isActive ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-102 pointer-events-none',
                direction === 1 && !isActive ? 'translate-x-[-20px]' : '',
                direction === -1 && !isActive ? 'translate-x-[20px]' : ''
              )}
              style={{
                zIndex: isActive ? 10 : isPrev || isNext ? 5 : 1,
              }}
            >
              {/* Product Image Gallery */}
              <div className="absolute inset-0 flex items-center justify-center p-4 md:p-8">
                <div className="relative w-full max-w-5xl h-[85%] flex items-center justify-center">
                  {/* Main Product Image */}
                  <div className="relative aspect-square max-h-[600px] w-full flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5 rounded-3xl blur-[100px] opacity-50 float-animation" />
                    
                    {displayImages.map((img, imgIndex) => (
                      <div
                        key={img.url}
                        className={cn(
                          'absolute inset-0 flex items-center justify-center transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
                          imgIndex === 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
                        )}
                      >
                        <img
                          src={img.url}
                          alt={(img as any).altText || product.name}
                          className="max-h-[600px] max-w-full object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.15)]"
                          loading={imgIndex === 0 ? 'eager' : 'lazy'}
                        />
                      </div>
                    ))}

                    {/* Image thumbnails indicator */}
                    {displayImages.length > 1 && (
                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                        {displayImages.map((_, imgIndex) => (
                          <button
                            key={imgIndex}
                            onClick={(e) => {
                              e.stopPropagation()
                              // In a full implementation, this would switch images
                            }}
                            className={cn(
                              'h-1.5 w-1.5 rounded-full transition-all duration-300',
                              imgIndex === 0 ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/60 w-1.5'
                            )}
                            aria-label={`View image ${imgIndex + 1}`}
                          />
                        ))}
                      </div>
                    )}

                    {/* Product Info Overlay - Right side on desktop */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-full md:w-96 p-8 md:p-12 text-left">
                      <div className="max-w-md mx-auto md:mx-0">
                        {/* Category badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in-up">
                          {product.category?.name || 'Featured'}
                          {product.isNewArrival && <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />}
                        </div>

                        {/* Brand */}
                        <p className="text-xs uppercase tracking-[0.2em] text-accent font-medium mb-2 animate-fade-in-up delay-100">
                          {product.brand.name}
                        </p>

                        {/* Product Name */}
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-balance mb-4 leading-[1.05] animate-fade-in-up delay-200 text-foreground">
                          {product.name}
                        </h1>

                        {/* Short Description */}
                        {product.shortDescription && (
                          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-lg leading-relaxed animate-fade-in-up delay-300">
                            {product.shortDescription}
                          </p>
                        )}

                        {/* Price */}
                        <div className="flex items-center gap-4 mb-8 animate-fade-in-up delay-400">
                          <span className="text-3xl md:text-4xl font-bold text-primary">
                            {formatPrice(product.salePrice ?? product.basePrice)}
                          </span>
                          {product.salePrice && product.salePrice < product.basePrice && (
                            <>
                              <span className="text-xl text-muted-foreground line-through">
                                {formatPrice(product.basePrice)}
                              </span>
                              <span className="px-3 py-1 bg-destructive/10 text-destructive text-sm font-medium rounded-full">
                                Save {Math.round((1 - Number(product.salePrice) / Number(product.basePrice)) * 100)}%
                              </span>
                            </>
                          )}
                        </div>

                        {/* Quick Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up delay-500">
                          <Button size="xl" asChild className="group relative overflow-hidden min-w-[200px]">
                            <Link href={`/products/${product.slug}`}>
                              View Details
                              <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                            </Link>
                          </Button>
                          <Button variant="outline" size="xl" asChild className="min-w-[200px]">
                            <Link href="/products">
                              Explore Collection
                            </Link>
                          </Button>
                        </div>

                        {/* Trust indicators */}
                        <div className="mt-12 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 text-primary">📦</span>
                            <span>Free shipping over KES 10,000</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 text-green-600">↩</span>
                            <span>30-day returns</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 text-blue-600">🔒</span>
                            <span>Secure checkout</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {/* Navigation Controls */}
        {products.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-6 top-1/2 -translate-y-1/2 z-20 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all shadow-lg"
              aria-label="Previous product"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-6 top-1/2 -translate-y-1/2 z-20 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all shadow-lg"
              aria-label="Next product"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Progress indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2">
                {products.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goTo(index)}
                    className={cn(
                      'h-1.5 rounded-full transition-all duration-500',
                      index === currentIndex ? 'bg-white w-10' : 'bg-white/30 hover:bg-white/50 w-2'
                    )}
                    aria-label={`View product ${index + 1}`}
                  />
                ))}
              </div>
              <div className="md:hidden flex items-center gap-2 text-white/70 text-sm font-medium">
                <span>{currentProduct.name}</span>
                <span className="text-white/40">/</span>
                <span>{currentIndex + 1} / {products.length}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 animate-bounce-slow">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 backdrop-blur-sm">
          <svg className="h-5 w-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </div>
  )
}

export default ProductHeroCarousel