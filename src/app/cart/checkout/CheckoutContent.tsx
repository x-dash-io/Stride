'use client'

import dynamic from 'next/dynamic'
import { CheckoutPageSkeleton } from '@/components/skeleton-loader'

const CheckoutClient = dynamic(() => import('./CheckoutClient').then(mod => mod.CheckoutClient), {
  ssr: false,
  loading: () => <CheckoutPageSkeleton />,
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