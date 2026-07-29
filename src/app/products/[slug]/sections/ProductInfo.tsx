'use client'

import { Star } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { Product } from '@/types'

interface ProductInfoProps {
  product: Product
  price: number
  originalPrice: number | null
  availableStock: number
}

export function ProductInfo({ product, price, originalPrice, availableStock }: ProductInfoProps) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-primary mb-2">{product.brand.name}</p>
      <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">{product.name}</h1>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`w-5 h-5 ${i < Math.floor(product.ratingAvg) ? 'fill-primary text-primary' : 'text-muted'}`} />
          ))}
        </div>
        <span className="text-sm text-muted-foreground">{product.ratingAvg.toFixed(1)} • {product.reviewCount} reviews</span>
      </div>

      <div className="mb-8 pb-8 border-b border-border">
        <div className="flex items-baseline gap-3 mb-2">
          <span className="text-4xl font-bold text-primary">{formatPrice(price)}</span>
          {originalPrice && (
            <span className="text-xl line-through text-muted-foreground">{formatPrice(originalPrice)}</span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {availableStock > 0
            ? <span className="text-green-600 font-medium">In Stock ({availableStock} available)</span>
            : <span className="text-destructive font-medium">Out of Stock</span>}
        </p>
      </div>
    </div>
  )
}