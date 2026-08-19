import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { requireStaff } from '@/lib/authz'
import { ADMIN_ROLE, DELIVERY_AGENT_ROLE } from '@/lib/roles'
import { DeliveryAgentsManager } from './DeliveryAgentsManager'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Delivery Agents | STRIDE Admin',
}

export default async function AdminDeliveryAgentsPage() {
  await requireStaff({ roles: [ADMIN_ROLE] })

  const agents = await prisma.user.findMany({
    where: { role: DELIVERY_AGENT_ROLE },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
      deliveries: {
        select: {
          id: true,
          orderNumber: true,
          status: true,
          grandTotal: true,
          deliveredAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      _count: { select: { deliveries: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const rows = agents.map((agent: (typeof agents)[number]) => ({
    id: agent.id,
    name: agent.name,
    email: agent.email,
    phone: agent.phone,
    createdAt: agent.createdAt.toISOString(),
    totalDeliveries: agent._count.deliveries,
    recentDeliveries: agent.deliveries.map((d: (typeof agent.deliveries)[number]) => ({
      id: d.id,
      orderNumber: d.orderNumber,
      status: d.status,
      grandTotal: Number(d.grandTotal),
      deliveredAt: d.deliveredAt ? d.deliveredAt.toISOString() : null,
      createdAt: d.createdAt.toISOString(),
    })),
  }))

  return (
    <div className="container-max py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-4xl font-serif font-bold">Delivery Agents</h1>
          <p className="text-muted-foreground mt-1">{rows.length} agent{rows.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <DeliveryAgentsManager rows={rows} />
    </div>
  )
}