'use client'

import { useState } from 'react'
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Truck, 
  Settings, 
  CreditCard, 
  AlertTriangle, 
  ExternalLink 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog'
import Link from 'next/link'
import { SignOutButton } from './SignOutButton'

// Map icon names to actual components
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Truck,
  Settings,
  CreditCard,
  AlertTriangle,
  ExternalLink,
  Menu,
  X,
}

interface MobileNavDrawerProps {
  storeName?: string | null
  navigationItems: Array<{
    href: string
    name: string
    icon: string
  }>
  suspendedNav?: Array<{
    href: string
    name: string
    icon: string
  }>
  isSuspended?: boolean
  isSuperAdmin?: boolean
}

export function MobileNavDrawer({ storeName, navigationItems, suspendedNav, isSuspended, isSuperAdmin }: MobileNavDrawerProps) {
  const [open, setOpen] = useState(false)

  const renderIcon = (iconName: string) => {
    const Icon = iconMap[iconName]
    return Icon ? <Icon className="w-5 h-5" /> : null
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          {renderIcon('Menu')}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-sm h-full rounded-none border-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <Link href="/admin" className="flex items-center gap-2" onClick={() => setOpen(false)}>
              <span className="font-serif text-lg font-bold tracking-tight text-foreground">
                {storeName || 'STRIDE'}
              </span>
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              {renderIcon('X')}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigationItems.map((item) => {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors"
                >
                  {renderIcon(item.icon)}
                  <span className="tracking-tight">{item.name}</span>
                </Link>
              )
            })}
            {/* Show locked items as disabled when suspended */}
            {isSuspended && !isSuperAdmin && suspendedNav?.length && suspendedNav
              .filter(item => item.href !== '/admin' && item.href !== '/admin/subscription')
              .map(item => {
                return (
                  <span
                    key={item.href}
                    title="Unlock by clearing your subscription dues"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium cursor-not-allowed opacity-40 text-muted-foreground select-none"
                  >
                    {renderIcon(item.icon)}
                    <span className="tracking-tight">{item.name}</span>
                  </span>
                )
              })
            }
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border space-y-2">
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              onClick={() => setOpen(false)}
            >
              {renderIcon('ExternalLink')}
              View Storefront
            </Link>
            <SignOutButton />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
