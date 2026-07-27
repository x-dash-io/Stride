'use client'

import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { useEffect } from 'react'

export default function OrdersError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Orders page error:', error)
  }, [error])

  return (
    <div className="container-max py-24 min-h-screen flex flex-col items-center justify-center text-center">
      <div className="mb-8">
        <AlertTriangle className="w-24 h-24 text-destructive" />
      </div>
      <h1 className="text-5xl font-serif font-bold mb-4">Failed to Load Orders</h1>
      <p className="text-xl text-muted-foreground mb-8 max-w-md">
        We couldn&apos;t retrieve your order history. Please try again.
      </p>

      <div className="flex gap-4">
        <button onClick={reset} className="btn-primary">Try Again</button>
        <Link href="/account" className="btn-secondary">Back to Account</Link>
      </div>
    </div>
  )
}
