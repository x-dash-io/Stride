'use client'

import React from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl: string
  searchParams: Record<string, string | undefined>
}

export function Pagination({ currentPage, totalPages, baseUrl, searchParams }: PaginationProps) {
  if (totalPages <= 1) return null

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams as Record<string, string>)
    params.set('page', String(page))
    return `${baseUrl}?${params.toString()}`
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  const visiblePages = pages.filter(page =>
    page === 1 ||
    page === totalPages ||
    (page >= currentPage - 1 && page <= currentPage + 1)
  )

  return (
    <nav className="flex items-center justify-center gap-1 mt-8" aria-label="Pagination">
      <Button variant="secondary" asChild className={cn(currentPage === 1 && 'opacity-50 pointer-events-none')}>
        <Link href={currentPage > 1 ? createPageUrl(currentPage - 1) : '#'} aria-label="Previous page">Previous</Link>
      </Button>

      {visiblePages.map((page, index) => {
        const prevPage = visiblePages[index - 1]
        const showEllipsis = prevPage && page - prevPage > 1

        return (
          <React.Fragment key={page}>
            {showEllipsis && <span className="px-2 text-muted-foreground">...</span>}
            <Link
              href={createPageUrl(page)}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                page === currentPage
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent'
              )}
              aria-label={`Page ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </Link>
          </React.Fragment>
        )
      })}

      <Button variant="secondary" asChild className={cn(currentPage === totalPages && 'opacity-50 pointer-events-none')}>
        <Link href={currentPage < totalPages ? createPageUrl(currentPage + 1) : '#'} aria-label="Next page">Next</Link>
      </Button>
    </nav>
  )
}