'use client'

import Link from 'next/link'
import { useCart } from '@/lib/contexts/cart-context'
import { getProductById } from '@/lib/data/products'
import { Trash2, ArrowLeft } from 'lucide-react'

export default function CartPage() {
  const { cart, removeItem, updateQuantity } = useCart()

  if (cart.items.length === 0) {
    return (
      <div className="container-max py-24 min-h-screen flex flex-col items-center justify-center text-center">
        <div className="mb-8 text-6xl">🛍️</div>
        <h1 className="text-4xl font-serif font-bold mb-4">Your cart is empty</h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          Explore our premium collection and add some beautiful shoes to your cart.
        </p>
        <Link href="/products" className="btn-primary">
          Continue Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="container-max py-12 min-h-screen">
      <Link
        href="/products"
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Continue Shopping
      </Link>

      <h1 className="text-4xl md:text-5xl font-serif font-bold mb-12">Your Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {cart.items.map((item) => {
              const product = getProductById(item.productId)
              if (!product) return null
              const price = product.salePrice || product.price

              return (
                <div
                  key={`${item.productId}-${item.selectedColor}-${item.selectedSize}`}
                  className="bg-card border border-border rounded-lg p-6 flex gap-6"
                >
                  <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center text-3xl flex-shrink-0">
                    👟
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm text-accent font-medium">{product.brand}</p>
                        <h3 className="text-lg font-serif font-semibold">
                          {product.name}
                        </h3>
                      </div>
                      <p className="text-2xl font-bold text-primary">
                        ${(price * item.quantity).toFixed(2)}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                      <span>Color: {item.selectedColor}</span>
                      <span>Size: {item.selectedSize}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity - 1)
                          }
                          className="w-8 h-8 border border-border rounded hover:bg-muted transition-colors"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            updateQuantity(
                              item.productId,
                              Math.max(1, parseInt(e.target.value) || 1)
                            )
                          }
                          className="w-12 text-center border border-border rounded py-1"
                          min="1"
                        />
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity + 1)
                          }
                          className="w-8 h-8 border border-border rounded hover:bg-muted transition-colors"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-destructive hover:bg-destructive hover:text-white p-2 rounded transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-muted/30 border border-border rounded-lg p-8 sticky top-24">
            <h2 className="text-xl font-serif font-bold mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6 pb-6 border-b border-border">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">${cart.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (9%)</span>
                <span className="font-medium">${cart.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">
                  {cart.shipping === 0 ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    `$${cart.shipping.toFixed(2)}`
                  )}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-8">
              <span className="font-semibold text-lg">Total</span>
              <span className="text-3xl font-bold text-accent">
                ${cart.total.toFixed(2)}
              </span>
            </div>

            {cart.subtotal < 200 && (
              <p className="text-xs text-muted-foreground mb-6 bg-blue-50 dark:bg-blue-950 p-3 rounded">
                Free shipping on orders over $200. You&apos;re ${(200 - cart.subtotal).toFixed(2)} away!
              </p>
            )}

            <Link
              href="/cart/checkout"
              className="btn-primary w-full text-center block mb-3"
            >
              Proceed to Checkout
            </Link>

            <button className="w-full btn-secondary">Continue Shopping</button>
          </div>
        </div>
      </div>
    </div>
  )
}
