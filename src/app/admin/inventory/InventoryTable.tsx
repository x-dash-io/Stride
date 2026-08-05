'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import { useToast } from '@/providers/ToastProvider'

interface InventoryRow {
  id: string
  sku: string
  size: string
  colour: string
  productId: string
  productName: string
  productSlug: string
  warehouse: string
  quantityOnHand: number
  quantityReserved: number
  lowStockThreshold: number
}

interface InventoryTableProps {
  rows: InventoryRow[]
  page: number
  totalPages: number
  search: string
}

function PaginationLink({ page, search, children }: { page: number; search: string; children: React.ReactNode }) {
  const params = new URLSearchParams()
  if (search) params.set('search', search)
  params.set('page', String(page))
  return (
    <Link href={`/admin/inventory?${params.toString()}`} className="px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-muted">
      {children}
    </Link>
  )
}

export function InventoryTable({ rows, page, totalPages, search }: InventoryTableProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [adjustingId, setAdjustingId] = useState<string | null>(null)
  const [delta, setDelta] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const startAdjust = (id: string) => {
    setAdjustingId(id)
    setDelta('')
  }

  const handleAdjust = async (e: React.FormEvent, row: InventoryRow) => {
    e.preventDefault()
    const value = Number(delta)
    if (!Number.isInteger(value) || value === 0) {
      return showToast('error', 'Enter a non-zero whole number.')
    }
    setIsSubmitting(true)
    try {
      const csrfRes = await fetch('/api/csrf')
      const { csrfToken } = await csrfRes.json()
      const res = await fetch(`/api/admin/inventory/${row.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
        body: JSON.stringify({ delta: value }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to adjust stock')
      showToast('success', value > 0 ? 'Stock added' : 'Stock removed')
      setAdjustingId(null)
      router.refresh()
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to adjust stock')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (rows.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-12 text-center">
        <p className="text-muted-foreground">No inventory rows match your search.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">Product / SKU</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3">Colour</th>
                <th className="px-4 py-3">Warehouse</th>
                <th className="px-4 py-3 text-right">On Hand</th>
                <th className="px-4 py-3 text-right">Reserved</th>
                <th className="px-4 py-3 text-right">Available</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const available = row.quantityOnHand - row.quantityReserved
                const isLow = row.quantityOnHand <= row.lowStockThreshold
                return (
                  <tr key={row.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/products/${row.productId}/edit`}
                        className="font-medium hover:text-accent flex items-center gap-1"
                      >
                        {row.productName}
                        <ExternalLink className="w-3 h-3 text-muted-foreground" />
                      </Link>
                      <p className="text-xs text-muted-foreground font-mono">{row.sku}</p>
                    </td>
                    <td className="px-4 py-3">{row.size}</td>
                    <td className="px-4 py-3">{row.colour}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.warehouse}</td>
                    <td className="px-4 py-3 text-right font-semibold">
                      <span className={isLow ? 'text-destructive' : ''}>{row.quantityOnHand}</span>
                      {isLow && (
                        <span className="ml-1.5 text-[10px] uppercase tracking-wide text-destructive">low</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{row.quantityReserved}</td>
                    <td className="px-4 py-3 text-right">{available}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        {adjustingId === row.id ? (
                          <form onSubmit={(e) => handleAdjust(e, row)} className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={delta}
                              onChange={(e) => setDelta(e.target.value)}
                              className="w-24 h-9"
                              placeholder="+/-"
                              autoFocus
                            />
                            <Button type="submit" size="sm" disabled={isSubmitting}>
                              Save
                            </Button>
                            <Button type="button" size="sm" variant="ghost" onClick={() => setAdjustingId(null)}>
                              Cancel
                            </Button>
                          </form>
                        ) : (
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => startAdjust(row.id)} aria-label={`Adjust stock for ${row.sku}`}>
                              Adjust
                            </Button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <PaginationLink page={Math.max(1, page - 1)} search={search}>
            <ChevronLeft className="w-4 h-4" />
          </PaginationLink>
          <span className="text-sm text-muted-foreground px-2">
            Page {page} of {totalPages}
          </span>
          <PaginationLink page={Math.min(totalPages, page + 1)} search={search}>
            <ChevronRight className="w-4 h-4" />
          </PaginationLink>
        </div>
      )}
    </div>
  )
}
