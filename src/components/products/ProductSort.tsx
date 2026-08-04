'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface ProductSortProps {
  currentSort?: string
}

export function ProductSort({ currentSort }: ProductSortProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  return (
    <select
      value={currentSort || 'newest'}
      onChange={(e) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('sort', e.target.value)
        params.delete('page')
        router.push(`/products?${params.toString()}`)
      }}
      className="px-3 py-2 border border-border rounded-lg bg-card text-foreground text-sm w-auto focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent cursor-pointer"
    >
      <option value="newest">Newest</option>
      <option value="price-asc">Price: Low to High</option>
      <option value="price-desc">Price: High to Low</option>
      <option value="popular">Most Popular</option>
      <option value="rating">Highest Rated</option>
    </select>
  )
}

