import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { getBillingStatus } from '@/lib/services/billing.service'
import { SubscriptionClient } from './SubscriptionClient'
import { requireStaff } from '@/lib/authz'
import { ADMIN_ROLE } from '@/lib/roles'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'My Store Subscription | STRIDE Admin',
}

export default async function SubscriptionPage() {
  const session = await requireStaff({ roles: [ADMIN_ROLE] })

  const billingData = await getBillingStatus()
  
  const invoices = await prisma.subscriptionLedger.findMany({
    orderBy: { periodStart: 'desc' },
  })

  // Serialize models for safety
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
      <SubscriptionClient
        initialStatus={serializedStatus}
        initialInvoices={serializedInvoices}
        userId={session.user.id}
      />
    </div>
  )
}
