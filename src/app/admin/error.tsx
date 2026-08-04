'use client'

import { useEffect } from 'react'
import { ErrorState } from '@/components/ui/error-state'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Admin page error:', error)
  }, [error])

  return (
    <ErrorState
      title="Admin Dashboard Error"
      message="Something went wrong loading the admin panel. Please try again."
      error={error}
      reset={reset}
      variant="full"
      showHomeButton={true}
    />
  )
}
