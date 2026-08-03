'use client'

import { formatPrice } from '@/lib/utils'
import { Package, Truck, Shield, RotateCcw, Headphones, ArrowRight } from 'lucide-react'
import { Cart } from '@/types'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface OrderSummaryProps {
  cart: Cart
}

export function OrderSummary({ cart }: OrderSummaryProps) {
  const subtotal = cart.subtotal || 0
  const tax = Math.round(subtotal * 0.16)
  const shipping = subtotal >= 10000 ? 0 : 500
  const total = subtotal + tax + shipping

  return (
    <div className="sticky top-24">
      <Card className="border">
        <CardHeader className="pb-4">
          <CardTitle>Order Summary</CardTitle>
          <CardDescription>Review your order details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-b pb-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax (16%)</span>
              <span className="font-medium">{formatPrice(tax)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                Shipping
                {shipping === 0 && <span className="text-green-600 text-xs">Free</span>}
              </span>
              <span className="font-medium">
                {shipping === 0 ? 'Free' : formatPrice(shipping)}
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-4 border-t">
            <div className="col-span-4 flex flex-col items-center gap-1 p-3 bg-muted/30 rounded-lg">
              <Package className="w-5 h-5 text-primary" />
              <span className="text-xs font-medium">Secure packaging</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t">
            <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium text-green-700">Secure Payment</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
              <RotateCcw className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-700">Easy Returns</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}