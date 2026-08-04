import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { StoreSettingsClient } from './StoreSettingsClient'
import { requireStaff } from '@/lib/authz'
import { ADMIN_ROLE } from '@/lib/roles'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Store Settings | STRIDE Admin',
}

export default async function StoreSettingsPage() {
  await requireStaff({ roles: [ADMIN_ROLE] })

  let settings = await prisma.storeSettings.findUnique({
    where: { id: 'singleton' },
  })

  if (!settings) {
    settings = await prisma.storeSettings.create({
      data: {
        id: 'singleton',
        storeName: 'STRIDE',
      },
    })
  }

  return (
    <div className="container-max py-8 min-h-screen">
      <StoreSettingsClient initialSettings={settings} />
    </div>
  )
}
