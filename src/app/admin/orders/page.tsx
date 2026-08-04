import { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { ShoppingBag, ArrowLeft, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { format } from 'date-fns'
import { OrderStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Admin Orders | STRIDE',
}

const statusFilters = ['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED', 'RETURNED', 'REFUNDED', 'ON_HOLD'] as const

const statusColors: Record<string, string> = {
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-indigo-100 text-indigo-800',
  IN_TRANSIT: 'bg-indigo-100 text-indigo-800',
  RETURNED: 'bg-orange-100 text-orange-800',
  REFUNDED: 'bg-purple-100 text-purple-800',
  ON_HOLD: 'bg-gray-100 text-gray-800',
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>
}) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/')

  const params = await searchParams
  const currentStatus = params.status || 'ALL'
  const page = Math.max(1, Number(params.page) || 1)
  const perPage = 20
  const skip = (page - 1) * perPage

  const where = currentStatus !== 'ALL' ? { status: currentStatus as OrderStatus } : {}

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: perPage,
      include: {
        user: { select: { name: true, email: true } },
      } as const,
    }),
    prisma.order.count({ where }),
  ])

  const totalPages = Math.ceil(total / perPage)

  return (
    <div className="container-max py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-4xl font-serif font-bold">Orders</h1>
          <p className="text-muted-foreground mt-1">{total} order{total !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {statusFilters.map((status) => {
          const isActive = currentStatus === status
          const href = status === 'ALL' ? '/admin/orders' : `/admin/orders?status=${status}`
          return (
            <Link
              key={status}
              href={href}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
            </Link>
          )
        })}
      </div>

      {items.length > 0 ? (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-6 py-4 font-medium">Order</th>
                  <th className="text-left px-6 py-4 font-medium">Customer</th>
                  <th className="text-left px-6 py-4 font-medium">Status</th>
                  <th className="text-left px-6 py-4 font-medium">Total</th>
                  <th className="text-left px-6 py-4 font-medium">Date</th>
                  <th className="text-right px-6 py-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-medium">#{order.orderNumber}</td>
                    <td className="px-6 py-4">
                      <p>{order.user?.name || 'Guest'}</p>
                      <p className="text-xs text-muted-foreground">{order.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">{formatPrice(Number(order.grandTotal))}</td>
                    <td className="px-6 py-4 text-muted-foreground">{format(new Date(order.createdAt), 'MMM d, yyyy')}</td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/orders/${order.id}`}>
                          <Eye className="w-4 h-4 mr-1" /> View
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={ShoppingBag}
          title="No orders found"
          description={
            currentStatus !== 'ALL'
              ? `No orders currently match the "${currentStatus.toLowerCase()}" status.`
              : 'No customer orders have been placed yet.'
          }
          variant="card"
          className="py-16"
        />
      )}

      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-2 mt-8" aria-label="Pagination">
          {page > 1 ? (
            <Link
              href={`/admin/orders?${new URLSearchParams({ ...(currentStatus !== 'ALL' && { status: currentStatus }), page: String(page - 1) }).toString()}`}
              className="px-4 py-2 rounded-md text-sm font-medium border border-input hover:bg-accent"
            >
              Previous
            </Link>
          ) : (
            <span className="px-4 py-2 rounded-md text-sm font-medium border border-input opacity-50 cursor-not-allowed">
              Previous
            </span>
          )}
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            let pageNum: number
            if (totalPages <= 5) pageNum = i + 1
            else if (page <= 3) pageNum = i + 1
            else if (page >= totalPages - 2) pageNum = totalPages - 4 + i
            else pageNum = page - 2 + i
            const params = new URLSearchParams()
            if (currentStatus !== 'ALL') params.set('status', currentStatus)
            params.set('page', String(pageNum))
            return (
              <Link
                key={pageNum}
                href={`/admin/orders?${params.toString()}`}
                className={`px-4 py-2 rounded-md text-sm font-medium ${page === pageNum ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
              >
                {pageNum}
              </Link>
            )
          })}
          {page < totalPages ? (
            <Link
              href={`/admin/orders?${new URLSearchParams({ ...(currentStatus !== 'ALL' && { status: currentStatus }), page: String(page + 1) }).toString()}`}
              className="px-4 py-2 rounded-md text-sm font-medium border border-input hover:bg-accent"
            >
              Next
            </Link>
          ) : (
            <span className="px-4 py-2 rounded-md text-sm font-medium border border-input opacity-50 cursor-not-allowed">
              Next
            </span>
          )}
        </nav>
      )}
    </div>
  )
}
