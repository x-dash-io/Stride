import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { Users, Package, ShoppingBag, Receipt, Plus, ArrowRight, CreditCard, Clock, Activity, Landmark, TrendingUp, TrendingDown, Minus, Target, AlertTriangle, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'
import { getBillingStatus } from '@/lib/services/billing.service'
import { requireStaff } from '@/lib/authz'
import { SUPER_ADMIN_ROLE } from '@/lib/roles'
import { DashboardChart } from '@/components/admin/DashboardChart'
import { DashboardFilters } from '@/components/admin/DashboardFilters'
import { KPICard } from '@/components/admin/KPICard'
import { DashboardSkeleton } from '@/components/admin/DashboardSkeleton'
import { RecentOrdersTable } from '@/components/admin/RecentOrdersTable'
import { LowStockTable } from '@/components/admin/LowStockTable'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Admin Dashboard | STRIDE',
}

interface DateRange {
  from: Date
  to: Date
}

interface PriorPeriodStats {
  revenue: number
  orders: number
  users: number
  products: number
}

async function getStats(dateRange?: DateRange) {
  const to = dateRange?.to ? endOfDay(dateRange.to) : endOfDay(new Date())
  const from = dateRange?.from ? startOfDay(dateRange.from) : startOfDay(subDays(new Date(), 30))
  
  const priorTo = subDays(from, 1)
  const priorFrom = subDays(priorTo, 30)

  const [
    totalUsers,
    totalProducts,
    totalOrders,
    totalRevenue,
    recentOrders,
    lowStockProducts,
    ordersInRange,
    priorOrdersInRange,
    priorPeriodStats
  ] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.aggregate({ 
      _sum: { grandTotal: true }, 
      where: { paymentStatus: 'CAPTURED' } 
    }),
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.productVariant.findMany({
      where: { isActive: true, inventory: { some: { quantityOnHand: { lte: 5 } } } },
      include: { product: { select: { name: true } }, inventory: true },
      take: 10,
    }),
    prisma.order.findMany({
      where: {
        paymentStatus: 'CAPTURED',
        createdAt: { gte: from, lte: to }
      },
      select: {
        createdAt: true,
        grandTotal: true,
      }
    }),
    prisma.order.findMany({
      where: {
        paymentStatus: 'CAPTURED',
        createdAt: { gte: priorFrom, lte: priorTo }
      },
      select: {
        createdAt: true,
        grandTotal: true,
      }
    }),
    Promise.all([
      prisma.order.aggregate({ 
        _sum: { grandTotal: true }, 
        where: { paymentStatus: 'CAPTURED', createdAt: { gte: priorFrom, lte: priorTo } } 
      }),
      prisma.order.count({ where: { createdAt: { gte: priorFrom, lte: priorTo } } }),
      prisma.user.count({ where: { createdAt: { gte: priorFrom, lte: priorTo } } }),
      prisma.product.count({ where: { createdAt: { gte: priorFrom, lte: priorTo } } }),
    ])
  ])

  // Serialize Decimal fields for client components
  const serializedRecentOrders = recentOrders.map(order => ({
    ...order,
    grandTotal: Number(order.grandTotal),
  }))

  const serializedLowStockProducts = lowStockProducts.map(variant => ({
    ...variant,
    basePrice: Number(variant.basePrice),
    salePrice: variant.salePrice ? Number(variant.salePrice) : null,
    weightKg: variant.weightKg ? Number(variant.weightKg) : null,
    product: variant.product,
    inventory: variant.inventory,
  }))

  const [priorRevenueAgg, priorOrders, priorUsers, priorProducts] = priorPeriodStats
  
  const priorRevenue = Number(priorRevenueAgg._sum.grandTotal || 0)
  const currentRevenue = Number(totalRevenue._sum.grandTotal || 0)
  
  const revenueTrend = ordersInRange.reduce((acc, order) => {
    const d = format(order.createdAt, 'MMM dd')
    const existing = acc.find(item => item.date === d)
    if (existing) {
      existing.revenue += Number(order.grandTotal)
    } else {
      acc.push({ date: d, revenue: Number(order.grandTotal) })
    }
    return acc
  }, [] as Array<{ date: string; revenue: number }>)
  
  const priorRevenueTrend = priorOrdersInRange.reduce((acc, order) => {
    const d = format(order.createdAt, 'MMM dd')
    const existing = acc.find(item => item.date === d)
    if (existing) {
      existing.priorRevenue = (existing.priorRevenue || 0) + Number(order.grandTotal)
    } else {
      acc.push({ date: d, priorRevenue: Number(order.grandTotal) })
    }
    return acc
  }, [] as Array<{ date: string; priorRevenue: number }>)
  
  const allDates = Array.from({ length: 30 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - i)
    return format(d, 'MMM dd')
  }).reverse()
  
  const completeTrend = allDates.map(date => {
    const current = revenueTrend.find(item => item.date === date)
    const prior = priorRevenueTrend.find(item => item.date === date)
    return { 
      date, 
      revenue: current?.revenue || 0,
      priorRevenue: prior?.priorRevenue || 0
    }
  })

  const calculateDelta = (current: number, prior: number) => {
    if (prior === 0) return current > 0 ? 100 : 0
    return ((current - prior) / prior) * 100
  }

  return {
    totalUsers,
    totalProducts,
    totalOrders,
    totalRevenue: currentRevenue,
    recentOrders: serializedRecentOrders,
    lowStockProducts: serializedLowStockProducts,
    revenueTrend: completeTrend,
    priorPeriod: {
      revenue: priorRevenue,
      orders: priorOrders,
      users: priorUsers,
      products: priorProducts,
    },
    deltas: {
      revenue: calculateDelta(currentRevenue, priorRevenue),
      orders: calculateDelta(totalOrders, priorOrders),
      users: calculateDelta(totalUsers, priorUsers),
      products: calculateDelta(totalProducts, priorProducts),
    },
    dateRange: { from, to }
  }
}

interface KPIMetric {
  label: string
  value: string | number
  delta: number
  deltaLabel?: string
  target?: number
  targetLabel?: string
  icon: React.ReactNode
  iconBg: string
  trend?: 'up' | 'down' | 'neutral'
  href?: string
  description?: string
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
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Monthly Fee</p>
                  <p className="text-2xl font-extrabold mt-1 text-foreground tracking-tight break-words">{formatPrice(3500)}</p>
                </div>
                <div className="bg-primary/5 dark:bg-zinc-800 rounded-xl p-2 flex-shrink-0">
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
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pending Approvals</p>
                  <p className="text-3xl font-extrabold mt-1 text-foreground tracking-tight break-words">
                    {pendingConfirmations > 0 ? (
                      <span className="text-amber-600 dark:text-amber-400 animate-pulse">{pendingConfirmations}</span>
                    ) : (
                      <span className="text-muted-foreground font-medium">0</span>
                    )}
                  </p>
                </div>
                <div className="bg-primary/5 dark:bg-zinc-800 rounded-xl p-2 flex-shrink-0">
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
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Grace Deadline</p>
                  <p className="text-sm font-bold mt-2 text-destructive bg-destructive/10 px-2 py-1 rounded inline-block break-words">
                    {format(new Date(billing.graceDeadline), 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="bg-primary/5 dark:bg-zinc-800 rounded-xl p-2 flex-shrink-0">
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
  
  // Define targets (these could come from settings in the future)
  const REVENUE_TARGET = 500000 // 500K KES monthly target
  const ORDERS_TARGET = 200
  const PRODUCTS_TARGET = 500
  const USERS_TARGET = 1000

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header with Filters */}
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

      {/* Global Filters */}
      <DashboardFilters
        defaultRange={stats.dateRange}
        statusOptions={['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']}
        paymentStatusOptions={['PENDING', 'CAPTURED', 'FAILED', 'REFUNDED']}
        showPresets={true}
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
        <KPICard
          label="Total Revenue"
          value={formatPrice(stats.totalRevenue)}
          delta={stats.deltas.revenue}
          deltaLabel="vs prior period"
          target={REVENUE_TARGET}
          targetLabel="of monthly target"
          trend={stats.deltas.revenue > 0 ? 'up' : stats.deltas.revenue < 0 ? 'down' : 'neutral'}
          icon={<Receipt className="w-6 h-6 text-secondary" />}
          iconBg="bg-secondary/15"
          isPrimary={true}
          href="/admin/orders"
          description="Accumulated sales revenue from fully captured customer payments."
        />
        <KPICard
          label="Total Orders"
          value={stats.totalOrders.toLocaleString()}
          delta={stats.deltas.orders}
          deltaLabel="vs prior period"
          target={ORDERS_TARGET}
          targetLabel="of monthly target"
          trend={stats.deltas.orders > 0 ? 'up' : stats.deltas.orders < 0 ? 'down' : 'neutral'}
          icon={<ShoppingBag className="w-5 h-5 text-primary" />}
          iconBg="bg-primary/5 dark:bg-zinc-800"
          href="/admin/orders"
          description="Total completed orders placed."
        />
        <KPICard
          label="Total Products"
          value={stats.totalProducts.toLocaleString()}
          delta={stats.deltas.products}
          deltaLabel="vs prior period"
          target={PRODUCTS_TARGET}
          targetLabel="of catalog target"
          trend={stats.deltas.products > 0 ? 'up' : stats.deltas.products < 0 ? 'down' : 'neutral'}
          icon={<Package className="w-5 h-5 text-primary" />}
          iconBg="bg-primary/5 dark:bg-zinc-800"
          href="/admin/products"
          description="Active items in store catalog."
        />
        <KPICard
          label="Total Users"
          value={stats.totalUsers.toLocaleString()}
          delta={stats.deltas.users}
          deltaLabel="vs prior period"
          target={USERS_TARGET}
          targetLabel="of user target"
          trend={stats.deltas.users > 0 ? 'up' : stats.deltas.users < 0 ? 'down' : 'neutral'}
          icon={<Users className="w-5 h-5 text-primary" />}
          iconBg="bg-primary/5 dark:bg-zinc-800"
          href="/admin/users"
          description="Registered customer profiles."
        />
      </div>

      {/* Revenue Trend Chart */}
      <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden text-left">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-bold font-serif">Revenue Trend (Last 30 Days)</h2>
        </div>
        <div className="p-6" style={{ height: '320px' }}>
          <DashboardChart 
            data={stats.revenueTrend} 
            targetValue={REVENUE_TARGET}
            targetLabel="Monthly Target"
            showPriorPeriod={true}
          />
        </div>
      </div>

      {/* Detail Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Recent Orders */}
        <div className="bg-card rounded-xl border border-border/50 shadow-sm lg:col-span-6 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-lg font-bold font-serif">Recent Orders</h2>
            <Button variant="ghost" size="sm" asChild className="hover:bg-accent transition-colors whitespace-nowrap">
              <Link href="/admin/orders">View All Orders</Link>
            </Button>
          </div>
          <div className="overflow-x-auto">
            <RecentOrdersTable data={stats.recentOrders} />
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-card rounded-xl border border-border/50 shadow-sm lg:col-span-6 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-bold font-serif">Low Stock Alerts</h2>
          </div>
          {stats.lowStockProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <LowStockTable data={stats.lowStockProducts} />
            </div>
          ) : (
            <div className="p-6 text-center text-muted-foreground text-sm">All products well stocked</div>
          )}
        </div>
      </div>
    </div>
  )
}