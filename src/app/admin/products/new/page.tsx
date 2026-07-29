'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Save } from 'lucide-react'
import { productCreateSchema, ProductCreateInput } from '@/lib/validations'
import { useToast } from '@/providers/ToastProvider'
import { BasicInfoTab, VariantsTab, ImagesTab, SeoTab } from './tabs'

export default function NewProductPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const methods = useForm<ProductCreateInput>({
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

      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
        <FormProvider {...methods}>
          <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="variants">Variants</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>

          <BasicInfoTab />
          <VariantsTab />
          <ImagesTab />
          <SeoTab />
        </Tabs>
          </FormProvider>

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