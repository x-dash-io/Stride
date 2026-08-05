export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { ArrowRight, Truck, Package, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { requireCustomer } from '@/lib/authz'
import { getUserOrders } from '@/lib/services/order.service'

export default async function AccountOrdersPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requireCustomer({ callbackUrl: '/account/orders' })

  const params = await searchParams
  const page = Math.max(1, Number(params.page) || 1)
  const perPage = 10

  const result = await getUserOrders(page, perPage)
  const { items, total } = result.ok ? result.value : { items: [], total: 0 }
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
      case 'DELIVERED': return 'bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20'
      case 'CANCELLED': return 'bg-destructive/10 text-destructive dark:text-destructive-foreground border border-destructive/20'
      case 'PENDING': return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
      case 'SHIPPED': case 'IN_TRANSIT': return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20'
      default: return 'bg-muted/10 text-muted-foreground border border-border'
    }
  }

  return (
    <div className="px-6 sm:px-8 lg:px-12 py-8 lg:py-12 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-2">My Orders</h1>
        <p className="text-muted-foreground">Track and manage your orders</p>
      </div>

      {items.length > 0 ? (
        <>
          <div className="space-y-4">
            {items.map((order) => (
              <Link key={order.id} href={`/account/orders/${order.id}`} className="block">
                <div className="bg-card rounded-xl p-6 hover:bg-accent/50 transition-colors">
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
              <Button variant="secondary" asChild className="disabled:opacity-50"><Link href={page > 1 ? `/account/orders?page=${page - 1}` : '#'} aria-disabled={page === 1}>Previous</Link></Button>
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
              <Button variant="secondary" asChild className="disabled:opacity-50"><Link href={page < totalPages ? `/account/orders?page=${page + 1}` : '#'} aria-disabled={page === totalPages}>Next</Link></Button>
            </nav>
          )}
        </>
      ) : (
        <EmptyState
          icon={Package}
          title="No orders yet"
          description="You haven't placed any orders yet. Discover our premium collection and start shopping."
          action={{ label: 'Start Shopping', href: '/products' }}
          variant="card"
          className="py-16"
        />
      )}
    </div>
  )
}