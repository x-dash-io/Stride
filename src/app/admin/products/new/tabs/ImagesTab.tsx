'use client'

import { useFormContext } from 'react-hook-form'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TabsContent } from '@/components/ui/tabs'

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