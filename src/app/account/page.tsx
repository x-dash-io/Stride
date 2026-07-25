import { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Link } from 'next/link'
import { ShoppingBag, User, MapPin, Heart, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'My Account | STRIDE',
  description: 'Manage your account, orders, and addresses.',
}

async function getUserData(userId: string) {
  const [user, orders, wishlistCount, addresses] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true, image: true, phone: true, createdAt: true } }),
    prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { items: { include: { variant: { include: { product: true } } } } },
    }),
    prisma.wishlistItem.count({ where: { wishlist: { userId } } }),
    prisma.address.findMany({ where: { userId }, orderBy: { isDefault: 'desc' } }),
  ])

  return { user, orders, wishlistCount, addresses }
}

export default async function AccountPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/auth/login')

  const { user, orders, wishlistCount, addresses } = await getUserData(session.user.id)

  return (
    <div className="container-max py-12 min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-serif font-bold">My Account</h1>
        <p className="text-muted-foreground mt-2">Welcome back, {user?.name || 'Customer'}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
            <div className="flex items-center gap-4 mb-6">
              {user?.image ? (
                <img src={user.image} alt="" className="w-16 h-16 rounded-full" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-medium">
                  {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="font-semibold">{user?.name || 'Customer'}</h3>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <nav className="space-y-2">
              <Link href="/account" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary text-primary-foreground font-medium">
                <User className="w-5 h-5" />
                Dashboard
              </Link>
              <Link href="/account/orders" className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                <ShoppingBag className="w-5 h-5" />
                My Orders
              </Link>
              <Link href="/account/addresses" className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                <MapPin className="w-5 h-5" />
                Addresses
              </Link>
              <Link href="/account/wishlist" className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                <Heart className="w-5 h-5" />
                Wishlist <span className="ml-auto bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">{wishlistCount}</span>
              </Link>
            </nav>
          </div>
        </aside>

        <main className="lg:col-span-3 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-serif font-bold">Recent Orders</h2>
              <Link href="/account/orders" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Link key={order.id} href={`/account/orders/${order.id}`} className="block">
                    <div className="bg-card border border-border rounded-xl p-4 hover:bg-accent/50 transition-colors">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                            {order.items[0]?.variant?.product?.images[0]?.url ? (
                              <img src={order.items[0].variant.product.images[0].url} alt="" className="w-full h-full object-cover rounded-lg" />
                            ) : (
                              <span className="text-3xl">👟</span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{order.items[0].productName}</p>
                            <p className="text-sm text-muted-foreground">+{order.items.length - 1} more item{order.items.length - 1 !== 1 ? 's' : ''}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 text-right">
                          <p className="font-semibold">{formatPrice(Number(order.grandTotal))}</p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                            order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                            order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl p-8 text-center">
                <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                <p className="text-muted-foreground mb-4">When you place an order, it will appear here.</p>
                <Link href="/products"><Button>Start Shopping</Button></Link>
              </div>
            )}
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-serif font-bold">Saved Addresses</h2>
              <Link href="/account/addresses" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                Manage <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.length > 0 ? (
                addresses.map((address) => (
                  <div key={address.id} className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{address.firstName} {address.lastName}</p>
                        <p className="text-sm text-muted-foreground">{address.addressLine1}</p>
                        <p className="text-sm text-muted-foreground">{address.city}, {address.state} {address.postalCode}</p>
                        <p className="text-sm text-muted-foreground">{address.phone}</p>
                      </div>
                      {address.isDefault && <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">Default</span>}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 bg-card border border-border rounded-xl p-8 text-center">
                  <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No addresses saved</h3>
                  <p className="text-muted-foreground mb-4">Add an address to speed up checkout.</p>
                  <Link href="/account/addresses"><Button>Add Address</Button></Link>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}