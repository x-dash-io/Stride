import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { ArrowRight, Truck, Package, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

async function getUserOrders(userId: string, page = 1, perPage = 10) {
  const skip = (page - 1) * perPage
  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: perPage,
      include: { items: { include: { variant: true } } },
    }),
    prisma.order.count({ where: { userId } }),
  ])
  return { items, total }
}

export default async function AccountOrdersPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/auth/login')

  const params = await searchParams
  const page = Math.max(1, Number(params.page) || 1)
  const perPage = 10

  const { items, total } = await getUserOrders(session.user.id, page, perPage)
  const totalPages = Math.ceil(total / perPage)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DELIVERED': return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'CANCELLED': return <AlertCircle className="w-5 h-5 text-red-600" />
      case 'PENDING': return <Clock className="w-5 h-5 text-yellow-600 animate-spin" />
      case 'SHIPPED': case 'IN_TRANSIT': return <Truck className="w-5 h-5 text-blue-600" />
      default: return <Package className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED': return 'bg-green-100 text-green-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'SHIPPED': case 'IN_TRANSIT': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="container-max py-12 min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-2">My Orders</h1>
        <p className="text-muted-foreground">Track and manage your orders</p>
      </div>

      {items.length > 0 ? (
        <>
          <div className="space-y-4">
            {items.map((order) => (
              <Link key={order.id} href={`/account/orders/${order.id}`} className="block">
                <div className="bg-card border border-border rounded-xl p-6 hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-muted rounded-lg">{getStatusIcon(order.status)}</div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">Order #{order.orderNumber}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>{order.status}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''} • {formatPrice(Number(order.grandTotal))}
                        </p>
                      </div>
                    </div>
                    <div className="text-right md:text-left">
                      <p className="text-sm text-muted-foreground">Placed</p>
                      <p className="font-medium">{new Date(order.createdAt).toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground md:hidden" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <nav className="flex items-center justify-center gap-2 mt-8" aria-label="Pagination">
              <Link href={page > 1 ? `/account/orders?page=${page - 1}` : '#'} className="btn-secondary disabled:opacity-50" aria-disabled={page === 1}>Previous</Link>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum: number
                if (totalPages <= 5) pageNum = i + 1
                else if (page <= 3) pageNum = i + 1
                else if (page >= totalPages - 2) pageNum = totalPages - 4 + i
                else pageNum = page - 2 + i
                return (
                  <Link key={pageNum} href={`/account/orders?page=${pageNum}`} className={`px-4 py-2 rounded-md text-sm font-medium ${page === pageNum ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}>{pageNum}</Link>
                )
              })}
              <Link href={page < totalPages ? `/account/orders?page=${page + 1}` : '#'} className="btn-secondary disabled:opacity-50" aria-disabled={page === totalPages}>Next</Link>
            </nav>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No orders yet</h2>
          <p className="text-muted-foreground mb-6">You haven't placed any orders yet.</p>
          <Link href="/products"><Button size="lg">Start Shopping</Button></Link>
        </div>
      )}
    </div>
  )
}