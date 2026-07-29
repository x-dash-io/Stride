'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Menu, ShoppingBag, User, Search, ChevronDown, Heart } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { useCart } from '@/providers/CartProvider'
import { CartDrawer } from './header/CartDrawer'
import { MobileMenu } from './header/MobileMenu'
import { UserMenu } from './header/UserMenu'
import { shopItems } from './header/shopItems'

export function Header() {
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [shopMenuOpen, setShopMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const shopRef = useRef<HTMLDivElement>(null)
  const { itemCount } = useCart()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (shopRef.current && !shopRef.current.contains(event.target as Node)) {
        setShopMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleCartOpen = () => {
    if (mobileMenuOpen) setMobileMenuOpen(false)
    setCartOpen(true)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container-max">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <Link href="/" className="font-serif text-xl md:text-2xl font-bold tracking-tight" aria-label="STRIDE Home">
              STRIDE
            </Link>

            <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
              <div className="relative" ref={shopRef}>
                <button
                  onClick={() => setShopMenuOpen(!shopMenuOpen)}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-accent/50 transition-colors"
                  aria-expanded={shopMenuOpen}
                  aria-haspopup="true"
                >
                  Shop
                  <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', shopMenuOpen && 'rotate-180')} />
                </button>
                {shopMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShopMenuOpen(false)}
                      aria-hidden="true"
                    />
                    <div className="absolute top-full left-0 z-50 mt-1 w-48 rounded-xl border border-border bg-popover p-1.5 shadow-lg animate-in fade-in slide-in-from-top-2">
                    {shopItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors"
                        onClick={() => setShopMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                    </div>
                  </>
                )}
              </div>
              <Link
                href="/products?salePrice=gt:0"
                className="px-3 py-2 text-sm font-medium text-destructive hover:text-destructive/80 rounded-md hover:bg-destructive/10 transition-colors"
              >
                Sale
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            <ThemeSwitcher />

            <Link
              href="/search"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </Link>

            <Link
              href="/account/wishlist"
              className="hidden md:inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="h-4 w-4" />
            </Link>

            <button
              onClick={handleCartOpen}
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
              aria-label="Shopping cart"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-medium">
                {itemCount > 0 ? itemCount : 0}
              </span>
            </button>

            {status === 'loading' ? (
              <div className="h-8 w-20 animate-pulse bg-muted rounded-lg" />
            ) : session ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-accent/50 transition-colors"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                >
                  {session.user.image ? (
                    <img src={session.user.image} alt="" className="h-7 w-7 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                      {session.user.name?.charAt(0).toUpperCase() || session.user.email?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <ChevronDown className="hidden sm:block h-3.5 w-3.5 text-muted-foreground" />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} aria-hidden="true" />
                    <div className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-xl border border-border bg-popover p-1.5 shadow-lg animate-in fade-in slide-in-from-top-2">
                      <div className="px-3 py-2 mb-1 border-b border-border/50">
                        <p className="text-sm font-medium truncate">{session.user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                      </div>
                      <Link
                        href="/account"
                        className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="h-4 w-4 text-muted-foreground" />
                        My Account
                      </Link>
                      <Link
                        href="/account/orders"
                        className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                        My Orders
                      </Link>
                      <Link
                        href="/account/wishlist"
                        className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Heart className="h-4 w-4 text-muted-foreground" />
                        Wishlist
                      </Link>
                      {session.user.role === 'ADMIN' && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      <div className="mt-1 pt-1 border-t border-border/50">
                        <button
                          onClick={() => { signOut({ callbackUrl: '/cart' }); setUserMenuOpen(false); }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link href="/auth/login">
                <Button variant="outline" size="sm" className="hidden md:inline-flex">
                  <User className="h-3.5 w-3.5" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      {mounted && createPortal(
        <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />,
        document.body
      )}
      {mounted && createPortal(
        <UserMenu isOpen={userMenuOpen} onClose={() => setUserMenuOpen(false)} />,
        document.body
      )}
    </header>
  )
}