'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { AddressFormData } from './AddressForm'

interface AddressFieldsProps {
  data: AddressFormData
  errors: Partial<Record<keyof AddressFormData, string>>
  isLoading: boolean
  isEditing: boolean
  onFieldChange: (field: keyof AddressFormData, value: string | boolean) => void
}

const LABEL_OPTIONS = [
  { value: 'Home', label: 'Home' },
  { value: 'Work', label: 'Work' },
  { value: 'Other', label: 'Other' },
] as const

// All 47 Kenya counties
const KENYA_COUNTIES = [
  'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet',
  'Embu', 'Garissa', 'Homa Bay', 'Isiolo', 'Kajiado',
  'Kakamega', 'Kericho', 'Kiambu', 'Kilifi', 'Kirinyaga',
  'Kisii', 'Kisumu', 'Kitui', 'Kwale', 'Laikipia',
  'Lamu', 'Machakos', 'Makueni', 'Mandera', 'Marsabit',
  'Meru', 'Migori', 'Mombasa', 'Murang\'a', 'Nairobi',
  'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua',
  'Nyeri', 'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River',
  'Tharaka-Nithi', 'Trans Nzoia', 'Turkana', 'Uasin Gishu',
  'Vihiga', 'Wajir', 'West Pokot',
] as const

export function AddressFields({
  data,
  errors,
  isLoading,
  isEditing,
  onFieldChange,
}: AddressFieldsProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="label">Label</Label>
        <Select value={data.label} onValueChange={(v) => onFieldChange('label', v)} disabled={isLoading}>
          <SelectTrigger id="label">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LABEL_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={data.firstName}
            onChange={(e) => onFieldChange('firstName', e.target.value)}
            placeholder="First Name"
            disabled={isLoading}
          />
          {errors.firstName && <p className="text-sm text-destructive">{errors.firstName}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={data.lastName}
            onChange={(e) => onFieldChange('lastName', e.target.value)}
            placeholder="Last Name"
            disabled={isLoading}
          />
          {errors.lastName && <p className="text-sm text-destructive">{errors.lastName}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">
          Phone Number
          <span className="ml-1 text-xs text-muted-foreground">(M-Pesa registered)</span>
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium pointer-events-none">
            🇰🇪
          </span>
          <Input
            id="phone"
            type="tel"
            value={data.phone}
            onChange={(e) => {
              // Strip non-digits, allow + prefix
              const raw = e.target.value.replace(/[^\d+]/g, '')
              onFieldChange('phone', raw)
            }}
            placeholder="0712 345 678"
            className="pl-10"
            disabled={isLoading}
            maxLength={15}
            inputMode="tel"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Accepted formats: 07XXXXXXXX · 01XXXXXXXX · +2547XXXXXXXX
        </p>
        {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="addressLine1">Address Line 1</Label>
        <Input
          id="addressLine1"
          value={data.addressLine1}
          onChange={(e) => onFieldChange('addressLine1', e.target.value)}
          placeholder="Street address, Building, P.O. Box"
          disabled={isLoading}
        />
        {errors.addressLine1 && <p className="text-sm text-destructive">{errors.addressLine1}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="addressLine2">Address Line 2 <span className="text-muted-foreground">(Optional)</span></Label>
        <Input
          id="addressLine2"
          value={data.addressLine2 || ''}
          onChange={(e) => onFieldChange('addressLine2', e.target.value)}
          placeholder="Apartment, House No., Suite, Floor"
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City / Town</Label>
          <Input
            id="city"
            value={data.city}
            onChange={(e) => onFieldChange('city', e.target.value)}
            placeholder="e.g. Nairobi"
            disabled={isLoading}
          />
          {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">County</Label>
          <Select
            value={data.state}
            onValueChange={(v) => onFieldChange('state', v)}
            disabled={isLoading}
          >
            <SelectTrigger id="state">
              <SelectValue placeholder="Select county…" />
            </SelectTrigger>
            <SelectContent className="max-h-64 overflow-y-auto">
              {KENYA_COUNTIES.map((county) => (
                <SelectItem key={county} value={county}>
                  {county}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.state && <p className="text-sm text-destructive">{errors.state}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="postalCode">Postal Code</Label>
          <Input
            id="postalCode"
            value={data.postalCode}
            onChange={(e) => onFieldChange('postalCode', e.target.value.replace(/\D/g, ''))}
            placeholder="e.g. 00100"
            disabled={isLoading}
            maxLength={10}
            inputMode="numeric"
          />
          {errors.postalCode && <p className="text-sm text-destructive">{errors.postalCode}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Country</Label>
        <Input value="Kenya 🇰🇪" readOnly className="bg-muted font-medium cursor-not-allowed" />
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="isDefault"
          checked={data.isDefault}
          onCheckedChange={(checked) => onFieldChange('isDefault', checked)}
          disabled={isLoading}
        />
        <Label htmlFor="isDefault" className="text-sm cursor-pointer">
          Set as default address
        </Label>
      </div>
    </div>
  )
}
