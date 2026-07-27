'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Menu, X, ShoppingBag, User, Search, ChevronDown, Heart, ChevronLeft, ChevronRight, Trash2, Package, Plus, Minus } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { useCart } from '@/providers/CartProvider'
import { formatPrice } from '@/lib/utils'

const shopItems = [
  { label: 'New Arrivals', href: '/products?sort=newest' },
  { label: 'Best Sellers', href: '/products?sort=popular' },
  { label: 'Brands', href: '/brands' },
  { label: 'Categories', href: '/categories' },
]

export function Header() {
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [shopMenuOpen, setShopMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const shopRef = useRef<HTMLDivElement>(null)
  const { cart, itemCount } = useCart()

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
                  <div className="absolute top-full left-0 mt-1 w-48 rounded-xl border border-border bg-popover p-1.5 shadow-lg animate-in fade-in slide-in-from-top-2">
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
              onClick={() => setCartOpen(true)}
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
      {mounted && createPortal(
        <ShopDropdown isOpen={shopMenuOpen} onClose={() => setShopMenuOpen(false)} />,
        document.body
      )}
    </header>
  )
}

function CartDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { cart, itemCount, removeItem, updateQuantity, clearCart } = useCart()
  const items = cart?.items || []

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Shopping cart">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in" onClick={onClose} aria-hidden="true" />
      <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-background shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        <div className="flex h-16 items-center justify-between border-b border-border/50 px-4">
          <h2 className="font-semibold text-base">Shopping Cart</h2>
          <button onClick={onClose} className="inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-accent transition-colors" aria-label="Close cart">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ShoppingBag className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground mb-6">Your cart is empty</p>
              <Button onClick={() => { onClose(); }} asChild>
                <Link href="/products">Continue Shopping</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const product = item.variant.product
                const price = item.unitPrice
                if (!product) return null
                return (
                  <div key={`${item.variantId}`} className="bg-card border border-border rounded-xl p-4 flex gap-4">
                    <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center text-3xl flex-shrink-0 relative overflow-hidden">
                      {product.images[0]?.url ? (
                        <img
                          src={product.images[0].url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <Package className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm text-primary font-medium">{product.brand.name}</p>
                          <h3 className="text-lg font-serif font-semibold">{product.name}</h3>
                        </div>
                        <p className="text-2xl font-bold text-primary whitespace-nowrap">
                          {formatPrice(price * item.quantity)}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                        <span>Color: {item.variant.colour}</span>
                        <span>Size: {item.variant.size}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.variantId, Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-16 text-center border-border"
                            min="1"
                            max={item.variant.availableStock}
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            disabled={item.quantity >= item.variant.availableStock}
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.variantId)}
                          className="text-destructive hover:bg-destructive hover:text-white"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
        <div className="border-t border-border/50 p-4">
          <Button className="w-full" onClick={onClose} size="lg" asChild>
            <Link href="/cart">View Cart & Checkout</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

function MobileMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
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

function UserMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
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

function ShopDropdown({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Shop dropdown">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in" onClick={onClose} aria-hidden="true" />
      <div className="fixed left-0 top-16 w-full md:w-auto bg-popover border-b border-border shadow-lg animate-in slide-in-from-top duration-200">
        <nav className="px-4 py-2 space-y-1" aria-label="Shop categories">
          {shopItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors"
              onClick={onClose}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}
