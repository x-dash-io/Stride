import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
import { ok, err, Result } from '@/lib/types/result'
import { initiateStkPush, queryStkPush, verifyMpesaCallbackIp } from '@/lib/mpesa'

export interface StkPushInput {
  phoneNumber: string
  amount: number
  accountReference: string
  transactionDesc: string
}

export interface StkPushResult {
  merchantRequestId: string
  checkoutRequestId: string
  responseCode: string
  responseDescription: string
  customerMessage: string
}

export async function initiateStkPushPayment(input: StkPushInput): Promise<Result<StkPushResult, string>> {
  const response = await initiateStkPush(input)

  if (response.ResponseCode !== '0') {
    return err(response.ResponseDescription || 'M-Pesa payment initiation failed')
  }

  return ok({
    merchantRequestId: response.MerchantRequestID,
    checkoutRequestId: response.CheckoutRequestID,
    responseCode: response.ResponseCode,
    responseDescription: response.ResponseDescription,
    customerMessage: response.CustomerMessage,
  })
}

export async function queryStkPushStatus(checkoutRequestId: string): Promise<Result<any, string>> {
  const response = await queryStkPush(checkoutRequestId)
  return ok(response)
}

export async function processMpesaCallback(
  body: any,
  clientIp: string
): Promise<Result<{ success: boolean; orderId?: string }, string>> {
  if (process.env.MPESA_ENVIRONMENT === 'production' && !verifyMpesaCallbackIp(clientIp)) {
    console.warn(`M-Pesa callback rejected from IP: ${clientIp}`)
    return ok({ success: true })
  }

  const callback = body.Body?.stkCallback
  if (!callback) {
    console.error('Invalid callback format:', body)
    return ok({ success: true })
  }

  const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = callback

  const payment = await prisma.paymentTransaction.findUnique({
    where: { transactionId: CheckoutRequestID },
    include: { order: true },
  })

  if (!payment) {
    console.error(`No payment found for CheckoutRequestID: ${CheckoutRequestID}`)
    return ok({ success: true })
  }

  if (payment.status === 'SUCCESS') {
    return ok({ success: true })
  }

  if (ResultCode === 0) {
    const items = (CallbackMetadata?.Item || []) as Array<{ Name: string; Value?: string | number }>
    const amount = items.find((i) => i.Name === 'Amount')?.Value
    const mpesaReceiptNumber = items.find((i) => i.Name === 'MpesaReceiptNumber')?.Value
    const phoneNumber = items.find((i) => i.Name === 'PhoneNumber')?.Value

    await prisma.$transaction(async (tx) => {
      await tx.paymentTransaction.update({
        where: { id: payment.id },
        data: {
          status: 'SUCCESS',
          gatewayResponse: payment.gatewayResponse
            ? { ...(payment.gatewayResponse as object), callback: body }
            : { callback: body },
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
          where: { variantId: item.variantId, quantityOnHand: { gte: item.quantity } },
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

    if (payment.order?.userId) {
      await clearCart(payment.order.userId)
    }
    return ok({ success: true, orderId: payment.orderId })
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

    return err(ResultDesc || 'M-Pesa payment failed')
  }
}

async function clearCart(userId: string) {
  const cart = await prisma.cart.findFirst({ where: { userId } })
  if (cart) {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })
    await prisma.cart.update({ where: { id: cart.id }, data: { subtotal: 0, taxTotal: 0, shippingTotal: 0, grandTotal: 0 } })
  }
}

export async function getPaymentTransactions(orderId: string): Promise<Result<any[], string>> {
  const transactions = await prisma.paymentTransaction.findMany({
    where: { orderId },
    orderBy: { createdAt: 'desc' },
  })
  return ok(transactions)
}