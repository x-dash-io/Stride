import { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getWishlist } from '@/lib/queries'

export const metadata: Metadata = {
  title: 'My Wishlist | STRIDE',
  description: 'View and manage your wishlist items.',
}

export default async function WishlistPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/auth/login')

  const wishlist = await getWishlist(session.user.id)

  const items = wishlist?.items || []

  return (
    <div className="container-max py-12 min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-2">My Wishlist</h1>
        <p className="text-muted-foreground">
          {items.length > 0
            ? `${items.length} item${items.length !== 1 ? 's' : ''} saved`
            : 'Items you save will appear here'}
        </p>
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => {
            const product = item.variant.product
            const available = item.variant.inventory.reduce((s, inv) => s + inv.quantityOnHand, 0)
            const hasSale = product.salePrice && Number(product.salePrice) < Number(product.basePrice)

            return (
              <div key={item.id} className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all">
                <Link href={`/products/${product.slug}`} className="block aspect-square bg-muted relative overflow-hidden">
                  {product.images[0] ? (
                    <img
                      src={product.images[0].url}
                      alt={product.images[0].altText || product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <ShoppingBag className="w-12 h-12" />
                    </div>
                  )}
                  <button className="absolute top-3 right-3 p-2 bg-background/80 backdrop-blur-sm rounded-full hover:bg-destructive hover:text-white transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </Link>
                <div className="p-4 space-y-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">{product.brand.name}</p>
                  <Link href={`/products/${product.slug}`}>
                    <h3 className="font-medium line-clamp-1 hover:text-primary transition-colors">{product.name}</h3>
                  </Link>
                  <div className="flex items-center gap-2">
                    {hasSale ? (
                      <>
                        <span className="font-semibold">{formatPrice(Number(product.salePrice))}</span>
                        <span className="text-sm text-muted-foreground line-through">{formatPrice(Number(product.basePrice))}</span>
                      </>
                    ) : (
                      <span className="font-semibold">{formatPrice(Number(product.basePrice))}</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Size: {item.variant.size} / {item.variant.colour}
                  </p>
                  <p className="text-xs">
                    {available > 0 ? (
                      <span className="text-green-600">{available} in stock</span>
                    ) : (
                      <span className="text-destructive">Out of stock</span>
                    )}
                  </p>
                  <Button className="w-full" size="sm" disabled={available === 0} asChild>
                    <Link href={`/products/${product.slug}`}>
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      {available > 0 ? 'Add to Cart' : 'View Product'}
                    </Link>
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
          <p className="text-muted-foreground mb-6">Save your favorite items to come back to them later.</p>
          <Button asChild>
            <Link href="/products">
              <ShoppingBag className="w-4 h-4 mr-2" /> Browse Products
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
