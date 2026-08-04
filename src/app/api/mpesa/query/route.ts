import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { queryStkPush } from '@/lib/mpesa'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const checkoutRequestId = request.nextUrl.searchParams.get('checkoutRequestId')
  if (!checkoutRequestId) {
    return NextResponse.json({ error: 'Checkout request ID required' }, { status: 400 })
  }

  // Verify user owns this transaction
  const payment = await prisma.paymentTransaction.findFirst({
    where: {
      transactionId: checkoutRequestId,
      order: { userId: session.user.id }
    }
  })

  if (!payment) {
    return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
  }

  try {
    const result = await queryStkPush(checkoutRequestId)
    return NextResponse.json(result)
  } catch (error) {
    console.error('M-Pesa query error:', error)
    return NextResponse.json({ error: 'Failed to query payment status' }, { status: 500 })
  }
}