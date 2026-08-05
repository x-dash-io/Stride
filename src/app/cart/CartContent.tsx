'use client'

import Link from 'next/link'
import { useCart } from '@/providers/CartProvider'
import { useSession } from 'next-auth/react'
import { formatPrice } from '@/lib/utils'
import { ArrowLeft, Trash2, Plus, Minus, ChevronRight, ShoppingBag, Package, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

import { CartPageSkeleton } from '@/components/skeleton-loader'
import { EmptyState } from '@/components/ui/empty-state'
import { isStaffRole } from '@/lib/roles'

export function CartContent() {
  const { cart, items, removeItem, updateQuantity, clearCart, isLoading } = useCart()
  const { data: session } = useSession()
  const [pendingRemove, setPendingRemove] = useState<string | null>(null)
  const [showClearDialog, setShowClearDialog] = useState(false)
  const [isClearing, setIsClearing] = useState(false)

  const isStaff = isStaffRole(session?.user?.role)

  const handleClearCart = async () => {
    setIsClearing(true)
    try {
      // Clear local storage cart session ID
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cartSessionId')
        document.cookie = 'cartSessionId=; path=/; max-age=0; SameSite=Lax'
      }

      await clearCart()
      setShowClearDialog(false)
    } catch (error) {
      console.error('Failed to clear cart:', error)
    } finally {
      setIsClearing(false)
    }
  }

  if (isLoading) {
    return <CartPageSkeleton />
  }

  if (items.length === 0 || !cart) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Your Cart is Empty"
        description="Explore our premium collection and discover high-crafted footwear to elevate your wardrobe."
        action={{ label: 'Continue Shopping', href: '/products' }}
        variant="full"
      />
    )
  }

  return (
    <div className="px-6 sm:px-8 lg:px-12 py-8 lg:py-12 max-w-7xl mx-auto">
      <div className="mb-8">
        <Breadcrumbs items={[{ label: 'Cart' }]} />
      </div>

      <h1 className="text-4xl md:text-5xl font-serif font-bold mb-12">Your Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {items.map((item) => {
              const product = item.variant.product
              const price = item.unitPrice

              if (!product) return null

              return (
                <div
                  key={`${item.variantId}`}
                  className="bg-card rounded-xl p-6 flex gap-6 relative overflow-hidden"
                >
                  {/* Inline remove confirmation overlay */}
                  {pendingRemove === item.variantId && (
                    <div className="absolute inset-0 z-10 bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center gap-4 rounded-xl animate-fade-in">
                      <p className="text-sm font-medium text-foreground text-center px-4">
                        Remove <span className="font-bold">{product.name}</span> from your cart?
                      </p>
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPendingRemove(null)}
                        >
                          Keep It
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            removeItem(item.variantId)
                            setPendingRemove(null)
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {product.images[0]?.url ? (
                      <img
                        src={product.images[0].url}
                        alt={product.name}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <Package className="w-12 h-12 text-muted-foreground" />
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
                          <Minus className="w-4 h-4" />
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
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setPendingRemove(item.variantId)}
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
        </div>

        <div className="lg:col-span-1">
          <div className="bg-muted/30 border border-border rounded-xl p-8 sticky top-24">
            <h2 className="text-xl font-serif font-bold mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6 pb-6 border-b border-border">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatPrice(cart.subtotal)}</span>
              </div>
              {(() => {
                const taxRate = Number(process.env.NEXT_PUBLIC_TAX_RATE || '0.16');
                if (taxRate <= 0) return null;
                return (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax ({taxRate * 100}%)</span>
                    <span className="font-medium">{formatPrice(cart.taxTotal)}</span>
                  </div>
                );
              })()}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">
                  {cart.shippingTotal === 0 ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    formatPrice(cart.shippingTotal)
                  )}
                </span>
              </div>
            </div>

            {isStaff ? (
              /* Staff cannot checkout — display a role notice */
              <div className="space-y-3 mb-3">
                <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl p-4">
                  <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">Admin accounts cannot place orders</p>
                    <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5 leading-relaxed">
                      Staff accounts are for store management only. Use a customer account to make purchases.
                    </p>
                  </div>
                </div>
                <Button className="w-full" size="lg" disabled>
                  Proceed to Checkout
                </Button>
              </div>
            ) : (
              <Link href="/cart/checkout" className="block mb-3">
                <Button className="w-full" size="lg">Proceed to Checkout</Button>
              </Link>
            )}

            <Button variant="outline" className="w-full" onClick={() => window.location.href = '/products'}>
              Continue Shopping
            </Button>

            <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
              <DialogTrigger asChild>
                <Button variant="ghost" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10">
                  Clear Cart
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Clear Cart</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to remove all items from your cart? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowClearDialog(false)}
                    disabled={isClearing}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleClearCart}
                    disabled={isClearing}
                  >
                    {isClearing ? 'Clearing...' : 'Clear Cart'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  )
}