'use client'

import { Button } from '@/components/ui/button'
import { Trash2, Loader2 } from 'lucide-react'
import type { AddressFormData } from './AddressForm'

interface AddressActionsProps {
  isLoading: boolean
  isEditing: boolean
  addressId?: string
  onSubmit: (e: React.FormEvent) => void
  onDelete: () => void
}

export function AddressActions({ isLoading, isEditing, addressId, onSubmit, onDelete }: AddressActionsProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="flex gap-4">
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : isEditing ? (
            'Update Address'
          ) : (
            'Add Address'
          )}
        </Button>
        {isEditing && (
          <Button
            type="button"
            variant="destructive"
            onClick={onDelete}
            disabled={isLoading}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        )}
      </div>
    </form>
  )
}