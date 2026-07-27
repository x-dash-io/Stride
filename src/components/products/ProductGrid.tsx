import { Star, Package } from 'lucide-react'
import Link from 'next/link'
import { Product } from '@/types'
import { formatPrice } from '@/lib/utils'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const price = product.salePrice ?? product.basePrice
  const originalPrice = product.salePrice ? product.basePrice : null

  return (
    <Link href={`/products/${product.slug}`} className="product-card group block">
      <div className="aspect-square bg-muted relative overflow-hidden">
        {product.primaryImage ? (
          <img src={product.primaryImage} alt={product.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
        ) : (
          <Package className="w-12 h-12 text-muted-foreground" />
        )}
      </div>

      <div className="p-4">
        <p className="text-xs uppercase tracking-wider text-accent mb-1">{product.brand.name}</p>
        <h3 className="text-lg font-serif font-semibold mb-2 line-clamp-2">{product.name}</h3>

        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.ratingAvg) ? 'fill-accent text-accent' : 'text-muted'}`} />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-primary">{formatPrice(price)}</span>
          {originalPrice && <span className="text-sm line-through text-muted-foreground">{formatPrice(originalPrice)}</span>}
        </div>

        {product.variants.some(v => v.availableStock === 0) && (
          <p className="text-xs text-destructive font-medium mt-2">Some sizes out of stock</p>
        )}
      </div>
    </Link>
  )
}

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="col-span-full text-center py-12">
        <p className="text-lg text-muted-foreground mb-4">No products found matching your filters.</p>
        <button className="btn-primary">Clear Filters</button>
      </div>
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