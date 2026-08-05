'use client'

import { useState, useEffect, useRef } from 'react'
import { Search as SearchIcon, X, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { searchProducts } from '@/app/actions/search'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useDebounce } from '@/hooks/useDebounce'
import { formatPrice } from '@/lib/utils'
import { HeaderSearchSkeleton } from '@/components/skeleton-loader'
import { EmptyState } from '@/components/ui/empty-state'
interface SearchResult {
  id: string
  name: string
  slug: string
  brand: string
  category: string
  price: number
  originalPrice: number | null
  image: string | null
}

const POPULAR_CATEGORIES = [
  { name: 'Running', href: '/products?category=running' },
  { name: 'Sneakers', href: '/products?category=sneakers' },
  { name: 'Training', href: '/products?category=training' },
  { name: 'Basketball', href: '/products?category=basketball' },
]

export function HeaderSearch() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [debouncedQuery] = useDebounce(query, 300)
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    async function fetchResults() {
      if (!debouncedQuery.trim()) {
        setResults([])
        return
      }
      setIsLoading(true)
      try {
        const data = await searchProducts(debouncedQuery)
        setResults(data)
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchResults()
  }, [debouncedQuery])

  const handleOpen = () => {
    setIsOpen(true)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const handleClose = () => {
    setIsOpen(false)
    setQuery('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      handleClose()
      router.push(`/search?q=${encodeURIComponent(query)}`)
    }
  }

  return (
    <div className="relative flex-1 max-w-md w-full" ref={containerRef}>
      <form onSubmit={handleSubmit} className="relative w-full">
        <div className="relative flex items-center">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10 shrink-0" />
          <Input
            ref={inputRef}
            type="search"
            placeholder="Search products..."
            style={{ paddingLeft: '2.25rem' }}
            className="w-full pr-9 h-9 bg-muted/50 border-transparent focus-visible:bg-background transition-colors text-sm rounded-lg [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              if (!isOpen) setIsOpen(true)
            }}
            onFocus={() => setIsOpen(true)}
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                inputRef.current?.focus()
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 inline-flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted z-10"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </form>

      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-popover border border-border rounded-xl shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
          {!query.trim() ? (
            <div className="p-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Popular Categories</h4>
              <div className="flex flex-wrap gap-2">
                {POPULAR_CATEGORIES.map((category) => (
                  <Link
                    key={category.name}
                    href={category.href}
                    onClick={handleClose}
                    className="inline-flex items-center px-3 py-1.5 rounded-full bg-muted text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-h-[70vh] overflow-y-auto">
              {isLoading ? (
                <HeaderSearchSkeleton />
              ) : results.length > 0 ? (
                <div className="py-2">
                  {results.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      onClick={handleClose}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
                    >
                      {product.image ? (
                        <div className="w-12 h-12 bg-muted rounded-md overflow-hidden shrink-0">
                          <img src={product.image} alt={product.name} width={48} height={48} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-muted rounded-md shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{product.brand} &middot; {product.category}</p>
                      </div>
                      <div className="text-sm font-semibold shrink-0">
                        {formatPrice(product.price)}
                      </div>
                    </Link>
                  ))}
                  <div className="border-t border-border mt-2 p-2">
                    <button
                      onClick={handleSubmit}
                      className="w-full text-center text-sm text-primary font-medium p-2 hover:bg-muted rounded-md transition-colors"
                    >
                      View all results for &quot;{query}&quot;
                    </button>
                  </div>
                </div>
              ) : (
                <EmptyState
                  icon={SearchIcon}
                  title={`No products found for "${query}"`}
                  description="Try typing a different keyword or category name."
                  variant="minimal"
                  className="py-10"
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
