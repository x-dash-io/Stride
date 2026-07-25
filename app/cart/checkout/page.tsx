'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/contexts/cart-context'
import { useAuth } from '@/lib/contexts/auth-context'
import { getProductById } from '@/lib/data/products'
import { createOrder } from '@/lib/data/orders'
import { ChevronRight, Check } from 'lucide-react'

type Step = 'shipping' | 'payment' | 'confirmation'

export default function CheckoutPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const { cart, clearCart } = useCart()
  const [currentStep, setCurrentStep] = useState<Step>('shipping')
  const [orderNumber, setOrderNumber] = useState<string>('')

  const [shippingData, setShippingData] = useState({
    fullName: user?.name || '',
    street: user?.addresses?.[0]?.street || '',
    city: user?.addresses?.[0]?.city || '',
    state: user?.addresses?.[0]?.state || '',
    zipCode: user?.addresses?.[0]?.zipCode || '',
    country: user?.addresses?.[0]?.country || 'USA',
  })

  const [billingData, setBillingData] = useState({
    sameAsShipping: true,
  })

  const [paymentData, setPaymentData] = useState({
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  })

  const [promoCode, setPromoCode] = useState('')
  const [appliedPromo, setAppliedPromo] = useState(false)

  if (!isAuthenticated) {
    return (
      <div className="container-max py-24 text-center min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-3xl font-serif font-bold mb-4">Please sign in to continue</h1>
        <p className="text-muted-foreground mb-8">
          You need to be logged in to complete your purchase.
        </p>
        <button
          onClick={() => router.push('/auth/login')}
          className="btn-primary"
        >
          Sign In
        </button>
      </div>
    )
  }

  if (cart.items.length === 0) {
    return (
      <div className="container-max py-24 text-center min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-3xl font-serif font-bold mb-4">Your cart is empty</h1>
        <button
          onClick={() => router.push('/products')}
          className="btn-primary"
        >
          Continue Shopping
        </button>
      </div>
    )
  }

  const handlePlaceOrder = () => {
    // Create order
    const orderItems = cart.items.map((item) => {
      const product = getProductById(item.productId)!
      return {
        productId: item.productId,
        productName: product.name,
        brand: product.brand,
        price: product.salePrice || product.price,
        quantity: item.quantity,
        color: item.selectedColor,
        size: item.selectedSize,
        image: product.images[0].url,
      }
    })

    const order = createOrder(user!.id, orderItems, {
      id: 'addr-' + Date.now(),
      type: 'shipping',
      fullName: shippingData.fullName,
      street: shippingData.street,
      city: shippingData.city,
      state: shippingData.state,
      zipCode: shippingData.zipCode,
      country: shippingData.country,
      isDefault: false,
    }, appliedPromo ? 'SAVE10' : undefined)

    setOrderNumber(order.id)
    clearCart()
    setCurrentStep('confirmation')
  }

  return (
    <div className="container-max py-12 min-h-screen">
      <h1 className="text-4xl md:text-5xl font-serif font-bold mb-12">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          {/* Steps */}
          <div className="mb-12 flex items-center gap-4">
            {(['shipping', 'payment', 'confirmation'] as const).map((step, idx, arr) => (
              <div key={step} className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    currentStep === step
                      ? 'bg-accent text-accent-foreground'
                      : step === 'confirmation' || arr.indexOf(currentStep) > idx
                      ? 'bg-green-600 text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step === 'confirmation' || arr.indexOf(currentStep) > idx ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    idx + 1
                  )}
                </div>
                <span className="text-sm font-medium capitalize">{step}</span>
                {idx < arr.length - 1 && <ChevronRight className="w-4 h-4 text-muted-foreground ml-2" />}
              </div>
            ))}
          </div>

          {/* Shipping Step */}
          {currentStep === 'shipping' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-serif font-bold mb-6">Shipping Address</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold block mb-2">Full Name</label>
                  <input
                    type="text"
                    value={shippingData.fullName}
                    onChange={(e) =>
                      setShippingData({ ...shippingData, fullName: e.target.value })
                    }
                    className="input-base"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold block mb-2">Street Address</label>
                <input
                  type="text"
                  value={shippingData.street}
                  onChange={(e) =>
                    setShippingData({ ...shippingData, street: e.target.value })
                  }
                  className="input-base"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-semibold block mb-2">City</label>
                  <input
                    type="text"
                    value={shippingData.city}
                    onChange={(e) =>
                      setShippingData({ ...shippingData, city: e.target.value })
                    }
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-2">State</label>
                  <input
                    type="text"
                    value={shippingData.state}
                    onChange={(e) =>
                      setShippingData({ ...shippingData, state: e.target.value })
                    }
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-2">ZIP Code</label>
                  <input
                    type="text"
                    value={shippingData.zipCode}
                    onChange={(e) =>
                      setShippingData({ ...shippingData, zipCode: e.target.value })
                    }
                    className="input-base"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => router.back()}
                  className="btn-secondary"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep('payment')}
                  className="btn-primary"
                >
                  Continue to Payment
                </button>
              </div>
            </div>
          )}

          {/* Payment Step */}
          {currentStep === 'payment' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-serif font-bold mb-6">Payment Method</h2>

              <div className="border-2 border-accent rounded-lg p-6 bg-accent/5">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="payment" defaultChecked className="w-4 h-4" />
                  <span className="font-medium">Credit Card</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold block mb-2">Cardholder Name</label>
                  <input
                    type="text"
                    value={paymentData.cardName}
                    onChange={(e) =>
                      setPaymentData({ ...paymentData, cardName: e.target.value })
                    }
                    placeholder="John Doe"
                    className="input-base"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold block mb-2">Card Number</label>
                <input
                  type="text"
                  value={paymentData.cardNumber}
                  onChange={(e) =>
                    setPaymentData({ ...paymentData, cardNumber: e.target.value })
                  }
                  placeholder="4532 1234 5678 9010"
                  className="input-base"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold block mb-2">Expiry Date</label>
                  <input
                    type="text"
                    value={paymentData.expiry}
                    onChange={(e) =>
                      setPaymentData({ ...paymentData, expiry: e.target.value })
                    }
                    placeholder="MM/YY"
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-2">CVV</label>
                  <input
                    type="text"
                    value={paymentData.cvv}
                    onChange={(e) =>
                      setPaymentData({ ...paymentData, cvv: e.target.value })
                    }
                    placeholder="123"
                    className="input-base"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setCurrentStep('shipping')}
                  className="btn-secondary"
                >
                  Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  className="btn-primary"
                >
                  Place Order
                </button>
              </div>
            </div>
          )}

          {/* Confirmation Step */}
          {currentStep === 'confirmation' && (
            <div className="text-center py-12">
              <div className="mb-6 text-6xl">✓</div>
              <h2 className="text-3xl font-serif font-bold mb-3">Order Confirmed!</h2>
              <p className="text-muted-foreground mb-6 text-lg">
                Thank you for your purchase. Your order has been received and is being processed.
              </p>
              <div className="bg-muted/30 rounded-lg p-6 mb-8 inline-block">
                <p className="text-sm text-muted-foreground mb-1">Order Number</p>
                <p className="text-2xl font-bold font-mono">{orderNumber}</p>
              </div>
              <div className="space-y-3">
                <p className="text-muted-foreground">
                  You&apos;ll receive a confirmation email shortly with tracking information.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => router.push('/account/orders')}
                    className="btn-primary"
                  >
                    View Orders
                  </button>
                  <button
                    onClick={() => router.push('/products')}
                    className="btn-secondary"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-muted/30 border border-border rounded-lg p-8 sticky top-24">
            <h3 className="text-xl font-serif font-bold mb-6">Order Summary</h3>

            <div className="space-y-3 mb-6 pb-6 border-b border-border max-h-64 overflow-y-auto">
              {cart.items.map((item) => {
                const product = getProductById(item.productId)
                if (!product) return null
                const price = product.salePrice || product.price

                return (
                  <div key={`${item.productId}-${item.selectedSize}`} className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex-1">
                      {product.name.substring(0, 20)}... x{item.quantity}
                    </span>
                    <span className="font-medium">
                      ${(price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                )
              })}
            </div>

            {currentStep !== 'confirmation' && (
              <div className="space-y-3 mb-6 pb-6 border-b border-border">
                <div>
                  <label className="text-xs text-muted-foreground block mb-2">
                    Promo Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="SAVE10"
                      className="input-base text-sm"
                      disabled={appliedPromo}
                    />
                    <button
                      onClick={() => setAppliedPromo(true)}
                      disabled={appliedPromo || !promoCode}
                      className="btn-accent text-sm px-3"
                    >
                      Apply
                    </button>
                  </div>
                  {appliedPromo && (
                    <p className="text-xs text-green-600 mt-2">Promo code applied!</p>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${cart.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>${cart.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>{cart.shipping === 0 ? 'Free' : `$${cart.shipping.toFixed(2)}`}</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-semibold">Total</span>
              <span className="text-2xl font-bold text-accent">
                ${cart.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
