'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Menu, X, ShoppingBag, User, Search, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const navItems = [
  { label: 'New Arrivals', href: '/products?sort=newest' },
  { label: 'Best Sellers', href: '/products?sort=popular' },
  { label: 'Sale', href: '/products?salePrice=gt:0' },
  { label: 'Brands', href: '/brands' },
  { label: 'Categories', href: '/categories' },
]

export function Header() {
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container-max">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>

            <Link href="/" className="font-serif font-bold text-xl md:text-2xl" aria-label="STRIDE Home">
              STRIDE
            </Link>

            <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/products"
              className="relative p-2 text-muted-foreground hover:text-foreground transition-colors md:hidden"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Link>

            <Link
              href="/cart"
              onClick={(e) => { e.preventDefault(); setCartOpen(true); }}
              className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Shopping cart"
            >
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                0
              </span>
            </Link>

            {status === 'loading' ? (
              <div className="h-8 w-20 animate-pulse bg-muted rounded" />
            ) : session ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 rounded-full p-1 hover:bg-accent transition-colors"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                >
                  {session.user.image ? (
                    <img src={session.user.image} alt="" className="h-8 w-8 rounded-full" />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                      {session.user.name?.charAt(0).toUpperCase() || session.user.email?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <ChevronDown className="h-4 w-4" />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} aria-hidden="true" />
                    <div className="relative z-50 mt-2 w-56 rounded-md border bg-popover p-2 shadow-lg">
                      <div className="px-2 py-1 border-b">
                        <p className="text-sm font-medium">{session.user.name}</p>
                        <p className="text-xs text-muted-foreground">{session.user.email}</p>
                      </div>
                      <Link
                        href="/account"
                        className="flex items-center gap-2 px-2 py-2 text-sm hover:bg-accent rounded-md"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        My Account
                      </Link>
                      <Link
                        href="/account/orders"
                        className="flex items-center gap-2 px-2 py-2 text-sm hover:bg-accent rounded-md"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <ShoppingBag className="h-4 w-4" />
                        My Orders
                      </Link>
                      {(session.user as any).role === 'ADMIN' && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2 px-2 py-2 text-sm hover:bg-accent rounded-md"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="flex w-full items-center gap-2 px-2 py-2 text-sm text-destructive hover:bg-accent rounded-md"
                      >
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <User className="h-4 w-4" />
                Account
              </Link>
            )}
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Mobile menu">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} aria-hidden="true" />
          <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-background shadow-xl flex flex-col">
            <div className="flex h-16 items-center justify-between border-b px-4">
              <Link href="/" className="font-serif font-bold text-xl">STRIDE</Link>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2" aria-label="Close menu">
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-2" aria-label="Mobile navigation">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block py-3 text-lg font-medium text-muted-foreground hover:text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <hr className="my-4" />
              {session ? (
                <div className="space-y-2">
                  <Link
                    href="/account"
                    className="block py-3 text-lg font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Account
                  </Link>
                  <Link
                    href="/account/orders"
                    className="block py-3 text-lg font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Orders
                  </Link>
                  {(session.user as any).role === 'ADMIN' && (
                    <Link
                      href="/admin"
                      className="block py-3 text-lg font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="w-full text-left py-3 text-lg font-medium text-destructive"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="block py-3 text-lg font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}

      {cartOpen && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Shopping cart">
          <div className="fixed inset-0 bg-black/50" onClick={() => setCartOpen(false)} aria-hidden="true" />
          <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-background shadow-xl flex flex-col">
            <div className="flex h-16 items-center justify-between border-b px-4">
              <h2 className="font-semibold">Shopping Cart</h2>
              <button onClick={() => setCartOpen(false)} className="p-2" aria-label="Close cart">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <p className="text-center text-muted-foreground py-8">Cart is empty</p>
              <Link href="/products" className="block text-center mt-4">
                <Button className="w-full">Continue Shopping</Button>
              </Link>
            </div>
            <div className="border-t p-4">
              <Link href="/cart" className="block">
                <Button className="w-full" onClick={() => setCartOpen(false)}>View Cart & Checkout</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}