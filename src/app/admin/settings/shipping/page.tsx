import { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { ShippingSettingsClient } from './ShippingSettingsClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Shipping Zones | STRIDE Admin',
}

export default async function ShippingSettingsPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/')

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
