import { RotateCcw, Shield } from 'lucide-react'

export function ProductShippingInfo() {
  return (
    <div className="bg-muted/30 rounded-xl p-6 mb-8 space-y-3">
      <div className="flex items-start gap-3">
        <RotateCcw className="w-6 h-6 text-primary" />
        <div>
          <p className="font-semibold">Easy Returns</p>
          <p className="text-sm text-muted-foreground">30-day return policy</p>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <Shield className="w-6 h-6 text-primary" />
        <div>
          <p className="font-semibold">Secure Payment</p>
          <p className="text-sm text-muted-foreground">M-Pesa & Card payments</p>
        </div>
      </div>
    </div>
  )
}