'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

const COUNTRY_OPTIONS = [
  { value: 'KE', label: 'Kenya' },
  { value: 'UG', label: 'Uganda' },
  { value: 'TZ', label: 'Tanzania' },
  { value: 'RW', label: 'Rwanda' },
  { value: 'ET', label: 'Ethiopia' },
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
            disabled={isLoading}
          />
          {errors.lastName && <p className="text-sm text-destructive">{errors.lastName}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          value={data.phone}
          onChange={(e) => onFieldChange('phone', e.target.value)}
          placeholder="0712 345 678"
          disabled={isLoading}
        />
        {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="addressLine1">Address Line 1</Label>
        <Input
          id="addressLine1"
          value={data.addressLine1}
          onChange={(e) => onFieldChange('addressLine1', e.target.value)}
          placeholder="Street address, P.O. Box"
          disabled={isLoading}
        />
        {errors.addressLine1 && <p className="text-sm text-destructive">{errors.addressLine1}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
        <Input
          id="addressLine2"
          value={data.addressLine2 || ''}
          onChange={(e) => onFieldChange('addressLine2', e.target.value)}
          placeholder="Apartment, suite, unit"
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={data.city}
            onChange={(e) => onFieldChange('city', e.target.value)}
            disabled={isLoading}
          />
          {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">County / State</Label>
          <Input
            id="state"
            value={data.state}
            onChange={(e) => onFieldChange('state', e.target.value)}
            disabled={isLoading}
          />
          {errors.state && <p className="text-sm text-destructive">{errors.state}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="postalCode">Postal Code</Label>
          <Input
            id="postalCode"
            value={data.postalCode}
            onChange={(e) => onFieldChange('postalCode', e.target.value)}
            disabled={isLoading}
          />
          {errors.postalCode && <p className="text-sm text-destructive">{errors.postalCode}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="country">Country</Label>
        <Select value={data.country} onValueChange={(v) => onFieldChange('country', v)} disabled={isLoading}>
          <SelectTrigger id="country">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {COUNTRY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={data.isDefault}
          onChange={(e) => onFieldChange('isDefault', e.target.checked)}
          disabled={isLoading}
          className="rounded border-input"
        />
        Set as default address
      </label>
    </div>
  )
}