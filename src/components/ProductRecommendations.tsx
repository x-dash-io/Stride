'use client'

import { useState, useEffect } from 'react'
import { Product } from '@/types'
import { ProductGrid } from '@/components/products/ProductGrid'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface ProductRecommendationsProps {
  productId: string
  categoryId?: string
  brandId?: string
  limit?: number
}

export function ProductRecommendations({ productId, categoryId, brandId, limit = 8 }: ProductRecommendationsProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function fetchRecommendations() {
      const params = new URLSearchParams()
      if (categoryId) params.set('category', categoryId)
      if (brandId) params.set('brand', brandId)
      params.set('limit', String(limit + 1)) // +1 to filter out current product

      try {
        const res = await fetch(`/api/products?${params.toString()}`)
        if (res.ok) {
          const data = await res.json()
          const filtered = data.items
            .filter((p: Product) => p.id !== productId)
            .slice(0, limit)
          if (!cancelled) setProducts(filtered)
        }
      } catch {
        // silent fail
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchRecommendations()

    return () => {
      cancelled = true
    }
  }, [productId, categoryId, brandId, limit])

  if (loading || products.length === 0) return null

  return (
    <section className="py-12">
      <div className="container-max">
        <h2 className="text-2xl font-serif font-bold mb-6">You May Also Like</h2>
        <ProductGrid products={products} />
        <div className="text-center mt-8">
          <Button variant="outline" size="lg" asChild>
            <Link href={`/products${categoryId ? `?category=${categoryId}` : ''}`}>View All</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}