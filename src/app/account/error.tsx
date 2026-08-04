'use client'

import { useEffect } from 'react'
import { ErrorState } from '@/components/ui/error-state'

export default function AccountError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Account page error:', error)
  }, [error])

  return (
    <ErrorState
      title="Account Loading Error"
      message="We couldn't load your account details. Please try again."
      error={error}
      reset={reset}
      variant="full"
      showHomeButton={true}
    />
  )
}
