'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/providers/CartProvider'
import { useToast } from '@/providers/ToastProvider'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { Product, ProductVariant } from '@/types'
import {
  ProductImageGallery,
  ProductInfo,
  ProductOptions,
  ProductActions,
  ProductShippingInfo,
  ProductReviews,
} from './sections'

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
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    const colors = [...new Set(product.variants.map(v => v.colour))]
    if (colors.length > 0) setSelectedColor(colors[0])
    const sizes = [...new Set(
      product.variants
        .filter(v => v.colour === colors[0] && v.availableStock > 0)
        .map(v => v.size)
    )].sort()
    if (sizes.length > 0) setSelectedSize(sizes[0])
  }, [product.variants])

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
    } catch {
      showToast('error', 'Failed to add to cart')
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="min-h-screen">
      <div className="container-max py-4">
        <Breadcrumbs
          items={[
            { label: 'Products', href: '/products' },
            { label: product.brand.name, href: `/products?brand=${product.brand.id}` },
            { label: product.name },
          ]}
        />
      </div>

      <div className="container-max py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <ProductImageGallery images={product.images} productName={product.name} />

          <div>
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
              onToggleWishlist={() => setIsWishlisted(!isWishlisted)}
            />

            <ProductShippingInfo />

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

      <ProductReviews reviews={product.reviews} />
    </div>
  )
}