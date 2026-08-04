import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { AccountContent } from './AccountContent'
import { PageSkeleton } from '@/components/skeleton-loader'
import { requireCustomer } from '@/lib/authz'

export const metadata: Metadata = {
  title: 'My Account | STRIDE',
  description: 'Manage your account, orders, and addresses.',
}

export const dynamic = 'force-dynamic'

async function getUserData(userId: string) {
  const [user, orders, wishlistCount, addresses, orderAgg] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true, image: true, phone: true, createdAt: true } }),
    prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { items: { include: { variant: { include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } } } } } } },
    }),
    prisma.wishlistItem.count({ where: { wishlist: { userId } } }),
    prisma.address.findMany({ where: { userId }, orderBy: { isDefault: 'desc' } }),
    prisma.order.aggregate({
      where: { userId, status: { not: 'CANCELLED' } },
      _sum: { grandTotal: true },
      _count: true,
    }),
  ])

  const totalSpent = Number(orderAgg._sum.grandTotal || 0)
  const ordersCount = orderAgg._count

  return { user, orders, wishlistCount, addresses, totalSpent, ordersCount }
}

async function AccountContentWrapper() {
  const session = await requireCustomer({ callbackUrl: '/account' })

  const { user, orders, wishlistCount, addresses, totalSpent, ordersCount } = await getUserData(session.user.id)

  if (!user) redirect('/auth/login?callbackUrl=/account')

  return (
    <AccountContent
      user={user}
      orders={orders}
      wishlistCount={wishlistCount}
      addresses={addresses}
      totalSpent={totalSpent}
      ordersCount={ordersCount}
    />
  )
}

export default async function AccountPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <AccountContentWrapper />
    </Suspense>
  )
}