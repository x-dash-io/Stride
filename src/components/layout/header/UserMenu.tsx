'use client'

import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { X, User, ShoppingCart, Heart, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function UserMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { data: session } = useSession()

  if (!isOpen || !session) return null

  const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN'

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="User menu">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in" onClick={onClose} aria-hidden="true" />
      <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-background shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        <div className="flex h-16 items-center justify-between border-b border-border/50 px-4">
          <h2 className="font-semibold text-base">{isAdmin ? 'Admin' : 'Account'}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close menu">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {!isAdmin && (
            <>
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
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
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
            </>
          )}
          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3 py-2.5 text-base font-medium rounded-lg hover:bg-accent/50 transition-colors"
              onClick={onClose}
            >
              <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
              Admin Dashboard
            </Link>
          )}
          <div className="pt-4 border-t border-border/50">
            <Button
              variant="ghost"
              onClick={() => { signOut({ callbackUrl: '/' }); onClose(); }}
              className="w-full text-left px-3 py-2.5 text-base font-medium text-destructive hover:bg-destructive/10 justify-start"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
