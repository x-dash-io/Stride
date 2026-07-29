'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Package } from 'lucide-react'
import { Product } from '@/types'

interface ProductImageGalleryProps {
  images: Product['images']
  productName: string
}

export function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const currentImage = images[selectedImageIndex]

  return (
    <div className="flex flex-col gap-4">
      <div className="aspect-square bg-muted rounded-xl relative overflow-hidden">
        {currentImage?.url ? (
          <Image
            src={currentImage.url}
            alt={currentImage.altText || productName}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
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
                'aspect-square bg-muted rounded-lg overflow-hidden border-2 transition-colors',
                selectedImageIndex === idx ? 'border-primary' : 'border-transparent hover:border-accent'
              )}
              aria-label={`View image ${idx + 1}`}
              aria-current={selectedImageIndex === idx}
            >
              <Image src={img.url} alt={img.altText || `${productName} ${idx + 1}`} fill className="object-cover" sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}