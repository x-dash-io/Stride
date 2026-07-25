'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { mockProducts } from '@/lib/data/products'
import { Star, ChevronDown } from 'lucide-react'
import { ProductGridSkeleton } from '@/components/skeleton-loader'

type SortOption = 'popular' | 'newest' | 'price-low' | 'price-high' | 'rating'

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedBrand, setSelectedBrand] = useState<string>('')
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 })
  const [sortBy, setSortBy] = useState<SortOption>('popular')
  const [showFilters, setShowFilters] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading delay for better UX feedback
    const timer = setTimeout(() => setIsLoading(false), 300)
    return () => clearTimeout(timer)
  }, [])

  // Get unique brands and categories
  const brands = [...new Set(mockProducts.map((p) => p.brand))]
  const categories = [...new Set(mockProducts.map((p) => p.category))]

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = mockProducts

    // Apply filters
    if (selectedCategory) {
      result = result.filter((p) => p.category === selectedCategory)
    }
    if (selectedBrand) {
      result = result.filter((p) => p.brand === selectedBrand)
    }
    result = result.filter(
      (p) => p.price >= priceRange.min && p.price <= priceRange.max
    )

    // Apply sorting
    const sorted = [...result]
    switch (sortBy) {
      case 'price-low':
        sorted.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price))
        break
      case 'price-high':
        sorted.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price))
        break
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating)
        break
      case 'newest':
        sorted.reverse()
        break
      default:
        // popular - by review count
        sorted.sort((a, b) => b.reviewCount - a.reviewCount)
    }

    return sorted
  }, [selectedCategory, selectedBrand, priceRange, sortBy])

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="container-max py-8 border-b border-border">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-2">
          Our Collection
        </h1>
        <p className="text-muted-foreground">
          Discover {filteredProducts.length} products from our premium selection
        </p>
      </div>

      <div className="container-max py-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div
          className={`md:col-span-1 ${
            showFilters ? 'block' : 'hidden md:block'
          }`}
        >
          <div className="sticky top-20 space-y-6">
            {/* Categories */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
                Category
              </h3>
              <div className="space-y-2">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    value=""
                    checked={selectedCategory === ''}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="ml-2 text-sm">All Categories</span>
                </label>
                {categories.map((cat) => (
                  <label key={cat} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      value={cat}
                      checked={selectedCategory === cat}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className="ml-2 text-sm capitalize">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Brand Filter */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
                Brand
              </h3>
              <div className="space-y-2">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="brand"
                    value=""
                    checked={selectedBrand === ''}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="ml-2 text-sm">All Brands</span>
                </label>
                {brands.map((brand) => (
                  <label key={brand} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="brand"
                      value={brand}
                      checked={selectedBrand === brand}
                      onChange={(e) => setSelectedBrand(e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className="ml-2 text-sm">{brand}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
                Price
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">
                    Min: ${priceRange.min}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={priceRange.min}
                    onChange={(e) =>
                      setPriceRange({ ...priceRange, min: parseInt(e.target.value) })
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">
                    Max: ${priceRange.max}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={priceRange.max}
                    onChange={(e) =>
                      setPriceRange({ ...priceRange, max: parseInt(e.target.value) })
                    }
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Reset Filters */}
            <button
              onClick={() => {
                setSelectedCategory('')
                setSelectedBrand('')
                setPriceRange({ min: 0, max: 1000 })
              }}
              className="w-full btn-secondary text-center text-sm"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="md:col-span-3">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden text-sm font-medium flex items-center gap-2"
            >
              Filters
              <ChevronDown className="w-4 h-4" />
            </button>

            <div className="ml-auto">
              <label className="text-sm font-medium mr-3">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-2 border border-border rounded bg-card text-foreground"
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Products */}
          {isLoading ? (
            <ProductGridSkeleton count={9} />
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="product-card group"
                >
                  <div className="aspect-square bg-muted flex items-center justify-center text-4xl group-hover:bg-muted/80 transition-colors">
                    👟
                  </div>
                  <div className="p-6">
                    <p className="text-xs uppercase tracking-wider text-accent mb-2">
                      {product.brand}
                    </p>
                    <h3 className="text-lg font-serif font-semibold mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(product.rating)
                                ? 'fill-accent text-accent'
                                : 'text-muted'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        ({product.reviewCount})
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      {product.salePrice ? (
                        <>
                          <span className="text-xl font-bold text-primary">
                            ${product.salePrice}
                          </span>
                          <span className="text-xs line-through text-muted-foreground">
                            ${product.price}
                          </span>
                        </>
                      ) : (
                        <span className="text-xl font-bold text-primary">
                          ${product.price}
                        </span>
                      )}
                    </div>
                    {!product.inStock && (
                      <p className="text-xs text-red-500 font-medium mt-2">
                        Out of Stock
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground mb-4">
                No products found matching your filters.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('')
                  setSelectedBrand('')
                  setPriceRange({ min: 0, max: 1000 })
                }}
                className="btn-primary"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
