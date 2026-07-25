import { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { Users, Package, ShoppingBag, DollarSign, TrendingUp, Plus, Search, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { format } from 'date-fns'

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
  if (!session?.user || (session.user as any).role !== 'ADMIN') redirect('/')

  const stats = await getStats()

  return (
    <div className="container-max py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-serif font-bold">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Button asChild><Link href="/admin/products/new"><Plus className="w-4 h-4 mr-2" />Add Product</Link></Button>
          <Button variant="outline" asChild><Link href="/admin/orders"><ShoppingBag className="w-4 h-4 mr-2" />Orders</Link></Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-3xl font-bold mt-1">{stats.totalUsers.toLocaleString()}</p>
            </div>
            <Users className="w-12 h-12 text-primary/50" />
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Products</p>
              <p className="text-3xl font-bold mt-1">{stats.totalProducts.toLocaleString()}</p>
            </div>
            <Package className="w-12 h-12 text-primary/50" />
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="text-3xl font-bold mt-1">{stats.totalOrders.toLocaleString()}</p>
            </div>
            <ShoppingBag className="w-12 h-12 text-primary/50" />
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-3xl font-bold mt-1">{formatPrice(stats.totalRevenue)}</p>
            </div>
            <DollarSign className="w-12 h-12 text-primary/50" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Orders</h2>
            <Button variant="ghost" size="sm" asChild><Link href="/admin/orders">View All</Link></Button>
          </div>
          <div className="divide-y divide-border">
            {stats.recentOrders.length > 0 ? (
              stats.recentOrders.map((order) => (
                <div key={order.id} className="p-6 flex items-center justify-between hover:bg-muted/50">
                  <div>
                    <p className="font-medium">#{order.orderNumber}</p>
                    <p className="text-sm text-muted-foreground">{order.user?.name || 'Guest'} • {format(new Date(order.createdAt), 'MMM d, yyyy')}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatPrice(Number(order.grandTotal))}</p>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{order.status}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-muted-foreground">No orders yet</div>
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="text-xl font-semibold">Low Stock Alerts</h2>
          </div>
          <div className="divide-y divide-border">
            {stats.lowStockProducts.length > 0 ? (
              stats.lowStockProducts.map((variant) => (
                <div key={variant.id} className="p-6 flex items-center justify-between hover:bg-muted/50">
                  <div>
                    <p className="font-medium">{variant.product.name}</p>
                    <p className="text-sm text-muted-foreground">Size: {variant.size} • Color: {variant.colour}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {variant.inventory.reduce((sum, inv) => sum + inv.quantityOnHand, 0)} left
                    </span>
                    <p className="text-sm text-muted-foreground mt-1">SKU: {variant.sku}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-muted-foreground">All products well stocked</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}