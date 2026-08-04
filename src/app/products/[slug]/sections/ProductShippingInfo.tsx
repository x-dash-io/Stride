import { Truck, Smartphone } from 'lucide-react'

export function ProductShippingInfo() {
  return (
    <div className="bg-muted/30 rounded-xl p-6 mb-8 space-y-3">
      <div className="flex items-start gap-3">
        <Truck className="w-6 h-6 text-primary" />
        <div>
          <p className="font-semibold">Kenyan Delivery</p>
          <p className="text-sm text-muted-foreground">Fast 1-3 days delivery across Kenya</p>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <Smartphone className="w-6 h-6 text-primary" />
        <div>
          <p className="font-semibold">M-Pesa Payment</p>
          <p className="text-sm text-muted-foreground">Secure M-Pesa STK Push prompt</p>
        </div>
      </div>
    </div>
  )
}