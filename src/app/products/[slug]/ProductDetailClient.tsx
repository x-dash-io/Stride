'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useCart } from '@/providers/CartProvider'
import { useToast } from '@/providers/ToastProvider'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { Product, ProductVariant } from '@/types'
import { addToWishlist } from '@/app/actions/wishlist'
import ProductReviews from '@/components/product-reviews'
import {
  ProductImageGallery,
  ProductInfo,
  ProductOptions,
  ProductActions,
  ProductShippingInfo,
} from './sections'

interface ProductDetailClientProps {
  product: Product
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { data: session } = useSession()
  const { addItem } = useCart()
  const { showToast } = useToast()
  const [selectedColor, setSelectedColor] = useState(product.variants[0]?.colour || '')
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  // Reset selection when the product (i.e. its variants) changes during navigation
  const [prevVariants, setPrevVariants] = useState(product.variants)
  if (prevVariants !== product.variants) {
    setPrevVariants(product.variants)
    const colors = [...new Set(product.variants.map(v => v.colour))]
    setSelectedColor(colors[0] ?? '')
    const sizes = [...new Set(
      product.variants
        .filter(v => v.colour === colors[0] && v.availableStock > 0)
        .map(v => v.size)
    )].sort()
    setSelectedSize(sizes[0] ?? '')
  }

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

    setAddedToCart(true)
    setIsAdding(true)

    try {
      await addItem(selectedVariant.id, quantity)
      showToast('success', 'Added to cart')
      setTimeout(() => setAddedToCart(false), 2000)
    } catch {
      showToast('error', 'Failed to add to cart')
      setAddedToCart(false)
    } finally {
      setIsAdding(false)
    }
  }

  const handleToggleWishlist = async () => {
    if (!session?.user) {
      showToast('error', 'Please sign in to save items to your wishlist')
      return
    }
    const targetVariant = selectedVariant || product.variants[0]
    if (!targetVariant) return

    const formData = new FormData()
    formData.append('variantId', targetVariant.id)

    try {
      const res = await addToWishlist(formData)
      if ('error' in res) {
        showToast('error', res.error as string)
      } else {
        setIsWishlisted(true)
        showToast('success', 'Added to your wishlist')
      }
    } catch {
      showToast('error', 'Failed to update wishlist')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container-max py-4">
        <Breadcrumbs
          items={[
            { label: 'Products', href: '/products' },
            { label: product.brand.name, href: `/products?brand=${product.brand.slug}` },
            { label: product.name },
          ]}
        />
      </div>

      <div className="container-max py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          <ProductImageGallery images={product.images} productName={product.name} />

          <div className="space-y-8">
            <ProductInfo
              product={product}
              price={price}
              originalPrice={originalPrice}
              availableStock={selectedVariant?.availableStock ?? 0}
            />

            <ProductOptions
              variants={product.variants}
              selectedColor={selectedColor}
              selectedSize={selectedSize}
              quantity={quantity}
              onColorChange={setSelectedColor}
              onSizeChange={setSelectedSize}
              onQuantityChange={setQuantity}
            />

            <ProductActions
              hasStock={product.variants.some(v => v.availableStock > 0)}
              isAdding={isAdding}
              addedToCart={addedToCart}
              isWishlisted={isWishlisted}
              onAddToCart={handleAddToCart}
              onToggleWishlist={handleToggleWishlist}
            />

            <ProductShippingInfo />

            <div className="space-y-6 border-t pt-6">
              <div>
                <h3 className="font-semibold mb-3 text-lg">Description</h3>
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-3 text-lg">Product Details</h3>
                <p className="text-muted-foreground leading-relaxed">{product.shortDescription}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">SKU:</span>
                  <span className="font-medium ml-2">{selectedVariant?.sku || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Brand:</span>
                  <span className="font-medium ml-2">{product.brand.name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-medium ml-2">{product.category?.name || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Gender:</span>
                  <span className="font-medium ml-2">{product.gender}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-max py-12 border-t border-border">
        <h2 className="text-3xl font-serif font-bold mb-8">Customer Reviews</h2>
        <ProductReviews productId={product.id} reviews={product.reviews || []} />
      </div>
    </div>
  )
}