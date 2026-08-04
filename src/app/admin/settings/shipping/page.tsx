import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { ShippingSettingsClient } from './ShippingSettingsClient'
import { requireStaff } from '@/lib/authz'
import { ADMIN_ROLE } from '@/lib/roles'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Shipping Zones | STRIDE Admin',
}

export default async function ShippingSettingsPage() {
  await requireStaff({ roles: [ADMIN_ROLE] })

  const zones = await prisma.shippingZone.findMany({
    orderBy: { sortOrder: 'asc' },
  })

  // Convert Decimals to numbers for JSON serialization safety in client components
  const serializedZones = zones.map(zone => ({
    ...zone,
    baseCost: Number(zone.baseCost),
  }))

  return (
    <div className="container-max py-8 min-h-screen">
      <ShippingSettingsClient initialZones={serializedZones} />
    </div>
  )
}
