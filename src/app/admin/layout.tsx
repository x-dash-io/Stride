import { prisma } from '@/lib/prisma'
import { getBillingStatus } from '@/lib/services/billing.service'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { requireStaff } from '@/lib/authz'
import { SUPER_ADMIN_ROLE } from '@/lib/roles'
import { AdminLayoutClient } from './AdminLayoutClient'

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
    { name: 'Delivery Agents', href: '/admin/delivery-agents', icon: 'Truck' },
    { name: 'Categories', href: '/admin/categories', icon: 'FolderKanban' },
    { name: 'Brands', href: '/admin/brands', icon: 'Tag' },
    { name: 'Collections', href: '/admin/collections', icon: 'Layers' },
    { name: 'Banners', href: '/admin/banners', icon: 'ImageIcon' },
    { name: 'Inventory', href: '/admin/inventory', icon: 'Boxes' },
    { name: 'Warehouses', href: '/admin/warehouses', icon: 'Warehouse' },
    { name: 'Reviews', href: '/admin/reviews', icon: 'MessageSquare' },
    { name: 'Users', href: '/admin/users', icon: 'Users' },
    { name: 'Newsletter', href: '/admin/newsletter', icon: 'Mail' },
    { name: 'Payments', href: '/admin/payments', icon: 'Receipt' },
    { name: 'Shipping Zones', href: '/admin/settings/shipping', icon: 'MapPinned' },
    { name: 'Store Settings', href: '/admin/settings/store', icon: 'Settings' },
    { name: 'Subscription', href: '/admin/subscription', icon: 'CreditCard' },
  ]

  // Grouped nav for the regular admin sidebar — mirrors allAdminNav but organized
  // into labeled sections for a more scannable sidebar.
  const adminNavGroups = [
    {
      label: 'Overview',
      items: allAdminNav.filter(i => ['/admin'].includes(i.href)),
    },
    {
      label: 'Catalog',
      items: allAdminNav.filter(i =>
        ['/admin/products', '/admin/categories', '/admin/brands', '/admin/collections', '/admin/banners', '/admin/inventory', '/admin/warehouses'].includes(i.href)
      ),
    },
    {
      label: 'Sales',
      items: allAdminNav.filter(i =>
        ['/admin/orders', '/admin/delivery-agents', '/admin/payments', '/admin/reviews'].includes(i.href)
      ),
    },
    {
      label: 'Audience',
      items: allAdminNav.filter(i => ['/admin/users', '/admin/newsletter'].includes(i.href)),
    },
    {
      label: 'Settings',
      items: allAdminNav.filter(i =>
        ['/admin/settings/shipping', '/admin/settings/store', '/admin/subscription'].includes(i.href)
      ),
    },
  ].filter(group => group.items.length > 0)

  // Platform-level sidebar for super admins: cross-tenant concerns only,
  // grouped the same way the regular admin nav is for a consistent feel.
  const platformNavGroups = [
    {
      label: 'Platform',
      items: [
        { name: 'Platform Dashboard', href: '/admin', icon: 'LayoutDashboard' },
        { name: 'Platform Billing', href: '/admin/billing', icon: 'CreditCard' },
      ],
    },
  ]

  const navigationGroups = isSuperAdmin
    ? platformNavGroups
    : isSuspended
    ? [
        {
          label: 'Store Management',
          items: [
            { name: 'Dashboard', href: '/admin', icon: 'LayoutDashboard' },
            { name: 'Subscription', href: '/admin/subscription', icon: 'CreditCard' },
          ],
        },
      ]
    : adminNavGroups

  const navigationItems = navigationGroups.flatMap(g => g.items)

  // Suspended admin: if they try to visit any locked route, redirect to subscription
  if (isSuspended && !isSuperAdmin) {
    const allowedWhenSuspended = ['/admin', '/admin/subscription']
    const isAllowed = allowedWhenSuspended.some(p => pathname === p || pathname.startsWith(p + '/'))
    if (!isAllowed) {
      redirect('/admin/subscription?reason=suspended')
    }
  }

  return (
    <AdminLayoutClient
      childContent={children}
      navigationItems={navigationItems}
      navigationGroups={navigationGroups}
      suspendedNav={allAdminNav}
      isSuspended={isSuspended}
      isSuperAdmin={isSuperAdmin}
      storeName={settings?.storeName ?? 'STRIDE'}
    />
  )
}