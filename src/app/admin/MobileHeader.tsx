'use client'

import { Menu } from 'lucide-react'
import Link from 'next/link'
import { MobileNavDrawer } from './MobileNavDrawer'

interface MobileHeaderProps {
  storeName?: string | null
  navigationItems?: Array<{
    href: string
    name: string
    icon: any
  }>
  suspendedNav?: Array<{
    href: string
    name: string
    icon: any
  }>
  isSuspended?: boolean
  isSuperAdmin?: boolean
}

export function MobileHeader({ storeName, navigationItems, suspendedNav, isSuspended, isSuperAdmin }: MobileHeaderProps) {
  const pathname = '/admin'

  return (
    <header className="lg:hidden sticky top-0 z-30 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {navigationItems && (
            <MobileNavDrawer
              storeName={storeName}
              navigationItems={navigationItems}
              suspendedNav={suspendedNav}
              isSuspended={isSuspended}
              isSuperAdmin={isSuperAdmin}
              pathname={pathname}
            />
          )}
          <Link href="/admin" className="flex items-center gap-2">
            <span className="font-serif text-lg font-bold tracking-tight text-foreground">
              {storeName || 'STRIDE'}
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="text-xs font-medium px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            Store
          </Link>
        </div>
      </div>
    </header>
  )
}
