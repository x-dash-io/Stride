'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/providers/ToastProvider'
import { Truck } from 'lucide-react'

interface AgentOption {
  id: string
  name: string | null
  email: string
}

interface AssignDeliveryAgentProps {
  orderId: string
  currentAgentId: string | null
  agents: AgentOption[]
}

const UNASSIGNED = '__unassigned__'

export function AssignDeliveryAgent({ orderId, currentAgentId, agents }: AssignDeliveryAgentProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selected, setSelected] = useState<string>(currentAgentId || UNASSIGNED)

  const assign = async (value: string) => {
    setSelected(value)
    setIsSubmitting(true)
    try {
      const csrfRes = await fetch('/api/csrf')
      const { csrfToken } = await csrfRes.json()
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
        body: JSON.stringify({ deliveryAgentId: value === UNASSIGNED ? null : value }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to assign delivery agent')
      showToast('success', value === UNASSIGNED ? 'Delivery agent unassigned' : 'Delivery agent assigned')
      router.refresh()
    } catch (err) {
      setSelected(currentAgentId || UNASSIGNED)
      showToast('error', err instanceof Error ? err.message : 'Failed to assign delivery agent')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Truck className="w-5 h-5" />
        Delivery Agent
      </h2>
      {agents.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No delivery agents yet. Add one from the{' '}
          <a href="/admin/delivery-agents" className="underline hover:text-foreground">
            Delivery Agents
          </a>{' '}
          page.
        </p>
      ) : (
        <Select value={selected} onValueChange={assign} disabled={isSubmitting}>
          <SelectTrigger className="w-full" aria-label="Assign delivery agent">
            <SelectValue placeholder="Unassigned" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
            {agents.map((agent) => (
              <SelectItem key={agent.id} value={agent.id}>
                {agent.name || agent.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  )
}