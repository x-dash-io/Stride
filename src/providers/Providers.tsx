'use client'

import { SessionProvider } from 'next-auth/react'
import { CartProvider } from './CartProvider'
import { ToastProvider } from './ToastProvider'
import { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </CartProvider>
    </SessionProvider>
  )
}