'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Product, ProductVariant } from '@/types'

interface ProductOptionsProps {
  variants: Product['variants']
  selectedColor: string
  selectedSize: string
  quantity: number
  onColorChange: (color: string) => void
  onSizeChange: (size: string) => void
  onQuantityChange: (qty: number) => void
}

export function ProductOptions({ variants, selectedColor, selectedSize, quantity, onColorChange, onSizeChange, onQuantityChange }: ProductOptionsProps) {
  const availableColors = [...new Set(variants.map(v => v.colour))]
  const availableSizes = [...new Set(
    variants
      .filter(v => v.colour === selectedColor && v.availableStock > 0)
      .map(v => v.size)
  )].sort()
  const selectedVariant = variants.find(v => v.colour === selectedColor && v.size === selectedSize)
  const maxStock = selectedVariant?.availableStock || 99

  return (
    <>
      <div className="mb-6">
        <label className="text-sm font-semibold uppercase tracking-wider mb-3 block">Color</label>
        <div className="flex gap-3 flex-wrap">
          {availableColors.map((color) => {
            const variant = variants.find(v => v.colour === color)
            return (
              <button
                key={color}
                onClick={() => {
                  onColorChange(color)
                  onSizeChange('')
                }}
                className={cn(
                  'w-12 h-12 rounded border-2 transition-all',
                  selectedColor === color ? 'border-primary' : 'border-border'
                )}
                style={{ backgroundColor: variant?.colourHex || undefined }}
                title={color}
                disabled={!variant || variant.availableStock === 0}
              >
                {selectedColor === color && <Check className="w-6 h-6 mx-auto text-white drop-shadow" />}
              </button>
            )
          })}
        </div>
        <p className="text-sm text-muted-foreground mt-2">{selectedColor}</p>
      </div>

      <div className="mb-6">
        <label className="text-sm font-semibold uppercase tracking-wider mb-3 block">Size</label>
        <div className="grid grid-cols-5 gap-2">
          {availableSizes.map((size) => (
            <button
              key={size}
              onClick={() => onSizeChange(size)}
              disabled={!selectedVariant || selectedVariant.availableStock === 0}
              className={cn(
                'py-3 px-2 rounded border-2 text-sm font-medium transition-all',
                selectedSize === size
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {size}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          <Link href="/size-guide" className="text-primary hover:underline">Not sure? Check size guide</Link>
        </p>
      </div>

      <div className="mb-8">
        <label className="text-sm font-semibold uppercase tracking-wider mb-3 block">Quantity</label>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => onQuantityChange(Math.max(1, quantity - 1))} aria-label="Decrease quantity">−</Button>
          <input type="number" value={quantity} onChange={(e) => onQuantityChange(Math.max(1, parseInt(e.target.value) || 1))} className="w-16 text-center border border-border rounded py-2" min="1" max={maxStock} />
          <Button variant="outline" size="icon" onClick={() => onQuantityChange(Math.min(maxStock, quantity + 1))} aria-label="Increase quantity">+</Button>
        </div>
      </div>
    </>
  )
}