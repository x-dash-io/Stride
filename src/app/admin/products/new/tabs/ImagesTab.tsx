'use client'

import { useFormContext } from 'react-hook-form'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TabsContent } from '@/components/ui/tabs'

const ImageUpload = dynamic(() => import('@/components/admin/ImageUpload').then(mod => mod.ImageUpload), {
  ssr: false,
  loading: () => (
    <div className="border-2 border-dashed rounded-xl p-8 text-center animate-pulse">
      <div className="h-12 w-12 mx-auto bg-muted rounded" />
      <div className="mt-3 h-4 bg-muted rounded w-1/2 mx-auto" />
      <div className="mt-2 h-4 bg-muted rounded w-1/3 mx-auto" />
    </div>
  ),
})

export function ImagesTab() {
  const { watch } = useFormContext()
  const productId = watch('id') || 'temp'

  return (
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
            productId={productId}
            variantId="default"
            maxFiles={10}
          />
        </CardContent>
      </Card>
    </TabsContent>
  )
}