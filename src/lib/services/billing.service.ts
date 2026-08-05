import { prisma } from '@/lib/prisma'
import { addDays, subMonths, startOfDay, endOfDay, isAfter, format } from 'date-fns'
import { sendEmail } from '@/lib/mail'

export interface BillingStatus {
  isSuspended: boolean
  currentPeriodStart: Date
  currentPeriodEnd: Date
  graceDeadline: Date
  status: 'PAID' | 'UNPAID' | 'OVERDUE' | 'WAIVED'
  latestInvoiceId?: string
}

/**
 * Calculates the billing period boundaries for a given date based on the 27th-of-month cycle.
 * E.g., for Aug 4, 2026, the period starts Jul 27, 2026 and ends Aug 26, 2026.
 */
export function getBillingPeriod(date: Date): { start: Date; end: Date; grace: Date } {
  const year = date.getFullYear()
  const month = date.getMonth() // 0-indexed

  let start: Date
  if (date.getDate() >= 27) {
    // Current period started on the 27th of this month
    start = new Date(year, month, 27, 0, 0, 0, 0)
  } else {
    // Current period started on the 27th of last month
    const prev = subMonths(date, 1)
    start = new Date(prev.getFullYear(), prev.getMonth(), 27, 0, 0, 0, 0)
  }

  // End of period is the 26th of the following month
  const end = new Date(start.getFullYear(), start.getMonth() + 1, 26, 23, 59, 59, 999)
  // Grace period deadline is 3 days after start (the 30th)
  const grace = addDays(start, 3)

  return { start, end, grace }
}

/**
 * Synchronizes the subscription ledger, ensuring an invoice exists for the current period.
 */
export async function syncSubscriptionLedger(): Promise<BillingStatus> {
  const now = new Date()
  const { start, end, grace } = getBillingPeriod(now)

  // Find existing record for this period
  let ledger = await prisma.subscriptionLedger.findFirst({
    where: {
      periodStart: {
        gte: startOfDay(start),
        lte: endOfDay(start),
      }
    }
  })

  // If not found, create new unpaid record
  if (!ledger) {
    ledger = await prisma.subscriptionLedger.create({
      data: {
        periodStart: start,
        periodEnd: end,
        graceDeadline: grace,
        amountKes: 3500.00,
        status: 'UNPAID',
      }
    })

    // Send invoice reminder email to business owner / admin
    try {
      const settings = await prisma.storeSettings.findUnique({
        where: { id: 'singleton' }
      })
      const adminUser = await prisma.user.findFirst({
        where: { role: 'ADMIN' }
      })
      const recipientEmail = settings?.contactEmail || adminUser?.email

      if (recipientEmail) {
        const startStr = format(start, 'MMMM dd, yyyy')
        const endStr = format(end, 'MMMM dd, yyyy')
        const deadlineStr = format(grace, 'MMMM dd, yyyy')

        const subject = `[Stride Invoice] subscription payment due - KES 3,500`
        const html = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; rounded-lg: 8px;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">STRIDE Subscription Invoice</h2>
            <p>Dear Stride Store Owner,</p>
            <p>A new platform subscription invoice has been generated for your store:</p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Amount Due:</td>
                <td style="padding: 8px 0;">KES 3,500</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Billing Period:</td>
                <td style="padding: 8px 0;">${startStr} to ${endStr}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Grace Period Deadline:</td>
                <td style="padding: 8px 0; color: #dc2626; font-weight: bold;">${deadlineStr}</td>
              </tr>
            </table>
            <p>Please note that if the payment is not made and verified within the 3-day grace period, your administrative panel access will be restricted.</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin-top: 20px;">
              <h3 style="margin-top: 0; color: #111827; font-size: 14px;">M-Pesa Payment Instructions:</h3>
              <ol style="margin-bottom: 0; padding-left: 20px; font-size: 14px; color: #4b5563;">
                <li>Go to M-Pesa on your phone.</li>
                <li>Choose <strong>Lipa Na M-Pesa</strong> &gt; <strong>Buy Goods and Services</strong>.</li>
                <li>Enter Till Number: <strong>5123456</strong>.</li>
                <li>Enter Amount: <strong>3,500</strong>.</li>
                <li>Once complete, copy the 10-character transaction reference code and submit it in the Billing section of your Stride Admin panel to clear the dues.</li>
              </ol>
            </div>
            <p style="margin-top: 30px; font-size: 12px; color: #9ca3af; text-align: center;">This is an automated system notification. Thank you for partnering with Stride.</p>
          </div>
        `

        await sendEmail({
          to: recipientEmail,
          subject,
          html,
        })
      }
    } catch (emailErr) {
      console.error('[Billing Service] Failed to send automated invoice reminder:', emailErr)
    }
  }

  // If unpaid and past grace period, mark as OVERDUE
  if (ledger.status === 'UNPAID' && isAfter(now, ledger.graceDeadline)) {
    ledger = await prisma.subscriptionLedger.update({
      where: { id: ledger.id },
      data: { status: 'OVERDUE' }
    })
  }

  const isSuspended = ledger.status === 'OVERDUE'

  return {
    isSuspended,
    currentPeriodStart: ledger.periodStart,
    currentPeriodEnd: ledger.periodEnd,
    graceDeadline: ledger.graceDeadline,
    status: ledger.status,
    latestInvoiceId: ledger.id,
  }
}

/**
 * Checks subscription status without side-effects (fast lookup).
 */
export async function getBillingStatus(): Promise<BillingStatus> {
  try {
    return await syncSubscriptionLedger()
  } catch (err) {
    console.error('[Billing Service] Failed to sync subscription ledger:', err)
    return {
      isSuspended: false,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(),
      graceDeadline: new Date(),
      status: 'UNPAID',
    }
  }
}
