import { NextRequest, NextResponse } from 'next/server'
import { withProtection } from '@/lib/api-protection'
import { processPayment } from '@/lib/services/order.service'
import { cookies } from 'next/headers'

async function handleProcessPayment(request: NextRequest) {
  const formData = await request.formData()
  const paymentMethod = (formData.get('paymentMethod') as string) || 'CASH_ON_DELIVERY'
  const phoneNumber = formData.get('phoneNumber') as string | undefined
  const csrfToken = formData.get('_csrf') as string | undefined
  const guestEmail = formData.get('guestEmail') as string | undefined

  if (!['MPESA_STK_PUSH', 'CASH_ON_DELIVERY'].includes(paymentMethod)) {
    return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 })
  }

  if (paymentMethod === 'MPESA_STK_PUSH' && !phoneNumber) {
    return NextResponse.json({ error: 'Phone number required for M-Pesa' }, { status: 400 })
  }

  // Read guest session cookie for cart lookup
  const cookieStore = await cookies()
  const sessionId = cookieStore.get('cartSessionId')?.value

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

// requireAuth: true — require authenticated user
export function POST(request: NextRequest) {
  return withProtection(request, handleProcessPayment, {
    requireAuth: true,
    rateLimit: 'payment',
    requireCsrf: false, // CSRF is verified inside processPayment via the form field
  })
}
