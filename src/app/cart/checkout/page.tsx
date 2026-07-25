import { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Cart } from '@/types'
import { CheckoutClient } from './CheckoutClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Checkout | STRIDE',
  description: 'Complete your order securely with M-Pesa or cash on delivery.',
}

function serializeCart(rawCart: any): Cart {
  return {
    ...rawCart,
    subtotal: Number(rawCart.subtotal),
    discountTotal: Number(rawCart.discountTotal),
    taxTotal: Number(rawCart.taxTotal),
    shippingTotal: Number(rawCart.shippingTotal),
    grandTotal: Number(rawCart.grandTotal),
    items: rawCart.items.map((item: any) => ({
      ...item,
      unitPrice: Number(item.unitPrice),
      totalPrice: Number(item.totalPrice),
    })),
  }
}

async function getCartData(userId: string) {
  const cart = await prisma.cart.findFirst({
    where: { userId },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: { include: { brand: true, images: { where: { isPrimary: true }, take: 1 } } },
              inventory: true,
            },
          },
        },
      },
    },
  })
  return cart ? serializeCart(cart) : null
}

async function getDefaultAddress(userId: string) {
  return prisma.address.findFirst({
    where: { userId, isDefault: true, isShipping: true },
  })
}

export default async function CheckoutPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/auth/login?callbackUrl=/cart/checkout')
  }

  const [cart, defaultAddress] = await Promise.all([
    getCartData(session.user.id),
    getDefaultAddress(session.user.id),
  ]);

  if (!cart || cart.items.length === 0) {
    redirect('/cart')
  }

  return (
    <CheckoutClient
      cart={cart}
      defaultAddress={defaultAddress}
      userEmail={session.user.email!}
    />
  )
}