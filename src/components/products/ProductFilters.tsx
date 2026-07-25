'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'

interface ProductFiltersProps {
  categories: Array<{ id: string; name: string; slug: string; children?: Array<{ id: string; name: string; slug: string }> }>
  brands: Array<{ id: string; name: string; slug: string }>
  selectedCategory?: string
  selectedBrand?: string
  priceRange: { min: number; max: number }
  fullPriceRange: { min: number; max: number }
}

export function ProductFilters({ categories, brands, selectedCategory, selectedBrand, priceRange, fullPriceRange }: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)
  const [localPriceRange, setLocalPriceRange] = useState(priceRange)

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value)
      else params.delete(key)
    })
    params.delete('page')
    router.push(`/products?${params.toString()}`)
  }

  return (
    <div className={cn('space-y-6', showFilters ? 'block' : 'hidden lg:block')}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filters</h3>
        <button onClick={() => setShowFilters(!showFilters)} className="lg:hidden text-sm text-accent hover:underline">
          {showFilters ? 'Hide' : 'Show'} Filters
        </button>
      </div>

      <div>
        <Label className="text-sm font-semibold uppercase tracking-wider mb-3 block">Category</Label>
        <div className="space-y-2">
          <label className="flex items-center cursor-pointer">
            <input type="radio" name="category" value="" checked={!selectedCategory} onChange={() => updateFilters({ category: null })} className="w-4 h-4" />
            <span className="ml-2 text-sm">All Categories</span>
          </label>
          {categories.map((cat) => (
            <label key={cat.id} className="flex items-center cursor-pointer">
              <input type="radio" name="category" value={cat.slug} checked={selectedCategory === cat.slug} onChange={() => updateFilters({ category: cat.slug })} className="w-4 h-4" />
              <span className="ml-2 text-sm capitalize">{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-sm font-semibold uppercase tracking-wider mb-3 block">Brand</Label>
        <div className="space-y-2">
          <label className="flex items-center cursor-pointer">
            <input type="radio" name="brand" value="" checked={!selectedBrand} onChange={() => updateFilters({ brand: null })} className="w-4 h-4" />
            <span className="ml-2 text-sm">All Brands</span>
          </label>
          {brands.map((brand) => (
            <label key={brand.id} className="flex items-center cursor-pointer">
              <input type="radio" name="brand" value={brand.slug} checked={selectedBrand === brand.slug} onChange={() => updateFilters({ brand: brand.slug })} className="w-4 h-4" />
              <span className="ml-2 text-sm">{brand.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-sm font-semibold uppercase tracking-wider mb-3 block">Price (KES)</Label>
        <div className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground block mb-1">Min: {localPriceRange.min.toLocaleString()}</Label>
            <Input type="range" min={fullPriceRange.min} max={fullPriceRange.max} value={localPriceRange.min} onChange={(e) => setLocalPriceRange({ ...localPriceRange, min: Number(e.target.value) })} onMouseUp={() => updateFilters({ minPrice: String(localPriceRange.min) })} className="w-full" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground block mb-1">Max: {localPriceRange.max.toLocaleString()}</Label>
            <Input type="range" min={fullPriceRange.min} max={fullPriceRange.max} value={localPriceRange.max} onChange={(e) => setLocalPriceRange({ ...localPriceRange, max: Number(e.target.value) })} onMouseUp={() => updateFilters({ maxPrice: String(localPriceRange.max) })} className="w-full" />
          </div>
        </div>
      </div>

      <Button variant="secondary" className="w-full" onClick={() => {
        updateFilters({ category: null, brand: null, minPrice: null, maxPrice: null })
        setLocalPriceRange(fullPriceRange)
      }}>
        Reset Filters
      </Button>
    </div>
  )
}