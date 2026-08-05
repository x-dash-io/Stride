'use client'

import { memo, useState } from 'react'
import { Package, ShoppingCart, Check, SlidersHorizontal } from 'lucide-react'
import Link from 'next/link'
import { Product } from '@/types'
import { formatPrice } from '@/lib/utils'
import { ClearFiltersButton } from '@/components/products/ClearFiltersButton'
import { Button } from '@/components/ui/button'
import { useCart } from '@/providers/CartProvider'
import { useToast } from '@/providers/ToastProvider'
import { EmptyState } from '@/components/ui/empty-state'

interface ProductCardProps {
  product: Product
}

export const ProductCard = memo(function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()
  const { showToast } = useToast()
  const [isAdding, setIsAdding] = useState(false)
  const [added, setAdded] = useState(false)

  const price = product.salePrice ?? product.basePrice
  const originalPrice = product.salePrice ? product.basePrice : null
  const discountPercent = originalPrice && price && originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100) 
    : null

  const hasStock = product.variants.some(v => v.availableStock > 0)
  const firstAvailableVariant = product.variants.find(v => v.availableStock > 0)

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!firstAvailableVariant) {
      showToast('error', 'This product is out of stock')
      return
    }

    // Optimistic UI update - show added state immediately
    setAdded(true)
    setIsAdding(true)

    try {
      await addItem(firstAvailableVariant.id, 1)
      showToast('success', 'Added to cart')
      setTimeout(() => setAdded(false), 2000)
    } catch {
      showToast('error', 'Failed to add to cart')
      setAdded(false)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <Link href={`/products/${product.slug}`} className="group block bg-card border border-border rounded-xl overflow-hidden hover:shadow-xl transition-all relative">
      {/* Discount Badge */}
      {discountPercent && (
        <div className="absolute top-3 left-3 z-10 bg-accent text-accent-foreground text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
          Save {discountPercent}%
        </div>
      )}

      {/* Status Badge */}
      <div className="absolute top-3 right-3 z-10">
        {product.tag === 'LIMITED_EDITION' && (
          <span className="bg-amber-500 text-white text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded">
            Limited Edition
          </span>
        )}
        {product.tag === 'NEW_ARRIVAL' && (
          <span className="bg-blue-500 text-white text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded">
            New
          </span>
        )}
        {product.tag === 'TRENDING' && (
          <span className="bg-pink-500 text-white text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded">
            Trending
          </span>
        )}
        {product.tag === 'FEATURED' && (
          <span className="bg-purple-500 text-white text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded">
            Featured
          </span>
        )}
        {product.tag === 'BEST_SELLER' && (
          <span className="bg-emerald-500 text-white text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded">
            Best Seller
          </span>
        )}
      </div>

      <div className="aspect-square bg-muted relative overflow-hidden">
        {product.primaryImage ? (
          <img src={product.primaryImage} alt={product.name} width={640} height={640} className="w-full h-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
        ) : (
          <Package className="w-12 h-12 text-muted-foreground" />
        )}

        {/* Quick Add Button Overlay (Desktop only) */}
        {hasStock && (
          <div className="hidden lg:flex absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center">
            <Button
              onClick={handleQuickAdd}
              disabled={isAdding || added}
              size="lg"
              className="transform translate-y-4 group-hover:translate-y-0 transition-transform"
            >
              {added ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Added
                </>
              ) : isAdding ? (
                'Adding...'
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Quick Add
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs uppercase tracking-wider text-accent mb-1">
          <Link href={`/brands/${product.brand.slug}`} className="hover:underline transition-colors">
            {product.brand.name}
          </Link>
        </p>
        <h3 className="text-lg font-serif font-semibold mb-2 line-clamp-2">{product.name}</h3>

        <div className="flex items-baseline gap-2 mb-3 mt-auto">
          <span className="text-xl font-bold text-primary">{formatPrice(price)}</span>
          {originalPrice && (
            <>
              <span className="text-sm line-through text-muted-foreground">{formatPrice(originalPrice)}</span>
              {discountPercent && (
                <span className="text-xs text-destructive font-semibold tracking-wide">Save {discountPercent}%</span>
              )}
            </>
          )}
        </div>

        {hasStock ? (
          <Button 
            onClick={handleQuickAdd} 
            disabled={isAdding || added} 
            className="w-full lg:hidden mt-2" 
            variant="outline" 
            size="sm"
          >
            {added ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Added
              </>
            ) : isAdding ? (
              'Adding...'
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </>
            )}
          </Button>
        ) : (
          <p className="text-xs text-destructive font-medium mt-2">Out of stock</p>
        )}
      </div>
    </Link>
  )
})

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <EmptyState
        icon={SlidersHorizontal}
        title="No Products Found"
        description="We couldn't find any products matching your selected filters. Try adjusting your search criteria or resetting filters."
        variant="card"
        className="col-span-full py-16"
      >
        <div className="mt-2">
          <ClearFiltersButton />
        </div>
      </EmptyState>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}