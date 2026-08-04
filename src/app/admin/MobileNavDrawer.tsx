'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog'
import Link from 'next/link'
import { SignOutButton } from './SignOutButton'

interface MobileNavDrawerProps {
  storeName?: string | null
  navigationItems: Array<{
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

export function MobileNavDrawer({ storeName, navigationItems, suspendedNav, isSuspended, isSuperAdmin }: MobileNavDrawerProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="w-5 h-5" />
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
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors"
                >
                  <Icon className="w-5 h-5" />
                  <span className="tracking-tight">{item.name}</span>
                </Link>
              )
            })}
            {/* Show locked items as disabled when suspended */}
            {isSuspended && !isSuperAdmin && suspendedNav?.length && suspendedNav
              .filter(item => item.href !== '/admin' && item.href !== '/admin/subscription')
              .map(item => {
                const Icon = item.icon
                return (
                  <span
                    key={item.href}
                    title="Unlock by clearing your subscription dues"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium cursor-not-allowed opacity-40 text-muted-foreground select-none"
                  >
                    <Icon className="w-5 h-5" />
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
              View Storefront
            </Link>
            <SignOutButton />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
