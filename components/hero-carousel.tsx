'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const CAROUSEL_IMAGES = [
  {
    id: 1,
    title: 'Luxury Sneakers',
    description: 'Premium footwear for modern style',
  },
  {
    id: 2,
    title: 'Classic Elegance',
    description: 'Timeless formal shoes',
  },
  {
    id: 3,
    title: 'Adventure Ready',
    description: 'Durable boots for every journey',
  },
  {
    id: 4,
    title: 'Urban Comfort',
    description: 'Day-to-night versatility',
  },
]

export function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)

  useEffect(() => {
    if (!isAutoPlay) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlay])

  const goToPrevious = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? CAROUSEL_IMAGES.length - 1 : prev - 1
    )
    setIsAutoPlay(false)
    setTimeout(() => setIsAutoPlay(true), 10000)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length)
    setIsAutoPlay(false)
    setTimeout(() => setIsAutoPlay(true), 10000)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    setIsAutoPlay(false)
    setTimeout(() => setIsAutoPlay(true), 10000)
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-muted">
      {/* Slides Container */}
      <div className="relative w-full h-full">
        {CAROUSEL_IMAGES.map((image, index) => (
          <div
            key={image.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Image Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-muted to-primary/10 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-6xl mb-8 animate-pulse">👟</div>
                <h3 className="text-4xl font-serif font-bold mb-3">
                  {image.title}
                </h3>
                <p className="text-xl opacity-80">{image.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Previous Button */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full transition-all duration-300 group"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </button>

      {/* Next Button */}
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full transition-all duration-300 group"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </button>

      {/* Dots Navigation */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-3">
        {CAROUSEL_IMAGES.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'bg-white w-8'
                : 'bg-white/50 hover:bg-white/75 w-2'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Slide Counter */}
      <div className="absolute top-6 right-6 z-10 bg-black/40 text-white px-4 py-2 rounded-full text-sm">
        {currentIndex + 1} / {CAROUSEL_IMAGES.length}
      </div>
    </div>
  )
}
