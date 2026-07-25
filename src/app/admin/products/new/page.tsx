'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Upload, Plus, Save, Loader2, Image as ImageIcon, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { productCreateSchema, ProductCreateInput } from '@/lib/validations'
import { useToast } from '@/providers/ToastProvider'

const genderOptions = [
  { value: 'MEN', label: 'Men' },
  { value: 'WOMEN', label: 'Women' },
  { value: 'KIDS', label: 'Kids' },
  { value: 'UNISEX', label: 'Unisex' },
]

const statusOptions = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'DISCONTINUED', label: 'Discontinued' },
]

export default function NewProductPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedImages, setSelectedImages] = useState<File[]>([])

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductCreateInput>({
    resolver: zodResolver(productCreateSchema),
    defaultValues: {
      gender: 'UNISEX',
      currency: 'KES',
      isFeatured: false,
      isNewArrival: false,
      isBestSeller: false,
      isLimitedEdition: false,
      isTrending: false,
      status: 'DRAFT',
    },
  })

  const onSubmit = async (data: ProductCreateInput) => {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, typeof value === 'boolean' ? String(value) : String(value))
        }
      })

      const response = await fetch('/api/admin/products', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create product')
      }

      showToast('success', 'Product created successfully')
      router.push(`/admin/products/${result.id}`)
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Failed to create product')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container-max py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-serif font-bold">New Product</h1>
        <p className="text-muted-foreground mt-1">Add a new product to the catalog</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="variants">Variants</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>

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
                    <Input
                      id="name"
                      placeholder="e.g., Air Max 270"
                      {...register('name')}
                    />
                    {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug *</Label>
                    <Input
                      id="slug"
                      placeholder="air-max-270"
                      {...register('slug')}
                    />
                    {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brandId">Brand *</Label>
                    <Select {...register('brandId')}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select brand" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nike">Nike</SelectItem>
                        <SelectItem value="adidas">Adidas</SelectItem>
                        <SelectItem value="puma">Puma</SelectItem>
                        <SelectItem value="new-balance">New Balance</SelectItem>
                        <SelectItem value="african-footwear">African Footwear Co.</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.brandId && <p className="text-sm text-destructive">{errors.brandId.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categoryId">Category</Label>
                    <Select {...register('categoryId')}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sneakers">Sneakers</SelectItem>
                        <SelectItem value="formal-shoes">Formal Shoes</SelectItem>
                        <SelectItem value="boots">Boots</SelectItem>
                        <SelectItem value="sandals">Sandals</SelectItem>
                        <SelectItem value="kids">Kids</SelectItem>
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
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="basePrice">Base Price (KES) *</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('basePrice', { valueAsNumber: true })}
                  />
                  {errors.basePrice && <p className="text-sm text-destructive">{errors.basePrice.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salePrice">Sale Price (KES)</Label>
                  <Input
                    id="salePrice"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('salePrice', { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="costPrice">Cost Price (KES)</Label>
                  <Input
                    id="costPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('costPrice', { valueAsNumber: true })}
                  />
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
                  <div className="flex items-center gap-2">
                    <Switch
                      id="isFeatured"
                      checked={watch('isFeatured')}
                      onCheckedChange={(checked) => setValue('isFeatured', checked)}
                    />
                    <Label htmlFor="isFeatured">Featured</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="isNewArrival"
                      checked={watch('isNewArrival')}
                      onCheckedChange={(checked) => setValue('isNewArrival', checked)}
                    />
                    <Label htmlFor="isNewArrival">New Arrival</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="isBestSeller"
                      checked={watch('isBestSeller')}
                      onCheckedChange={(checked) => setValue('isBestSeller', checked)}
                    />
                    <Label htmlFor="isBestSeller">Best Seller</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="isLimitedEdition"
                      checked={watch('isLimitedEdition')}
                      onCheckedChange={(checked) => setValue('isLimitedEdition', checked)}
                    />
                    <Label htmlFor="isLimitedEdition">Limited Edition</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="isTrending"
                      checked={watch('isTrending')}
                      onCheckedChange={(checked) => setValue('isTrending', checked)}
                    />
                    <Label htmlFor="isTrending">Trending</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="variants" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Variants</CardTitle>
                <CardDescription>Add size/color combinations for this product</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground text-sm">
                    Variants can be added after the product is created. Navigate to the product detail page in admin to manage variants.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="images" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Product Images</CardTitle>
                    <CardDescription>Upload product images. First image will be the primary image.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ImageUpload
                  productId="temp"
                  variantId="temp"
                  maxFiles={10}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>SEO Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input
                    id="metaTitle"
                    placeholder="Product name - STRIDE Kenya"
                    {...register('metaTitle')}
                    maxLength={255}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    placeholder="Brief description for search results (max 160 chars)"
                    {...register('metaDescription')}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4 border-t pt-6">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} size="lg">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create Product
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}