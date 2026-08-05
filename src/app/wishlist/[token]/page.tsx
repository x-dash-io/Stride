import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import { ShoppingBag, Heart, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface ShareWishlistProps {
  params: Promise<{ token: string }>
}

export async function generateMetadata({ params }: ShareWishlistProps): Promise<Metadata> {
  const { token } = await params
  const wishlist = await prisma.wishlist.findUnique({
    where: { shareToken: token },
    include: { items: { include: { variant: { include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } } } } } } },
  })
  return {
    title: wishlist ? `${wishlist.name} | STRIDE` : 'Shared Wishlist | STRIDE',
    description: wishlist ? `${wishlist.items.length} items shared by a friend` : undefined,
  }
}

export default async function SharedWishlistPage({ params }: ShareWishlistProps) {
  const { token } = await params
  const wishlist = await prisma.wishlist.findUnique({
    where: { shareToken: token },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: {
                include: {
                  images: { where: { isPrimary: true }, take: 1 },
                  brand: true,
                },
              },
              inventory: true,
            },
          },
        },
      },
    },
  })

  if (!wishlist) {
    notFound()
  }

  const items = wishlist.items.filter(item => item.variant.product)

  return (
    <div className="container-max py-12 min-h-screen">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Heart className="w-8 h-8 text-primary" />
          <h1 className="text-4xl md:text-5xl font-serif font-bold">{wishlist.name}</h1>
        </div>
        <p className="text-muted-foreground">
          {items.length > 0
            ? `${items.length} item${items.length !== 1 ? 's' : ''} saved`
            : 'This wishlist is empty'}
        </p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-6">No items in this wishlist yet.</p>
          <Button variant="outline" asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => {
            const product = item.variant.product
            if (!product) return null

            const available = item.variant.inventory?.reduce((s, inv) => s + inv.quantityOnHand, 0) ?? 0
            const hasSale = product.salePrice && Number(product.salePrice) < Number(product.basePrice)

            return (
              <div key={item.id} className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all">
                <Link href={`/products/${product.slug}`} className="block aspect-square bg-muted relative overflow-hidden">
                  {product.images && product.images[0] ? (
                    <img
                      src={product.images[0].url}
                      alt={product.images[0].altText || product.name}
                      width={320}
                      height={320}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <ShoppingBag className="w-12 h-12" />
                    </div>
                  )}
                </Link>
                <div className="p-4 space-y-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">{product.brand?.name || ''}</p>
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
      )}
    </div>
  )
}