'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/providers/ToastProvider'
import { AddressFields } from './AddressFields'
import { AddressActions } from './AddressActions'

export interface AddressFormData {
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
    if (!data.state || data.state.length < 2) newErrors.state = 'County is required'
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
    <>
      <AddressFields
        data={data}
        errors={errors}
        isLoading={isLoading}
        isEditing={isEditing}
        onFieldChange={updateField}
      />
      <AddressActions
        isLoading={isLoading}
        isEditing={isEditing}
        addressId={addressId}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
      />
    </>
  )
}