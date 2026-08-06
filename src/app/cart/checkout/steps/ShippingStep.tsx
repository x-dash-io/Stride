'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronRight, Loader2 } from 'lucide-react'
import { shippingAddressSchema } from '@/lib/validations'
import { useToast } from '@/providers/ToastProvider'

interface ShippingStepProps {
  onNext: (addressId: string) => void
  onBack: () => void
  onZoneChange?: (cost: number) => void
}

export function ShippingStep({ onNext, onBack, onZoneChange }: ShippingStepProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [zones, setZones] = useState<{ id: string; name: string; baseCost: number }[]>([])
  const [isLoadingZones, setIsLoadingZones] = useState(true)

  useEffect(() => {
    fetch('/api/shipping-zones')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setZones(data)
        }
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoadingZones(false))
  }, [])

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: {
      label: 'Home',
      isDefault: true,
      isBilling: true,
      isShipping: true,
      country: 'KE',
    },
  })

  const selectedState = watch('state')

  useEffect(() => {
    if (selectedState && onZoneChange) {
      const zone = zones.find(z => z.name === selectedState)
      if (zone) {
        onZoneChange(zone.baseCost)
      }
    }
  }, [selectedState, zones, onZoneChange])

  const onSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      const csrfRes = await fetch('/api/csrf')
      const { csrfToken } = await csrfRes.json()

      const response = await fetch('/api/account/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        if (response.status === 401) {
          // User is not authenticated, redirect to login with callbackUrl
          router.push('/auth/login?callbackUrl=/cart/checkout')
          return
        }
        const error = await response.json()
        throw new Error(error.error || 'Failed to save address')
      }

      const result = await response.json()
      onNext(result.id)
    } catch (error) {
      console.error('Shipping address error:', error)
      showToast('error', error instanceof Error ? error.message : 'Failed to save address')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-card border border-border rounded-xl p-6 md:p-8">
        <div className="mb-6">
          <h2 className="text-xl font-serif font-bold">Shipping Address</h2>
          <p className="text-sm text-muted-foreground mt-1">Where should we deliver your order?</p>
        </div>
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="label">Address Label</Label>
              <Select onValueChange={(value) => register('label').onChange({ target: { value } } as any)} defaultValue="Home">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select label" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Home">Home</SelectItem>
                  <SelectItem value="Work">Work</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input id="firstName" {...register('firstName', { required: 'First name is required' })} />
              {errors.firstName && <p className="text-sm text-destructive">{String(errors.firstName.message)}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input id="lastName" {...register('lastName', { required: 'Last name is required' })} />
              {errors.lastName && <p className="text-sm text-destructive">{String(errors.lastName.message)}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input id="phone" type="tel" placeholder="2547XXXXXXXX" {...register('phone', { required: 'Phone number is required', pattern: { value: /^254[0-9]{9}$/, message: 'Format: 2547XXXXXXXX' } })} />
              {errors.phone && <p className="text-sm text-destructive">{String(errors.phone.message)}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="addressLine1">Address Line 1 *</Label>
              <Input id="addressLine1" {...register('addressLine1', { required: 'Address is required' })} />
              {errors.addressLine1 && <p className="text-sm text-destructive">{String(errors.addressLine1.message)}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
              <Input id="addressLine2" {...register('addressLine2')} placeholder="Apartment, House No., Floor" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City / Town *</Label>
              <Input id="city" placeholder="e.g. Nairobi" {...register('city', { required: 'City is required' })} />
              {errors.city && <p className="text-sm text-destructive">{String(errors.city.message)}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">County *</Label>
              {isLoadingZones ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  Loading counties...
                </div>
              ) : (
                <Select
                  onValueChange={(value) => register('state', { required: 'County is required' }).onChange({ target: { value } } as any)}
                  defaultValue=""
                >
                  <SelectTrigger className="w-full" id="state">
                    <SelectValue placeholder="Select County..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="" disabled>Select County...</SelectItem>
                    {zones.map((zone) => (
                      <SelectItem key={zone.id} value={zone.name}>
                        {zone.name} (KES {zone.baseCost})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {errors.state && <p className="text-sm text-destructive">{String(errors.state.message)}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code *</Label>
              <Input id="postalCode" placeholder="e.g. 00100" {...register('postalCode', { required: 'Postal code is required' })} />
              {errors.postalCode && <p className="text-sm text-destructive">{String(errors.postalCode.message)}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input value="Kenya" readOnly className="bg-muted font-medium" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? (
            <> <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Saving... </>
          ) : (
            <> Continue <ChevronRight className="w-5 h-5 ml-2" /> </>
          )}
        </Button>
      </div>
    </form>
  )
}