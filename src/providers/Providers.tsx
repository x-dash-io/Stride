'use client'

import { SessionProvider } from 'next-auth/react'
import { CartProvider } from './CartProvider'
import { ToastProvider } from './ToastProvider'
import { ThemeProvider } from './ThemeProvider'
import { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <CartProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </CartProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}