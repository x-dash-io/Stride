import { requireDeliveryAccess } from '@/lib/authz'
import { DeliveryDashboard } from './DeliveryDashboard'

export const dynamic = 'force-dynamic'

export default async function DeliveryPage() {
  const session = await requireDeliveryAccess()
  return <DeliveryDashboard agentName={session.user.name ?? session.user.email ?? 'Agent'} agentId={session.user.id} />
}
