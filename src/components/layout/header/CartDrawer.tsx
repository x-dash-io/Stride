'use client'

import { useEffect, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ShieldCheck,
  Truck,
  Package,
  Lock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/providers/CartProvider'
import { formatPrice } from '@/lib/utils'

import { EmptyState } from '@/components/ui/empty-state'

export function CartDrawer({ isOpen: propsIsOpen, onClose: propsOnClose }: { isOpen?: boolean; onClose?: () => void } = {}) {
  const { cart, itemCount, removeItem, updateQuantity, isCartOpen: contextIsOpen, closeCart: contextCloseCart } = useCart()
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false)
  const items = cart?.items || []

  const isOpen = propsIsOpen !== undefined ? propsIsOpen : contextIsOpen
  const onClose = propsOnClose || contextCloseCart

  const subtotal = items.reduce((total, item) => total + (item.unitPrice || 0) * (item.quantity || 1), 0)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  const portalTarget = typeof document !== 'undefined' ? (document.getElementById('portal-root') || document.body) : null
  if (!mounted || !isOpen || !portalTarget) return null

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Cart Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Cart"
        className="fixed inset-y-0 right-0 z-50 h-full w-full max-w-sm bg-background shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-border/50 px-4 shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <div>
              <h2 className="text-base font-semibold leading-none">Shopping Cart</h2>
              <p className="text-xs text-muted-foreground mt-1">{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close cart"
            className="h-9 w-9"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>



        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto px-4 divide-y divide-border/40">
          {items.length === 0 ? (
            <EmptyState
              icon={ShoppingBag}
              title="Your Cart is Empty"
              description="Discover our premium collection of handcrafted footwear."
              action={{
                label: 'Explore Collection',
                href: '/products',
                onClick: onClose,
              }}
              variant="minimal"
              className="py-12"
            />
          ) : (
            <div className="py-4 space-y-5">
              {items.map((item) => {
                const product = item.variant?.product
                const price = item.unitPrice || 0
                if (!product) return null

                return (
                  <div key={`${item.variantId}`} className="py-4 flex gap-3 items-start">
                    {/* Thumbnail */}
                    <div className="w-16 h-20 bg-muted rounded-lg flex items-center justify-center shrink-0 overflow-hidden border border-border/40">
                      {product.images && product.images[0]?.url ? (
                        <img
                          src={product.images[0].url}
                          alt={product.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <Package className="w-8 h-8 text-muted-foreground/50" />
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="min-w-0">
                          <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase block">
                            {product.brand?.name || 'Stride'}
                          </span>
                          <h4 className="text-sm font-medium text-foreground line-clamp-1">{product.name}</h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('Are you sure you want to remove this item from your cart?')) {
                              removeItem(item.variantId)
                            }
                          }}
                          className="text-muted-foreground/60 hover:text-destructive transition-colors flex-shrink-0 p-1"
                          aria-label={`Remove ${product.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Variant Info */}
                      <div className="flex items-center gap-1.5 my-2 flex-wrap">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-muted text-muted-foreground border border-border/30">
                          {item.variant.colour}
                        </span>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-muted text-muted-foreground border border-border/30">
                          {item.variant.size}
                        </span>
                      </div>

                      {/* Quantity & Price */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-border/80 rounded overflow-hidden bg-background">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-semibold">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            disabled={item.quantity >= (item.variant.availableStock || 99)}
                            className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-sm font-bold">{formatPrice(price * item.quantity)}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border/50 p-4 shrink-0 space-y-3">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">{formatPrice(subtotal)}</span>
              </div>
              <p className="text-xs text-muted-foreground text-center">Shipping and taxes calculated at checkout</p>
            </div>

            {/* CTAs */}
            <div className="space-y-2">
              <Button
                className="w-full h-10 font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2"
                onClick={onClose}
                asChild
              >
                <Link href="/cart/checkout">
                  <Lock className="w-4 h-4" />
                  <span>Checkout</span>
                </Link>
              </Button>

              <Button
                variant="outline"
                className="w-full h-10 font-medium rounded-lg"
                onClick={onClose}
                asChild
              >
                <Link href="/cart">View Bag ({itemCount})</Link>
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center justify-between text-[10px] text-muted-foreground/80 border-t border-border/30 pt-2">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                Secure
              </span>
              <span className="flex items-center gap-1">
                <Truck className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                Fast Delivery
              </span>
            </div>
          </div>
        )}
      </div>
    </>,
    portalTarget
  )
}
