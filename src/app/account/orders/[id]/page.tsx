export const dynamic = 'force-dynamic'
import { notFound } from 'next/navigation'
import { formatPrice } from '@/lib/utils'
import { ArrowLeft, Truck, CheckCircle, Clock, Package, MapPin, Smartphone, CreditCard, ShoppingBag, MessageSquarePlus } from 'lucide-react'
import Link from 'next/link'
import { requireCustomer } from '@/lib/authz'
import { getOrderDetails } from '@/lib/services/order.service'

const statusOrder = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED']

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireCustomer({ callbackUrl: '/account/orders' })

  const { id } = await params
  const result = await getOrderDetails(id)

  if (!result.ok) notFound()
  const order = result.value

  const currentStatusIndex = statusOrder.indexOf(order.status)

  return (
    <div className="container-max py-12 min-h-screen">
      <Link href="/account/orders" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="w-4 h-4" />
        Back to Orders
      </Link>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-4xl md:text-5xl font-serif font-bold">Order #{order.orderNumber}</h1>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
            order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
            order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {order.status}
          </span>
        </div>
        <p className="text-muted-foreground">Placed on {new Date(order.createdAt).toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Truck className="w-5 h-5" /> Order Progress</h2>
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-muted" />
              {statusOrder.map((status, index) => (
                <div key={status} className="relative flex items-start gap-4 mb-6 last:mb-0">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors ${
                    index < currentStatusIndex ? 'bg-green-600 border-green-600 text-white' :
                    index === currentStatusIndex ? 'bg-primary border-primary text-primary-foreground' :
                    'bg-background border-border text-muted-foreground'
                  }`}>
                    {index < currentStatusIndex ? <CheckCircle className="w-6 h-6" /> : index === currentStatusIndex ? <Clock className="w-6 h-6 animate-spin" /> : status === 'DELIVERED' ? <Package className="w-6 h-6" /> : <Truck className="w-6 h-6" />}
                  </div>
                  <div className="pt-1">
                    <p className={`font-medium ${index <= currentStatusIndex ? 'text-foreground' : 'text-muted-foreground'}`}>{status.replace('_', ' ')}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.statusHistory.find(h => h.toStatus === status)?.createdAt
                        ? new Date(order.statusHistory.find(h => h.toStatus === status)!.createdAt).toLocaleString()
                        : index <= currentStatusIndex ? 'Completed' : 'Pending'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Items</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                    {item.variant.product.images[0]?.url ? <img src={item.variant.product.images[0].url} alt="" width={80} height={80} className="w-full h-full object-cover rounded-lg" /> : <ShoppingBag className="w-8 h-8 text-muted-foreground" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-muted-foreground">Size: {item.size} • Color: {item.colour}</p>
                    <p className="text-sm text-muted-foreground">SKU: {item.variantSku}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatPrice(Number(item.totalPrice))}</p>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  {['CONFIRMED', 'SHIPPED', 'DELIVERED'].includes(order.status) && item.variant.product.slug && (
                    <div className="flex items-center">
                      <Link
                        href={`/products/${item.variant.product.slug}?review=1`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
                      >
                        <MessageSquarePlus className="h-3.5 w-3.5" />
                        Write a review
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(Number(order.subtotal))}</span></div>
              {Number(order.taxTotal) > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatPrice(Number(order.taxTotal))}</span>
                </div>
              )}
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{Number(order.shippingTotal) === 0 ? 'Free' : formatPrice(Number(order.shippingTotal))}</span></div>
              {Number(order.discountTotal) > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(Number(order.discountTotal))}</span></div>}
              <div className="border-t pt-3 flex justify-between text-lg font-semibold"><span>Total</span><span>{formatPrice(Number(order.grandTotal))}</span></div>
            </div>
          </section>

          <section className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><MapPin className="w-5 h-5" /> Shipping Address</h2>
            {order.shippingAddress && (
              <address className="not-italic text-sm text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                <p>{order.shippingAddress.country}</p>
                <p>Phone: {order.shippingAddress.phone}</p>
              </address>
            )}
          </section>

          <section className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              {order.paymentMethod === 'MPESA_STK_PUSH' && <Smartphone className="w-5 h-5" />}
              {order.paymentMethod === 'CASH_ON_DELIVERY' && <CreditCard className="w-5 h-5" />}
              Payment
            </h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Method</dt><dd className="font-medium">{order.paymentMethod?.replace('_', ' ') || 'Pending'}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Status</dt><dd className={`font-medium ${order.paymentStatus === 'CAPTURED' ? 'text-green-600' : order.paymentStatus === 'FAILED' ? 'text-red-600' : 'text-yellow-600'}`}>{order.paymentStatus}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Amount Paid</dt><dd className="font-semibold">{formatPrice(Number(order.amountPaid))}</dd></div>
            </dl>
          </section>
        </div>
      </div>
    </div>
  )
}