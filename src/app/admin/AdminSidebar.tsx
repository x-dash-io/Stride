'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
  FolderKanban,
  Warehouse,
  Users,
  Mail,
  Receipt,
  LogOut,
  User,
  Sun,
  Moon,
} from 'lucide-react'
import { 
  Sidebar, 
  SidebarHeader, 
  SidebarFooter, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupLabel, 
  SidebarGroupContent, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton, 
  SidebarMenuSub, 
  SidebarMenuSubItem, 
  SidebarMenuSubButton,
  SidebarTrigger,
  SidebarInset,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { SignOutButton } from './SignOutButton'
import { AdminSuspensionBanner } from './AdminSuspensionBanner'
import { MobileHeader } from './MobileHeader'
import { cn } from '@/lib/utils'

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
  FolderKanban,
  Warehouse,
  Users,
  Mail,
  Receipt,
  LogOut,
  User,
  Sun,
  Moon,
}

const allAdminNav = [
  { name: 'Dashboard', href: '/admin', icon: 'LayoutDashboard' },
  { name: 'Products', href: '/admin/products', icon: 'Package' },
  { name: 'Orders', href: '/admin/orders', icon: 'ShoppingBag' },
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
  { name: 'Shipping Zones', href: '/admin/settings/shipping', icon: 'Truck' },
  { name: 'Store Settings', href: '/admin/settings/store', icon: 'Settings' },
  { name: 'Subscription', href: '/admin/subscription', icon: 'CreditCard' },
]

const superAdminNav = [
  { name: 'Platform Dashboard', href: '/admin', icon: 'LayoutDashboard' },
  { name: 'Platform Billing', href: '/admin/billing', icon: 'CreditCard' },
]

interface NavItem {
  name: string
  href: string
  icon: string
}

interface AdminSidebarProps {
  navigationItems: NavItem[]
  suspendedNav?: NavItem[]
  isSuspended?: boolean
  isSuperAdmin?: boolean
  storeName?: string
}

function AdminSidebarInner({
  navigationItems,
  suspendedNav,
  isSuspended,
  isSuperAdmin,
  storeName,
}: AdminSidebarProps) {
  const pathname = usePathname()
  const { state } = useSidebar()

  const renderIcon = (iconName: string) => {
    const Icon = iconMap[iconName]
    return Icon ? <Icon className="h-5 w-5" /> : null
  }

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link href="/admin" className="flex items-center gap-3 px-2 py-2" onClick={() => {}}>
          <span className="font-serif text-xl font-bold tracking-tight text-foreground truncate">
            {storeName || 'STRIDE'}
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{isSuperAdmin ? 'Platform Access' : 'Store Management'}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive(item.href)}>
                    <Link href={item.href}>
                      {renderIcon(item.icon)}
                      <span className="truncate">{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {isSuspended && !isSuperAdmin && suspendedNav && (
                <>
                  <Separator className="my-2" />
                  {suspendedNav
                    .filter(item => item.href !== '/admin' && item.href !== '/admin/subscription')
                    .map((item) => (
                      <SidebarMenuItem key={item.href}>
                        <span
                          title="Unlock by clearing your subscription dues"
                          className="flex items-center gap-3 px-2 py-2 rounded-md text-sm font-medium cursor-not-allowed opacity-40 text-muted-foreground select-none"
                        >
                          {renderIcon(item.icon)}
                          <span className="truncate">{item.name}</span>
                        </span>
                      </SidebarMenuItem>
                    ))}
                </>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              Admin User
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-2">
          <ThemeSwitcher />
          <SignOutButton />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

export function AdminSidebar(props: AdminSidebarProps) {
  return <AdminSidebarInner {...props} />
}

export function AdminSidebarTrigger() {
  return <SidebarTrigger tooltip="Toggle Sidebar" />
}

export function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <SidebarInset>
      {children}
    </SidebarInset>
  )
}