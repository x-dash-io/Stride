import { NextRequest, NextResponse } from 'next/server'
import { createProtectedRouteNoParams } from '@/lib/api-protection'
import { processPayment } from '@/lib/services/order.service'

async function handleProcessPayment(request: NextRequest, _routeContext: { session: { user: { id: string } }; ip: string }) {
  const formData = await request.formData()
  const paymentMethod = (formData.get('paymentMethod') as string) || 'CASH_ON_DELIVERY'
  const phoneNumber = formData.get('phoneNumber') as string | undefined
  const csrfToken = formData.get('_csrf') as string | undefined

  if (!['MPESA_STK_PUSH', 'CASH_ON_DELIVERY'].includes(paymentMethod)) {
    return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 })
  }

  if (paymentMethod === 'MPESA_STK_PUSH' && !phoneNumber) {
    return NextResponse.json({ error: 'Phone number required for M-Pesa' }, { status: 400 })
  }

  const result = await processPayment({
    paymentMethod: paymentMethod as 'MPESA_STK_PUSH' | 'CASH_ON_DELIVERY',
    phoneNumber,
    csrfToken,
  })

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json({
    success: true,
    orderId: result.value.orderId,
    checkoutRequestId: result.value.checkoutRequestId,
  })
}

export const POST = createProtectedRouteNoParams(handleProcessPayment, {
  requireAuth: true,
  rateLimit: 'payment',
  requireCsrf: true,
})
