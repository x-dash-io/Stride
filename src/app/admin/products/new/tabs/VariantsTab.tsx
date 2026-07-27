'use client'

import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2 } from 'lucide-react'
import { TabsContent } from '@/components/ui/tabs'

export function VariantsTab() {
  const { control, watch, setValue } = useFormContext()

  return (
    <TabsContent value="variants" className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Product Variants</CardTitle>
              <CardDescription>Add size/color combinations for this product</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label>SKU *</Label>
                  <Input placeholder="SKU-001" disabled />
                </div>

                <div className="space-y-2">
                  <Label>Size *</Label>
                  <Input placeholder="e.g., 42" disabled />
                </div>

                <div className="space-y-2">
                  <Label>Colour *</Label>
                  <Input placeholder="e.g., Black" disabled />
                </div>

                <div className="space-y-2">
                  <Label>Colour Hex</Label>
                  <Input placeholder="#000000" type="color" disabled />
                </div>

                <div className="space-y-2">
                  <Label>Base Price (KES)</Label>
                  <Input type="number" step="0.01" min="0" placeholder="0.00" disabled />
                </div>

                <div className="space-y-2">
                  <Label>Sale Price (KES)</Label>
                  <Input type="number" step="0.01" min="0" placeholder="0.00" disabled />
                </div>

                <div className="space-y-2">
                  <Label>US Size</Label>
                  <Input placeholder="9" disabled />
                </div>

                <div className="space-y-2">
                  <Label>EU Size</Label>
                  <Input placeholder="42" disabled />
                </div>

                <div className="space-y-2">
                  <Label>UK Size</Label>
                  <Input placeholder="8" disabled />
                </div>

                <div className="space-y-2">
                  <Label>Material</Label>
                  <Input placeholder="Leather" disabled />
                </div>

                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select disabled>
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

                <div className="space-y-2 flex items-end">
                  <label className="cursor-pointer flex items-center gap-2">
                    <input type="checkbox" disabled /> Active
                  </label>
                  <label className="cursor-pointer flex items-center gap-2">
                    <input type="checkbox" disabled /> Default
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center py-8 text-muted-foreground">
            <p>Variants can be added after the product is created.</p>
            <p className="text-sm">Navigate to the product detail page in admin to manage variants.</p>
          </div>

          <Button type="button" variant="outline" className="w-full mt-4">
            Add Variant
          </Button>
        </CardContent>
      </Card>
    </TabsContent>
  )
}