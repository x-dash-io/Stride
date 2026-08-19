'use client'

import * as React from 'react'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AdminSidebar, AdminLayoutContent } from './AdminSidebar'
import { MobileHeader } from './MobileHeader'
import { DesktopHeader } from './DesktopHeader'
import { AdminSuspensionBanner } from './AdminSuspensionBanner'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { Suspense } from 'react'

interface AdminLayoutClientProps {
  childContent: React.ReactNode
  navigationItems: Array<{ name: string; href: string; icon: string }>
  navigationGroups?: Array<{ label: string; items: Array<{ name: string; href: string; icon: string }> }>
  suspendedNav: Array<{ name: string; href: string; icon: string }>
  isSuspended: boolean
  isSuperAdmin: boolean
  storeName: string
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
  return (
    <SidebarProvider>
      <AdminSidebar
        storeName={storeName}
        navigationItems={navigationItems}
        navigationGroups={navigationGroups}
        suspendedNav={suspendedNav}
        isSuspended={isSuspended}
        isSuperAdmin={isSuperAdmin}
      />

      <AdminLayoutContent>
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
          <main className="flex-1 px-6 sm:px-8 lg:px-12 py-8 lg:py-12 w-full max-w-[1600px] mx-auto">
            <Suspense fallback={null}>
              <AdminSuspensionBanner />
            </Suspense>
            {childContent}
          </main>
      </AdminLayoutContent>
    </SidebarProvider>
  )
}