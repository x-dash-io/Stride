'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search as SearchIcon, X, Loader2, Command } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { searchProducts } from '@/app/actions/search'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useDebounce } from '@/hooks/useDebounce'
import { formatPrice } from '@/lib/utils'
import { HeaderSearchSkeleton } from '@/components/skeleton-loader'
import { cn } from '@/lib/utils'

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
  const [debouncedQuery] = useDebounce(query, 200)
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

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      setIsOpen(true)
      setTimeout(() => inputRef.current?.focus(), 0)
    }
    if (e.key === 'Escape') {
      setIsOpen(false)
      inputRef.current?.blur()
    }
  }, [])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [isOpen])

  const handleFocus = () => setIsOpen(true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      setIsOpen(false)
      router.push(`/search?q=${encodeURIComponent(query)}`)
    }
  }

  const handleClear = () => {
    setQuery('')
    inputRef.current?.focus()
  }

  const handleResultClick = () => {
    setIsOpen(false)
    setQuery('')
  }

  return (
    <div className="relative w-full max-w-[280px]" ref={containerRef} suppressHydrationWarning>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center gap-0">
          <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none shrink-0 z-10" aria-hidden="true" />

          <Input
            ref={inputRef}
            type="search"
            placeholder="Search products…"
            className="w-full h-9 pl-8 pr-7 bg-muted/50 border-border/50 text-sm placeholder:text-muted-foreground/60 hover:bg-muted focus:bg-background focus-visible:ring-1 focus-visible:ring-ring/30 focus-visible:border-transparent transition-all duration-200 dark:bg-muted/30 outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleFocus}
            autoComplete="off"
            spellCheck={false}
          />

          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 inline-flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          )}

          {isLoading && (
            <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground animate-spin" aria-hidden="true" />
          )}
        </div>
      </form>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in-0 slide-in-from-top-2 duration-150">
          {!query.trim() ? (
            <div className="p-2.5">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Categories</h4>
                <span className="text-[10px] text-muted-foreground/50 flex items-center gap-1">
                  <Command className="h-2.5 w-2.5" /> K
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_CATEGORIES.map((category) => (
                  <Link
                    key={category.name}
                    href={category.href}
                    onClick={handleResultClick}
                    className="inline-flex items-center px-2.5 py-1 rounded-full bg-muted text-xs font-medium text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div>
              {isLoading ? (
                <HeaderSearchSkeleton />
              ) : results.length > 0 ? (
                <div className="py-1">
                  {results.slice(0, 6).map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      onClick={handleResultClick}
                      className="flex items-center gap-2 px-3 py-1.5 hover:bg-muted/50 transition-colors border-b border-border/30 last:border-0"
                    >
                      {product.image ? (
                        <div className="w-9 h-9 bg-muted rounded-lg overflow-hidden shrink-0">
                          <img
                            src={product.image}
                            alt={product.name}
                            width={36}
                            height={36}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className="w-9 h-9 bg-muted rounded-lg shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate text-foreground">{product.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{product.brand} · {product.category}</p>
                      </div>
                      <div className="text-xs font-semibold text-foreground shrink-0">
                        {formatPrice(product.price)}
                      </div>
                    </Link>
                  ))}
                  {results.length > 6 && (
                    <button
                      onClick={handleSubmit}
                      className="w-full px-3 py-1.5 text-center text-xs text-primary font-medium hover:bg-muted/50 transition-colors border-t border-border"
                    >
                      View all {results.length} results
                    </button>
                  )}
                </div>
              ) : (
                <div className="p-3 text-center">
                  <p className="text-xs text-muted-foreground">No products found for &quot;{query}&quot;</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5">Try a different keyword or browse categories.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}