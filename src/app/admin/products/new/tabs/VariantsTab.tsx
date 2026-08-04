'use client'

import { useState } from 'react'
import { useFormContext, useFieldArray } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2 } from 'lucide-react'
import { TabsContent } from '@/components/ui/tabs'

interface VariantFormData {
  sku: string
  size: string
  sizeEu: string
  sizeUs: string
  sizeUk: string
  colour: string
  colourHex: string
  basePrice: number
  salePrice: number
  quantity: number
  isActive: boolean
  isDefault: boolean
}

export function VariantsTab() {
  const { control, register } = useFormContext()
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'variants' as any,
  })

  const addVariant = () => {
    append({
      sku: '',
      size: '',
      sizeEu: '',
      sizeUs: '',
      sizeUk: '',
      colour: '',
      colourHex: '#000000',
      basePrice: 0,
      salePrice: 0,
      quantity: 0,
      isActive: true,
      isDefault: false,
    } as any)
  }

  return (
    <TabsContent value="variants" className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Product Variants</CardTitle>
              <CardDescription>Add size/color combinations for this product</CardDescription>
            </div>
            <Button type="button" onClick={addVariant} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Variant
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {fields.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-lg">
              <p>No variants added yet</p>
              <p className="text-sm mt-2">Click "Add Variant" to create size/color combinations</p>
            </div>
          ) : (
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border border-border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Variant {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-2">
                      <Label>SKU *</Label>
                      <Input
                        {...register(`variants.${index}.sku` as any)}
                        placeholder="SKU-001"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Size *</Label>
                      <Input
                        {...register(`variants.${index}.size` as any)}
                        placeholder="e.g., 42"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Colour *</Label>
                      <Input
                        {...register(`variants.${index}.colour` as any)}
                        placeholder="e.g., Black"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Colour Hex</Label>
                      <div className="flex gap-2">
                        <Input
                          {...register(`variants.${index}.colourHex` as any)}
                          placeholder="#000000"
                          type="text"
                        />
                        <input
                          {...register(`variants.${index}.colourHex` as any)}
                          type="color"
                          className="w-12 h-10 rounded cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Base Price (KES)</Label>
                      <Input
                        {...register(`variants.${index}.basePrice` as any, { valueAsNumber: true })}
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Sale Price (KES)</Label>
                      <Input
                        {...register(`variants.${index}.salePrice` as any, { valueAsNumber: true })}
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Quantity *</Label>
                      <Input
                        {...register(`variants.${index}.quantity` as any, { valueAsNumber: true })}
                        type="number"
                        min="0"
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Gender</Label>
                      <Select {...register(`variants.${index}.gender` as any)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MEN">Men</SelectItem>
                          <SelectItem value="WOMEN">Women</SelectItem>
                          <SelectItem value="KIDS">Kids</SelectItem>
                          <SelectItem value="UNISEX">Unisex</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-4 items-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register(`variants.${index}.isActive` as any)}
                        defaultChecked={true}
                      />
                      <span className="text-sm">Active</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register(`variants.${index}.isDefault` as any)}
                      />
                      <span className="text-sm">Default variant</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  )
}