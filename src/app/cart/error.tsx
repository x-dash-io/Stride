'use client'

import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

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
    <div className="container-max py-24 min-h-screen flex flex-col items-center justify-center text-center">
      <div className="mb-8">
        <AlertTriangle className="w-24 h-24 text-destructive" />
      </div>
      <h1 className="text-5xl font-serif font-bold mb-4">Something Went Wrong with Your Cart</h1>
      <p className="text-xl text-muted-foreground mb-8 max-w-md">
        We encountered an issue loading your cart. Please try again.
      </p>

      <div className="flex gap-4">
        <Button onClick={reset} variant="default">Try Again</Button>
        <Button variant="secondary" asChild><Link href="/">Go Home</Link></Button>
      </div>
    </div>
  )
}
