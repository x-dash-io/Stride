'use client'

import { WishlistItem } from '@/types'
import { formatPrice } from '@/lib/utils'
import { ShoppingBag, Trash2, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useState } from 'react'
import { removeFromWishlist } from '@/app/actions/wishlist'
import { EmptyState } from '@/components/ui/empty-state'

interface WishlistClientProps {
  items: WishlistItem[]
}

export default function WishlistClient({ items }: WishlistClientProps) {
  const [localItems, setLocalItems] = useState(items)

  const handleRemove = async (itemId: string) => {
    const formData = new FormData()
    formData.append('itemId', itemId)

    try {
      const result = await removeFromWishlist(formData)
      if ('error' in result) {
        alert(result.error)
      } else {
        setLocalItems(localItems.filter(item => item.id !== itemId))
      }
    } catch (error) {
      alert('Failed to remove item')
    }
  }

  if (localItems.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="Your Wishlist is Empty"
        description="Save your favorite items to come back to them later whenever you are ready."
        action={{ label: 'Explore Products', href: '/products', icon: ShoppingBag }}
        variant="card"
      />
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {localItems.map((item) => {
        const product = item.variant.product
        if (!product) return null
        
        const available = item.variant.inventory.reduce((s, inv) => s + inv.quantityOnHand, 0)
        const hasSale = product.salePrice && Number(product.salePrice) < Number(product.basePrice)

        return (
          <div key={item.id} className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all">
            <Link href={`/products/${product.slug}`} className="block aspect-square bg-muted relative overflow-hidden">
              {product.images && product.images[0] ? (
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
              <button
                onClick={(e) => {
                  e.preventDefault()
                  handleRemove(item.id)
                }}
                className="absolute top-3 right-3 p-2 bg-background/80 backdrop-blur-sm rounded-full hover:bg-destructive hover:text-white transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
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
  )
}
