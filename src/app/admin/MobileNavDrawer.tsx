'use client'

import { useState } from 'react'
import { ThemeSwitcher } from '@/components/theme-switcher'
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
  ExternalLink, 
  Tag, 
  Layers, 
  Image as ImageIcon, 
  Boxes, 
  MessageSquare 
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
  Tag,
  Layers,
  ImageIcon,
  Boxes,
  MessageSquare,
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
  pathname?: string
}

export function MobileNavDrawer({ storeName, navigationItems, suspendedNav, isSuspended, isSuperAdmin, pathname }: MobileNavDrawerProps) {
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
            <div className="mb-4 px-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {isSuperAdmin ? 'Platform Access' : 'Store Management'}
              </h3>
            </div>
            {navigationItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all {
                    isActive
                      ? 'bg-primary/10 text-primary border-l-4 border-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }`}
                >
                  {renderIcon(item.icon)}
                  <span className="tracking-tight">{item.name}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-green-500 rounded-full" />
                  )}
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
            <SignOutButton />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
