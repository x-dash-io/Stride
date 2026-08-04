'use client'

import { useEffect } from 'react'
import { ErrorState } from '@/components/ui/error-state'

export default function ProductDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Product detail error:', error)
  }, [error])

  return (
    <ErrorState
      title="Failed to Load Product"
      message="We couldn't load this product's details. It may have been removed or is temporarily unavailable."
      error={error}
      reset={reset}
      backHref="/products"
      backLabel="Back to Products"
      variant="full"
    />
  )
}
