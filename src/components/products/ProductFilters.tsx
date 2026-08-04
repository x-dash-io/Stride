'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ProductFiltersProps {
  categories: Array<{ id: string; name: string; slug: string; children?: Array<{ id: string; name: string; slug: string }> }>
  brands: Array<{ id: string; name: string; slug: string }>
  availableSizes?: string[]
  availableColors?: Array<{ name: string; hex: string | null }>
  selectedCategory?: string
  selectedBrand?: string
  selectedGender?: string
  selectedSize?: string
  selectedColor?: string
  priceRange: { min: number; max: number }
  fullPriceRange: { min: number; max: number }
}

const GENDER_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Men', value: 'MEN' },
  { label: 'Women', value: 'WOMEN' },
  { label: 'Kids', value: 'KIDS' },
  { label: 'Unisex', value: 'UNISEX' },
]

export function ProductFilters({
  categories,
  brands,
  availableSizes = [],
  availableColors = [],
  selectedCategory,
  selectedBrand,
  selectedGender,
  selectedSize,
  selectedColor,
  priceRange,
  fullPriceRange,
}: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)
  const [localPriceRange, setLocalPriceRange] = useState(priceRange)

  useEffect(() => {
    setLocalPriceRange(priceRange)
  }, [priceRange.min, priceRange.max])

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value)
      else params.delete(key)
    })
    params.delete('page')
    router.push(`/products?${params.toString()}`)
  }

  const handleMinPriceChange = (val: number) => {
    const clamped = Math.min(val, localPriceRange.max)
    setLocalPriceRange(prev => ({ ...prev, min: clamped }))
  }

  const handleMaxPriceChange = (val: number) => {
    const clamped = Math.max(val, localPriceRange.min)
    setLocalPriceRange(prev => ({ ...prev, max: clamped }))
  }

  const applyPriceFilter = () => {
    updateFilters({
      minPrice: String(localPriceRange.min),
      maxPrice: String(localPriceRange.max),
    })
  }

  const currentCategorySlug = selectedCategory?.toLowerCase()
  const currentBrandSlug = selectedBrand?.toLowerCase()
  const currentGender = selectedGender?.toUpperCase() ?? ''
  const currentSize = selectedSize ?? ''
  const currentColor = selectedColor ?? ''

  return (
    <div className={cn('space-y-6', showFilters ? 'block' : 'hidden lg:block')}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filters</h3>
        <button onClick={() => setShowFilters(!showFilters)} className="lg:hidden text-sm text-accent hover:underline">
          {showFilters ? 'Hide' : 'Show'} Filters
        </button>
      </div>

      {/* Category Filter */}
      <div>
        <Label className="text-sm font-semibold uppercase tracking-wider mb-3 block">Category</Label>
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          <label className="flex items-center cursor-pointer hover:text-primary">
            <input
              type="radio"
              name="category"
              value=""
              checked={!currentCategorySlug}
              onChange={() => updateFilters({ category: null })}
              className="w-4 h-4 text-primary focus:ring-primary"
            />
            <span className="ml-2 text-sm font-medium">All Categories</span>
          </label>
          {categories.map((cat) => {
            const isCatSelected = currentCategorySlug === cat.slug.toLowerCase()
            return (
              <div key={cat.id} className="space-y-1">
                <label className="flex items-center cursor-pointer hover:text-primary">
                  <input
                    type="radio"
                    name="category"
                    value={cat.slug}
                    checked={isCatSelected}
                    onChange={() => updateFilters({ category: cat.slug })}
                    className="w-4 h-4 text-primary focus:ring-primary"
                  />
                  <span className={cn('ml-2 text-sm capitalize', isCatSelected && 'font-semibold text-primary')}>
                    {cat.name}
                  </span>
                </label>
                {cat.children && cat.children.length > 0 && (
                  <div className="ml-5 space-y-1 border-l border-border pl-3 mt-1">
                    {cat.children.map((child) => {
                      const isChildSelected = currentCategorySlug === child.slug.toLowerCase()
                      return (
                        <label key={child.id} className="flex items-center cursor-pointer hover:text-primary">
                          <input
                            type="radio"
                            name="category"
                            value={child.slug}
                            checked={isChildSelected}
                            onChange={() => updateFilters({ category: child.slug })}
                            className="w-3.5 h-3.5 text-primary focus:ring-primary"
                          />
                          <span className={cn('ml-2 text-xs capitalize', isChildSelected && 'font-semibold text-primary')}>
                            {child.name}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Gender Filter */}
      <div>
        <Label className="text-sm font-semibold uppercase tracking-wider mb-3 block">Gender</Label>
        <div className="space-y-2">
          {GENDER_OPTIONS.map(({ label, value }) => {
            const isSelected = currentGender === value
            return (
              <label key={value} className="flex items-center cursor-pointer hover:text-primary">
                <input
                  type="radio"
                  name="gender"
                  value={value}
                  checked={isSelected}
                  onChange={() => updateFilters({ gender: value || null })}
                  className="w-4 h-4 text-primary focus:ring-primary"
                />
                <span className={cn('ml-2 text-sm', isSelected && 'font-semibold text-primary')}>
                  {label}
                </span>
              </label>
            )
          })}
        </div>
      </div>

      {/* Brand Filter */}
      <div>
        <Label className="text-sm font-semibold uppercase tracking-wider mb-3 block">Brand</Label>
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          <label className="flex items-center cursor-pointer hover:text-primary">
            <input
              type="radio"
              name="brand"
              value=""
              checked={!currentBrandSlug}
              onChange={() => updateFilters({ brand: null })}
              className="w-4 h-4 text-primary focus:ring-primary"
            />
            <span className="ml-2 text-sm font-medium">All Brands</span>
          </label>
          {brands.map((brand) => {
            const isBrandSelected = currentBrandSlug === brand.slug.toLowerCase()
            return (
              <label key={brand.id} className="flex items-center cursor-pointer hover:text-primary">
                <input
                  type="radio"
                  name="brand"
                  value={brand.slug}
                  checked={isBrandSelected}
                  onChange={() => updateFilters({ brand: brand.slug })}
                  className="w-4 h-4 text-primary focus:ring-primary"
                />
                <span className={cn('ml-2 text-sm', isBrandSelected && 'font-semibold text-primary')}>
                  {brand.name}
                </span>
              </label>
            )
          })}
        </div>
      </div>

      {/* Size Filter */}
      {availableSizes.length > 0 && (
        <div>
          <Label className="text-sm font-semibold uppercase tracking-wider mb-3 block">Size (EU)</Label>
          <div className="flex flex-wrap gap-2">
            {availableSizes.map((size) => {
              const isSelected = currentSize === size
              return (
                <button
                  key={size}
                  onClick={() => updateFilters({ size: isSelected ? null : size })}
                  className={cn(
                    'min-w-[48px] min-h-[48px] px-2 text-xs font-medium rounded border transition-colors',
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border hover:border-primary hover:text-primary bg-background'
                  )}
                  aria-pressed={isSelected}
                  aria-label={`Size ${size}`}
                >
                  {size}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Color Filter */}
      {availableColors.length > 0 && (
        <div>
          <Label className="text-sm font-semibold uppercase tracking-wider mb-3 block">Color</Label>
          <div className="flex flex-wrap gap-2">
            {availableColors.map(({ name, hex }) => {
              const isSelected = currentColor === name
              return (
                <button
                  key={name}
                  onClick={() => updateFilters({ color: isSelected ? null : name })}
                  title={name}
                  aria-label={name}
                  aria-pressed={isSelected}
                  className={cn(
                    'min-w-[48px] min-h-[48px] flex flex-col items-center justify-center gap-1 rounded border text-[10px] font-medium transition-colors',
                    isSelected ? 'border-primary ring-2 ring-primary ring-offset-1' : 'border-border hover:border-primary'
                  )}
                >
                  <span
                    className="w-5 h-5 rounded-full border border-black/10"
                    style={{ backgroundColor: hex ?? '#ccc' }}
                  />
                  <span className="leading-none">{name.split('/')[0]}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Price Range Filter */}
      <div>
        <Label className="text-sm font-semibold uppercase tracking-wider mb-3 block">Price (KES)</Label>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Min: KES {localPriceRange.min.toLocaleString()}</span>
            </div>
            <Input
              type="range"
              min={fullPriceRange.min}
              max={fullPriceRange.max}
              value={localPriceRange.min}
              onChange={(e) => handleMinPriceChange(Number(e.target.value))}
              onMouseUp={applyPriceFilter}
              onTouchEnd={applyPriceFilter}
              onKeyUp={(e) => e.key === 'Enter' && applyPriceFilter()}
              className="w-full h-2 cursor-pointer"
            />
          </div>
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Max: KES {localPriceRange.max.toLocaleString()}</span>
            </div>
            <Input
              type="range"
              min={fullPriceRange.min}
              max={fullPriceRange.max}
              value={localPriceRange.max}
              onChange={(e) => handleMaxPriceChange(Number(e.target.value))}
              onMouseUp={applyPriceFilter}
              onTouchEnd={applyPriceFilter}
              onKeyUp={(e) => e.key === 'Enter' && applyPriceFilter()}
              className="w-full h-2 cursor-pointer"
            />
          </div>
          <Button variant="outline" size="sm" className="w-full text-xs" onClick={applyPriceFilter}>
            Apply Price Range
          </Button>
        </div>
      </div>

      <Button
        variant="secondary"
        className="w-full"
        onClick={() => {
          updateFilters({ category: null, brand: null, gender: null, size: null, color: null, minPrice: null, maxPrice: null })
          setLocalPriceRange(fullPriceRange)
        }}
      >
        Reset Filters
      </Button>
    </div>
  )
}