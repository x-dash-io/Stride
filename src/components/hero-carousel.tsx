'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
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

const SLIDE_DURATION = 6000

export function HeroCarousel({ banners }: HeroCarouselProps) {
  const slides = banners && banners.length > 0 ? banners : FALLBACK_SLIDES
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const goTo = useCallback((index: number) => {
    setCurrentIndex(index)
    setIsAutoPlay(false)

    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current)
    resumeTimerRef.current = setTimeout(() => setIsAutoPlay(true), 10000)
  }, [])

  const goToPrevious = useCallback(() => {
    goTo(currentIndex === 0 ? slides.length - 1 : currentIndex - 1)
  }, [currentIndex, goTo, slides.length])

  const goToNext = useCallback(() => {
    goTo((currentIndex + 1) % slides.length)
  }, [currentIndex, goTo, slides.length])

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(media.matches)

    const onChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
      if (event.matches) setIsAutoPlay(false)
    }

    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (!isAutoPlay || slides.length <= 1 || prefersReducedMotion) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length)
    }, SLIDE_DURATION)

    return () => clearInterval(interval)
  }, [isAutoPlay, slides.length, prefersReducedMotion, currentIndex])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (slides.length <= 1) return
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        goToNext()
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        goToPrevious()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [slides.length, goToNext, goToPrevious])

  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current)
    }
  }, [])

  if (slides.length === 0) return null

  const transitionMs = prefersReducedMotion ? 0 : 700

  return (
    <div
      className="relative h-full w-full overflow-hidden bg-muted"
      role="region"
      aria-roledescription="carousel"
      aria-label="Hero banners"
      onMouseEnter={() => setIsAutoPlay(false)}
      onMouseLeave={() => {
        if (!prefersReducedMotion) setIsAutoPlay(true)
      }}
    >
      {slides.map((slide, index) => {
        const isActive = index === currentIndex
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
              'absolute inset-0',
              !prefersReducedMotion && 'transition-all duration-700 ease-in-out',
              isActive ? 'opacity-100 scale-100' : 'pointer-events-none opacity-0 scale-105'
            )}
            style={{ transitionDuration: `${transitionMs}ms` }}
            aria-hidden={!isActive}
          >
            {imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={title || 'Slide'}
                className={cn('absolute inset-0 h-full w-full object-cover', !prefersReducedMotion && 'hero-bg')}
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
                  'max-w-2xl px-4 text-center',
                  isActive && !prefersReducedMotion && 'hero-content'
                )}
                style={textColor ? { color: textColor } : undefined}
                aria-live={isActive ? 'polite' : 'off'}
              >
                <p className={cn('mb-4 text-xs uppercase tracking-[0.15em] opacity-80', isActive && !prefersReducedMotion && 'hero-content-delay-1')}>
                  {subtitle || 'Premium Collection'}
                </p>
                <h3 className={cn('mb-4 font-serif text-4xl font-bold leading-tight md:text-6xl', imageUrl ? 'text-white' : 'text-foreground', isActive && !prefersReducedMotion && 'hero-content-delay-2')}>
                  {title}
                </h3>
                {ctaText && ctaUrl && (
                  <div className={cn(isActive && !prefersReducedMotion && 'hero-content-delay-3')}>
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
            type="button"
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-all hover:bg-black/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={goToNext}
            className="absolute right-4 top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-all hover:bg-black/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
            <span className="mr-2 hidden text-xs font-medium tabular-nums text-white/70 sm:inline">
              {String(currentIndex + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
            </span>
            {slides.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => goTo(index)}
                className={cn(
                  'group relative h-1.5 overflow-hidden rounded-full transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white',
                  index === currentIndex ? 'w-8 bg-white/30' : 'w-1.5 bg-white/40 hover:bg-white/60'
                )}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === currentIndex ? 'true' : undefined}
              >
                {index === currentIndex && isAutoPlay && !prefersReducedMotion && (
                  <span
                    key={`banner-progress-${currentIndex}`}
                    className="absolute inset-0 origin-left rounded-full bg-white hero-progress"
                    style={{ animationDuration: `${SLIDE_DURATION}ms` }}
                  />
                )}
                {index === currentIndex && (!isAutoPlay || prefersReducedMotion) && (
                  <span className="absolute inset-0 rounded-full bg-white" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
