import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyMpesaCallbackIp } from '@/lib/mpesa'

export async function POST(request: NextRequest) {
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('remote-addr')
    || 'unknown'

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
      const items = CallbackMetadata?.Item || []
      const amount = items.find((i: any) => i.Name === 'Amount')?.Value
      const mpesaReceiptNumber = items.find((i: any) => i.Name === 'MpesaReceiptNumber')?.Value
      const phoneNumber = items.find((i: any) => i.Name === 'PhoneNumber')?.Value

      await prisma.$transaction(async (tx) => {
        await tx.paymentTransaction.update({
          where: { id: payment.id },
          data: {
            status: 'SUCCESS',
            gatewayResponse: { ...payment.gatewayResponse, callback: body },
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

        const pointsEarned = Math.floor(Number(payment.amount) / 100)
        if (pointsEarned > 0 && payment.order.userId) {
          const loyaltyAccount = await tx.loyaltyAccount.findUnique({
            where: { userId: payment.order.userId },
          })
          if (loyaltyAccount) {
            await tx.loyaltyAccount.update({
              where: { id: loyaltyAccount.id },
              data: {
                pointsBalance: { increment: pointsEarned },
                lifetimePoints: { increment: pointsEarned },
              },
            })
            await tx.loyaltyTransaction.create({
              data: {
                accountId: loyaltyAccount.id,
                points: pointsEarned,
                balanceAfter: loyaltyAccount.pointsBalance + pointsEarned,
                reason: 'PURCHASE',
                referenceType: 'order',
                referenceId: payment.orderId,
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
          data: { status: 'FAILED', gatewayResponse: { ...payment.gatewayResponse, callback: body } },
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

    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
  } catch (error) {
    console.error('M-Pesa callback error:', error)
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
  }
}