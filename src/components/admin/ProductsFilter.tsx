'use client'

import { Search, Package } from 'lucide-react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'

interface ProductsFilterProps {
  search: string
  status: string
  total: number
}

export function ProductsFilter({ search, status, total }: ProductsFilterProps) {
  const statusFilters = ['ALL', 'ACTIVE', 'DRAFT', 'INACTIVE', 'DISCONTINUED'] as const

  const handleStatusChange = (value: string) => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    params.set('status', value)
    params.set('page', '1')
    window.location.href = `/admin/products?${params.toString()}`
  }

  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2">
          <Package className="w-4 h-4" /> Back to Dashboard
        </Link>
        <h1 className="text-4xl font-serif font-bold">Products</h1>
        <p className="text-muted-foreground mt-1">{total} product{total !== 1 ? 's' : ''}</p>
      </div>

      <Button asChild>
        <Link href="/admin/products/new">
          <Search className="w-4 h-4 mr-2" /> Add Product
        </Link>
      </Button>
    </div>
  )
}

export function ProductsSearchFilter({ search, status }: { search: string; status: string }) {
  const statusFilters = ['ALL', 'ACTIVE', 'DRAFT', 'INACTIVE', 'DISCONTINUED'] as const

  const handleStatusChange = (value: string) => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    params.set('status', value)
    params.set('page', '1')
    window.location.href = `/admin/products?${params.toString()}`
  }

  return (
    <div className="flex gap-4 mb-6">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          className="pl-10"
          defaultValue={search}
        />
      </div>
      <Select defaultValue={status} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          {statusFilters.map((s) => (
            <SelectItem key={s} value={s}>{s}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}