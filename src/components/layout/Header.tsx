'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Menu, ShoppingCart, Search } from 'lucide-react'
import { useState, useEffect, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { useCart } from '@/providers/CartProvider'
import { CartDrawer } from './header/CartDrawer'
import { MobileMenu } from './header/MobileMenu'
import { HeaderSearch } from './header/HeaderSearch'
import { isStaffRole } from '@/lib/roles'
import { FocusTrap } from '@/components/ui/focus-trap'

const NAV_LINKS = [
  { label: 'Shop', href: '/products' },
  { label: 'New', href: '/products?sort=newest' },
]

export function Header({ storeName = 'STRIDE', logoUrl }: { storeName?: string; logoUrl?: string | null }) {
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false)
  const { itemCount, openCart } = useCart()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleCartOpen = () => {
    if (mobileMenuOpen) setMobileMenuOpen(false)
    openCart()
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        mounted && scrolled
          ? 'bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-sm'
          : 'bg-background/80 backdrop-blur-sm border-b border-transparent'
      )}
      suppressHydrationWarning
    >
      <div className="container-max">
        <div className="flex h-16 items-center justify-between gap-3 sm:gap-6">
          {/* Left: hamburger (mobile) + logo + nav */}
          <div className="flex items-center gap-4 sm:gap-5 shrink-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <Link
              href="/"
              className="font-serif text-xl font-bold tracking-tight hover:opacity-80 transition-opacity shrink-0 flex items-center gap-2"
              aria-label={`${storeName} Home`}
            >
              {logoUrl ? (
                <img src={logoUrl} alt={storeName} width={128} height={32} className="h-8 w-auto object-contain" />
              ) : (
                storeName
              )}
            </Link>

            {/* Desktop nav — plain text links */}
            <nav className="hidden md:flex items-center gap-6 ml-2" aria-label="Main navigation">
              {NAV_LINKS.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right: search + cart + account */}
          <div className="flex items-center gap-2 sm:gap-4 flex-1 justify-end max-w-xl">
            <HeaderSearch />

            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              <button
                onClick={handleCartOpen}
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors shrink-0"
                aria-label={`Shopping cart, ${itemCount} items`}
              >
                <ShoppingCart className="h-4.5 w-4.5" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-semibold tabular-nums">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* Account area */}
              {status === 'loading' ? (
                <div className="h-7 w-16 animate-pulse bg-muted rounded-md ml-1 shrink-0" />
              ) : session ? (
                <div className="relative ml-1 shrink-0">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-1.5 rounded-lg p-1 hover:bg-accent/50 transition-colors"
                    aria-expanded={userMenuOpen}
                    aria-haspopup="true"
                    aria-label="Account menu"
                  >
                    {session.user.image ? (
                      <img
                        src={session.user.image}
                        alt=""
                        width={28}
                        height={28}
                        className="h-7 w-7 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                        {session.user.name?.charAt(0).toUpperCase() ||
                          session.user.email?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </button>

                  {userMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setUserMenuOpen(false)}
                        aria-hidden="true"
                      />
                      <FocusTrap onEscape={() => setUserMenuOpen(false)}>
                      <div className="absolute right-0 z-50 mt-2 w-52 origin-top-right rounded-xl border border-border bg-popover shadow-lg animate-in fade-in slide-in-from-top-2">
                        <div className="px-4 py-3 border-b border-border/50">
                          <p className="text-sm font-medium truncate">{session.user.name}</p>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {session.user.email}
                          </p>
                        </div>
                        <div className="p-1.5 space-y-0.5">
                          <Link
                            href="/account"
                            className="block px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            My Account
                          </Link>
                          <Link
                            href="/account/orders"
                            className="block px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            Orders
                          </Link>
                          <Link
                            href="/account/wishlist"
                            className="block px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            Wishlist
                          </Link>
                          {isStaffRole(session.user.role) && (
                            <Link
                              href="/admin"
                              className="block px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              Admin
                            </Link>
                          )}
                        </div>
                        <div className="p-1.5 border-t border-border/50">
                          <button
                            onClick={() => {
                              signOut({ callbackUrl: '/' })
                              setUserMenuOpen(false)
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                          >
                            Sign Out
                          </button>
                        </div>
                      </div>
                      </FocusTrap>
                    </>
                  )}
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="inline-flex h-10 items-center justify-center px-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/60 shrink-0"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {mounted &&
        typeof document !== 'undefined' &&
        createPortal(
          <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />,
          document.getElementById('portal-root') || document.body
        )}
    </header>
  )
}