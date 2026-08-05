'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Package, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react'
import { Product } from '@/types'
import { FocusTrap } from '@/components/ui/focus-trap'

interface ProductImageGalleryProps {
  images: Product['images']
  productName: string
}

export function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const currentImage = images[selectedImageIndex]

  const goToPrevious = () => {
    setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
  }

  const goToNext = () => {
    setSelectedImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="aspect-square bg-muted rounded-xl relative overflow-hidden group">
        {currentImage?.url ? (
          <>
            <img
              src={currentImage.url}
              alt={currentImage.altText || productName}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
            <button
              onClick={toggleFullscreen}
              className="absolute top-4 right-4 bg-white/90 hover:bg-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              aria-label="View fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </>
        ) : (
          <Package className="w-24 h-24 text-muted-foreground" />
        )}
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-8 gap-4">
          {images.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setSelectedImageIndex(idx)}
              className={cn(
                'aspect-square bg-muted rounded-lg overflow-hidden border-2 transition-all hover:scale-105',
                selectedImageIndex === idx ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-accent'
              )}
              aria-label={`View image ${idx + 1}`}
              aria-current={selectedImageIndex === idx}
            >
              <img src={img.url} alt={img.altText || `${productName} ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
      
      {/* Fullscreen Modal */}
      {isFullscreen && (
        <FocusTrap onEscape={toggleFullscreen}>
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-8"
          role="dialog"
          aria-modal="true"
          aria-label={`${productName} fullscreen view`}
          onClick={toggleFullscreen}
        >
          <button
            onClick={(e) => { e.stopPropagation(); toggleFullscreen() }}
            className="absolute top-4 right-4 text-white hover:text-gray-300"
            aria-label="Close fullscreen"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={currentImage?.url}
            alt={currentImage?.altText || productName}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goToPrevious() }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goToNext() }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
        </FocusTrap>
      )}
    </div>
  )
}