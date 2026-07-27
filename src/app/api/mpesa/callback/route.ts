import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyMpesaCallbackIp } from '@/lib/mpesa'
import { paymentRateLimit, rateLimit } from '@/lib/rate-limit'

interface CallbackMetadataItem {
  Name: string
  Value?: string | number
}

export async function POST(request: NextRequest) {
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('remote-addr')
    || 'unknown'

  const { success, remaining, reset } = await rateLimit(paymentRateLimit, clientIp)
  if (!success) {
    return NextResponse.json(
      { ResultCode: 0, ResultDesc: 'Rate limited' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)) } }
    )
  }

  if (process.env.MPESA_ENVIRONMENT === 'production' && !verifyMpesaCallbackIp(clientIp)) {
    console.warn(`M-Pesa callback rejected from IP: ${clientIp}`)
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
  }

  try {
    const body = await request.json()
    const callback = body.Body?.stkCallback

    if (!callback) {
      console.error('Invalid callback format:', body)
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
    }

    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = callback

    const payment = await prisma.paymentTransaction.findUnique({
      where: { transactionId: CheckoutRequestID },
      include: { order: true },
    })

    if (!payment) {
      console.error(`No payment found for CheckoutRequestID: ${CheckoutRequestID}`)
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
    }

    if (payment.status === 'SUCCESS') {
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
    }

    if (ResultCode === 0) {
      const items = (CallbackMetadata?.Item || []) as CallbackMetadataItem[]
      const amount = items.find((i) => i.Name === 'Amount')?.Value
      const mpesaReceiptNumber = items.find((i) => i.Name === 'MpesaReceiptNumber')?.Value
      const phoneNumber = items.find((i) => i.Name === 'PhoneNumber')?.Value

      await prisma.$transaction(async (tx) => {
        await tx.paymentTransaction.update({
          where: { id: payment.id },
          data: {
            status: 'SUCCESS',
            gatewayResponse: payment.gatewayResponse ? { ...(payment.gatewayResponse as object), callback: body } : { callback: body },
          },
        })

        await tx.order.update({
          where: { id: payment.orderId },
          data: {
            status: 'CONFIRMED',
            paymentStatus: 'CAPTURED',
            amountPaid: payment.amount,
          },
        })

        await tx.orderStatusHistory.create({
          data: {
            orderId: payment.orderId,
            fromStatus: 'PENDING',
            toStatus: 'CONFIRMED',
            note: `M-Pesa payment received. Receipt: ${mpesaReceiptNumber}`,
          },
        })

        const orderItems = await tx.orderItem.findMany({ where: { orderId: payment.orderId } })
        for (const item of orderItems) {
          const inventory = await tx.inventory.findFirst({
            where: { variantId: item.variantId, quantityReserved: { gte: item.quantity } },
          })
          if (inventory) {
            await tx.inventory.update({
              where: { id: inventory.id },
              data: {
                quantityOnHand: { decrement: item.quantity },
                quantityReserved: { decrement: item.quantity },
              },
            })
          }
        }
      })

      await prisma.cartItem.deleteMany({
        where: { cart: { userId: payment.order.userId } },
      })
      await prisma.cart.updateMany({
        where: { userId: payment.order.userId },
        data: { subtotal: 0, taxTotal: 0, shippingTotal: 0, grandTotal: 0 },
      })

    } else {
      await prisma.$transaction(async (tx) => {
        await tx.paymentTransaction.update({
          where: { id: payment.id },
          data: { status: 'FAILED', gatewayResponse: payment.gatewayResponse ? { ...(payment.gatewayResponse as object), callback: body } : { callback: body } },
        })

        await tx.order.update({
          where: { id: payment.orderId },
          data: { status: 'CANCELLED', paymentStatus: 'FAILED' },
        })

        const orderItems = await tx.orderItem.findMany({ where: { orderId: payment.orderId } })
        for (const item of orderItems) {
          const inventory = await tx.inventory.findFirst({
            where: { variantId: item.variantId, quantityReserved: { gte: item.quantity } },
          })
          if (inventory) {
            await tx.inventory.update({
              where: { id: inventory.id },
              data: { quantityReserved: { decrement: item.quantity } },
            })
          }
        }
      })
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' }, { headers: { 'X-RateLimit-Remaining': String(remaining) } })
  } catch (error) {
    console.error('M-Pesa callback error:', error)
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
  }
}