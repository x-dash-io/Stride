'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { mockProducts } from '@/lib/data/products'
import { mockReviews, getProductReviews } from '@/lib/data/reviews'
import { useCart } from '@/lib/contexts/cart-context'
import { Star, Heart, Share2, ChevronLeft, Check } from 'lucide-react'

export default function ProductDetailPage() {
  const params = useParams()
  const productId = params.id as string
  const product = mockProducts.find((p) => p.id === productId)
  const reviews = getProductReviews(productId)

  const [selectedColor, setSelectedColor] = useState(product?.colors[0].name || '')
  const [selectedSize, setSelectedSize] = useState(product?.sizes[0].size || '')
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)

  const { addItem } = useCart()

  if (!product) {
    return (
      <div className="container-max py-12 text-center">
        <h1 className="text-2xl font-serif font-bold mb-4">Product not found</h1>
        <Link href="/products" className="btn-primary">
          Back to Products
        </Link>
      </div>
    )
  }

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      quantity,
      selectedColor,
      selectedSize,
    })
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  const price = product.salePrice || product.price
  const savings = product.salePrice ? product.price - product.salePrice : 0

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="container-max py-4">
        <Link
          href="/products"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Products
        </Link>
      </div>

      <div className="container-max py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="flex flex-col gap-4">
            <div className="aspect-square bg-muted rounded-lg flex items-center justify-center text-8xl">
              👟
            </div>
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  className="aspect-square bg-muted rounded-lg flex items-center justify-center text-4xl hover:opacity-70 transition-opacity"
                >
                  👟
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div>
            {/* Metadata */}
            <p className="text-xs uppercase tracking-widest text-accent mb-2">
              {product.brand}
            </p>
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating)
                        ? 'fill-accent text-accent'
                        : 'text-muted'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {product.rating} • {product.reviewCount} reviews
              </span>
            </div>

            {/* Price */}
            <div className="mb-8 pb-8 border-b border-border">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-4xl font-bold text-primary">${price}</span>
                {product.salePrice && (
                  <>
                    <span className="text-xl line-through text-muted-foreground">
                      ${product.price}
                    </span>
                    <span className="bg-destructive text-destructive-foreground text-sm font-semibold px-3 py-1 rounded">
                      Save ${savings}
                    </span>
                  </>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {product.inStock ? (
                  <span className="text-green-600 font-medium">In Stock</span>
                ) : (
                  <span className="text-destructive font-medium">Out of Stock</span>
                )}
              </p>
            </div>

            {/* Color Selection */}
            <div className="mb-6">
              <label className="text-sm font-semibold uppercase tracking-wider mb-3 block">
                Color
              </label>
              <div className="flex gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`w-12 h-12 rounded border-2 transition-all ${
                      selectedColor === color.name
                        ? 'border-accent'
                        : 'border-border'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  >
                    {selectedColor === color.name && (
                      <Check className="w-6 h-6 mx-auto text-white drop-shadow" />
                    )}
                  </button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-2">{selectedColor}</p>
            </div>

            {/* Size Selection */}
            <div className="mb-6">
              <label className="text-sm font-semibold uppercase tracking-wider mb-3 block">
                Size
              </label>
              <div className="grid grid-cols-4 gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size.size}
                    onClick={() => size.available && setSelectedSize(size.size)}
                    disabled={!size.available}
                    className={`py-3 px-2 rounded border-2 text-sm font-medium transition-all ${
                      selectedSize === size.size
                        ? 'border-accent bg-accent text-accent-foreground'
                        : 'border-border hover:border-accent disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                  >
                    {size.size}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                <Link href="#size-guide" className="text-accent hover:underline">
                  Not sure? Check size guide
                </Link>
              </p>
            </div>

            {/* Quantity */}
            <div className="mb-8">
              <label className="text-sm font-semibold uppercase tracking-wider mb-3 block">
                Quantity
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border border-border rounded hover:bg-muted transition-colors"
                >
                  −
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 text-center border border-border rounded py-2"
                  min="1"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 border border-border rounded hover:bg-muted transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="space-y-3 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className={`w-full py-4 rounded font-semibold text-lg transition-all flex items-center justify-center gap-2 ${
                  addedToCart
                    ? 'bg-green-600 text-white'
                    : 'btn-primary'
                } ${!product.inStock && 'opacity-50 cursor-not-allowed'}`}
              >
                {addedToCart ? (
                  <>
                    <Check className="w-5 h-5" />
                    Added to Cart
                  </>
                ) : product.inStock ? (
                  'Add to Cart'
                ) : (
                  'Out of Stock'
                )}
              </button>

              {/* Wishlist & Share */}
              <div className="flex gap-3">
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`flex-1 py-3 rounded border-2 transition-all flex items-center justify-center gap-2 ${
                    isWishlisted
                      ? 'border-accent bg-accent text-accent-foreground'
                      : 'border-border hover:border-accent'
                  }`}
                >
                  <Heart
                    className={`w-5 h-5 ${
                      isWishlisted ? 'fill-current' : ''
                    }`}
                  />
                  {isWishlisted ? 'Wishlisted' : 'Wishlist'}
                </button>
                <button className="flex-1 py-3 px-3 rounded border-2 border-border hover:border-accent flex items-center justify-center gap-2 transition-all">
                  <Share2 className="w-5 h-5" />
                  Share
                </button>
              </div>
            </div>

            {/* Product Info */}
            <div className="bg-muted/30 rounded-lg p-6 mb-8 space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🚚</span>
                <div>
                  <p className="font-semibold">Free Shipping</p>
                  <p className="text-sm text-muted-foreground">On orders over $200</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">↩️</span>
                <div>
                  <p className="font-semibold">Easy Returns</p>
                  <p className="text-sm text-muted-foreground">30-day return policy</p>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">{product.description}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Details</h3>
                <p className="text-muted-foreground">{product.details}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Materials</h3>
                <div className="flex flex-wrap gap-2">
                  {product.materials.map((material) => (
                    <span
                      key={material}
                      className="bg-muted px-3 py-1 rounded-full text-sm"
                    >
                      {material}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="container-max py-12 border-t border-border">
        <h2 className="text-3xl font-serif font-bold mb-8">Customer Reviews</h2>

        {reviews.length > 0 ? (
          <div className="space-y-8">
            {reviews.slice(0, 5).map((review) => (
              <div key={review.id} className="border-b border-border pb-8 last:border-b-0">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold">{review.userName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? 'fill-accent text-accent'
                                : 'text-muted'
                            }`}
                          />
                        ))}
                      </div>
                      {review.verified && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Verified Purchase
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="font-semibold mb-2">{review.title}</h4>
                <p className="text-muted-foreground text-sm mb-4">{review.comment}</p>
                <div className="flex items-center gap-4 text-sm">
                  <button className="text-muted-foreground hover:text-foreground transition-colors">
                    👍 Helpful ({review.helpful})
                  </button>
                  <button className="text-muted-foreground hover:text-foreground transition-colors">
                    👎 Not helpful ({review.notHelpful})
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            No reviews yet. Be the first to review this product!
          </p>
        )}
      </section>
    </div>
  )
}
