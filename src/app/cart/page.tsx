'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/providers/CartProvider'
import { formatPrice } from '@/lib/utils'
import { ArrowLeft, Trash2, Plus, Minus, ChevronRight, ShoppingBag, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Breadcrumbs } from '@/components/breadcrumbs'

export default function CartPage() {
  const { cart, items, removeItem, updateQuantity, isLoading } = useCart()

  if (isLoading) {
    return (
      <div className="container-max py-24 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (items.length === 0 || !cart) {
    return (
      <div className="container-max py-24 min-h-screen flex flex-col items-center justify-center text-center">
        <ShoppingBag className="w-24 h-24 text-muted-foreground mb-8" />
        <h1 className="text-4xl font-serif font-bold mb-4">Your cart is empty</h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          Explore our premium collection and add some beautiful shoes to your cart.
        </p>
        <Link href="/products">
          <Button size="lg">Continue Shopping</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container-max py-12 min-h-screen">
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
                  className="bg-card border border-border rounded-xl p-6 flex gap-6"
                >
                  <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center text-3xl flex-shrink-0 relative overflow-hidden">
                    {product.images[0]?.url ? (
                      <Image
                        src={product.images[0].url}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="96px"
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
        </div>

        <div className="lg:col-span-1">
          <div className="bg-muted/30 border border-border rounded-xl p-8 sticky top-24">
            <h2 className="text-xl font-serif font-bold mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6 pb-6 border-b border-border">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatPrice(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (16%)</span>
                <span className="font-medium">{formatPrice(cart.taxTotal)}</span>
              </div>
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

            {cart.subtotal < 10000 && (
              <p className="text-xs text-muted-foreground mb-6 bg-blue-50 dark:bg-blue-950 p-3 rounded">
                Free shipping on orders over KES 10,000. You're {formatPrice(10000 - cart.subtotal)} away!
              </p>
            )}

            <Link href="/cart/checkout" className="block mb-3">
              <Button className="w-full" size="lg">Proceed to Checkout</Button>
            </Link>

            <Button variant="outline" className="w-full" onClick={() => window.location.href = '/products'}>
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}