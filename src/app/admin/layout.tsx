import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getBillingStatus } from '@/lib/services/billing.service'
import { headers } from 'next/headers'
import { Suspense } from 'react'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Truck, 
  Settings, 
  CreditCard, 
  ExternalLink, 
  LogOut,
  AlertTriangle,
} from 'lucide-react'
import { SignOutButton } from './SignOutButton'
import { AdminSuspensionBanner } from './AdminSuspensionBanner'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
    redirect('/')
  }

  const isSuperAdmin = session.user.role === 'SUPER_ADMIN'
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
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Shipping Zones', href: '/admin/settings/shipping', icon: Truck },
    { name: 'Store Settings', href: '/admin/settings/store', icon: Settings },
    { name: 'Subscription', href: '/admin/subscription', icon: CreditCard },
  ]

  const navigationItems = isSuperAdmin
    ? [
        { name: 'Platform Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Platform Billing', href: '/admin/billing', icon: CreditCard },
      ]
    : isSuspended
    ? [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Subscription', href: '/admin/subscription', icon: CreditCard },
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
    <div className="flex flex-col min-h-screen bg-slate-50/50 dark:bg-zinc-950">
      {/* Backoffice Header */}
      <header className="sticky top-0 z-30 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-900/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo Section */}
            <div className="flex items-center gap-8">
              <Link href="/admin" className="flex items-center gap-2">
                <span className="font-serif text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {settings?.storeName || 'STRIDE'}
                  <span className="ml-1.5 text-xs font-sans font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 align-middle">
                    {isSuperAdmin ? 'Platform Manager' : 'Admin'}
                  </span>
                </span>
              </Link>
              
              {/* Desktop Nav */}
              <nav className="hidden md:flex items-center gap-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-zinc-950 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.name}
                    </Link>
                  )
                })}
                {/* Show locked items as disabled when suspended */}
                {isSuspended && !isSuperAdmin && allAdminNav
                  .filter(item => item.href !== '/admin' && item.href !== '/admin/subscription')
                  .map(item => {
                    const Icon = item.icon
                    return (
                      <span
                        key={item.href}
                        title="Unlock by clearing your subscription dues"
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium cursor-not-allowed opacity-40 text-slate-400 dark:text-zinc-600 select-none"
                      >
                        <Icon className="w-4 h-4" />
                        {item.name}
                      </span>
                    )
                  })
                }
              </nav>
            </div>

            {/* User and Storefront Actions */}
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200 text-slate-700 hover:text-slate-950 hover:bg-slate-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:text-white dark:hover:bg-zinc-800 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View Storefront
              </Link>

              <div className="flex items-center gap-2.5 pl-4 border-l border-slate-200 dark:border-zinc-800">
                <div className="hidden lg:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                    {session.user.name || 'Admin User'}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {session.user.email}
                  </span>
                </div>
                <SignOutButton />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Nav Bar */}
      <div className="md:hidden border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 flex overflow-x-auto gap-1 scrollbar-none">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-zinc-950'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {item.name}
            </Link>
          )
        })}
        {isSuspended && !isSuperAdmin && allAdminNav
          .filter(item => item.href !== '/admin' && item.href !== '/admin/subscription')
          .map(item => {
            const Icon = item.icon
            return (
              <span
                key={item.href}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap cursor-not-allowed opacity-40 text-slate-400 dark:text-zinc-600 select-none"
              >
                <Icon className="w-3.5 h-3.5" />
                {item.name}
              </span>
            )
          })
        }
      </div>

      {/* Suspension Banner — shown to regular admins when suspended */}
      {isSuspended && !isSuperAdmin && (
        <div className="w-full bg-red-600 dark:bg-red-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium">
                Your store subscription is overdue. The public storefront is currently <strong>offline</strong> for customers.
              </span>
            </div>
            <Link
              href="/admin/subscription"
              className="flex-shrink-0 text-xs font-bold bg-white text-red-700 hover:bg-red-50 px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap"
            >
              Clear Dues →
            </Link>
          </div>
        </div>
      )}

      {/* Page Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={null}>
          <AdminSuspensionBanner />
        </Suspense>
        {children}
      </main>
    </div>
  )
}
