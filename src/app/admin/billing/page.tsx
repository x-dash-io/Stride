import { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { BillingClient } from './BillingClient'
import { getBillingStatus } from '@/lib/services/billing.service'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Billing | STRIDE Admin',
}

export default async function BillingPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/')

  const billingData = await getBillingStatus()
  
  const invoices = await prisma.subscriptionLedger.findMany({
    orderBy: { periodStart: 'desc' },
  })

  // Serialize models for safety (Decimals and Dates to JSON strings/numbers)
  const serializedInvoices = invoices.map(inv => ({
    ...inv,
    periodStart: inv.periodStart.toISOString(),
    periodEnd: inv.periodEnd.toISOString(),
    graceDeadline: inv.graceDeadline.toISOString(),
    amountKes: Number(inv.amountKes),
    confirmedAt: inv.confirmedAt?.toISOString() || null,
    createdAt: inv.createdAt.toISOString(),
    updatedAt: inv.updatedAt.toISOString(),
  }))

  const serializedStatus = {
    isSuspended: billingData.isSuspended,
    currentPeriodStart: billingData.currentPeriodStart.toISOString(),
    currentPeriodEnd: billingData.currentPeriodEnd.toISOString(),
    graceDeadline: billingData.graceDeadline.toISOString(),
    status: billingData.status,
    latestInvoiceId: billingData.latestInvoiceId || '',
  }

  return (
    <div className="container-max py-8 min-h-screen">
      <BillingClient
        initialStatus={serializedStatus}
        initialInvoices={serializedInvoices}
        userId={session.user.id}
      />
    </div>
  )
}
