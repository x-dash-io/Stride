'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  MapPin,
  Phone,
  Package,
  CheckCircle,
  Loader2,
  RefreshCw,
  Smartphone,
  AlertCircle,
  Clock,
  Truck,
  LogOut,
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { formatPrice } from '@/lib/utils'

interface DeliveryOrder {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  paymentMethod: string
  grandTotal: number
  shippingAddress: {
    firstName: string
    lastName: string
    addressLine1: string
    addressLine2?: string | null
    city: string
    state: string
    phone: string
  } | null
  user: { name: string | null; phone: string | null; email: string } | null
  items: Array<{
    quantity: number
    variant: { product: { name: string } }
  }>
  payments: Array<{ status: string }>
}

interface DeliveryDashboardProps {
  agentName: string
  agentId: string
}

const STATUS_COLOR: Record<string, string> = {
  SHIPPED: 'bg-indigo-100 text-indigo-800',
  IN_TRANSIT: 'bg-blue-100 text-blue-800',
}

export function DeliveryDashboard({ agentName }: DeliveryDashboardProps) {
  const [orders, setOrders] = useState<DeliveryOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stkPending, setStkPending] = useState<Record<string, boolean>>({})
  const [stkResult, setStkResult] = useState<Record<string, { type: 'success' | 'error'; message: string }>>({})

  const fetchOrders = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/delivery/orders?status=SHIPPED,IN_TRANSIT')
      const data = await res.json()
      setOrders(data.orders ?? [])
    } catch {
      // silently fail — UI shows empty state
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const sendStkPush = async (orderId: string) => {
    setStkPending((p) => ({ ...p, [orderId]: true }))
    setStkResult((r) => {
      const next = { ...r }
      delete next[orderId]
      return next
    })

    try {
      const res = await fetch('/api/delivery/stk-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      })
      const data = await res.json()

      if (!res.ok) {
        setStkResult((r) => ({ ...r, [orderId]: { type: 'error', message: data.error } }))
      } else {
        setStkResult((r) => ({ ...r, [orderId]: { type: 'success', message: data.message } }))
        // Refresh after 10 s to see updated payment status
        setTimeout(fetchOrders, 10_000)
      }
    } catch {
      setStkResult((r) => ({ ...r, [orderId]: { type: 'error', message: 'Network error. Please try again.' } }))
    } finally {
      setStkPending((p) => ({ ...p, [orderId]: false }))
    }
  }

  const hasPendingPayment = (order: DeliveryOrder) =>
    order.payments.some((p) => p.status === 'PENDING')

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-background border-b border-border sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
              <Truck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Delivery Portal</p>
              <p className="font-semibold text-sm">{agentName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={fetchOrders} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/auth/login' })}
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Your Deliveries</h1>
          <span className="text-sm text-muted-foreground">{orders.length} active</span>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-7 h-7 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && orders.length === 0 && (
          <div className="text-center py-16 space-y-2">
            <Package className="w-12 h-12 text-muted-foreground mx-auto" />
            <p className="font-medium">No active deliveries</p>
            <p className="text-sm text-muted-foreground">
              Orders assigned to you will appear here.
            </p>
          </div>
        )}

        {orders.map((order) => {
          const addr = order.shippingAddress
          const customerPhone = addr?.phone || order.user?.phone
          const customerName = addr
            ? `${addr.firstName} ${addr.lastName}`
            : order.user?.name ?? order.user?.email ?? '—'
          const isCOD = order.paymentMethod === 'CASH_ON_DELIVERY'
          const isAlreadyPaid = order.paymentStatus === 'CAPTURED'
          const pendingStk = hasPendingPayment(order)
          const result = stkResult[order.id]

          return (
            <div
              key={order.id}
              className="bg-background border border-border rounded-2xl overflow-hidden shadow-sm"
            >
              {/* Order header */}
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <div>
                  <p className="font-mono text-sm font-semibold">{order.orderNumber}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''} ·{' '}
                    <span className="font-medium text-foreground">{formatPrice(order.grandTotal)}</span>
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLOR[order.status] ?? 'bg-muted text-muted-foreground'}`}>
                    {order.status.replace('_', ' ')}
                  </span>
                  {isCOD && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      isAlreadyPaid
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {isAlreadyPaid ? '✓ Paid' : 'COD — Unpaid'}
                    </span>
                  )}
                </div>
              </div>

              {/* Customer info */}
              <div className="px-5 py-4 space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium">{customerName}</p>
                    {addr && (
                      <p className="text-muted-foreground">
                        {addr.addressLine1}
                        {addr.addressLine2 ? `, ${addr.addressLine2}` : ''} · {addr.city}, {addr.state}
                      </p>
                    )}
                  </div>
                </div>

                {customerPhone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <a
                      href={`tel:${customerPhone}`}
                      className="text-sm text-primary font-medium hover:underline"
                    >
                      {customerPhone}
                    </a>
                  </div>
                )}

                {/* Items preview */}
                <div className="flex items-start gap-3">
                  <Package className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    {order.items.slice(0, 2).map((i) => `${i.variant.product.name} ×${i.quantity}`).join(', ')}
                    {order.items.length > 2 && ` +${order.items.length - 2} more`}
                  </p>
                </div>
              </div>

              {/* COD payment action */}
              {isCOD && !isAlreadyPaid && (
                <div className="px-5 pb-5 space-y-3">
                  {result && (
                    <div className={`flex items-start gap-2 p-3 rounded-xl text-sm ${
                      result.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300'
                        : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                    }`}>
                      {result.type === 'success' ? (
                        <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      )}
                      <span>{result.message}</span>
                    </div>
                  )}

                  {pendingStk && !result && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-50 text-blue-800 text-sm dark:bg-blue-900/20 dark:text-blue-300">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      <span>STK push is pending. Customer should enter their M-Pesa PIN.</span>
                    </div>
                  )}

                  <Button
                    className="w-full gap-2"
                    onClick={() => sendStkPush(order.id)}
                    disabled={stkPending[order.id] || pendingStk}
                  >
                    {stkPending[order.id] ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending prompt…
                      </>
                    ) : (
                      <>
                        <Smartphone className="w-4 h-4" />
                        Send M-Pesa Payment Request
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    This sends an M-Pesa prompt to {customerPhone ?? 'the customer'}
                  </p>
                </div>
              )}

              {isCOD && isAlreadyPaid && (
                <div className="px-5 pb-5">
                  <div className="flex items-center justify-center gap-2 py-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-800 dark:text-emerald-300 text-sm font-medium">
                    <CheckCircle className="w-4 h-4" />
                    Payment received — mark as delivered
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </main>
    </div>
  )
}
