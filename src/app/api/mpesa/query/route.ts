import { NextRequest, NextResponse } from 'next/server'
import { queryStkPush } from '@/lib/mpesa'

export async function GET(request: NextRequest) {
  const checkoutRequestId = request.nextUrl.searchParams.get('checkoutRequestId')

  if (!checkoutRequestId) {
    return NextResponse.json({ error: 'CheckoutRequestID is required' }, { status: 400 })
  }

  try {
    const result = await queryStkPush(checkoutRequestId)

    return NextResponse.json({
      ResultCode: result.ResultCode,
      ResultDesc: result.ResultDesc,
      ...result,
    })
  } catch (error) {
    console.error('M-Pesa query error:', error)
    return NextResponse.json({ error: 'Failed to query payment status' }, { status: 500 })
  }
}