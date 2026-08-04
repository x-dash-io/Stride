import { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { StoreSettingsClient } from './StoreSettingsClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Store Settings | STRIDE Admin',
}

export default async function StoreSettingsPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/')

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
