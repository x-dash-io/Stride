'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Check, AlertTriangle, ShieldCheck, Loader2 } from 'lucide-react'
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
  isSuperAdmin: boolean
}

export function BillingClient({ initialStatus, initialInvoices, userId, isSuperAdmin }: BillingClientProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices)
  const [billingStatus, setBillingStatus] = useState(initialStatus)
  
  // Manager confirmation states
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null)
  const [managerStatus, setManagerStatus] = useState<'PAID' | 'UNPAID' | 'OVERDUE' | 'WAIVED'>('PAID')
  const [managerNotes, setManagerNotes] = useState('')
  const [confirmMpesaRef, setConfirmMpesaRef] = useState('')
  const [isManagerSubmitting, setIsManagerSubmitting] = useState(false)

  const selectedInvoice = invoices.find(inv => inv.id === selectedInvoiceId)

  const handleManagerUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedInvoiceId || !selectedInvoice) return

    // If marking as PAID, enforce matching reference code verification
    if (managerStatus === 'PAID') {
      const originalRef = (selectedInvoice.mpesaRef || '').toUpperCase().trim()
      const enteredRef = confirmMpesaRef.toUpperCase().trim()

      if (!originalRef) {
        return showToast('error', 'Cannot mark as PAID. Store Admin has not submitted an M-Pesa reference code yet.')
      }

      if (enteredRef !== originalRef) {
        return showToast('error', `Reference mismatch. You must enter the exact code submitted: ${originalRef}`)
      }
    }

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
          mpesaRef: managerStatus === 'PAID' ? confirmMpesaRef.toUpperCase().trim() : undefined,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to update status')
      }

      showToast('success', 'Subscription status updated successfully!')
      setSelectedInvoiceId(null)
      setManagerNotes('')
      setConfirmMpesaRef('')
      
      // Refresh list
      const refreshRes = await fetch('/api/admin/billing')
      const refreshed = await refreshRes.json()
      setInvoices(refreshed.invoices)
      setBillingStatus(refreshed.status)

      router.refresh()
    } catch (error: any) {
      showToast('error', error.message || 'Failed to update')
    } finally {
      setIsManagerSubmitting(false)
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold font-serif text-slate-900 dark:text-white">Platform Billing & Invoices</h1>
        <p className="text-sm text-muted-foreground mt-1">Super Admin Panel to oversee store hosting ledgers and verify payments.</p>
      </div>

      {billingStatus.isSuspended && (
        <div className="relative overflow-hidden rounded-xl border border-amber-200 bg-amber-50/50 p-5 dark:border-amber-900/30 dark:bg-amber-950/20 backdrop-blur-sm">
          <div className="flex gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-amber-950 dark:text-amber-200">Tenant Store Access Suspended</h3>
              <p className="mt-1 text-sm text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
                The storefront is currently offline because the latest subscription invoice is overdue and the grace period has expired.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Platform Verification Panel */}
      {isSuperAdmin && selectedInvoiceId && selectedInvoice && (
        <Card className="border border-primary/30 bg-primary/5/30 backdrop-blur-sm shadow-md animate-slide-down max-w-xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-serif">
              <ShieldCheck className="w-5 h-5 text-primary" /> Manager Verification Console
            </CardTitle>
            <CardDescription className="text-xs">
              Verify payment reference for period {format(new Date(selectedInvoice.periodStart), 'MMM d')} – {format(new Date(selectedInvoice.periodEnd), 'MMM d')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleManagerUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="managerStatus" className="text-sm font-semibold">Set Status</Label>
                <select
                  id="managerStatus"
                  value={managerStatus}
                  onChange={(e: any) => setManagerStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-sm font-medium"
                >
                  <option value="PAID">PAID</option>
                  <option value="UNPAID">UNPAID</option>
                  <option value="OVERDUE">OVERDUE</option>
                  <option value="WAIVED">WAIVED</option>
                </select>
              </div>

              {managerStatus === 'PAID' && (
                <div className="space-y-2.5 bg-slate-100/50 dark:bg-zinc-900/50 p-4 rounded-lg border border-slate-200/50 dark:border-zinc-800/60">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Submitted M-Pesa Reference:</span>
                    <span className="font-mono font-bold bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20 text-sm">
                      {selectedInvoice.mpesaRef || 'None Submitted'}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="confirmMpesaRef" className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                      Confirm M-Pesa Reference Code
                    </Label>
                    <Input
                      id="confirmMpesaRef"
                      value={confirmMpesaRef}
                      onChange={(e) => setConfirmMpesaRef(e.target.value)}
                      placeholder="Enter matching code to verify"
                      className="font-mono text-base uppercase bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800"
                      required
                    />
                    <p className="text-[10px] text-muted-foreground">Type the exact reference code submitted by the store admin to confirm receipt of funds.</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="managerNotes" className="text-sm font-semibold">Manager Notes / Transaction Audit Info</Label>
                <Input
                  id="managerNotes"
                  value={managerNotes}
                  onChange={(e) => setManagerNotes(e.target.value)}
                  placeholder="e.g. Confirmed KES 3,500 receipt via M-Pesa statement"
                  className="bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <Button type="submit" disabled={isManagerSubmitting} className="flex-1 sm:flex-initial">
                  {isManagerSubmitting ? 'Saving...' : 'Save Verification'}
                </Button>
                <Button type="button" variant="outline" onClick={() => {
                  setSelectedInvoiceId(null)
                  setConfirmMpesaRef('')
                  setManagerNotes('')
                }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Invoice History */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
          <h2 className="font-serif font-bold text-lg text-slate-900 dark:text-white">Platform Invoice Ledger</h2>
          <span className="text-xs text-muted-foreground font-semibold">Showing all billing entries</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-zinc-800/40 border-b border-slate-100 dark:border-zinc-800 text-slate-600 dark:text-zinc-400">
                <th className="p-4 font-semibold text-xs uppercase tracking-wider">Period</th>
                <th className="p-4 font-semibold text-xs uppercase tracking-wider">Amount</th>
                <th className="p-4 font-semibold text-xs uppercase tracking-wider">Status</th>
                <th className="p-4 font-semibold text-xs uppercase tracking-wider">Submitted Ref</th>
                <th className="p-4 font-semibold text-xs uppercase tracking-wider">Confirmed At</th>
                {isSuperAdmin && <th className="p-4 font-semibold text-xs uppercase tracking-wider text-right">Action</th>}
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
                            ? 'bg-red-100 text-red-800 animate-pulse'
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
                    {isSuperAdmin && (
                      <td className="p-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedInvoiceId(invoice.id)
                            setManagerStatus(invoice.status)
                            setManagerNotes(invoice.notes || '')
                            setConfirmMpesaRef('')
                          }}
                          className="hover:border-primary hover:text-primary transition-all"
                        >
                          Verify
                        </Button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground text-sm">
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
