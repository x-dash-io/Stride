'use client'

import * as React from 'react'
import { SidebarProvider } from '@/components/ui/sidebar'
import { MobileHeader } from './MobileHeader'
import { DesktopHeader } from './DesktopHeader'
import { AdminSuspensionBanner } from './AdminSuspensionBanner'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { Suspense } from 'react'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Truck,
  MapPinned,
  Settings,
  CreditCard,
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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface AdminLayoutClientProps {
  childContent: React.ReactNode
  navigationItems: Array<{ name: string; href: string; icon: string }>
  navigationGroups?: Array<{ label: string; items: Array<{ name: string; href: string; icon: string }> }>
  suspendedNav: Array<{ name: string; href: string; icon: string }>
  isSuspended: boolean
  isSuperAdmin: boolean
  storeName: string
}

const SIDEBAR_WIDTH = '16rem'
const SIDEBAR_WIDTH_ICON = '3rem'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Truck,
  MapPinned,
  Settings,
  CreditCard,
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
}

export function AdminLayoutClient({
  childContent,
  navigationItems,
  navigationGroups,
  suspendedNav,
  isSuspended,
  isSuperAdmin,
  storeName,
}: AdminLayoutClientProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = React.useState(false)

  const renderIcon = (iconName: string) => {
    const Icon = iconMap[iconName]
    return Icon ? <Icon className="w-5 h-5" /> : null
  }

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  const groups = navigationGroups && navigationGroups.length > 0
    ? navigationGroups
    : [{ label: isSuperAdmin ? 'Platform' : 'Store', items: navigationItems }]

  return (
    <div className="flex min-h-screen overflow-hidden">
      {/* Sidebar Wrapper */}
      <div
        className={cn(
          "hidden md:flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-200",
          isCollapsed ? "w-[3rem]" : "w-[16rem]"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-sidebar-border">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-md hover:bg-sidebar-accent"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-sidebar-foreground" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-sidebar-foreground" />
            )}
          </button>
          {!isCollapsed && (
            <>
              <span className="font-serif text-xl font-bold tracking-tight text-sidebar-foreground">
                {storeName || 'STRIDE'}
              </span>
              {isSuperAdmin && (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/10 rounded-full px-2 py-0.5">
                  Super Admin
                </span>
              )}
            </>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {groups.map((group) => (
            <div key={group.label} className="mb-4">
              {!isCollapsed && (
                <div className="flex h-8 shrink-0 items-center px-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60">
                  {group.label}
                </div>
              )}
              <ul className="space-y-1">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 overflow-hidden rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive(item.href)
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      {renderIcon(item.icon)}
                      {!isCollapsed && <span className="truncate">{item.name}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      {/* Spacer - reserves space for sidebar */}
      <div
        className={cn(
          "hidden md:block transition-all duration-200",
          isCollapsed ? "w-[3rem]" : "w-[16rem]"
        )}
      />

      {/* Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <MobileHeader storeName={storeName} />

        {/* Desktop Header */}
        <DesktopHeader storeName={storeName} />

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
        <main className="flex-1 px-6 sm:px-8 lg:px-12 py-8 lg:py-12 w-full max-w-[1600px] mx-auto min-w-0">
          <Suspense fallback={null}>
            <AdminSuspensionBanner />
          </Suspense>
          {childContent}
        </main>
      </div>
    </div>
  )
}