'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CreditCard, Check, AlertTriangle, ShieldCheck, HelpCircle, Loader2 } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { format } from 'date-fns'

interface Invoice {
  id: string
  periodStart: string
  periodEnd: string
  graceDeadline: string
  amountKes: number
  status: 'PAID' | 'UNPAID' | 'OVERDUE' | 'WAIVED'
  mpesaRef: string | null
  confirmedAt: string | null
  confirmedBy: string | null
  notes: string | null
}

interface BillingClientProps {
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

export function BillingClient({ initialStatus, initialInvoices, userId }: BillingClientProps) {
  const router = useRouter()
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices)
  const [billingStatus, setBillingStatus] = useState(initialStatus)
  const [mpesaRef, setMpesaRef] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Manager confirmation states
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null)
  const [managerStatus, setManagerStatus] = useState<'PAID' | 'UNPAID' | 'OVERDUE' | 'WAIVED'>('PAID')
  const [managerNotes, setManagerNotes] = useState('')
  const [isManagerSubmitting, setIsManagerSubmitting] = useState(false)

  const handleSubmitReference = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mpesaRef.trim()) return alert('Please enter reference code')

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

      alert('Payment reference submitted successfully! The manager will verify and approve.')
      setMpesaRef('')
      
      // Refresh list
      const refreshRes = await fetch('/api/admin/billing')
      const refreshed = await refreshRes.json()
      setInvoices(refreshed.invoices)
      setBillingStatus(refreshed.status)
      
      router.refresh()
    } catch (error: any) {
      alert(error.message || 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleManagerUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedInvoiceId) return

    setIsManagerSubmitting(true)
    try {
      const csrfRes = await fetch('/api/csrf')
      const { csrfToken } = await csrfRes.json()

      const res = await fetch(`/api/admin/billing/${selectedInvoiceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          status: managerStatus,
          notes: managerNotes || null,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to update status')
      }

      alert('Subscription status updated successfully!')
      setSelectedInvoiceId(null)
      setManagerNotes('')
      
      // Refresh list
      const refreshRes = await fetch('/api/admin/billing')
      const refreshed = await refreshRes.json()
      setInvoices(refreshed.invoices)
      setBillingStatus(refreshed.status)

      router.refresh()
    } catch (error: any) {
      alert(error.message || 'Failed to update')
    } finally {
      setIsManagerSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Admin Nav Tabs */}
      <div className="flex border-b border-border gap-4 pb-1">
        <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
          <a href="/admin">Dashboard</a>
        </Button>
        <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
          <a href="/admin/products">Products</a>
        </Button>
        <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
          <a href="/admin/orders">Orders</a>
        </Button>
        <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
          <a href="/admin/settings/shipping">Shipping Zones</a>
        </Button>
        <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
          <a href="/admin/settings/store">Store Settings</a>
        </Button>
        <Button variant="ghost" asChild className="border-b-2 border-primary rounded-none px-1 text-foreground font-semibold">
          <a href="/admin/billing">Billing</a>
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-serif">Platform Subscription</h1>
          <p className="text-sm text-muted-foreground">Manage your monthly store hosting subscription dues</p>
        </div>
      </div>

      {billingStatus.isSuspended && (
        <Alert variant="destructive" className="border-red-500 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <AlertTitle className="font-bold text-base">Store Access Suspended</AlertTitle>
          <AlertDescription className="mt-1">
            Your store's subscription due for the period beginning {format(new Date(billingStatus.currentPeriodStart), 'MMM d, yyyy')} has not been cleared, and the 3-day grace period has expired. The public storefront is currently set to offline. Please pay to reactivate the store.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Status Card */}
        <Card className="border border-border md:col-span-1">
          <CardHeader>
            <CardTitle>Current Status</CardTitle>
            <CardDescription>Store subscription details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <span
                className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
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
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Monthly Cost</span>
              <span className="font-semibold">{formatPrice(3500)}</span>
            </div>
            <div className="flex items-center justify-between text-sm border-t pt-2">
              <span className="text-muted-foreground">Period Start</span>
              <span>{format(new Date(billingStatus.currentPeriodStart), 'MMM d, yyyy')}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Period End</span>
              <span>{format(new Date(billingStatus.currentPeriodEnd), 'MMM d, yyyy')}</span>
            </div>
            <div className="flex items-center justify-between text-sm border-t pt-2">
              <span className="text-muted-foreground font-medium">Grace Deadline</span>
              <span className="text-destructive font-semibold">
                {format(new Date(billingStatus.graceDeadline), 'MMM d, yyyy')}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Instructions */}
        <Card className="border border-border md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" /> Pay Platform Dues
            </CardTitle>
            <CardDescription>Follow instructions to clear outstanding hosting dues</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/40 p-4 rounded-xl space-y-2 border border-border">
              <h3 className="font-semibold text-sm">Payment Instructions:</h3>
              <ol className="list-decimal pl-5 text-sm space-y-1.5 text-muted-foreground">
                <li>Go to M-Pesa on your phone.</li>
                <li>Choose <strong>Lipa Na M-Pesa</strong> &gt; <strong>Buy Goods and Services</strong>.</li>
                <li>Enter Till Number: <strong className="text-foreground text-base">5123456</strong> (or your configured Till).</li>
                <li>Enter Amount: <strong className="text-foreground text-base">KES 3,500</strong>.</li>
                <li>Complete transaction. Copy/paste the transaction reference below.</li>
              </ol>
            </div>

            {billingStatus.status !== 'PAID' && billingStatus.status !== 'WAIVED' ? (
              <form onSubmit={handleSubmitReference} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mpesaRef">M-Pesa Transaction Reference Code</Label>
                  <Input
                    id="mpesaRef"
                    value={mpesaRef}
                    onChange={(e) => setMpesaRef(e.target.value)}
                    placeholder="e.g. SGH538JK23"
                    className="font-mono text-base uppercase"
                    maxLength={10}
                    required
                  />
                  <p className="text-xs text-muted-foreground">The 10-character code received in your Safaricom M-Pesa message.</p>
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
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
              <div className="flex items-center gap-2 text-green-600 bg-green-50 p-4 rounded-lg border border-green-200">
                <Check className="w-5 h-5" />
                <span className="font-medium text-sm">Your subscription for the current period is active and fully paid. Thank you!</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Developer / Manager Admin Action Box */}
      <Card className="border border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <ShieldCheck className="w-5 h-5 text-primary" /> Manager Verification Console
          </CardTitle>
          <CardDescription>Use this panel to confirm and mark client invoices as paid or waived.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedInvoiceId ? (
            <form onSubmit={handleManagerUpdate} className="space-y-4 max-w-md border border-border p-4 rounded-lg bg-background">
              <h3 className="font-semibold text-sm">Update Invoice Status</h3>
              <div className="space-y-2">
                <Label htmlFor="managerStatus">Set Status</Label>
                <select
                  id="managerStatus"
                  value={managerStatus}
                  onChange={(e: any) => setManagerStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                >
                  <option value="PAID">PAID</option>
                  <option value="UNPAID">UNPAID</option>
                  <option value="OVERDUE">OVERDUE</option>
                  <option value="WAIVED">WAIVED</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="managerNotes">Manager Notes / Transaction verification</Label>
                <Input
                  id="managerNotes"
                  value={managerNotes}
                  onChange={(e) => setManagerNotes(e.target.value)}
                  placeholder="e.g. Confirmed payment reference"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isManagerSubmitting} size="sm">
                  {isManagerSubmitting ? 'Saving...' : 'Save Status'}
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setSelectedInvoiceId(null)}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <p className="text-xs text-muted-foreground">Select an invoice below to update its status or confirm a reference code.</p>
          )}
        </CardContent>
      </Card>

      {/* Invoice History */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold">Invoice & Billing History</h2>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="p-4 font-semibold text-sm">Period</th>
              <th className="p-4 font-semibold text-sm">Amount</th>
              <th className="p-4 font-semibold text-sm">Status</th>
              <th className="p-4 font-semibold text-sm">Submitted Ref</th>
              <th className="p-4 font-semibold text-sm">Confirmed At</th>
              <th className="p-4 font-semibold text-sm text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {invoices.length > 0 ? (
              invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-muted/30">
                  <td className="p-4 text-sm">
                    {format(new Date(invoice.periodStart), 'MMM d, yyyy')} – {format(new Date(invoice.periodEnd), 'MMM d, yyyy')}
                  </td>
                  <td className="p-4 font-semibold text-sm">{formatPrice(invoice.amountKes)}</td>
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
                  <td className="p-4 text-sm font-mono">{invoice.mpesaRef || '—'}</td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {invoice.confirmedAt ? format(new Date(invoice.confirmedAt), 'MMM d, yyyy HH:mm') : '—'}
                  </td>
                  <td className="p-4 text-right">
                    <Button variant="outline" size="sm" onClick={() => {
                      setSelectedInvoiceId(invoice.id)
                      setManagerStatus(invoice.status)
                      setManagerNotes(invoice.notes || '')
                    }}>
                      Manage
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  No billing history found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
