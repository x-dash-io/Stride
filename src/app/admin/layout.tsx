import { prisma } from '@/lib/prisma'
import { getBillingStatus } from '@/lib/services/billing.service'
import { headers } from 'next/headers'
import { Suspense } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireStaff } from '@/lib/authz'
import { SUPER_ADMIN_ROLE } from '@/lib/roles'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Truck, 
  Settings, 
  CreditCard, 
  ExternalLink, 
  AlertTriangle,
  Tag,
  Image as ImageIcon,
  Layers,
  Boxes,
  MessageSquare,
} from 'lucide-react'
import { SignOutButton } from './SignOutButton'
import { AdminSuspensionBanner } from './AdminSuspensionBanner'
import { MobileHeader } from './MobileHeader'
import { MobileNavDrawer } from './MobileNavDrawer'

// Icon map for server-side rendering
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Truck,
  Settings,
  CreditCard,
  ExternalLink,
  AlertTriangle,
  Tag,
  ImageIcon,
  Layers,
  Boxes,
  MessageSquare,
}

export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireStaff()

  const isSuperAdmin = session.user.role === SUPER_ADMIN_ROLE
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || '/admin'

  // Restrict access to /admin/billing strictly to SUPER_ADMIN
  if (pathname.startsWith('/admin/billing') && !isSuperAdmin) {
    redirect('/admin')
  }

  // Restrict access to /admin/subscription strictly to regular ADMIN
  if (pathname.startsWith('/admin/subscription') && isSuperAdmin) {
    redirect('/admin')
  }

  const settings = await prisma.storeSettings.findUnique({
    where: { id: 'singleton' },
  })

  // Get billing status — super admins are never suspended from admin access
  const billing = !isSuperAdmin ? await getBillingStatus() : null
  const isSuspended = billing?.isSuspended ?? false

// Define navigation tabs based on user role and suspension status
  // When suspended, regular admins only see Dashboard and Subscription
  const allAdminNav = [
    { name: 'Dashboard', href: '/admin', icon: 'LayoutDashboard' },
    { name: 'Products', href: '/admin/products', icon: 'Package' },
    { name: 'Orders', href: '/admin/orders', icon: 'ShoppingBag' },
    { name: 'Brands', href: '/admin/brands', icon: 'Tag' },
    { name: 'Collections', href: '/admin/collections', icon: 'Layers' },
    { name: 'Banners', href: '/admin/banners', icon: 'ImageIcon' },
    { name: 'Inventory', href: '/admin/inventory', icon: 'Boxes' },
    { name: 'Reviews', href: '/admin/reviews', icon: 'MessageSquare' },
    { name: 'Shipping Zones', href: '/admin/settings/shipping', icon: 'Truck' },
    { name: 'Store Settings', href: '/admin/settings/store', icon: 'Settings' },
    { name: 'Subscription', href: '/admin/subscription', icon: 'CreditCard' },
  ]

  const navigationItems = isSuperAdmin
    ? [
        { name: 'Platform Dashboard', href: '/admin', icon: 'LayoutDashboard' },
        { name: 'Platform Billing', href: '/admin/billing', icon: 'CreditCard' },
      ]
    : isSuspended
    ? [
        { name: 'Dashboard', href: '/admin', icon: 'LayoutDashboard' },
        { name: 'Subscription', href: '/admin/subscription', icon: 'CreditCard' },
      ]
    : allAdminNav

  // Suspended admin: if they try to visit any locked route, redirect to subscription
  if (isSuspended && !isSuperAdmin) {
    const allowedWhenSuspended = ['/admin', '/admin/subscription']
    const isAllowed = allowedWhenSuspended.some(p => pathname === p || pathname.startsWith(p + '/'))
    if (!isAllowed) {
      redirect('/admin/subscription?reason=suspended')
    }
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar Navigation */}
      <aside className="hidden lg:flex flex-col w-64 bg-card border-r border-border">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <Link href="/admin" className="flex items-center gap-3">
            <span className="font-serif text-xl font-bold tracking-tight text-foreground">
              {settings?.storeName || 'STRIDE'}
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = iconMap[item.icon]
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                {Icon ? <Icon className="w-5 h-5" /> : null}
                <span className="tracking-tight">{item.name}</span>
              </Link>
            )
          })}
          {/* Show locked items as disabled when suspended */}
          {isSuspended && !isSuperAdmin && allAdminNav
            .filter(item => item.href !== '/admin' && item.href !== '/admin/subscription')
            .map(item => {
              const Icon = iconMap[item.icon]
              return (
                <span
                  key={item.href}
                  title="Unlock by clearing your subscription dues"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium cursor-not-allowed opacity-40 text-muted-foreground select-none"
                >
                  {Icon ? <Icon className="w-5 h-5" /> : null}
                  <span className="tracking-tight">{item.name}</span>
                </span>
              )
            })
          }
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-border space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {session.user.name || 'Admin User'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {session.user.email}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <Link
              href="/"
              className="flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View Storefront
            </Link>
            <SignOutButton />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <MobileHeader
          storeName={settings?.storeName}
          navigationItems={navigationItems}
          suspendedNav={allAdminNav}
          isSuspended={isSuspended}
          isSuperAdmin={isSuperAdmin}
        />

        {/* Suspension Banner */}
        {isSuspended && !isSuperAdmin && (
          <div className="bg-destructive text-destructive-foreground">
            <div className="px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 text-sm">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium tracking-tight">
                  Your store subscription is overdue. The public storefront is currently <strong>offline</strong> for customers.
                </span>
              </div>
              <Link
                href="/admin/subscription"
                className="flex-shrink-0 text-xs font-bold bg-background text-destructive hover:bg-accent px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
              >
                Clear Dues →
              </Link>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 px-6 sm:px-8 lg:px-12 py-8 lg:py-12 max-w-7xl mx-auto">
          <Suspense fallback={null}>
            <AdminSuspensionBanner />
          </Suspense>
          {children}
        </main>
      </div>
    </div>
  )
}
