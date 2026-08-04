'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Smartphone, Truck, Loader2, AlertCircle, CheckCircle, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaymentStepProps {
  onSubmit: (formData: FormData) => Promise<void>
  onBack: () => void
  isProcessing: boolean
  mpesaStatus: 'idle' | 'pending' | 'waiting' | 'success' | 'error'
  mpesaMessage: string
}

export function PaymentStep({ onSubmit, onBack, isProcessing, mpesaStatus, mpesaMessage }: PaymentStepProps) {
  const [paymentMethod, setPaymentMethod] = useState<'MPESA_STK_PUSH' | 'CASH_ON_DELIVERY'>('MPESA_STK_PUSH')
  const [phoneNumber, setPhoneNumber] = useState('')
  const isSubmitting = isProcessing

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    await onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>Choose how you&apos;d like to pay</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'MPESA_STK_PUSH' | 'CASH_ON_DELIVERY')} className="space-y-4">
            <div className="border-2 rounded-lg p-4 bg-primary/5">
              <RadioGroupItem value="MPESA_STK_PUSH" className="flex items-center gap-3 cursor-pointer">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">M-Pesa</p>
                  <p className="text-sm text-muted-foreground">Enter PIN on your phone to complete payment</p>
                </div>
              </RadioGroupItem>
            </div>

            <div className="border-2 rounded-lg p-4">
              <RadioGroupItem value="CASH_ON_DELIVERY" className="flex items-center gap-3 cursor-pointer">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium">Cash on Delivery</p>
                  <p className="text-sm text-muted-foreground">Pay when your order arrives</p>
                </div>
              </RadioGroupItem>
            </div>
          </RadioGroup>

          {paymentMethod === 'MPESA_STK_PUSH' && (
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">M-Pesa Phone Number *</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                placeholder="2547XXXXXXXX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">Format: 2547XXXXXXXX</p>
            </div>
          )}

          <input type="hidden" name="paymentMethod" value={paymentMethod} />
        </CardContent>
      </Card>

      {mpesaStatus !== 'idle' && (
        <Card className={cn(
          'p-4 border',
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
                {mpesaStatus === 'waiting' ? 'Waiting for Payment' : 
                 mpesaStatus === 'success' ? 'Payment Successful' : 'Payment Failed'}
              </p>
              <p className="text-sm text-muted-foreground">{mpesaMessage}</p>
            </div>
          </div>
        </Card>
      )}

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onBack}>Back</Button>
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? (
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