'use client'

import Link from 'next/link'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Product } from '@/types'

type SizeSystem = 'EU' | 'US' | 'UK'

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
  const [sizeSystem, setSizeSystem] = useState<SizeSystem>('EU')

  const availableColors = [...new Set(variants.map(v => v.colour))]
  const availableSizes = [...new Set(
    variants
      .filter(v => v.colour === selectedColor)
      .map(v => v.size)
  )].sort()

  const selectedVariant = variants.find(v => v.colour === selectedColor && v.size === selectedSize)
  const maxStock = selectedVariant?.availableStock || 99

  /** Get the display label for a variant's size in the chosen system.
   *  Falls back to the raw `size` (EU) if the alternate system field is null. */
  function getSizeLabel(euSize: string): string {
    const variant = variants.find(v => v.colour === selectedColor && v.size === euSize)
    if (!variant) return euSize
    switch (sizeSystem) {
      case 'US': return variant.sizeUs || euSize
      case 'UK': return variant.sizeUk || euSize
      default:   return variant.sizeEu || euSize
    }
  }

  return (
    <>
      {/* Color Selector */}
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

      {/* Size Selector with system toggle */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold uppercase tracking-wider">Size</label>

          {/* Fix 8: Size system toggle — EU / US / UK */}
          <div className="flex rounded border border-border overflow-hidden text-xs font-medium">
            {(['EU', 'US', 'UK'] as SizeSystem[]).map((sys) => (
              <button
                key={sys}
                onClick={() => setSizeSystem(sys)}
                className={cn(
                  'px-2.5 py-1 transition-colors',
                  sizeSystem === sys
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background text-muted-foreground hover:bg-muted'
                )}
                aria-pressed={sizeSystem === sys}
              >
                {sys}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {availableSizes.map((euSize) => {
            const variantForSize = variants.find(v => v.colour === selectedColor && v.size === euSize)
            const isOutOfStock = !variantForSize || variantForSize.availableStock === 0
            const label = getSizeLabel(euSize)
            return (
              <button
                key={euSize}
                onClick={() => onSizeChange(euSize)}
                disabled={isOutOfStock}
                className={cn(
                  'py-3 px-2 rounded border-2 text-sm font-medium transition-all min-h-[48px] min-w-[48px]',
                  selectedSize === euSize
                    ? 'border-primary bg-primary text-primary-foreground'
                    : isOutOfStock
                    ? 'border-border opacity-40 cursor-not-allowed line-through'
                    : 'border-border hover:border-primary'
                )}
                aria-label={`Size ${label}${isOutOfStock ? ' (out of stock)' : ''}`}
              >
                {label}
              </button>
            )
          })}
        </div>

        <p className="text-xs text-muted-foreground mt-2">
          <Link href="/size-guide" className="text-primary hover:underline">Not sure? Check size guide</Link>
        </p>
      </div>

      {/* Quantity Selector — Fix 10: min-h-[48px] for accessible touch targets */}
      <div className="mb-8">
        <label className="text-sm font-semibold uppercase tracking-wider mb-3 block">Quantity</label>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            aria-label="Decrease quantity"
            className="min-h-[48px] min-w-[48px]"
          >−</Button>
          <Input
            type="number"
            value={quantity}
            onChange={(e) => onQuantityChange(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-16 text-center border border-border rounded"
            min={1}
            max={maxStock}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => onQuantityChange(Math.min(maxStock, quantity + 1))}
            aria-label="Increase quantity"
            className="min-h-[48px] min-w-[48px]"
          >+</Button>
        </div>
      </div>
    </>
  )
}