import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { Users, Package, ShoppingBag, Receipt, Plus, ArrowRight, CreditCard, Clock, Activity, Landmark } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { getBillingStatus } from '@/lib/services/billing.service'
import { requireStaff } from '@/lib/authz'
import { SUPER_ADMIN_ROLE } from '@/lib/roles'
import { DashboardChart } from '@/components/admin/DashboardChart'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Admin Dashboard | STRIDE',
}

async function getStats() {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [totalUsers, totalProducts, totalOrders, totalRevenue, recentOrders, lowStockProducts, ordersLast30Days] = await Promise.all([
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
    prisma.order.findMany({
      where: {
        paymentStatus: 'CAPTURED',
        createdAt: { gte: thirtyDaysAgo }
      },
      select: {
        createdAt: true,
        grandTotal: true,
      }
    })
  ])

  const revenueMap = new Map<string, number>()
  for (let i = 0; i < 30; i++) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    revenueMap.set(format(d, 'MMM dd'), 0)
  }

  ordersLast30Days.forEach(order => {
    const d = format(order.createdAt, 'MMM dd')
    if (revenueMap.has(d)) {
      revenueMap.set(d, revenueMap.get(d)! + Number(order.grandTotal))
    }
  })

  const revenueTrend = Array.from(revenueMap.entries())
    .map(([date, revenue]) => ({ date, revenue }))
    .reverse()

  return {
    totalUsers,
    totalProducts,
    totalOrders,
    totalRevenue: Number(totalRevenue._sum.grandTotal || 0),
    recentOrders,
    lowStockProducts,
    revenueTrend,
  }
}

export default async function AdminDashboardPage() {
  const session = await requireStaff()

  const isSuperAdmin = session.user.role === SUPER_ADMIN_ROLE

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
      <div className="space-y-10 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="text-left">
            <h1 className="text-4xl font-serif font-bold text-foreground tracking-tight">Platform Control Panel</h1>
            <p className="text-sm text-muted-foreground mt-2 font-medium">Monitor tenant subscriptions, payments, and system health across the SaaS platform.</p>
          </div>
          <Button asChild className="self-start md:self-end">
            <Link href="/admin/billing" className="group">
              Manage Billing <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

        {/* Asymmetric Stats Grid (5-column layout for visual hierarchy) */}
        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-5 gap-6">
          {/* SaaS Status (Primary Indicator, 2 columns) */}
          <div className="bg-card rounded-xl p-6 shadow-sm border-2 border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent hover:border-primary/30 transition-all duration-300 hover:shadow-md md:col-span-3 lg:col-span-2">
            <div className="flex flex-col justify-between h-full space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">SaaS Status</p>
                  <p className="text-2xl font-bold mt-2 text-foreground">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                      billing.status === 'PAID'
                        ? 'bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20'
                        : billing.status === 'WAIVED'
                        ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20'
                        : 'bg-destructive/10 text-destructive dark:text-destructive-foreground border border-destructive/20 animate-pulse'
                    }`}>
                      {billing.status}
                    </span>
                  </p>
                </div>
                <div className="bg-primary/10 rounded-xl p-2.5">
                  <Activity className="w-6 h-6 text-primary" />
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground font-medium">Current SaaS portal billing active and running.</p>
            </div>
          </div>

          {/* Monthly Fee (Secondary Indicator) */}
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 md:col-span-3 lg:col-span-1">
            <div className="flex flex-col justify-between h-full space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Monthly Fee</p>
                  <p className="text-3xl font-extrabold mt-1 text-foreground tracking-tight">{formatPrice(3500)}</p>
                </div>
                <div className="bg-primary/5 dark:bg-zinc-800 rounded-xl p-2">
                  <Landmark className="w-5 h-5 text-primary" />
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground font-medium">Fixed platform base subscription cost.</p>
            </div>
          </div>

          {/* Pending Approvals (Secondary Indicator) */}
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 md:col-span-3 lg:col-span-1">
            <div className="flex flex-col justify-between h-full space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pending Approvals</p>
                  <p className="text-3xl font-extrabold mt-1 text-foreground tracking-tight">
                    {pendingConfirmations > 0 ? (
                      <span className="text-amber-600 dark:text-amber-400 animate-pulse">{pendingConfirmations}</span>
                    ) : (
                      <span className="text-muted-foreground font-medium">0</span>
                    )}
                  </p>
                </div>
                <div className="bg-primary/5 dark:bg-zinc-800 rounded-xl p-2">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground font-medium">Payments awaiting validation.</p>
            </div>
          </div>

          {/* Grace Deadline (Secondary Indicator) */}
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 md:col-span-3 lg:col-span-1">
            <div className="flex flex-col justify-between h-full space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Grace Deadline</p>
                  <p className="text-sm font-bold mt-2 text-destructive bg-destructive/10 px-2 py-1 rounded inline-block">
                    {format(new Date(billing.graceDeadline), 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="bg-primary/5 dark:bg-zinc-800 rounded-xl p-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground font-medium">System suspension threshold date.</p>
            </div>
          </div>
        </div>

        {/* Content Split (Asymmetric 12-column grid layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Recent Invoices list (Left side: spans 7 columns) */}
          <div className="bg-card rounded-xl border border-border/50 shadow-sm lg:col-span-6 overflow-hidden text-left">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-bold font-serif">Recent Subscription Invoices</h2>
              <Button variant="ghost" size="sm" asChild className="hover:bg-accent transition-colors">
                <Link href="/admin/billing">View All Invoices</Link>
              </Button>
            </div>
            <div className="divide-y divide-border">
              {totalInvoices.length > 0 ? (
                totalInvoices.map((inv) => (
                  <div key={inv.id} className="p-6 flex items-center justify-between hover:bg-accent/40 hover:translate-x-0.5 transition-all duration-200">
                    <div>
                      <p className="font-semibold text-sm">
                        {format(new Date(inv.periodStart), 'MMM d')} – {format(new Date(inv.periodEnd), 'MMM d, yyyy')}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Submitted M-Pesa Ref: <span className="font-mono font-bold text-foreground bg-accent/30 px-1 py-0.5 rounded">{inv.mpesaRef || '—'}</span>
                      </p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1.5">
                      <span className="font-bold text-sm text-foreground">{formatPrice(Number(inv.amountKes))}</span>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        inv.status === 'PAID'
                          ? 'bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20'
                          : inv.status === 'WAIVED'
                          ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20'
                          : 'bg-destructive/10 text-destructive dark:text-destructive-foreground border border-destructive/20'
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

          {/* Quick System info & Tips (Right side: spans 5 columns) */}
          <div className="space-y-6 lg:col-span-6 text-left">
            <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm space-y-6">
              <h2 className="text-lg font-bold font-serif border-b border-border pb-3">System Overview</h2>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Active Tenant Stores</span>
                  <span className="font-semibold text-foreground">{totalStoresCount}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-border pt-3">
                  <span className="text-muted-foreground">Neon Database Schema</span>
                  <span className="font-mono text-xs bg-accent px-2 py-0.5 rounded text-foreground">public</span>
                </div>
                <div className="flex justify-between text-sm border-t border-border pt-3">
                  <span className="text-muted-foreground">File Storage Provider</span>
                  <span className="font-mono text-xs bg-accent px-2 py-0.5 rounded text-foreground">Cloudflare R2</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-secondary/15 to-secondary/5 p-5 rounded-xl text-xs text-muted-foreground space-y-2.5 border border-secondary/20 shadow-sm">
              <p className="font-bold text-foreground flex items-center gap-1.5 text-secondary">
                <Activity className="w-3.5 h-3.5" /> Platform Governance Tip:
              </p>
              <p className="leading-relaxed">
                Client store settings are updated on a monthly billing cycle. Stores are automatically suspended if their invoice status becomes <span className="font-semibold text-destructive uppercase">Overdue</span> (3 days past the 27th cutoff).
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Regular Store Admin Dashboard
  const stats = await getStats()

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="text-left">
          <h1 className="text-4xl font-serif font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-2">Manage products, view orders, and track your store sales metrics.</p>
        </div>
        <div className="flex gap-2.5 self-start md:self-end">
          <Button variant="outline" asChild className="hover:bg-accent transition-colors">
            <Link href="/admin/orders">
              <ShoppingBag className="w-4 h-4 mr-2" /> Orders
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/products/new">
              <Plus className="w-4 h-4 mr-2" /> Add Product
            </Link>
          </Button>
        </div>
      </div>

      {/* Asymmetric Stats Grid (5-column layout: Revenue spans 2, others span 1) */}
      <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-5 gap-6">
        {/* Total Revenue (Primary Metric, spans 2 columns with gold Stride secondary branding) */}
        <div className="bg-card rounded-xl p-6 shadow-sm border-2 border-secondary/20 bg-gradient-to-br from-secondary/10 via-secondary/5 to-transparent hover:border-secondary/30 transition-all duration-300 hover:shadow-md md:col-span-3 lg:col-span-2">
          <div className="flex flex-col justify-between h-full space-y-4">
            <div className="flex items-start justify-between">
              <div className="text-left">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Revenue</p>
                <p className="text-4xl font-extrabold mt-2 text-foreground tracking-tight">{formatPrice(stats.totalRevenue)}</p>
              </div>
              <div className="bg-secondary/15 rounded-xl p-2.5">
                <Receipt className="w-6 h-6 text-secondary" />
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground font-medium text-left">Accumulated sales revenue from fully captured customer payments.</p>
          </div>
        </div>

        {/* Total Orders (Secondary Metric) */}
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 md:col-span-3 lg:col-span-1">
          <div className="flex flex-col justify-between h-full space-y-4">
            <div className="flex items-start justify-between">
              <div className="text-left">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Orders</p>
                <p className="text-3xl font-extrabold mt-1 text-foreground tracking-tight">{stats.totalOrders.toLocaleString()}</p>
              </div>
              <div className="bg-primary/5 dark:bg-zinc-800 rounded-xl p-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground font-medium text-left">Total completed orders placed.</p>
          </div>
        </div>

        {/* Total Products (Secondary Metric) */}
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 md:col-span-3 lg:col-span-1">
          <div className="flex flex-col justify-between h-full space-y-4">
            <div className="flex items-start justify-between">
              <div className="text-left">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Products</p>
                <p className="text-3xl font-extrabold mt-1 text-foreground tracking-tight">{stats.totalProducts.toLocaleString()}</p>
              </div>
              <div className="bg-primary/5 dark:bg-zinc-800 rounded-xl p-2">
                <Package className="w-5 h-5 text-primary" />
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground font-medium text-left">Active items in store catalog.</p>
          </div>
        </div>

        {/* Total Users (Secondary Metric) */}
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 md:col-span-3 lg:col-span-1">
          <div className="flex flex-col justify-between h-full space-y-4">
            <div className="flex items-start justify-between">
              <div className="text-left">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Users</p>
                <p className="text-3xl font-extrabold mt-1 text-foreground tracking-tight">{stats.totalUsers.toLocaleString()}</p>
              </div>
              <div className="bg-primary/5 dark:bg-zinc-800 rounded-xl p-2">
                <Users className="w-5 h-5 text-primary" />
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground font-medium text-left">Registered customer profiles.</p>
          </div>
        </div>
      </div>

      {/* Revenue Trend Chart */}
      <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden text-left">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-bold font-serif">Revenue Trend (Last 30 Days)</h2>
        </div>
        <div className="p-6">
          <DashboardChart data={stats.revenueTrend} />
        </div>
      </div>

      {/* Grid Detail Content (Asymmetrical 12-column split) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Orders (Left side: spans 7 columns) */}
        <div className="bg-card rounded-xl border border-border/50 shadow-sm lg:col-span-6 overflow-hidden text-left">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-bold font-serif">Recent Orders</h2>
            <Button variant="ghost" size="sm" asChild className="hover:bg-accent transition-colors">
              <Link href="/admin/orders">View All Orders</Link>
            </Button>
          </div>
          <div className="divide-y divide-border">
{stats.recentOrders.length > 0 ? (
               stats.recentOrders.map((order) => (
                 <div key={order.id} className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 hover:bg-accent/40 hover:translate-x-0.5 transition-all duration-200">
                   <div className="flex-1 min-w-0">
                     <p className="font-semibold text-sm text-foreground">#{order.orderNumber}</p>
                     <p className="text-xs text-muted-foreground mt-1">
                       {order.user?.name || 'Guest'} • {format(new Date(order.createdAt), 'MMM d, yyyy')}
                     </p>
                   </div>
                   <div className="text-right flex flex-col items-end gap-1.5">
                     <p className="font-bold text-sm text-foreground">{formatPrice(Number(order.grandTotal))}</p>
                     <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary dark:text-primary-foreground border border-primary/20 whitespace-nowrap">
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

        {/* Low Stock Alerts (Right side: spans 5 columns) */}
        <div className="bg-card rounded-xl border border-border/50 shadow-sm lg:col-span-6 overflow-hidden text-left">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-bold font-serif">Low Stock Alerts</h2>
          </div>
          <div className="divide-y divide-border">
            {stats.lowStockProducts.length > 0 ? (
              stats.lowStockProducts.map((variant) => (
<div key={variant.id} className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 hover:bg-accent/40 hover:translate-x-0.5 transition-all duration-200">
                 <div className="flex-1 min-w-0">
                   <p className="font-semibold text-sm text-foreground truncate">{variant.product.name}</p>
                   <p className="text-xs text-muted-foreground mt-1 font-medium">Size: {variant.size} • Color: {variant.colour}</p>
                 </div>
                 <div className="text-right flex flex-col items-end gap-1.5">
                   <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-destructive/10 text-destructive dark:text-destructive-foreground border border-destructive/20 whitespace-nowrap">
                     {variant.inventory.reduce((sum, inv) => sum + inv.quantityOnHand, 0)} left
                   </span>
                   <p className="text-[9px] text-muted-foreground font-mono">SKU: {variant.sku}</p>
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