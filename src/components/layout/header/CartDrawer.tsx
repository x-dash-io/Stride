'use client'

import Link from 'next/link'
import { X, ShoppingBag, Package, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useCart } from '@/providers/CartProvider'
import { formatPrice } from '@/lib/utils'

export function CartDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { cart, itemCount, removeItem, updateQuantity, clearCart } = useCart()
  const items = cart?.items || []

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Shopping cart">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in" onClick={onClose} aria-hidden="true" />
      <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-background shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        <div className="flex h-16 items-center justify-between border-b border-border/50 px-4">
          <h2 className="font-semibold text-base">Shopping Cart</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close cart">
            <X className="h-5 w-5" />
          </Button>
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