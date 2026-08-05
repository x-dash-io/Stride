'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, FormProvider } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Save } from 'lucide-react'
import { useToast } from '@/providers/ToastProvider'
import { BasicInfoTab, SeoTab } from '../../new/tabs'

interface ProductFormValues {
  name: string
  slug: string
  brandId: string
  categoryId?: string
  shortDescription?: string
  description?: string
  gender: 'MEN' | 'WOMEN' | 'KIDS' | 'UNISEX'
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED'
  basePrice: number
  salePrice?: number
  costPrice?: number
  weightKg?: number
  isFeatured: boolean
  isNewArrival: boolean
  isBestSeller: boolean
  isLimitedEdition: boolean
  isTrending: boolean
  metaTitle?: string
  metaDescription?: string
}

interface ProductEditFormProps {
  productId: string
  initial: ProductFormValues
}

export function ProductEditForm({ productId, initial }: ProductEditFormProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const methods = useForm<ProductFormValues>({
    defaultValues: initial,
  })

  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true)
    try {
      const csrfRes = await fetch('/api/csrf')
      const { csrfToken } = await csrfRes.json()

      const payload = {
        ...data,
        basePrice: Number.isFinite(data.basePrice) ? data.basePrice : undefined,
        salePrice: Number.isFinite(data.salePrice) ? data.salePrice : undefined,
        costPrice: Number.isFinite(data.costPrice) ? data.costPrice : undefined,
        weightKg: Number.isFinite(data.weightKg) ? data.weightKg : undefined,
        categoryId: data.categoryId || undefined,
      }

      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update product')
      }

      showToast('success', 'Product updated successfully')
      router.refresh()
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Failed to update product')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
      <FormProvider {...methods}>
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>

          <BasicInfoTab />
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
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
