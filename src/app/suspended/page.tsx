import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { getBillingStatus } from '@/lib/services/billing.service'
import { redirect } from 'next/navigation'
import { ShoppingBag } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Temporarily Offline | STRIDE',
}

export default async function SuspendedStorePage() {
  // If the store is actually NOT suspended, redirect back home
  const billing = await getBillingStatus()
  if (!billing.isSuspended) {
    redirect('/')
  }

  const settings = await prisma.storeSettings.findUnique({
    where: { id: 'singleton' }
  })

  const storeName = settings?.storeName || 'STRIDE'
  const contactEmail = settings?.contactEmail || 'support@stride.co.ke'
  const contactPhone = settings?.contactPhone || '+254 700 000 000'

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center space-y-8 p-8 bg-card border border-border rounded-2xl shadow-xl">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight mt-4">{storeName}</h1>
        </div>

        <div className="space-y-4">
          <p className="text-xl font-semibold text-foreground">Store Temporarily Offline</p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            We are currently performing scheduled maintenance or updating our system. We will be back online shortly!
          </p>
        </div>

        <div className="border-t border-border pt-6 space-y-2 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Need help?</p>
          {contactEmail && <p>Email: <a href={`mailto:${contactEmail}`} className="underline hover:text-foreground">{contactEmail}</a></p>}
          {contactPhone && <p>Phone: <span className="text-foreground">{contactPhone}</span></p>}
        </div>
      </div>
    </div>
  )
}
