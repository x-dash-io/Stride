'use client'

import { useEffect } from 'react'
import { ErrorState } from '@/components/ui/error-state'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <ErrorState
      title="Oops! Something went wrong"
      message="We're sorry, but something unexpected happened. Our team has been notified."
      error={error}
      reset={reset}
      variant="full"
      showHomeButton={true}
      showSupportButton={true}
    />
  )
}
