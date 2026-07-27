'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronRight, Check, Loader2, Smartphone, Truck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { shippingAddressSchema } from '@/lib/validations'
import { formatPrice } from '@/lib/utils'
import { Cart } from '@/types'
import { ShippingStep } from './steps/ShippingStep'
import { PaymentStep } from './steps/PaymentStep'
import { ConfirmationStep } from './steps/ConfirmationStep'
import { OrderSummary } from './steps/OrderSummary'

type Step = 'shipping' | 'payment' | 'confirmation'

interface CheckoutClientProps {
  cart: Cart | null
  defaultAddress: any | null
  userEmail: string
  isGuest?: boolean
}

export function CheckoutClient({ cart, defaultAddress, userEmail, isGuest = false }: CheckoutClientProps) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('shipping')
  const [orderNumber, setOrderNumber] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<'MPESA_STK_PUSH' | 'CASH_ON_DELIVERY'>('MPESA_STK_PUSH')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mpesaStatus, setMpesaStatus] = useState<'idle' | 'pending' | 'waiting' | 'success' | 'error'>('idle')
  const [mpesaMessage, setMpesaMessage] = useState('')
  const [stockErrors, setStockErrors] = useState<Record<string, string>>({})

  const steps: { key: Step; label: string }[] = [
    { key: 'shipping', label: 'Shipping' },
    { key: 'payment', label: 'Payment' },
    { key: 'confirmation', label: 'Confirmation' },
  ]

  const handlePaymentSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    setMpesaStatus('pending')
    setMpesaMessage('Processing payment...')

    const csrfRes = await fetch('/api/csrf')
    const { csrfToken } = await csrfRes.json()
    formData.append('_csrf', csrfToken)

    const response = await fetch('/api/checkout/process', {
      method: 'POST',
      body: formData,
    })

    const result = await response.json()

    if (result.error) {
      setMpesaStatus('error')
      setMpesaMessage(result.error)
      setIsSubmitting(false)
      return
    }

    if (result.checkoutRequestId) {
      setMpesaStatus('waiting')
      setMpesaMessage('STK Push sent! Please enter your M-Pesa PIN on your phone.')
      pollPaymentStatus(result.checkoutRequestId, result.orderId!)
    } else if (result.success && result.orderId) {
      setOrderNumber(result.orderId)
      setStep('confirmation')
      setMpesaStatus('success')
    }
    setIsSubmitting(false)
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
          setStep('confirmation')
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
    switch (step) {
      case 'shipping':
        return <ShippingStep onNext={() => setStep('payment')} onBack={() => router.push('/cart')} />
      case 'payment':
        return (
          <PaymentStep
            onSubmit={handlePaymentSubmit}
            onBack={() => setStep('shipping')}
            isProcessing={isSubmitting}
            mpesaStatus={mpesaStatus}
            mpesaMessage={mpesaMessage}
          />
        )
      case 'confirmation':
        return <ConfirmationStep orderNumber={orderNumber} onContinueShopping={() => router.push('/products')} onViewOrders={() => router.push('/account/orders')} />
    }
  }

  return (
    <div className="container-max py-12 min-h-screen">
      <h1 className="text-4xl md:text-5xl font-serif font-bold mb-12">Checkout</h1>

      <div className="mb-12 flex items-center gap-4">
        {steps.map((stepItem, idx) => (
          <div key={stepItem.key} className="flex items-center gap-4">
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors',
                step === stepItem.key
                  ? 'bg-primary text-primary-foreground'
                  : ['shipping', 'payment', 'confirmation'].indexOf(step) > idx
                  ? 'bg-green-600 text-white'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {['shipping', 'payment', 'confirmation'].indexOf(step) > idx ? (
                <span className="text-green-600">✓</span>
              ) : (
                idx + 1
              )}
            </div>
            <span className={cn(
              'text-sm font-medium capitalize',
              step === stepItem.key ? 'text-primary' : 'text-muted-foreground'
            )}>
              {stepItem.label}
            </span>
            {idx < steps.length - 1 && <ChevronRight className="w-4 h-4 text-muted-foreground ml-2" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          {renderStep()}
        </div>

        <div className="lg:col-span-1">
          <OrderSummary cart={cart!} />
        </div>
      </div>
    </div>
  )
}