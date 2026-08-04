import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { getBillingStatus } from '@/lib/services/billing.service'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ShoppingBag, Clock, Mail, Phone, ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Temporarily Offline | STRIDE',
  description: 'This store is temporarily offline. Please check back soon.',
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
  const storeTagline = settings?.storeTagline || 'Premium Footwear'
  const contactEmail = settings?.contactEmail || 'support@stride.co.ke'
  const contactPhone = settings?.contactPhone || '+254 700 000 000'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted/30 px-4 py-16">
      {/* Soft background pattern */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-md w-full space-y-8">
        {/* Brand header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 border border-primary/15 shadow-lg shadow-primary/10 mb-2">
            <ShoppingBag className="w-10 h-10 text-primary" />
          </div>
          <h1 className="font-serif text-4xl font-bold tracking-tight">{storeName}</h1>
          <p className="text-muted-foreground text-sm tracking-widest uppercase font-medium">{storeTagline}</p>
        </div>

        {/* Main message card */}
        <div className="bg-card border border-border rounded-2xl shadow-xl shadow-black/5 p-8 space-y-5">
          <div className="flex items-center gap-3 pb-5 border-b border-border">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Temporarily Unavailable</h2>
              <p className="text-xs text-muted-foreground mt-0.5">We&apos;ll be back shortly</p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            {storeName} is currently undergoing a brief maintenance period. All existing orders are safe and will be fulfilled as normal.
          </p>

          <p className="text-sm text-muted-foreground leading-relaxed">
            We apologize for any inconvenience and appreciate your patience. Please check back in a little while.
          </p>

          {/* Contact info */}
          <div className="pt-4 border-t border-border space-y-3">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Need help? Contact us:</p>
            <div className="space-y-2">
              {contactEmail && (
                <a
                  href={`mailto:${contactEmail}`}
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span>{contactEmail}</span>
                </a>
              )}
              {contactPhone && (
                <a
                  href={`tel:${contactPhone.replace(/\s/g, '')}`}
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span>{contactPhone}</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} {storeName}. All rights reserved.
        </p>
      </div>
    </div>
  )
}
