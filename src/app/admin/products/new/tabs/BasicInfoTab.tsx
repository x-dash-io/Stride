'use client'

import { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { TabsContent } from '@/components/ui/tabs'

const genderOptions = [
  { value: 'MEN', label: 'Men' },
  { value: 'WOMEN', label: 'Women' },
  { value: 'KIDS', label: 'Kids' },
  { value: 'UNISEX', label: 'Unisex' },
] as const

const statusOptions = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'DISCONTINUED', label: 'Discontinued' },
] as const

export function BasicInfoTab() {
  const { register, formState: { errors } } = useFormContext()
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([])
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    let cancelled = false
    Promise.all([
      fetch('/api/admin/brands').then((res) => (res.ok ? res.json() : [])),
      fetch('/api/admin/categories').then((res) => (res.ok ? res.json() : [])),
    ])
      .then(([brandList, categoryList]) => {
        if (cancelled) return
        setBrands(brandList)
        setCategories(categoryList)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <TabsContent value="basic" className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Required fields marked with *</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" placeholder="e.g., Air Max 270" {...register('name')} />
              {errors.name && <p className="text-sm text-destructive">{(errors.name.message as string) || 'Invalid'}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input id="slug" placeholder="air-max-270" {...register('slug')} />
              {errors.slug && <p className="text-sm text-destructive">{(errors.slug.message as string) || 'Invalid'}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="brandId">Brand *</Label>
              <Select {...register('brandId')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                  {brands.length === 0 && (
                    <SelectItem value="__none__" disabled>
                      No brands available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {errors.brandId && <p className="text-sm text-destructive">{(errors.brandId.message as string) || 'Invalid'}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoryId">Category</Label>
              <Select {...register('categoryId')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                  {categories.length === 0 && (
                    <SelectItem value="__none__" disabled>
                      No categories available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Gender *</Label>
            <Select {...register('gender')}>
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                {genderOptions.map((g) => (
                  <SelectItem key={g.value} value={g.value}>
                    {g.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.gender && <p className="text-sm text-destructive">{(errors.gender.message as string) || 'Invalid'}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="shortDescription">Short Description</Label>
            <Textarea
              id="shortDescription"
              placeholder="Brief description for product cards (max 500 chars)"
              {...register('shortDescription')}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Full Description</Label>
            <Textarea
              id="description"
              placeholder="Detailed product description..."
              {...register('description')}
              rows={6}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
          <CardDescription>Set competitive prices for your product</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="basePrice">Base Price (KES) *</Label>
            <Input
              id="basePrice"
              type="number"
              step="0.01"
              min="0"
              placeholder="25000"
              {...register('basePrice', { valueAsNumber: true })}
            />
            <p className="text-xs text-muted-foreground">Regular selling price</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="salePrice">Sale Price (KES)</Label>
            <Input
              id="salePrice"
              type="number"
              step="0.01"
              min="0"
              placeholder="22000"
              {...register('salePrice', { valueAsNumber: true })}
            />
            <p className="text-xs text-muted-foreground">Discounted price (optional)</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="costPrice">Cost Price (KES)</Label>
            <Input
              id="costPrice"
              type="number"
              step="0.01"
              min="0"
              placeholder="15000"
              {...register('costPrice', { valueAsNumber: true })}
            />
            <p className="text-xs text-muted-foreground">Internal cost (for margin calculation)</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status & Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select {...register('status')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="weightKg">Weight (kg)</Label>
              <Input
                id="weightKg"
                type="number"
                step="0.01"
                min="0"
                {...register('weightKg', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {[
              { id: 'isFeatured', label: 'Featured' },
              { id: 'isNewArrival', label: 'New Arrival' },
              { id: 'isBestSeller', label: 'Best Seller' },
              { id: 'isLimitedEdition', label: 'Limited Edition' },
              { id: 'isTrending', label: 'Trending' },
            ].map(({ id, label }) => (
              <div key={id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={id}
                  {...register(id)}
                />
                <label htmlFor={id} className="text-sm">{label}</label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  )
}