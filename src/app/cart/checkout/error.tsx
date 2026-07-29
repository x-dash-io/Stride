'use client'

import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function CheckoutError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Checkout error:', error)
  }, [error])

  return (
    <div className="container-max py-24 min-h-screen flex flex-col items-center justify-center text-center">
      <div className="mb-8">
        <AlertTriangle className="w-24 h-24 text-destructive" />
      </div>
      <h1 className="text-5xl font-serif font-bold mb-4">Checkout Error</h1>
      <p className="text-xl text-muted-foreground mb-8 max-w-md">
        Something went wrong during checkout. Please try again.
      </p>

      <div className="flex gap-4">
        <Button onClick={reset} variant="default">Try Again</Button>
        <Button variant="secondary" asChild><Link href="/cart">Back to Cart</Link></Button>
      </div>
    </div>
  )
}
