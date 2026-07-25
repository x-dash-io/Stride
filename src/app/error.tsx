'use client'

import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { useEffect } from 'react'

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
    <div className="container-max py-24 min-h-screen flex flex-col items-center justify-center text-center">
      <div className="mb-8">
        <AlertTriangle className="w-24 h-24 text-destructive" />
      </div>
      <h1 className="text-5xl font-serif font-bold mb-4">Oops! Something went wrong</h1>
      <p className="text-xl text-muted-foreground mb-2 max-w-md">
        We&apos;re sorry, but something unexpected happened. Our team has been notified.
      </p>
      <p className="text-sm text-muted-foreground mb-8 font-mono bg-muted/30 p-4 rounded max-w-md break-words">
        {error.message || 'Unknown error'}
      </p>
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="btn-primary"
        >
          Try Again
        </button>
        <Link href="/" className="btn-secondary">
          Go Home
        </Link>
      </div>
    </div>
  )
}
