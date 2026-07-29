'use client'

import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { X, User, ShoppingBag, Heart } from 'lucide-react'
import { ThemeSwitcher } from '@/components/theme-switcher'

const shopItems = [
  { label: 'New Arrivals', href: '/products?sort=newest' },
  { label: 'Best Sellers', href: '/products?sort=popular' },
  { label: 'Brands', href: '/brands' },
  { label: 'Categories', href: '/categories' },
]

export function MobileMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { data: session } = useSession()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] md:hidden" role="dialog" aria-modal="true" aria-label="Mobile menu">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in" onClick={onClose} aria-hidden="true" />
      <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-background shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        <div className="flex h-16 items-center justify-between border-b border-border/50 px-4">
          <Link href="/" className="font-serif font-bold text-xl" onClick={onClose}>STRIDE</Link>
          <button onClick={onClose} className="inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-accent transition-colors" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-1" aria-label="Mobile navigation">
          {shopItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-2.5 text-base font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent/50 transition-colors"
              onClick={onClose}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/products?salePrice=gt:0"
            className="block px-3 py-2.5 text-base font-medium text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
            onClick={onClose}
          >
            Sale
          </Link>
          <div className="my-4 border-t border-border/50" />
          {session ? (
            <div className="space-y-1">
              <Link
                href="/account"
                className="flex items-center gap-3 px-3 py-2.5 text-base font-medium rounded-lg hover:bg-accent/50 transition-colors"
                onClick={onClose}
              >
                <User className="h-4 w-4 text-muted-foreground" />
                My Account
              </Link>
              <Link
                href="/account/orders"
                className="flex items-center gap-3 px-3 py-2.5 text-base font-medium rounded-lg hover:bg-accent/50 transition-colors"
                onClick={onClose}
              >
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                My Orders
              </Link>
              <Link
                href="/account/wishlist"
                className="flex items-center gap-3 px-3 py-2.5 text-base font-medium rounded-lg hover:bg-accent/50 transition-colors"
                onClick={onClose}
              >
                <Heart className="h-4 w-4 text-muted-foreground" />
                Wishlist
              </Link>
              {session.user.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className="block px-3 py-2.5 text-base font-medium rounded-lg hover:bg-accent/50 transition-colors"
                  onClick={onClose}
                >
                  Admin Dashboard
                </Link>
              )}
              <button
                onClick={() => { signOut({ callbackUrl: '/cart' }); onClose(); }}
                className="w-full text-left px-3 py-2.5 text-base font-medium text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="block px-3 py-2.5 text-base font-medium rounded-lg hover:bg-accent/50 transition-colors"
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
    </div>
  )
}