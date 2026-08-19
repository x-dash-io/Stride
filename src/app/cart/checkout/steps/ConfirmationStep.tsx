'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, ChevronRight, Smartphone } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { formatPrice } from '@/lib/utils'

interface ConfirmationStepProps {
  orderNumber: string
  paymentMethod?: 'MPESA_STK_PUSH' | 'CASH_ON_DELIVERY'
  onContinueShopping: () => void
  onViewOrders: () => void
}

export function ConfirmationStep({ orderNumber, paymentMethod, onContinueShopping, onViewOrders }: ConfirmationStepProps) {
  const isCod = paymentMethod === 'CASH_ON_DELIVERY'

  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Check className="w-8 h-8 text-green-600" />
      </div>
      <h2 className="text-3xl font-serif font-bold mb-3">Order Confirmed!</h2>
      <p className="text-muted-foreground mb-6 text-lg">
        Thank you for your purchase. Your order has been received and is being processed.
      </p>
      <div className="bg-muted/30 rounded-lg p-6 mb-8 inline-block">
        <p className="text-sm text-muted-foreground mb-1">Order Number</p>
        <p className="text-2xl font-bold font-mono">{orderNumber}</p>
      </div>

      {isCod && (
        <div className="max-w-md mx-auto mb-8 text-left bg-primary/5 border border-primary/20 rounded-lg p-4 flex gap-3">
          <div className="w-9 h-9 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-sm">Have your phone ready</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              You&apos;ll receive an M-Pesa prompt to pay when your order arrives, so keep your phone nearby and make sure it&apos;s registered for M-Pesa.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <p className="text-muted-foreground">You&apos;ll receive a confirmation email shortly with tracking information.</p>
        <div className="flex gap-3 justify-center">
          <Button onClick={onViewOrders}>View Orders</Button>
          <Button variant="outline" onClick={onContinueShopping}>Continue Shopping</Button>
        </div>
      </div>
    </div>
  )
}