'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/providers/CartProvider'
import { useToast } from '@/providers/ToastProvider'
import { formatPrice } from '@/lib/utils'
import { ChevronLeft, Star, Heart, Share2, Check, Truck, RotateCcw, Shield, MapPin, Loader2, Package, ThumbsUp } from 'lucide-react'
import { Product, ProductVariant } from '@/types'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ProductDetailClientProps {
  product: Product
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { addItem } = useCart()
  const { showToast } = useToast()
  const [selectedColor, setSelectedColor] = useState(product.variants[0]?.colour || '')
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isAdding, setIsAdding] = useState(false)

  const availableColors = [...new Set(product.variants.map(v => v.colour))]
  const availableSizes = [...new Set(
    product.variants
      .filter(v => v.colour === selectedColor && v.availableStock > 0)
      .map(v => v.size)
  )].sort()

  const selectedVariant = product.variants.find(
    v => v.colour === selectedColor && v.size === selectedSize
  )

  const price = selectedVariant?.salePrice ?? selectedVariant?.basePrice ?? product.salePrice ?? product.basePrice
  const originalPrice = selectedVariant?.basePrice && selectedVariant.salePrice ? selectedVariant.basePrice : product.salePrice ? product.basePrice : null

  const handleAddToCart = async () => {
    if (!selectedVariant) return
    if (!selectedColor || !selectedSize) {
      showToast('error', 'Please select a color and size')
      return
    }
    if (selectedVariant.availableStock < quantity) {
      showToast('error', 'Insufficient stock for selected quantity')
      return
    }

    setIsAdding(true)
    try {
      await addItem(selectedVariant.id, quantity)
      setAddedToCart(true)
      showToast('success', 'Added to cart')
      setTimeout(() => setAddedToCart(false), 2000)
    } catch (error) {
      showToast('error', 'Failed to add to cart')
    } finally {
      setIsAdding(false)
    }
  }

  if (!selectedColor && availableColors.length > 0) {
    setSelectedColor(availableColors[0])
  }
  if (!selectedSize && availableSizes.length > 0) {
    setSelectedSize(availableSizes[0])
  }

  const currentImage = product.images[selectedImageIndex] || product.variants[0]?.images[0]

  return (
    <div className="min-h-screen">
      <nav className="container-max py-4" aria-label="Breadcrumb">
        <Link href="/products" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-4 h-4" />
          Back to Products
        </Link>
      </nav>

      <div className="container-max py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="flex flex-col gap-4">
            <div className="aspect-square bg-muted rounded-xl relative overflow-hidden">
              {currentImage?.url ? (
                <Image
                  src={currentImage.url}
                  alt={currentImage.altText || product.name}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <Package className="w-24 h-24 text-muted-foreground" />
              )}
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-8 gap-4">
                {product.images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={cn(
                      'aspect-square bg-muted rounded-lg overflow-hidden border-2 transition-colors',
                      selectedImageIndex === idx ? 'border-primary' : 'border-transparent hover:border-accent'
                    )}
                    aria-label={`View image ${idx + 1}`}
                    aria-current={selectedImageIndex === idx}
                  >
                    <Image src={img.url} alt={img.altText || `${product.name} ${idx + 1}`} fill className="object-cover" sizes="80px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-primary mb-2">{product.brand.name}</p>
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">{product.name}</h1>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < Math.floor(product.ratingAvg) ? 'fill-primary text-primary' : 'text-muted'}`} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">{product.ratingAvg.toFixed(1)} • {product.reviewCount} reviews</span>
            </div>

            <div className="mb-8 pb-8 border-b border-border">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-4xl font-bold text-primary">{formatPrice(price)}</span>
                {originalPrice && (
                  <span className="text-xl line-through text-muted-foreground">{formatPrice(originalPrice)}</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {selectedVariant?.availableStock !== undefined && selectedVariant.availableStock > 0
                  ? <span className="text-green-600 font-medium">In Stock ({selectedVariant.availableStock} available)</span>
                  : <span className="text-destructive font-medium">Out of Stock</span>}
              </p>
            </div>

            <div className="mb-6">
              <label className="text-sm font-semibold uppercase tracking-wider mb-3 block">Color</label>
              <div className="flex gap-3 flex-wrap">
                {availableColors.map((color) => {
                  const variant = product.variants.find(v => v.colour === color)
                  return (
                    <button
                      key={color}
                      onClick={() => {
                        setSelectedColor(color)
                        setSelectedSize('')
                      }}
                      className={cn(
                        'w-12 h-12 rounded border-2 transition-all',
                        selectedColor === color ? 'border-primary' : 'border-border'
                      )}
                      style={{ backgroundColor: variant?.colourHex || undefined }}
                      title={color}
                      disabled={!variant || variant.availableStock === 0}
                    >
                      {selectedColor === color && <Check className="w-6 h-6 mx-auto text-white drop-shadow" />}
                    </button>
                  )
                })}
              </div>
              <p className="text-sm text-muted-foreground mt-2">{selectedColor}</p>
            </div>

            <div className="mb-6">
              <label className="text-sm font-semibold uppercase tracking-wider mb-3 block">Size</label>
              <div className="grid grid-cols-5 gap-2">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    disabled={!selectedVariant || selectedVariant.availableStock === 0}
                    className={cn(
                      'py-3 px-2 rounded border-2 text-sm font-medium transition-all',
                      selectedSize === size
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                <Link href="/size-guide" className="text-primary hover:underline">Not sure? Check size guide</Link>
              </p>
            </div>

            <div className="mb-8">
              <label className="text-sm font-semibold uppercase tracking-wider mb-3 block">Quantity</label>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity">−</Button>
                <input type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} className="w-16 text-center border border-border rounded py-2" min="1" max={selectedVariant?.availableStock || 99} />
                <Button variant="outline" size="icon" onClick={() => setQuantity(Math.min(selectedVariant?.availableStock || 99, quantity + 1))} aria-label="Increase quantity">+</Button>
              </div>
            </div>

            <div className="space-y-3 mb-8">
              <Button
                onClick={handleAddToCart}
                disabled={!product.variants.some(v => v.availableStock > 0) || isAdding}
                className={cn('w-full py-4 rounded font-semibold text-lg', addedToCart ? 'bg-green-600' : 'btn-primary')}
              >
                {addedToCart ? (
                  <> <Check className="w-5 h-5 mr-2" /> Added to Cart </>
                ) : isAdding ? (
                  <> <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Adding... </>
                ) : !product.variants.some(v => v.availableStock > 0) ? (
                  'Out of Stock'
                ) : (
                  'Add to Cart'
                )}
              </Button>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={cn(
                    'flex-1 py-3 rounded border-2 transition-all flex items-center justify-center gap-2',
                    isWishlisted ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary'
                  )}
                >
                  <Heart className={cn('w-5 h-5', isWishlisted && 'fill-current')} />
                  {isWishlisted ? 'Wishlisted' : 'Wishlist'}
                </button>
                <Button variant="outline" className="flex-1 flex items-center justify-center gap-2">
                  <Share2 className="w-5 h-5" />
                  Share
                </Button>
              </div>
            </div>

            <div className="bg-muted/30 rounded-xl p-6 mb-8 space-y-3">
              <div className="flex items-start gap-3">
                <Truck className="w-6 h-6 text-primary" />
                <div>
                  <p className="font-semibold">Free Shipping</p>
                  <p className="text-sm text-muted-foreground">On orders over KES 10,000</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <RotateCcw className="w-6 h-6 text-primary" />
                <div>
                  <p className="font-semibold">Easy Returns</p>
                  <p className="text-sm text-muted-foreground">30-day return policy</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-primary" />
                <div>
                  <p className="font-semibold">Secure Payment</p>
                  <p className="text-sm text-muted-foreground">M-Pesa & Card payments</p>
                </div>
              </div>
            </div>

            <div className="space-y-6 border-t pt-6">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">{product.description}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Details</h3>
                <p className="text-muted-foreground">{product.shortDescription}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="container-max py-12 border-t border-border">
        <h2 className="text-3xl font-serif font-bold mb-8">Customer Reviews</h2>
        {product.reviews && product.reviews.length > 0 ? (
          <div className="space-y-8">
            {product.reviews.map((review) => (
              <div key={review.id} className="border-b border-border pb-8 last:border-b-0">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold">{review.user?.name || 'Anonymous'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-primary text-primary' : 'text-muted'}`} />
                        ))}
                      </div>
                      {review.isVerifiedPurchase && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Verified Purchase</span>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
                {review.title && <h4 className="font-semibold mb-2">{review.title}</h4>}
                <p className="text-muted-foreground text-sm mb-4">{review.body}</p>
                <div className="flex items-center gap-4 text-sm">
                  <button className="text-muted-foreground hover:text-foreground flex items-center gap-1"><ThumbsUp className="w-4 h-4" /> Helpful ({review.helpfulCount})</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">No reviews yet. Be the first to review!</p>
        )}
      </section>
    </div>
  )
}