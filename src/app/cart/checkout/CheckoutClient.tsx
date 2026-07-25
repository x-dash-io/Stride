'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useActionState } from 'react'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronRight, Check, Loader2, Smartphone, CreditCard, Truck, AlertCircle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Cart, Address } from '@/types'
import { processPayment } from '@/app/actions/checkout'
import { submitShippingAddress } from '@/app/actions/checkout'

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
  const [shippingData, setShippingData] = useState({
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
  const [paymentMethod, setPaymentMethod] = useState<'MPESA_STK_PUSH' | 'CASH_ON_DELIVERY'>('MPESA_STK_PUSH')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [mpesaStatus, setMpesaStatus] = useState<'idle' | 'pending' | 'waiting' | 'success' | 'error'>('idle')
  const [mpesaMessage, setMpesaMessage] = useState('')

  const steps: { key: Step; label: string }[] = [
    { key: 'shipping', label: 'Shipping' },
    { key: 'payment', label: 'Payment' },
    { key: 'confirmation', label: 'Confirmation' },
  ]

  const handleShippingSubmit = async (formData: FormData) => {
    const result = await submitShippingAddress(formData)
    if (result.error) {
      alert(result.error)
      return
    }
    setCurrentStep('payment')
  }

  const handlePaymentSubmit = async (formData: FormData) => {
    setIsProcessing(true)
    setMpesaStatus('pending')
    setMpesaMessage('Processing payment...')

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
      setOrderNumber(result.orderId)
      setCurrentStep('confirmation')
      setMpesaStatus('success')
    }
    setIsProcessing(false)
  }

  const pollPaymentStatus = async (checkoutRequestId: string, orderId: string) => {
    let attempts = 0
    const maxAttempts = 15

    const poll = async () => {
      if (attempts >= maxAttempts) {
        setMpesaStatus('error')
        setMpesaMessage('Payment timed out. Please check your M-Pesa and try again.')
        return
      }

      attempts++

      try {
        const response = await fetch(`/api/mpesa/query?checkoutRequestId=${checkoutRequestId}`)
        const data = await response.json()

        if (data.ResultCode === '0') {
          setMpesaStatus('success')
          setMpesaMessage('Payment successful!')
          setOrderNumber(orderId)
          setCurrentStep('confirmation')
        } else if (data.ResultCode && data.ResultCode !== '0' && data.ResultCode !== '500.001.1001') {
          setMpesaStatus('error')
          setMpesaMessage(data.ResultDesc || 'Payment failed')
        } else {
          setTimeout(poll, 3000)
        }
      } catch (error) {
        setTimeout(poll, 3000)
      }
    }

    poll()
  }

  const renderStep = () => {
    switch (currentStep) {
      case 'shipping':
        return <ShippingStep formData={shippingData} setFormData={setShippingData} onSubmit={handleShippingSubmit} router={router} />
      case 'payment':
        return <PaymentStep paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} phoneNumber={phoneNumber} setPhoneNumber={setPhoneNumber} onSubmit={handlePaymentSubmit} isProcessing={isProcessing} mpesaStatus={mpesaStatus} mpesaMessage={mpesaMessage} router={router} />
      case 'confirmation':
        return <ConfirmationStep orderNumber={orderNumber} router={router} />
    }
  }

  return (
    <div className="container-max py-12 min-h-screen">
      <h1 className="text-4xl md:text-5xl font-serif font-bold mb-12">Checkout</h1>

      <div className="mb-12 flex items-center gap-4">
{steps.map((step, idx) => (
              <div key={step.key} className="flex items-center gap-4">
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
                    idx + 1
                  )}
                </div>
            <span className="text-sm font-medium capitalize">{step.label}</span>
            {idx < steps.length - 1 && <ChevronRight className="w-4 h-4 text-muted-foreground ml-2" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          {renderStep()}
        </div>

        <div className="lg:col-span-1">
          <OrderSummary cart={cart} />
        </div>
      </div>
    </div>
  )
}

function ShippingStep({ formData, setFormData, onSubmit, router }: { formData: any; setFormData: any; onSubmit: (formData: FormData) => void; router: any }) {
  return (
    <form action={onSubmit} className="space-y-6">
      <h2 className="text-2xl font-serif font-bold mb-6">Shipping Address</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input id="firstName" name="firstName" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} required />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input id="lastName" name="lastName" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} required />
        </div>
      </div>

      <div>
        <Label htmlFor="phone">Phone Number</Label>
        <Input id="phone" name="phone" type="tel" placeholder="2547XXXXXXXX" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
        <p className="text-xs text-muted-foreground mt-1">Format: 2547XXXXXXXX</p>
      </div>

      <div>
        <Label htmlFor="addressLine1">Address Line 1</Label>
        <Input id="addressLine1" name="addressLine1" value={formData.addressLine1} onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })} required />
      </div>

      <div>
        <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
        <Input id="addressLine2" name="addressLine2" value={formData.addressLine2} onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="city">City</Label>
          <Input id="city" name="city" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} required />
        </div>
        <div>
          <Label htmlFor="state">County</Label>
          <Input id="state" name="state" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} required />
        </div>
        <div>
          <Label htmlFor="postalCode">Postal Code</Label>
          <Input id="postalCode" name="postalCode" value={formData.postalCode} onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })} />
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={() => router.push('/cart')}>Back</Button>
        <Button type="submit">Continue to Payment</Button>
      </div>
    </form>
  )
}

function PaymentStep({ paymentMethod, setPaymentMethod, phoneNumber, setPhoneNumber, onSubmit, isProcessing, mpesaStatus, mpesaMessage, router }: any) {
  return (
    <form action={onSubmit} className="space-y-6">
      <h2 className="text-2xl font-serif font-bold mb-6">Payment Method</h2>

      <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
        <div className="border-2 rounded-lg p-4 bg-primary/5">
          <RadioGroupItem value="MPESA_STK_PUSH" className="flex items-center gap-3 cursor-pointer">
            <Smartphone className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium">M-Pesa</p>
              <p className="text-sm text-muted-foreground">Enter PIN on your phone to complete payment</p>
            </div>
          </RadioGroupItem>
        </div>

        <div className="border-2 rounded-lg p-4">
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
              <p className="font-medium">{mpesaStatus === 'waiting' ? 'Waiting for Payment' : mpesaStatus === 'success' ? 'Payment Successful' : 'Payment Failed'}</p>
              <p className="text-sm text-muted-foreground">{mpesaMessage}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={() => router.push('/cart/checkout')}>Back</Button>
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

function ConfirmationStep({ orderNumber, router }: { orderNumber: string; router: ReturnType<typeof useRouter> }) {
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
      <div className="space-y-3">
        <p className="text-muted-foreground">You'll receive a confirmation email shortly with tracking information.</p>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => router.push('/account/orders')}>View Orders</Button>
          <Button variant="outline" onClick={() => router.push('/products')}>Continue Shopping</Button>
        </div>
      </div>
    </div>
  )
}

function OrderSummary({ cart }: { cart: Cart }) {
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