'use client'

import { useEffect } from 'react'
import { ErrorState } from '@/components/ui/error-state'

export default function OrderDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Order detail error:', error)
  }, [error])

  return (
    <ErrorState
      title="Failed to Load Order Details"
      message="We couldn't load the details for this order. Please try again."
      error={error}
      reset={reset}
      backHref="/account/orders"
      backLabel="Back to Orders"
      variant="full"
    />
  )
}
