import { requireDeliveryAccess } from '@/lib/authz'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Delivery Portal | STRIDE',
}

export default async function DeliveryLayout({ children }: { children: React.ReactNode }) {
  await requireDeliveryAccess()
  return (
    <div className="min-h-screen bg-muted/30">
      {children}
    </div>
  )
}
