'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/providers/ToastProvider'
import { Check, ChevronRight, Play } from 'lucide-react'

export const ORDER_FLOW = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED'] as const

export const PAYMENT_STATUSES = ['PENDING', 'AUTHORIZED', 'CAPTURED', 'REFUNDED', 'FAILED', 'PARTIALLY_REFUNDED'] as const

const ALL_STATUSES = [...ORDER_FLOW, 'ON_HOLD', 'CANCELLED', 'RETURNED', 'REFUNDED'] as const

interface OrderStatusManagerProps {
  orderId: string
  orderNumber: string
  status: string
  paymentStatus: string
}

export function OrderStatusManager({ orderId, orderNumber, status, paymentStatus }: OrderStatusManagerProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string>(status)
  const [selectedPayment, setSelectedPayment] = useState<string>(paymentStatus)

  const currentIndex = ORDER_FLOW.indexOf(status as (typeof ORDER_FLOW)[number])
  const nextStatus = currentIndex >= 0 && currentIndex < ORDER_FLOW.length - 1 ? ORDER_FLOW[currentIndex + 1] : null

  const updateStatus = async (newStatus: string) => {
    if (newStatus === status) return
    setIsSubmitting(true)
    try {
      const csrfRes = await fetch('/api/csrf')
      const { csrfToken } = await csrfRes.json()
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update status')
      showToast('success', `Order ${orderNumber} marked as ${newStatus.replace(/_/g, ' ').toLowerCase()}`)
      router.refresh()
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to update status')
    } finally {
      setIsSubmitting(false)
    }
  }

  const updatePayment = async (newPayment: string) => {
    if (newPayment === paymentStatus) return
    setIsSubmitting(true)
    try {
      const csrfRes = await fetch('/api/csrf')
      const { csrfToken } = await csrfRes.json()
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
        body: JSON.stringify({ paymentStatus: newPayment }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update payment')
      showToast('success', 'Payment status updated')
      router.refresh()
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to update payment')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-5">
      {currentIndex >= 0 && (
        <div className="flex items-center justify-between">
          {ORDER_FLOW.map((step, i) => (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-colors ${
                    i < currentIndex
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : i === currentIndex
                        ? 'bg-accent border-accent text-white'
                        : 'border-border text-muted-foreground'
                  }`}
                >
                  {i < currentIndex ? <Check className="w-4 h-4" /> : <span className="w-4 text-center">{i + 1}</span>}
                </div>
                <span
                  className={`text-[10px] uppercase tracking-wide whitespace-nowrap ${
                    i <= currentIndex ? 'text-foreground font-semibold' : 'text-muted-foreground'
                  }`}
                >
                  {step.replace(/_/g, ' ')}
                </span>
              </div>
              {i < ORDER_FLOW.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 mb-5 ${i < currentIndex ? 'bg-emerald-500' : 'bg-border'}`} />
              )}
            </div>
          ))}
        </div>
      )}

      {nextStatus && (
        <Button className="w-full" disabled={isSubmitting} onClick={() => updateStatus(nextStatus)}>
          <Play className="w-4 h-4" /> Advance to {nextStatus.replace(/_/g, ' ').toLowerCase()}
        </Button>
      )}

      <div className="grid gap-3">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">Set status</span>
          <div className="flex items-center gap-2">
            <Select
              value={selectedStatus}
              onValueChange={(value) => {
                setSelectedStatus(value)
                void updateStatus(value)
              }}
            >
              <SelectTrigger className="w-52" aria-label="Order status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALL_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">Payment status</span>
          <div className="flex items-center gap-2">
            <Select
              value={selectedPayment}
              onValueChange={(value) => {
                setSelectedPayment(value)
                void updatePayment(value)
              }}
            >
              <SelectTrigger className="w-52" aria-label="Payment status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </div>
    </div>
  )
}
