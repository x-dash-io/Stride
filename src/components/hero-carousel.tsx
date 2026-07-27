'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { Banner } from '@/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface HeroCarouselProps {
  banners?: Banner[]
}

const FALLBACK_SLIDES = [
  { id: '1', title: 'Luxury Sneakers', subtitle: 'Premium footwear for modern style', desktopImageUrl: '', ctaText: 'Shop Now', ctaUrl: '/products' },
  { id: '2', title: 'Classic Elegance', subtitle: 'Timeless formal shoes', desktopImageUrl: '', ctaText: 'Shop Now', ctaUrl: '/products' },
  { id: '3', title: 'Adventure Ready', subtitle: 'Durable boots for every journey', desktopImageUrl: '', ctaText: 'Shop Now', ctaUrl: '/products' },
]

const SLIDE_DURATION = 5000

export function HeroCarousel({ banners }: HeroCarouselProps) {
  const slides = banners && banners.length > 0 ? banners : FALLBACK_SLIDES
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)
  const [direction, setDirection] = useState(0)

  const goTo = useCallback((index: number) => {
    setDirection(index > currentIndex ? 1 : -1)
    setCurrentIndex(index)
    setIsAutoPlay(false)
    setTimeout(() => setIsAutoPlay(true), 10000)
  }, [currentIndex])

  const goToPrevious = useCallback(() => {
    goTo(currentIndex === 0 ? slides.length - 1 : currentIndex - 1)
  }, [currentIndex, goTo, slides.length])

  const goToNext = useCallback(() => {
    goTo((currentIndex + 1) % slides.length)
  }, [currentIndex, goTo, slides.length])

  useEffect(() => {
    if (!isAutoPlay || slides.length <= 1) return
    const interval = setInterval(() => {
      setDirection(1)
      setCurrentIndex((prev) => (prev + 1) % slides.length)
    }, SLIDE_DURATION)
    return () => clearInterval(interval)
  }, [isAutoPlay, slides.length])

  if (slides.length === 0) return null

  return (
    <div className="relative w-full h-full overflow-hidden bg-muted">
      {slides.map((slide, index) => {
        const isActive = index === currentIndex
        const isPrev = index === (currentIndex === 0 ? slides.length - 1 : currentIndex - 1)
        const bgColor = 'bgColor' in slide ? (slide as Banner).bgColor : undefined
        const textColor = 'textColor' in slide ? (slide as Banner).textColor : undefined
        const imageUrl = 'desktopImageUrl' in slide ? (slide as Banner).desktopImageUrl : ''
        const title = slide.title || ''
        const subtitle = 'subtitle' in slide ? (slide as Banner).subtitle : ''
        const ctaText = 'ctaText' in slide ? (slide as Banner).ctaText : undefined
        const ctaUrl = 'ctaUrl' in slide ? (slide as Banner).ctaUrl : undefined

        return (
          <div
            key={slide.id}
            className={cn(
              'absolute inset-0 transition-all duration-700 ease-in-out',
              isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
            )}
          >
            {imageUrl && (
              <img
                src={imageUrl}
                alt={title || 'Slide'}
                className="absolute inset-0 w-full h-full object-cover hero-bg"
              />
            )}
            <div
              className={cn(
                'absolute inset-0 flex items-center justify-center',
                imageUrl ? 'bg-black/40' : 'bg-gradient-to-br from-accent/20 via-muted to-primary/10'
              )}
              style={bgColor ? { backgroundColor: bgColor } : undefined}
            >
              <div
                className={cn(
                  'text-center max-w-2xl px-4',
                  isActive && 'hero-content'
                )}
                style={textColor ? { color: textColor } : undefined}
              >
                <p className={cn('text-xs uppercase tracking-[0.15em] mb-4 opacity-80', isActive && 'hero-content-delay-1')}>
                  {subtitle || 'Premium Collection'}
                </p>
                <h3 className={cn('text-4xl md:text-6xl font-serif font-bold mb-4 leading-tight', imageUrl ? 'text-white' : 'text-foreground', isActive && 'hero-content-delay-2')}>
                  {title}
                </h3>
                {ctaText && ctaUrl && (
                  <div className={cn(isActive && 'hero-content-delay-3')}>
                    <Button
                      asChild
                      size="lg"
                      className={imageUrl ? 'bg-white text-black hover:bg-white/90' : ''}
                    >
                      <Link href={ctaUrl}>
                        {ctaText}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}

      {slides.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm transition-all"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm transition-all"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goTo(index)}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-500',
                  index === currentIndex ? 'bg-white w-8' : 'bg-white/40 hover:bg-white/60 w-1.5'
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
