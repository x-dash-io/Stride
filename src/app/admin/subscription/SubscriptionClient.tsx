'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CreditCard, Check, AlertTriangle, Loader2 } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { format } from 'date-fns'
import { useToast } from '@/providers/ToastProvider'

interface Invoice {
  id: string
  periodStart: string
  periodEnd: string
  graceDeadline: string
  amountKes: number
  status: 'PAID' | 'UNPAID' | 'OVERDUE' | 'WAIVED'
  mpesaRef: string | null
  confirmedAt: string | null
}

interface SubscriptionClientProps {
  initialStatus: {
    isSuspended: boolean
    currentPeriodStart: string
    currentPeriodEnd: string
    graceDeadline: string
    status: 'PAID' | 'UNPAID' | 'OVERDUE' | 'WAIVED'
    latestInvoiceId: string
  }
  initialInvoices: Invoice[]
  userId: string
}

export function SubscriptionClient({ initialStatus, initialInvoices, userId }: SubscriptionClientProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices)
  const [billingStatus, setBillingStatus] = useState(initialStatus)
  const [mpesaRef, setMpesaRef] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmitReference = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mpesaRef.trim()) return showToast('error', 'Please enter reference code')

    setIsSubmitting(true)
    try {
      const csrfRes = await fetch('/api/csrf')
      const { csrfToken } = await csrfRes.json()

      const res = await fetch('/api/admin/billing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          invoiceId: billingStatus.latestInvoiceId,
          mpesaRef: mpesaRef.toUpperCase().trim(),
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to submit payment reference')
      }

      showToast('success', 'Payment reference submitted successfully! The manager will verify and approve.')
      setMpesaRef('')
      
      // Refresh list
      const refreshRes = await fetch('/api/admin/billing')
      const refreshed = await refreshRes.json()
      setInvoices(refreshed.invoices)
      setBillingStatus(refreshed.status)
      
      router.refresh()
    } catch (error: any) {
      showToast('error', error.message || 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold font-serif text-slate-900 dark:text-white">Store Subscription</h1>
        <p className="text-sm text-muted-foreground mt-1">Submit payment reference codes and track your store billing status.</p>
      </div>

      {billingStatus.isSuspended && (
        <div className="relative overflow-hidden rounded-xl border border-red-200 bg-red-50/50 p-5 dark:border-red-900/30 dark:bg-red-950/20 backdrop-blur-sm">
          <div className="flex gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-red-950 dark:text-red-200">Access Temporarily Suspended</h3>
              <p className="mt-1 text-sm text-red-800/90 dark:text-red-300/90 leading-relaxed">
                Your store's subscription due for the period beginning {format(new Date(billingStatus.currentPeriodStart), 'MMM d, yyyy')} has not been cleared, and the 3-day grace period has expired. The public storefront is currently set to offline. Please pay to reactivate the store.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Status Card */}
        <Card className="border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm md:col-span-1">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-serif">Billing Status</CardTitle>
            <CardDescription className="text-xs">Current active period info</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <span
                className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  billingStatus.status === 'PAID'
                    ? 'bg-green-100 text-green-800'
                    : billingStatus.status === 'WAIVED'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-red-100 text-red-800 animate-pulse'
                }`}
              >
                {billingStatus.status}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm border-t border-slate-100 dark:border-zinc-850 pt-3">
              <span className="text-muted-foreground">Hosting Cost</span>
              <span className="font-semibold text-slate-800 dark:text-zinc-200">{formatPrice(3500)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Period Start</span>
              <span className="text-slate-800 dark:text-zinc-200">{format(new Date(billingStatus.currentPeriodStart), 'MMM d, yyyy')}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Period End</span>
              <span className="text-slate-800 dark:text-zinc-200">{format(new Date(billingStatus.currentPeriodEnd), 'MMM d, yyyy')}</span>
            </div>
            <div className="flex items-center justify-between text-sm border-t border-slate-100 dark:border-zinc-850 pt-3">
              <span className="text-muted-foreground font-medium">Grace Deadline</span>
              <span className="text-destructive font-semibold">
                {format(new Date(billingStatus.graceDeadline), 'MMM d, yyyy')}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Instructions */}
        <Card className="border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm md:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-serif">
              <CreditCard className="w-5 h-5 text-primary" /> Pay Platform Dues
            </CardTitle>
            <CardDescription className="text-xs">Follow instructions to clear outstanding hosting dues</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-slate-50 dark:bg-zinc-800/40 p-5 rounded-xl border border-slate-100 dark:border-zinc-800/60 space-y-3">
              <h3 className="font-semibold text-sm text-slate-800 dark:text-zinc-200">M-Pesa Payment Instructions:</h3>
              <ol className="list-decimal pl-5 text-sm space-y-2 text-slate-600 dark:text-zinc-400">
                <li>Go to M-Pesa on your phone.</li>
                <li>Choose <strong>Lipa Na M-Pesa</strong> &gt; <strong>Buy Goods and Services</strong>.</li>
                <li>Enter Till Number: <strong className="text-slate-900 dark:text-white font-bold">5123456</strong>.</li>
                <li>Enter Amount: <strong className="text-slate-900 dark:text-white font-bold">KES 3,500</strong>.</li>
                <li>Complete transaction. Copy/paste the transaction reference below.</li>
              </ol>
            </div>

            {billingStatus.status !== 'PAID' && billingStatus.status !== 'WAIVED' ? (
              <form onSubmit={handleSubmitReference} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mpesaRef" className="text-sm font-semibold">M-Pesa Transaction Reference Code</Label>
                  <Input
                    id="mpesaRef"
                    value={mpesaRef}
                    onChange={(e) => setMpesaRef(e.target.value)}
                    placeholder="e.g. SGH538JK23"
                    className="font-mono text-base uppercase bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800"
                    maxLength={10}
                    required
                  />
                  <p className="text-xs text-muted-foreground">The 10-character code received in your Safaricom M-Pesa message.</p>
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto transition-all">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...
                    </>
                  ) : (
                    'Submit Payment Code'
                  )}
                </Button>
              </form>
            ) : (
              <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-xl border border-emerald-200/60 dark:border-emerald-900/30">
                <Check className="w-5 h-5 flex-shrink-0" />
                <span className="font-semibold text-sm leading-relaxed">Your subscription for the current period is active and fully paid. Thank you!</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Invoice History */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 dark:border-zinc-800">
          <h2 className="font-serif font-bold text-lg text-slate-900 dark:text-white">Invoice & Billing History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-zinc-800/40 border-b border-slate-100 dark:border-zinc-800 text-slate-600 dark:text-zinc-400">
                <th className="p-4 font-semibold text-xs uppercase tracking-wider">Period</th>
                <th className="p-4 font-semibold text-xs uppercase tracking-wider">Amount</th>
                <th className="p-4 font-semibold text-xs uppercase tracking-wider">Status</th>
                <th className="p-4 font-semibold text-xs uppercase tracking-wider">Submitted Ref</th>
                <th className="p-4 font-semibold text-xs uppercase tracking-wider">Confirmed At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {invoices.length > 0 ? (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-slate-50/30 dark:hover:bg-zinc-800/10 transition-colors">
                    <td className="p-4 text-sm font-medium text-slate-800 dark:text-zinc-200">
                      {format(new Date(invoice.periodStart), 'MMM d, yyyy')} – {format(new Date(invoice.periodEnd), 'MMM d, yyyy')}
                    </td>
                    <td className="p-4 font-bold text-sm text-slate-900 dark:text-white">{formatPrice(invoice.amountKes)}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                          invoice.status === 'PAID'
                            ? 'bg-green-100 text-green-800'
                            : invoice.status === 'WAIVED'
                            ? 'bg-blue-100 text-blue-800'
                            : invoice.status === 'OVERDUE'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-mono text-slate-700 dark:text-zinc-300">{invoice.mpesaRef || '—'}</td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {invoice.confirmedAt ? format(new Date(invoice.confirmedAt), 'MMM d, yyyy HH:mm') : '—'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground text-sm">
                    No billing history found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
