import { NextRequest, NextResponse } from 'next/server'
import { requireDeliveryAccess } from '@/lib/authz'
import { prisma } from '@/lib/prisma'
import { initiateStkPush } from '@/lib/mpesa'
import type { Prisma } from '@prisma/client'

/**
 * POST /api/delivery/stk-push
 * Triggered by a delivery agent when they arrive at the customer's location.
 * Sends an M-Pesa STK push to the customer's registered phone to collect
 * Cash-on-Delivery payment without the agent needing to call the shop admin.
 */
export async function POST(request: NextRequest) {
  const session = await requireDeliveryAccess()

  const body = await request.json()
  const { orderId } = body

  if (!orderId) {
    return NextResponse.json({ error: 'orderId is required' }, { status: 400 })
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      shippingAddress: true,
      user: { select: { phone: true, name: true } },
      payments: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  })

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  // Only allow for COD orders that are IN_TRANSIT or SHIPPED
  if (order.paymentMethod !== 'CASH_ON_DELIVERY') {
    return NextResponse.json({ error: 'STK push only applies to Cash on Delivery orders' }, { status: 400 })
  }

  if (!['SHIPPED', 'IN_TRANSIT'].includes(order.status)) {
    return NextResponse.json({ error: `Cannot request payment for order in status: ${order.status}` }, { status: 400 })
  }

  if (order.paymentStatus === 'CAPTURED') {
    return NextResponse.json({ error: 'Order is already paid' }, { status: 400 })
  }

  // Check if there is already a pending STK for this order
  const existingPending = order.payments.find(p => p.status === 'PENDING')
  if (existingPending) {
    return NextResponse.json({ error: 'A payment prompt is already pending for this order' }, { status: 409 })
  }

  // Resolve phone number: prefer the shipping address phone, fallback to user phone
  const phone = order.shippingAddress?.phone || order.user?.phone
  if (!phone) {
    return NextResponse.json(
      { error: 'No phone number found for this order. Please update the customer phone.' },
      { status: 400 }
    )
  }

  try {
    const stkResponse = await initiateStkPush({
      phoneNumber: phone,
      amount: Math.round(Number(order.grandTotal)),
      accountReference: order.orderNumber,
      transactionDesc: `COD payment for ${order.orderNumber}`,
    })

    if (stkResponse.ResponseCode !== '0') {
      return NextResponse.json(
        { error: stkResponse.ResponseDescription || 'M-Pesa STK push failed' },
        { status: 502 }
      )
    }

    // Record the payment transaction
    await prisma.paymentTransaction.create({
      data: {
        orderId: order.id,
        transactionId: stkResponse.CheckoutRequestID,
        paymentMethod: 'MPESA_STK_PUSH',
        amount: order.grandTotal,
        currency: 'KES',
        status: 'PENDING',
        gatewayResponse: stkResponse as unknown as Prisma.InputJsonValue,
      },
    })

    // Log who triggered it
    await prisma.orderStatusHistory.create({
      data: {
        orderId: order.id,
        fromStatus: order.status,
        toStatus: order.status,
        note: `M-Pesa STK push sent to ${phone} by delivery agent ${session.user.name ?? session.user.email} (${session.user.id})`,
      },
    })

    return NextResponse.json({
      success: true,
      checkoutRequestId: stkResponse.CheckoutRequestID,
      message: `STK push sent to ${phone}. Customer should enter their M-Pesa PIN.`,
    })
  } catch (error: unknown) {
    console.error('Delivery STK push error:', error)
    const msg = error instanceof Error ? error.message : 'Failed to initiate STK push'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
