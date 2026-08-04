import { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { Users, Package, ShoppingBag, DollarSign, Plus, ArrowRight, CreditCard, Clock, Activity, Landmark } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { getBillingStatus } from '@/lib/services/billing.service'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Admin Dashboard | STRIDE',
}

async function getStats() {
  const [totalUsers, totalProducts, totalOrders, totalRevenue, recentOrders, lowStockProducts] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { grandTotal: true }, where: { paymentStatus: 'CAPTURED' } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.productVariant.findMany({
      where: { isActive: true, inventory: { some: { quantityOnHand: { lte: 5 } } } },
      include: { product: { select: { name: true } }, inventory: true },
      take: 5,
    }),
  ])

  return {
    totalUsers,
    totalProducts,
    totalOrders,
    totalRevenue: Number(totalRevenue._sum.grandTotal || 0),
    recentOrders,
    lowStockProducts,
  }
}

export default async function AdminDashboardPage() {
  const session = await auth()
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
    redirect('/')
  }

  const isSuperAdmin = session.user.role === 'SUPER_ADMIN'

  if (isSuperAdmin) {
    // Fetch SaaS Platform Manager Stats
    const billing = await getBillingStatus()
    const [pendingConfirmations, totalInvoices, totalStoresCount] = await Promise.all([
      prisma.subscriptionLedger.count({
        where: {
          status: { in: ['UNPAID', 'OVERDUE'] },
          mpesaRef: { not: null }
        }
      }),
      prisma.subscriptionLedger.findMany({
        take: 5,
        orderBy: { periodStart: 'desc' },
      }),
      prisma.storeSettings.count()
    ])

    return (
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-zinc-800 pb-5">
          <div>
            <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-white">Platform Control Panel</h1>
            <p className="text-sm text-muted-foreground mt-1">Monitor tenant subscriptions, payments, and system health.</p>
          </div>
          <Button asChild>
            <Link href="/admin/billing">
              Manage Billing <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">SaaS Status</p>
                <p className="text-2xl font-bold mt-1 text-slate-800 dark:text-zinc-100">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    billing.status === 'PAID'
                      ? 'bg-green-100 text-green-800'
                      : billing.status === 'WAIVED'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-red-100 text-red-800 animate-pulse'
                  }`}>
                    {billing.status}
                  </span>
                </p>
              </div>
              <Activity className="w-10 h-10 text-primary/40" />
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Monthly Fee</p>
                <p className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{formatPrice(3500)}</p>
              </div>
              <Landmark className="w-10 h-10 text-primary/40" />
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pending Approvals</p>
                <p className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">
                  {pendingConfirmations > 0 ? (
                    <span className="text-amber-600 animate-pulse">{pendingConfirmations} Pending</span>
                  ) : (
                    <span className="text-slate-500 font-medium">None</span>
                  )}
                </p>
              </div>
              <Clock className="w-10 h-10 text-primary/40" />
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Grace Deadline</p>
                <p className="text-sm font-semibold mt-2 text-destructive">
                  {format(new Date(billing.graceDeadline), 'MMM d, yyyy')}
                </p>
              </div>
              <CreditCard className="w-10 h-10 text-primary/40" />
            </div>
          </div>
        </div>

        {/* Content Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Invoices list */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl shadow-sm lg:col-span-2">
            <div className="p-6 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <h2 className="text-lg font-bold font-serif">Recent Subscription Invoices</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/billing">View All Invoices</Link>
              </Button>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-zinc-850">
              {totalInvoices.length > 0 ? (
                totalInvoices.map((inv) => (
                  <div key={inv.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                    <div>
                      <p className="font-semibold text-sm">
                        {format(new Date(inv.periodStart), 'MMM d')} – {format(new Date(inv.periodEnd), 'MMM d, yyyy')}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Submitted M-Pesa Ref: <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">{inv.mpesaRef || '—'}</span>
                      </p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1.5">
                      <span className="font-bold text-sm text-slate-800 dark:text-zinc-200">{formatPrice(Number(inv.amountKes))}</span>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        inv.status === 'PAID'
                          ? 'bg-green-100 text-green-800'
                          : inv.status === 'WAIVED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {inv.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-muted-foreground text-sm">No platform billing records found.</div>
              )}
            </div>
          </div>

          {/* Quick System info */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-bold font-serif border-b border-slate-100 dark:border-zinc-800 pb-3">System Overview</h2>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Active Tenant Stores</span>
                <span className="font-semibold">{totalStoresCount}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-slate-100 dark:border-zinc-800 pt-2">
                <span className="text-muted-foreground">Neon Database Schema</span>
                <span className="font-mono text-xs bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">public</span>
              </div>
              <div className="flex justify-between text-sm border-t border-slate-100 dark:border-zinc-800 pt-2">
                <span className="text-muted-foreground">File Storage Provider</span>
                <span className="font-mono text-xs bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">Cloudflare R2</span>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-zinc-800/40 p-4 rounded-xl text-xs text-slate-500 space-y-2 border border-slate-100 dark:border-zinc-800/60">
              <p className="font-semibold text-slate-700 dark:text-zinc-300">Manager Tip:</p>
              <p>Clients are automatically suspended if their invoice status becomes OVERDUE (3 days grace period past the 27th of the month cycle).</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Regular Store Admin Dashboard
  const stats = await getStats()

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-zinc-800 pb-5">
        <div>
          <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage products, view orders, and track your store sales.</p>
        </div>
        <div className="flex gap-2.5">
          <Button asChild>
            <Link href="/admin/products/new">
              <Plus className="w-4 h-4 mr-2" /> Add Product
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/orders">
              <ShoppingBag className="w-4 h-4 mr-2" /> Orders
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Users</p>
              <p className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">{stats.totalUsers.toLocaleString()}</p>
            </div>
            <Users className="w-12 h-12 text-primary/30" />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Products</p>
              <p className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">{stats.totalProducts.toLocaleString()}</p>
            </div>
            <Package className="w-12 h-12 text-primary/30" />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Orders</p>
              <p className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">{stats.totalOrders.toLocaleString()}</p>
            </div>
            <ShoppingBag className="w-12 h-12 text-primary/30" />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Revenue</p>
              <p className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">{formatPrice(stats.totalRevenue)}</p>
            </div>
            <DollarSign className="w-12 h-12 text-primary/30" />
          </div>
        </div>
      </div>

      {/* Grid Detail Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl shadow-sm">
          <div className="p-6 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
            <h2 className="text-lg font-bold font-serif">Recent Orders</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/orders">View All</Link>
            </Button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-zinc-850">
            {stats.recentOrders.length > 0 ? (
              stats.recentOrders.map((order) => (
                <div key={order.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                  <div>
                    <p className="font-semibold text-sm">#{order.orderNumber}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {order.user?.name || 'Guest'} • {format(new Date(order.createdAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <p className="font-bold text-sm text-slate-800 dark:text-zinc-200">{formatPrice(Number(order.grandTotal))}</p>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-muted-foreground text-sm">No orders yet</div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl shadow-sm">
          <div className="p-6 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
            <h2 className="text-lg font-bold font-serif">Low Stock Alerts</h2>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-zinc-850">
            {stats.lowStockProducts.length > 0 ? (
              stats.lowStockProducts.map((variant) => (
                <div key={variant.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                  <div>
                    <p className="font-semibold text-sm">{variant.product.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">Size: {variant.size} • Color: {variant.colour}</p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200">
                      {variant.inventory.reduce((sum, inv) => sum + inv.quantityOnHand, 0)} left
                    </span>
                    <p className="text-[10px] text-muted-foreground font-mono">SKU: {variant.sku}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-muted-foreground text-sm">All products well stocked</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}