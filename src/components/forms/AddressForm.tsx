'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/providers/ToastProvider'

interface AddressFormData {
  label: string
  firstName: string
  lastName: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country: string
  isDefault: boolean
}

interface AddressFormProps {
  initialData?: AddressFormData
  addressId?: string
}

const defaultData: AddressFormData = {
  label: 'Home',
  firstName: '',
  lastName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'KE',
  isDefault: false,
}

export function AddressForm({ initialData, addressId }: AddressFormProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<AddressFormData>(initialData || defaultData)
  const [errors, setErrors] = useState<Partial<Record<keyof AddressFormData, string>>>({})

  const isEditing = !!addressId

  const updateField = (field: keyof AddressFormData, value: string | boolean) => {
    setData((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof AddressFormData, string>> = {}
    if (!data.firstName || data.firstName.length < 2) newErrors.firstName = 'First name is required'
    if (!data.lastName || data.lastName.length < 2) newErrors.lastName = 'Last name is required'
    if (!data.phone || data.phone.length < 6) newErrors.phone = 'Valid phone number is required'
    if (!data.addressLine1 || data.addressLine1.length < 5) newErrors.addressLine1 = 'Address must be at least 5 characters'
    if (!data.city || data.city.length < 2) newErrors.city = 'City is required'
    if (!data.state || data.state.length < 2) newErrors.state = 'County/State is required'
    if (!data.postalCode || data.postalCode.length < 2) newErrors.postalCode = 'Postal code is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    try {
      const url = isEditing ? `/api/account/addresses/${addressId}` : '/api/account/addresses'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const result = await response.json()
        showToast('error', result.error || 'Failed to save address')
        return
      }

      showToast('success', isEditing ? 'Address updated!' : 'Address added!')
      router.push('/account/addresses')
      router.refresh()
    } catch {
      showToast('error', 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this address?')) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/account/addresses/${addressId}`, { method: 'DELETE' })

      if (!response.ok) {
        showToast('error', 'Failed to delete address')
        return
      }

      showToast('success', 'Address deleted!')
      router.push('/account/addresses')
      router.refresh()
    } catch {
      showToast('error', 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="label">Label</Label>
        <Select value={data.label} onValueChange={(v) => updateField('label', v)}>
          <SelectTrigger id="label">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Home">Home</SelectItem>
            <SelectItem value="Work">Work</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input id="firstName" value={data.firstName} onChange={(e) => updateField('firstName', e.target.value)} disabled={isLoading} />
          {errors.firstName && <p className="text-sm text-destructive">{errors.firstName}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input id="lastName" value={data.lastName} onChange={(e) => updateField('lastName', e.target.value)} disabled={isLoading} />
          {errors.lastName && <p className="text-sm text-destructive">{errors.lastName}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input id="phone" type="tel" value={data.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="0712 345 678" disabled={isLoading} />
        {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="addressLine1">Address Line 1</Label>
        <Input id="addressLine1" value={data.addressLine1} onChange={(e) => updateField('addressLine1', e.target.value)} placeholder="Street address, P.O. Box" disabled={isLoading} />
        {errors.addressLine1 && <p className="text-sm text-destructive">{errors.addressLine1}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
        <Input id="addressLine2" value={data.addressLine2 || ''} onChange={(e) => updateField('addressLine2', e.target.value)} placeholder="Apartment, suite, unit" disabled={isLoading} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" value={data.city} onChange={(e) => updateField('city', e.target.value)} disabled={isLoading} />
          {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">County / State</Label>
          <Input id="state" value={data.state} onChange={(e) => updateField('state', e.target.value)} disabled={isLoading} />
          {errors.state && <p className="text-sm text-destructive">{errors.state}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="postalCode">Postal Code</Label>
          <Input id="postalCode" value={data.postalCode} onChange={(e) => updateField('postalCode', e.target.value)} disabled={isLoading} />
          {errors.postalCode && <p className="text-sm text-destructive">{errors.postalCode}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="country">Country</Label>
        <Select value={data.country} onValueChange={(v) => updateField('country', v)}>
          <SelectTrigger id="country">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="KE">Kenya</SelectItem>
            <SelectItem value="UG">Uganda</SelectItem>
            <SelectItem value="TZ">Tanzania</SelectItem>
            <SelectItem value="RW">Rwanda</SelectItem>
            <SelectItem value="ET">Ethiopia</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={data.isDefault}
          onChange={(e) => updateField('isDefault', e.target.checked)}
          className="rounded border-input"
        />
        Set as default address
      </label>

      <div className="flex gap-4">
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isLoading ? 'Saving...' : isEditing ? 'Update Address' : 'Add Address'}
        </Button>
        {isEditing && (
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={isLoading}>
            Delete
          </Button>
        )}
      </div>
    </form>
  )
}
