'use client'

import Link from 'next/link'
import { mockProducts } from '@/lib/data/products'
import { Heart } from 'lucide-react'
import { useAuth } from '@/lib/contexts/auth-context'
import { useState } from 'react'

interface ProductRecommendationsProps {
  productId: string
  limit?: number
}

export default function ProductRecommendations({
  productId,
  limit = 4,
}: ProductRecommendationsProps) {
  const { user, addToFavorites, removeFromFavorites } = useAuth()
  const [localFavorites, setLocalFavorites] = useState(user?.favorites || [])

  // Get the current product
  const currentProduct = mockProducts.find((p) => p.id === productId)
  if (!currentProduct) return null

  // Get similar products based on category
  const recommendations = mockProducts
    .filter(
      (p) =>
        p.id !== productId &&
        (p.category === currentProduct.category ||
          p.brand === currentProduct.brand)
    )
    .slice(0, limit)

  if (recommendations.length === 0) return null

  const toggleFavorite = (id: string) => {
    if (localFavorites.includes(id)) {
      removeFromFavorites(id)
      setLocalFavorites(localFavorites.filter((fav) => fav !== id))
    } else {
      addToFavorites(id)
      setLocalFavorites([...localFavorites, id])
    }
  }

  return (
    <section className="py-16 border-t border-border">
      <h2 className="text-3xl font-serif font-bold mb-8">You Might Also Like</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {recommendations.map((product) => {
          const price = product.salePrice || product.price
          const isFavorite = localFavorites.includes(product.id)

          return (
            <div
              key={product.id}
              className="group bg-card border border-border rounded-lg overflow-hidden hover:border-accent transition-colors"
            >
              {/* Product Image */}
              <Link
                href={`/products/${product.id}`}
                className="aspect-square bg-muted flex items-center justify-center text-6xl relative overflow-hidden"
              >
                <span className="group-hover:scale-110 transition-transform">
                  👟
                </span>
                {product.salePrice && (
                  <div className="absolute top-3 right-3 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded">
                    {Math.round(
                      ((product.price - product.salePrice) / product.price) * 100
                    )}
                    % OFF
                  </div>
                )}
              </Link>

              {/* Product Info */}
              <div className="p-4">
                <p className="text-xs uppercase tracking-widest text-accent font-medium mb-1">
                  {product.brand}
                </p>
                <Link href={`/products/${product.id}`}>
                  <h3 className="font-serif font-bold text-sm mb-3 line-clamp-2 group-hover:text-accent transition-colors">
                    {product.name}
                  </h3>
                </Link>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-3">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-xs ${
                          i < Math.floor(product.rating)
                            ? '⭐'
                            : '☆'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    ({product.reviewCount})
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="font-bold text-accent">${price.toFixed(2)}</span>
                  {product.salePrice && (
                    <span className="text-xs line-through text-muted-foreground">
                      ${product.price.toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    href={`/products/${product.id}`}
                    className="flex-1 py-2 bg-accent text-accent-foreground rounded text-xs font-semibold hover:opacity-90 transition-opacity text-center"
                  >
                    View
                  </Link>
                  {user && (
                    <button
                      onClick={() => toggleFavorite(product.id)}
                      className={`py-2 px-3 rounded border transition-colors ${
                        isFavorite
                          ? 'bg-accent text-accent-foreground border-accent'
                          : 'border-border hover:border-accent'
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          isFavorite ? 'fill-current' : ''
                        }`}
                      />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
