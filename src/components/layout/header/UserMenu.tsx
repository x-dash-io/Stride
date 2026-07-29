'use client'

import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { X, User, ShoppingBag, Heart } from 'lucide-react'

export function UserMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { data: session } = useSession()

  if (!isOpen || !session) return null

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="User menu">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in" onClick={onClose} aria-hidden="true" />
      <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-background shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        <div className="flex h-16 items-center justify-between border-b border-border/50 px-4">
          <h2 className="font-semibold text-base">Account</h2>
          <button onClick={onClose} className="inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-accent transition-colors" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
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
          <div className="pt-4 border-t border-border/50">
            <button
              onClick={() => { signOut({ callbackUrl: '/cart' }); onClose(); }}
              className="w-full text-left px-3 py-2.5 text-base font-medium text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}