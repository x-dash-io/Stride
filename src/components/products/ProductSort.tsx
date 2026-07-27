'use client'

import { useSearchParams } from 'next/navigation'

interface ProductSortProps {
  currentSort?: string
}

export function ProductSort({ currentSort }: ProductSortProps) {
  const searchParams = useSearchParams()

  return (
    <select
      defaultValue={currentSort || 'newest'}
      onChange={(e) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('sort', e.target.value)
        params.delete('page')
        window.location.href = `/products?${params.toString()}`
      }}
      className="input-base text-sm w-auto"
    >
      <option value="newest">Newest</option>
      <option value="price-asc">Price: Low to High</option>
      <option value="price-desc">Price: High to Low</option>
      <option value="popular">Most Popular</option>
      <option value="rating">Highest Rated</option>
    </select>
  )
}
