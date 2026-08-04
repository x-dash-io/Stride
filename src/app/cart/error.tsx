'use client'

import { useEffect } from 'react'
import { ErrorState } from '@/components/ui/error-state'

export default function CartError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Cart error:', error)
  }, [error])

  return (
    <ErrorState
      title="Something Went Wrong with Your Cart"
      message="We encountered an issue loading your cart. Please try again."
      error={error}
      reset={reset}
      variant="full"
      showHomeButton={true}
    />
  )
}
