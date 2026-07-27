# Split CheckoutClient Component Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the 403-line CheckoutClient.tsx into 4 step components (ShippingStep, PaymentStep, ConfirmationStep, OrderSummarySidebar) and update CheckoutClient to orchestrate them with state management.

**Architecture:** Split the monolithic CheckoutClient into 4 focused step components that each handle one step of the 3-step wizard flow. CheckoutClient will manage shared state (current step, cart data, address, payment method, M-Pesa polling) and orchestrate step transitions.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Zod validations, M-Pesa STK Push polling

## Global Constraints

- Use existing validation schemas from `@/lib/validations` (shippingAddressSchema, paymentSchema)
- Use existing server actions from `@/app/actions/checkout` (submitShippingAddress, processPayment)
- Maintain existing 3-step wizard flow: shipping → payment → confirmation
- Maintain M-Pesa STK Push polling logic in PaymentStep
- Use existing UI components from `@/components/ui/*`
- Run `npm run typecheck` and `npm run build` to verify

## File Structure

```
/home/singason/Documents/footwear-e-commerce-platform/
├── src/app/cart/checkout/
│   ├── CheckoutClient.tsx (modified - orchestrator)
│   └── steps/
│       ├── ShippingStep.tsx (new)
│       ├── PaymentStep.tsx (new)
│       ├── ConfirmationStep.tsx (new)
│       └── OrderSummarySidebar.tsx (new)
```

---

### Task 1: Create ShippingStep Component

**Files:**
- Create: `src/app/cart/checkout/steps/ShippingStep.tsx`

**Interfaces:**
- Consumes: `shippingAddressSchema` from `@/lib/validations`, `submitShippingAddress` from `@/app/actions/checkout`
- Produces: `ShippingStepProps` interface with props: `cart`, `defaultAddress`, `userEmail`, `onNext`, `onBack`

**Steps:**

- [ ] **Step 1.1: Create ShippingStep.tsx component**

```tsx
'use client'

import { useState } from 'react'
import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Cart, Address } from '@/types'
import { shippingAddressSchema } from '@/lib/validations'
import { submitShippingAddress } from '@/app/actions/checkout'

export interface ShippingStepProps {
  cart: Cart
  defaultAddress: Address | null
  userEmail: string
  onNext: () => void
  onBack: () => void
}

export function ShippingStep({ cart, defaultAddress, userEmail, onNext, onBack }: ShippingStepProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: defaultAddress?.firstName || '',
    lastName: defaultAddress?.lastName || '',
    phone: defaultAddress?.phone || '',
    addressLine1: defaultAddress?.addressLine1 || '',
    addressLine2: defaultAddress?.addressLine2 || '',
    city: defaultAddress?.city || '',
    state: defaultAddress?.state || '',
    postalCode: defaultAddress?.postalCode || '',
    country: defaultAddress?.country || 'KE',
  })
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const formDataToSubmit = new FormData()
    Object.entries(formData).forEach(([key, value]) => {
      formDataToSubmit.append(key, value)
    })
    formDataToSubmit.append('label', 'Home')
    formDataToSubmit.append('isDefault', 'true')
    formDataToSubmit.append('isShipping', 'true')
    formDataToSubmit.append('isBilling', 'true')

    const result = await submitShippingAddress(formDataToSubmit)
    if (result.error) {
      setError(result.error)
      return
    }
    onNext()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-serif font-bold mb-6">Shipping Address</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required />
        </div>
      </div>

      <div>
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          placeholder="2547XXXXXXXX"
          value={formData.phone}
          onChange={handleChange}
          required
        />
        <p className="text-xs text-muted-foreground mt-1">Format: 2547XXXXXXXX</p>
      </div>

      <div>
        <Label htmlFor="addressLine1">Address Line 1</Label>
        <Input id="addressLine1" name="addressLine1" value={formData.addressLine1} onChange={handleChange} required />
      </div>

      <div>
        <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
        <Input id="addressLine2" name="addressLine2" value={formData.addressLine2} onChange={handleChange} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="city">City</Label>
          <Input id="city" name="city" value={formData.city} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="state">County</Label>
          <Input id="state" name="state" value={formData.state} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="postalCode">Postal Code</Label>
          <Input id="postalCode" name="postalCode" value={formData.postalCode} onChange={handleChange} />
        </div>
      </div>

      <div className="flex gap-3 justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          <ChevronLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button type="submit">Continue to Payment <ChevronRight className="w-4 h-4 ml-2" /></Button>
      </div>
    </form>
  )
}
```

- [ ] **Step 1.2: Verify component compiles**

Run: `npm run typecheck`
Expected: PASS (no TypeScript errors in new file)

---

### Task 2: Create PaymentStep Component

**Files:**
- Create: `src/app/cart/checkout/steps/PaymentStep.tsx`

**Interfaces:**
- Consumes: `paymentSchema` from `@/lib/validations`, `processPayment` from `@/app/actions/checkout`
- Produces: `PaymentStepProps` with props: `cart`, `defaultAddress`, `userEmail`, `onNext`, `onBack`, `onComplete`

**Steps:**

- [ ] **Step 2.1: Create PaymentStep.tsx component**

```tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Smartphone, Truck, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Cart, Address } from '@/types'
import { processPayment } from '@/app/actions/checkout'

type PaymentMethod = 'MPESA_STK_PUSH' | 'CASH_ON_DELIVERY'
type MpesaStatus = 'idle' | 'pending' | 'waiting' | 'success' | 'error'

export interface PaymentStepProps {
  cart: Cart
  defaultAddress: Address | null
  userEmail: string
  onNext: () => void
  onBack: () => void
  onComplete: (orderNumber: string) => void
}

export function PaymentStep({ cart, defaultAddress, userEmail, onNext, onBack, onComplete }: PaymentStepProps) {
  const router = useRouter()
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('MPESA_STK_PUSH')
  const [phoneNumber, setPhoneNumber] = useState(defaultAddress?.phone || '')
  const [isProcessing, setIsProcessing] = useState(false)
  const [mpesaStatus, setMpesaStatus] = useState<MpesaStatus>('idle')
  const [mpesaMessage, setMpesaMessage] = useState('')

  const pollPaymentStatus = useCallback(async (checkoutRequestId: string, orderId: string) => {
    let attempts = 0
    const maxAttempts = 15

    const poll = async () => {
      if (attempts >= maxAttempts) {
        setMpesaStatus('error')
        setMpesaMessage('Payment timed out. Please check your M-Pesa and try again.')
        setIsProcessing(false)
        return
      }
      attempts++

      try {
        const response = await fetch(`/api/mpesa/query?checkoutRequestId=${checkoutRequestId}`)
        const data = await response.json()

        if (data.ResultCode === '0') {
          setMpesaStatus('success')
          setMpesaMessage('Payment successful!')
          onComplete(orderId)
        } else if (data.ResultCode && data.ResultCode !== '0' && data.ResultCode !== '500.001.1001') {
          setMpesaStatus('error')
          setMpesaMessage(data.ResultDesc || 'Payment failed')
          setIsProcessing(false)
        } else {
          setTimeout(poll, 3000)
        }
      } catch {
        setTimeout(poll, 3000)
      }
    }

    poll()
  }, [onComplete])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsProcessing(true)
    setMpesaStatus('pending')
    setMpesaMessage('Processing payment...')

    const formData = new FormData(e.currentTarget)
    const csrfRes = await fetch('/api/csrf')
    const { csrfToken } = await csrfRes.json()
    formData.append('_csrf', csrfToken)

    const result = await processPayment(formData)

    if (result.error) {
      setMpesaStatus('error')
      setMpesaMessage(result.error)
      setIsProcessing(false)
      return
    }

    if (result.checkoutRequestId) {
      setMpesaStatus('waiting')
      setMpesaMessage('STK Push sent! Please enter your M-Pesa PIN on your phone.')
      pollPaymentStatus(result.checkoutRequestId, result.orderId!)
    } else if (result.success && result.orderId) {
      onComplete(result.orderId)
      setMpesaStatus('success')
    }
    setIsProcessing(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-serif font-bold mb-6">Payment Method</h2>

      <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
        <div className={cn('border-2 rounded-lg p-4', paymentMethod === 'MPESA_STK_PUSH' ? 'bg-primary/5 border-primary' : 'border-border')}>
          <RadioGroupItem value="MPESA_STK_PUSH" className="flex items-center gap-3 cursor-pointer">
            <Smartphone className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium">M-Pesa</p>
              <p className="text-sm text-muted-foreground">Enter PIN on your phone to complete payment</p>
            </div>
          </RadioGroupItem>
        </div>

        <div className={cn('border-2 rounded-lg p-4', paymentMethod === 'CASH_ON_DELIVERY' ? 'bg-primary/5 border-primary' : 'border-border')}>
          <RadioGroupItem value="CASH_ON_DELIVERY" className="flex items-center gap-3 cursor-pointer">
            <Truck className="w-5 h-5" />
            <div>
              <p className="font-medium">Cash on Delivery</p>
              <p className="text-sm text-muted-foreground">Pay when your order arrives</p>
            </div>
          </RadioGroupItem>
        </div>
      </RadioGroup>

      {paymentMethod === 'MPESA_STK_PUSH' && (
        <div>
          <Label htmlFor="phoneNumber">M-Pesa Phone Number</Label>
          <Input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            placeholder="2547XXXXXXXX"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
            disabled={isProcessing}
          />
        </div>
      )}

      <input type="hidden" name="paymentMethod" value={paymentMethod} />

      {mpesaStatus !== 'idle' && (
        <div className={cn(
          'p-4 rounded-lg border',
          mpesaStatus === 'waiting' && 'bg-blue-50 border-blue-200',
          mpesaStatus === 'success' && 'bg-green-50 border-green-200',
          mpesaStatus === 'error' && 'bg-red-50 border-red-200'
        )}>
          <div className="flex items-center gap-3">
            {mpesaStatus === 'waiting' && <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />}
            {mpesaStatus === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
            {mpesaStatus === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}
            <div>
              <p className="font-medium">
                {mpesaStatus === 'waiting' ? 'Waiting for Payment' : mpesaStatus === 'success' ? 'Payment Successful' : 'Payment Failed'}
              </p>
              <p className="text-sm text-muted-foreground">{mpesaMessage}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3 justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          <ChevronLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button type="submit" disabled={isProcessing} className="w-full sm:w-auto">
          {isProcessing ? (
            <> <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing... </>
          ) : paymentMethod === 'MPESA_STK_PUSH' ? (
            'Pay with M-Pesa'
          ) : (
            'Place Order'
          )}
        </Button>
      </div>
    </form>
  )
}
```

- [ ] **Step 2.2: Verify component compiles**

Run: `npm run typecheck`
Expected: PASS

---

### Task 3: Create ConfirmationStep Component

**Files:**
- Create: `src/app/cart/checkout/steps/ConfirmationStep.tsx`

**Interfaces:**
- Produces: `ConfirmationStepProps` with props: `orderNumber`, `onBack`

**Steps:**

- [ ] **Step 3.1: Create ConfirmationStep.tsx component**

```tsx
'use client'

import { Button } from '@/components/ui/button'
import { Check, ChevronLeft, Truck, Mail } from 'lucide-react'
import { useRouter } from 'next/navigation'

export interface ConfirmationStepProps {
  orderNumber: string
  onBack: () => void
}

export function ConfirmationStep({ orderNumber, onBack }: ConfirmationStepProps) {
  const router = useRouter()

  return (
    <div className="text-center py-12">
      <Check className="w-16 h-16 text-green-600 mx-auto mb-6" />
      <h2 className="text-3xl font-serif font-bold mb-3">Order Confirmed!</h2>
      <p className="text-muted-foreground mb-6 text-lg">
        Thank you for your purchase. Your order has been received and is being processed.
      </p>

      <div className="bg-muted/30 rounded-lg p-6 mb-8 inline-block">
        <p className="text-sm text-muted-foreground mb-1">Order Number</p>
        <p className="text-2xl font-bold font-mono">{orderNumber}</p>
      </div>

      <div className="space-y-3 text-sm text-muted-foreground mb-8">
        <p>You'll receive a confirmation email shortly with tracking information.</p>
        <div className="flex items-center justify-center gap-2 text-sm">
          <Mail className="w-4 h-4" />
          <span>Order details sent to your email</span>
        </div>
        <div className="flex items-center justify-center gap-2 text-sm">
          <Truck className="w-4 h-4" />
          <span>Estimated delivery: 2-5 business days</span>
        </div>
      </div>

      <div className="flex gap-3 justify-center">
        <Button onClick={() => router.push('/account/orders')}>View Orders</Button>
        <Button variant="outline" onClick={() => router.push('/products')}>Continue Shopping</Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 3.2: Verify component compiles**

Run: `npm run typecheck`
Expected: PASS

---

### Task 4: Create OrderSummarySidebar Component

**Files:**
- Create: `src/app/cart/checkout/steps/OrderSummarySidebar.tsx`

**Interfaces:**
- Produces: `OrderSummarySidebarProps` with prop: `cart`

**Steps:**

- [ ] **Step 4.1: Create OrderSummarySidebar.tsx component**

```tsx
'use client'

import { formatPrice } from '@/lib/utils'
import { Cart } from '@/types'

export interface OrderSummarySidebarProps {
  cart: Cart
}

export function OrderSummarySidebar({ cart }: OrderSummarySidebarProps) {
  return (
    <div className="bg-muted/30 border border-border rounded-xl p-6 sticky top-24">
      <h3 className="text-xl font-serif font-bold mb-6">Order Summary</h3>

      <div className="space-y-3 mb-6 pb-6 border-b border-border max-h-64 overflow-y-auto">
        {cart.items.map((item) => (
          <div key={`${item.variantId}-${item.variant.size}`} className="flex justify-between text-sm">
            <span className="text-muted-foreground flex-1 pr-2">
              {item.variant.product?.name.substring(0, 25) || 'Product'}... ×{item.quantity}
            </span>
            <span className="font-medium">{formatPrice(Number(item.unitPrice) * item.quantity)}</span>
          </div>
        ))}
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatPrice(Number(cart.subtotal))}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tax (16%)</span>
          <span>{formatPrice(Number(cart.taxTotal))}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Shipping</span>
          <span>{Number(cart.shippingTotal) === 0 ? 'Free' : formatPrice(Number(cart.shippingTotal))}</span>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <span className="font-semibold">Total</span>
        <span className="text-2xl font-bold text-primary">{formatPrice(Number(cart.grandTotal))}</span>
      </div>
    </div>
  )
}
```

- [ ] **Step 4.2: Verify component compiles**

Run: `npm run typecheck`
Expected: PASS

---

### Task 5: Update CheckoutClient to Orchestrate Steps

**Files:**
- Modify: `src/app/cart/checkout/CheckoutClient.tsx`

**Interfaces:**
- Consumes: All 4 step components, existing types and actions
- Produces: Updated `CheckoutClient` with state management for current step, shipping data, payment method, M-Pesa polling, order number

**Steps:**

- [ ] **Step 5.1: Update CheckoutClient.tsx**

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, Check, Truck, Smartphone, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Cart, Address } from '@/types'
import { ShippingStep } from './steps/ShippingStep'
import { PaymentStep } from './steps/PaymentStep'
import { ConfirmationStep } from './steps/ConfirmationStep'
import { OrderSummarySidebar } from './steps/OrderSummarySidebar'

type Step = 'shipping' | 'payment' | 'confirmation'

interface CheckoutClientProps {
  cart: Cart
  defaultAddress: Address | null
  userEmail: string
}

export function CheckoutClient({ cart, defaultAddress, userEmail }: CheckoutClientProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>('shipping')
  const [orderNumber, setOrderNumber] = useState<string>('')

  const steps: { key: Step; label: string; icon: React.ReactNode }[] = [
    { key: 'shipping', label: 'Shipping', icon: <Truck className="w-4 h-4" /> },
    { key: 'payment', label: 'Payment', icon: <Smartphone className="w-4 h-4" /> },
    { key: 'confirmation', label: 'Confirmation', icon: <Check className="w-4 h-4" /> },
  ]

  const handleShippingComplete = () => setCurrentStep('payment')
  const handlePaymentComplete = () => setCurrentStep('confirmation')
  const handleOrderComplete = (orderNum: string) => {
    setOrderNumber(orderNum)
    setCurrentStep('confirmation')
  }
  const handleBack = () => {
    if (currentStep === 'payment') setCurrentStep('shipping')
    else if (currentStep === 'confirmation') setCurrentStep('payment')
    else router.push('/cart')
  }

  const renderStep = () => {
    switch (currentStep) {
      case 'shipping':
        return (
          <ShippingStep
            cart={cart}
            defaultAddress={defaultAddress}
            userEmail={userEmail}
            onNext={handleShippingComplete}
            onBack={handleBack}
          />
        )
      case 'payment':
        return (
          <PaymentStep
            cart={cart}
            defaultAddress={defaultAddress}
            userEmail={userEmail}
            onNext={handlePaymentComplete}
            onBack={handleBack}
            onComplete={handleOrderComplete}
          />
        )
      case 'confirmation':
        return (
          <ConfirmationStep
            orderNumber={orderNumber}
            onBack={handleBack}
          />
        )
    }
  }

  return (
    <div className="container-max py-12 min-h-screen">
      <h1 className="text-4xl md:text-5xl font-serif font-bold mb-12">Checkout</h1>

      <div className="mb-12 flex items-center gap-4 overflow-x-auto">
        {steps.map((step, idx) => (
          <div key={step.key} className="flex items-center gap-4 whitespace-nowrap">
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors',
                currentStep === step.key
                  ? 'bg-primary text-primary-foreground'
                  : steps.findIndex(s => s.key === currentStep) > idx
                  ? 'bg-green-600 text-white'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {steps.findIndex(s => s.key === currentStep) > idx ? (
                <Check className="w-5 h-5" />
              ) : (
                step.icon
              )}
            </div>
            <span className="text-sm font-medium capitalize hidden sm:inline">{step.label}</span>
            {idx < steps.length - 1 && <ChevronRight className="w-4 h-4 text-muted-foreground ml-2" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          {renderStep()}
        </div>

        <div className="lg:col-span-1">
          <OrderSummarySidebar cart={cart} />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 5.2: Verify the updated CheckoutClient compiles**

Run: `npm run typecheck`
Expected: PASS

---

### Task 6: Create Steps Index Export

**Files:**
- Create: `src/app/cart/checkout/steps/index.ts`

**Steps:**

- [ ] **Step 6.1: Create index.ts barrel export**

```ts
export { ShippingStep } from './ShippingStep'
export { PaymentStep } from './PaymentStep'
export { ConfirmationStep } from './ConfirmationStep'
export { OrderSummarySidebar } from './OrderSummarySidebar'
export type { ShippingStepProps } from './ShippingStep'
export type { PaymentStepProps } from './PaymentStep'
export type { ConfirmationStepProps } from './ConfirmationStep'
export type { OrderSummarySidebarProps } from './OrderSummarySidebar'
```

- [ ] **Step 6.2: Verify exports work**

Run: `npm run typecheck`
Expected: PASS

---

### Task 7: Run Full Verification

**Steps:**

- [ ] **Step 7.1: Run typecheck**

Run: `npm run typecheck`
Expected: PASS (no TypeScript errors)

- [ ] **Step 7.2: Run build**

Run: `npm run build`
Expected: PASS (build succeeds)

---

## Self-Review Checklist

- [ ] All 4 step components created with proper props interfaces
- [ ] CheckoutClient updated to orchestrate steps with state management
- [ ] Validation schemas from `@/lib/validations` used in step components
- [ ] M-Pesa polling logic moved to PaymentStep
- [ ] OrderSummarySidebar extracted as sticky sidebar component
- [ ] Step indicator in CheckoutClient updated with icons
- [ ] Back/Next navigation works across all steps
- [ ] TypeScript compilation passes
- [ ] Build succeeds