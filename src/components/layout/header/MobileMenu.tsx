'use client'

import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { isStaffRole } from '@/lib/roles'
import { FocusTrap } from '@/components/ui/focus-trap'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'

const shopItems = [
  { label: 'Shop', href: '/products' },
  { label: 'New Arrivals', href: '/products?sort=newest' },
]

export function MobileMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { data: session } = useSession()

  useBodyScrollLock(isOpen)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] md:hidden" role="dialog" aria-modal="true" aria-label="Mobile menu">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in" onClick={onClose} aria-hidden="true" />
      <FocusTrap onEscape={onClose}>
      <div className="fixed left-0 top-0 h-full w-full max-w-sm bg-background shadow-2xl flex flex-col animate-in slide-in-from-left duration-200">
        <div className="flex h-16 items-center justify-between border-b border-border/50 px-4">
          <Link href="/" className="font-serif font-bold text-xl" onClick={onClose}>STRIDE</Link>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close menu">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2" aria-label="Mobile navigation">
          {shopItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-4 text-base font-medium leading-relaxed text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent/50 transition-colors"
              onClick={onClose}
            >
              {item.label}
            </Link>
          ))}
          <div className="my-6 border-t border-border/50" />
          {session ? (
            <div className="space-y-2">
              <Link
                href="/account"
                className="block px-3 py-4 text-base font-medium leading-relaxed rounded-lg hover:bg-accent/50 transition-colors"
                onClick={onClose}
              >
                My Account
              </Link>
              <Link
                href="/account/orders"
                className="block px-3 py-4 text-base font-medium leading-relaxed rounded-lg hover:bg-accent/50 transition-colors"
                onClick={onClose}
              >
                My Orders
              </Link>
              <Link
                href="/account/wishlist"
                className="block px-3 py-4 text-base font-medium leading-relaxed rounded-lg hover:bg-accent/50 transition-colors"
                onClick={onClose}
              >
                Wishlist
              </Link>
              {isStaffRole(session.user.role) && (
                <Link
                  href="/admin"
                  className="block px-3 py-4 text-base font-medium leading-relaxed rounded-lg hover:bg-accent/50 transition-colors"
                  onClick={onClose}
                >
                  Admin Dashboard
                </Link>
              )}
              <Button
                variant="ghost"
                onClick={() => { signOut({ callbackUrl: '/' }); onClose(); }}
                className="w-full text-left px-3 py-4 text-base font-medium text-destructive hover:bg-destructive/10 justify-start"
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="block px-3 py-4 text-base font-medium leading-relaxed rounded-lg hover:bg-accent/50 transition-colors"
              onClick={onClose}
            >
              Sign In
            </Link>
          )}
        </nav>
        <div className="border-t border-border/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Theme</span>
            <ThemeSwitcher />
          </div>
        </div>
      </div>
      </FocusTrap>
    </div>
  )
}
