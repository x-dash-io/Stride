'use client'

import dynamic from 'next/dynamic'
import { CheckoutFormSkeleton } from '@/components/skeleton-loader'

const CheckoutClient = dynamic(() => import('./CheckoutClient').then(mod => mod.CheckoutClient), {
  ssr: false,
  loading: () => (
    <>
      <div className="container-max py-12">
        <div className="h-10 bg-muted rounded w-1/4 animate-pulse mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <CheckoutFormSkeleton />
          <div className="space-y-4 animate-pulse">
            <div className="h-6 bg-muted rounded w-1/3" />
            <div className="h-24 bg-muted rounded" />
            <div className="h-24 bg-muted rounded" />
          </div>
        </div>
      </div>
    </>
  ),
})

interface CheckoutContentProps {
  cart: any
  defaultAddress: any
  userEmail: string
  isGuest: boolean
}

export function CheckoutContent({ cart, defaultAddress, userEmail, isGuest }: CheckoutContentProps) {
  return (
    <CheckoutClient
      cart={cart}
      defaultAddress={defaultAddress}
      userEmail={userEmail}
      isGuest={isGuest}
    />
  )
}