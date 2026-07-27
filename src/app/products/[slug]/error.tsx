'use client'

import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { useEffect } from 'react'

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
    <div className="container-max py-24 min-h-screen flex flex-col items-center justify-center text-center">
      <div className="mb-8">
        <AlertTriangle className="w-24 h-24 text-destructive" />
      </div>
      <h1 className="text-5xl font-serif font-bold mb-4">Failed to Load Product</h1>
      <p className="text-xl text-muted-foreground mb-2 max-w-md">
        We couldn&apos;t load this product&apos;s details. It may have been removed or is temporarily unavailable.
      </p>
      <p className="text-sm text-muted-foreground mb-8 font-mono bg-muted/30 p-4 rounded max-w-md break-words">
        {error.message || 'Unknown error'}
      </p>
      <div className="flex gap-4">
        <button onClick={reset} className="btn-primary">Try Again</button>
        <Link href="/products" className="btn-secondary">Back to Products</Link>
      </div>
    </div>
  )
}
