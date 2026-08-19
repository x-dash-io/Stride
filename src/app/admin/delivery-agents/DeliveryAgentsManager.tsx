'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plus, X, Truck, ChevronDown, ChevronUp, Mail, Phone } from 'lucide-react'
import { useToast } from '@/providers/ToastProvider'
import { formatPrice } from '@/lib/utils'

interface DeliveryRow {
  id: string
  orderNumber: string
  status: string
  grandTotal: number
  deliveredAt: string | null
  createdAt: string
}

interface AgentRow {
  id: string
  name: string | null
  email: string
  phone: string | null
  createdAt: string
  totalDeliveries: number
  recentDeliveries: DeliveryRow[]
}

interface DeliveryAgentsManagerProps {
  rows: AgentRow[]
}

const statusColors: Record<string, string> = {
  DELIVERED: 'bg-emerald-100 text-emerald-800',
  CANCELLED: 'bg-red-100 text-red-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-indigo-100 text-indigo-800',
  IN_TRANSIT: 'bg-indigo-100 text-indigo-800',
}

export function DeliveryAgentsManager({ rows }: DeliveryAgentsManagerProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })

  const resetForm = () => setForm({ name: '', email: '', phone: '', password: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) {
      showToast('error', 'Name, email, and password are required')
      return
    }
    setIsSubmitting(true)
    try {
      const csrfRes = await fetch('/api/csrf')
      const { csrfToken } = await csrfRes.json()
      const res = await fetch('/api/admin/delivery-agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create delivery agent')
      showToast('success', `${form.name} added as a delivery agent`)
      resetForm()
      setShowForm(false)
      router.refresh()
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to create delivery agent')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" /> Add Delivery Agent
          </Button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">New Delivery Agent</h2>
            <button type="button" onClick={() => { setShowForm(false); resetForm() }} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="agentName">Full Name</Label>
              <Input
                id="agentName"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Jane Wanjiru"
                disabled={isSubmitting}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="agentEmail">Email</Label>
              <Input
                id="agentEmail"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="jane@stride.co.ke"
                disabled={isSubmitting}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="agentPhone">Phone Number</Label>
              <Input
                id="agentPhone"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/[^\d+]/g, '') })}
                placeholder="0712 345 678"
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="agentPassword">Temporary Password</Label>
              <Input
                id="agentPassword"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="At least 8 characters"
                disabled={isSubmitting}
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => { setShowForm(false); resetForm() }}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating…' : 'Create Agent'}
            </Button>
          </div>
        </form>
      )}

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {rows.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <Truck className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>No delivery agents yet. Add one to start assigning COD orders.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {rows.map((agent) => {
              const isExpanded = expandedId === agent.id
              return (
                <div key={agent.id}>
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : agent.id)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Truck className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{agent.name || 'Unnamed agent'}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{agent.email}</span>
                          {agent.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{agent.phone}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <Badge variant="secondary">{agent.totalDeliveries} deliver{agent.totalDeliveries === 1 ? 'y' : 'ies'}</Badge>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-6 pb-4">
                      {agent.recentDeliveries.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-2">No deliveries assigned yet.</p>
                      ) : (
                        <div className="overflow-x-auto rounded-lg border border-border">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground bg-muted/30">
                                <th className="px-4 py-2">Order</th>
                                <th className="px-4 py-2">Status</th>
                                <th className="px-4 py-2">Total</th>
                                <th className="px-4 py-2">Assigned</th>
                              </tr>
                            </thead>
                            <tbody>
                              {agent.recentDeliveries.map((d) => (
                                <tr key={d.id} className="border-b border-border last:border-0">
                                  <td className="px-4 py-2 font-mono text-xs">
                                    <a href={`/admin/orders/${d.id}`} className="hover:underline">{d.orderNumber}</a>
                                  </td>
                                  <td className="px-4 py-2">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[d.status] || 'bg-muted text-muted-foreground'}`}>
                                      {d.status}
                                    </span>
                                  </td>
                                  <td className="px-4 py-2">{formatPrice(d.grandTotal)}</td>
                                  <td className="px-4 py-2 text-muted-foreground">{new Date(d.createdAt).toLocaleDateString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}