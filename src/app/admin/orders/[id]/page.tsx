import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { ArrowLeft, ShoppingBag, Package, MapPin, CreditCard, User, Mail, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { OrderStatus } from '@prisma/client'
import { requireStaff } from '@/lib/authz'
import { ADMIN_ROLE } from '@/lib/roles'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Order Details | STRIDE',
}

const statusColors: Record<string, string> = {
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-indigo-100 text-indigo-800',
  IN_TRANSIT: 'bg-indigo-100 text-indigo-800',
  RETURNED: 'bg-orange-100 text-orange-800',
  REFUNDED: 'bg-purple-100 text-purple-800',
  ON_HOLD: 'bg-gray-100 text-gray-800',
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireStaff({ roles: [ADMIN_ROLE] })

  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      items: {
        include: {
          variant: {
            include: {
              product: { select: { name: true, slug: true, images: true } },
            },
          },
        },
      },
      shippingAddress: true,
      billingAddress: true,
      payments: { take: 1, orderBy: { createdAt: 'desc' } },
    },
  })

  if (!order) {
    notFound()
  }

  return (
    <div className="container-max py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/admin/orders" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2">
            <ArrowLeft className="w-4 h-4" /> Back to Orders
          </Link>
          <h1 className="text-4xl font-serif font-bold">Order #{order.orderNumber}</h1>
          <p className="text-muted-foreground mt-1">
            Placed on {format(new Date(order.createdAt), 'MMMM d, yyyy')}
          </p>
        </div>
        <div className="flex gap-2">
          <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
            {order.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-xl">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order Items ({order.items.length})
              </h2>
            </div>
            <div className="divide-y divide-border">
              {order.items.map((item) => (
                <div key={item.id} className="p-6 flex gap-4">
                  {item.variant.product.images[0]?.url && (
                    <img
                      src={item.variant.product.images[0].url}
                      alt={item.variant.product.name}
                      width={80}
                      height={80}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <Link
                      href={`/products/${item.variant.product.slug}`}
                      className="font-medium hover:underline"
                    >
                      {item.variant.product.name}
                    </Link>
                    <p className="text-sm text-muted-foreground mt-1">
                      Size: {item.variant.size} • Color: {item.variant.colour}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      SKU: {item.variant.sku}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatPrice(Number(item.unitPrice))}</p>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    <p className="font-semibold mt-1">
                      {formatPrice(Number(item.unitPrice) * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(Number(order.subtotal))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{formatPrice(Number(order.shippingTotal))}</span>
              </div>
              {Number(order.taxTotal) > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatPrice(Number(order.taxTotal))}</span>
                </div>
              )}
              {order.discountTotal && Number(order.discountTotal) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatPrice(Number(order.discountTotal))}</span>
                </div>
              )}
              <div className="border-t border-border pt-3 flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>{formatPrice(Number(order.grandTotal))}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Details Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-card border border-border rounded-xl">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <User className="w-5 h-5" />
                Customer
              </h2>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{order.user?.name || 'Guest'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{order.email}</span>
              </div>
              {order.user?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{order.user.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="bg-card border border-border rounded-xl">
              <div className="p-6 border-b border-border">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Shipping Address
                </h2>
              </div>
              <div className="p-6">
                <p className="font-medium">
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {order.shippingAddress.addressLine1}
                  {order.shippingAddress.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
                </p>
                <p className="text-sm text-muted-foreground">
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                </p>
                <p className="text-sm text-muted-foreground">
                  {order.shippingAddress.country}
                </p>
                {order.shippingAddress.phone && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Phone: {order.shippingAddress.phone}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Payment Info */}
          <div className="bg-card border border-border rounded-xl">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment
              </h2>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method</span>
                <span className="font-medium">{order.paymentMethod || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  order.paymentStatus === 'CAPTURED' ? 'bg-green-100 text-green-800' :
                  order.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {order.paymentStatus}
                </span>
              </div>
              {order.payments && order.payments[0]?.transactionId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction ID</span>
                  <span className="text-sm font-mono">{order.payments[0].transactionId}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            <div className="space-y-2">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/admin/orders">Back to Orders</Link>
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-4">
                Status management coming soon
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
