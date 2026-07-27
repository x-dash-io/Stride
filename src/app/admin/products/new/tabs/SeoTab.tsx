'use client'

import { useFormContext } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TabsContent } from '@/components/ui/tabs'

const getErrorMessage = (error: any) => {
  if (typeof error?.message === 'string') return error.message
  if (typeof error === 'string') return error
  return 'Invalid value'
}

export function SeoTab() {
  const { register, watch, setValue, formState: { errors } } = useFormContext()

  return (
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
              maxLength={160}
            />
            {errors.metaDescription && <p className="text-sm text-destructive">{getErrorMessage(errors.metaDescription)}</p>}
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  )
}