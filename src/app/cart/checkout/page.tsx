import { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { Prisma } from '@prisma/client'
import { Cart, CartItem, Product, ProductVariant } from '@/types'
import { Suspense } from 'react'
import { CheckoutContent } from './CheckoutContent'
import { CheckoutFormSkeleton } from '@/components/skeleton-loader'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Checkout | STRIDE',
  description: 'Complete your order securely with M-Pesa or cash on delivery.',
}

const cartInclude = {
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
} satisfies Prisma.CartInclude

type RawCart = Prisma.CartGetPayload<{ include: typeof cartInclude }>

function serializeCartItem(item: RawCart['items'][number]): CartItem {
  const { unitPrice, totalPrice, ...rest } = item
  const variant: ProductVariant = {
    ...rest.variant,
    basePrice: rest.variant.basePrice ? Number(rest.variant.basePrice) : null,
    salePrice: rest.variant.salePrice ? Number(rest.variant.salePrice) : null,
    weightKg: rest.variant.weightKg ? Number(rest.variant.weightKg) : null,
    images: [],
    availableStock: rest.variant.inventory.reduce((sum, i) => sum + i.quantityOnHand, 0),
    product: rest.variant.product
      ? {
          ...rest.variant.product,
          basePrice: Number(rest.variant.product.basePrice),
          salePrice: rest.variant.product.salePrice ? Number(rest.variant.product.salePrice) : null,
          costPrice: rest.variant.product.costPrice ? Number(rest.variant.product.costPrice) : null,
          weightKg: rest.variant.product.weightKg ? Number(rest.variant.product.weightKg) : null,
          totalStock: 0,
          soldCount: 0,
          ratingAvg: 0,
          reviewCount: 0,
          variants: [],
          createdAt: rest.variant.product.createdAt.toISOString(),
          updatedAt: rest.variant.product.updatedAt.toISOString(),
        }
      : undefined,
  }
  return {
    ...rest,
    unitPrice: Number(unitPrice),
    totalPrice: Number(totalPrice),
    variant,
  }
}

function serializeCart(rawCart: RawCart): Cart {
  return {
    id: rawCart.id,
    userId: rawCart.userId,
    sessionId: rawCart.sessionId,
    subtotal: Number(rawCart.subtotal),
    discountTotal: Number(rawCart.discountTotal),
    taxTotal: Number(rawCart.taxTotal),
    shippingTotal: Number(rawCart.shippingTotal),
    grandTotal: Number(rawCart.grandTotal),
    currency: rawCart.currency,
    expiresAt: rawCart.expiresAt instanceof Date ? rawCart.expiresAt.toISOString() : String(rawCart.expiresAt),
    items: rawCart.items.map(serializeCartItem),
  }
}

async function getCartData(userId?: string, sessionId?: string) {
  const cart = await prisma.cart.findFirst({
    where: userId ? { userId } : { sessionId },
    include: cartInclude,
  })
  return cart ? serializeCart(cart) : null
}

async function getDefaultAddress(userId: string) {
  return prisma.address.findFirst({
    where: { userId, isDefault: true, isShipping: true },
  })
}

async function CheckoutContentWrapper() {
  const session = await auth()
  const cookieStore = await cookies()

  let cart = null
  let defaultAddress = null
  let userEmail = null
  let isGuest = false

  if (session?.user?.id) {
    const [userCart, userAddress] = await Promise.all([
      getCartData(session.user.id),
      getDefaultAddress(session.user.id),
    ])
    cart = userCart
    defaultAddress = userAddress
    userEmail = session.user.email
  } else {
    const sessionId = cookieStore.get('cartSessionId')?.value
    if (sessionId) {
      cart = await getCartData(undefined, sessionId)
    }
    isGuest = true
  }

  if (!cart || cart.items.length === 0) {
    redirect('/cart')
  }

  return (
    <CheckoutContent
      cart={cart}
      defaultAddress={defaultAddress}
      userEmail={userEmail || ''}
      isGuest={isGuest}
    />
  )
}

export default async function CheckoutPage() {
  return (
    <Suspense fallback={
      <>
        <div className="container-max py-12">
          <div className="h-10 bg-muted rounded w-1/4 animate-pulse mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <CheckoutFormSkeleton />
            <div className="space-y-4 animate-pulse">
              <div className="h-6 bg-muted rounded w-1/3" />
              <div className="h-24 bg-muted rounded" />
              <div className="h-24 bg-muted rounded" />
            </div>
          </div>
        </div>
      </>
    }>
      <CheckoutContentWrapper />
    </Suspense>
  )
}