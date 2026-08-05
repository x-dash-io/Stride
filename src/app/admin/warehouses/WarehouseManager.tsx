'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Plus, Trash2, Pencil, X, Search, Warehouse, ChevronLeft, ChevronRight } from 'lucide-react'
import { useToast } from '@/providers/ToastProvider'

interface WarehouseRow {
  id: string
  name: string
  code: string
  city: string
  country: string
  isActive: boolean
}

interface WarehouseManagerProps {
  rows: WarehouseRow[]
  page: number
  totalPages: number
  search: string
}

function PaginationLink({ page, search, children }: { page: number; search: string; children: React.ReactNode }) {
  const params = new URLSearchParams()
  if (search) params.set('search', search)
  params.set('page', String(page))
  return (
    <Link href={`/admin/warehouses?${params.toString()}`} className="px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-muted">
      {children}
    </Link>
  )
}

export function WarehouseManager({ rows, page, totalPages, search }: WarehouseManagerProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<WarehouseRow>>({
    name: '',
    code: '',
    city: '',
    country: 'Kenya',
    isActive: true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resetForm = () => {
    setForm({
      name: '',
      code: '',
      city: '',
      country: 'Kenya',
      isActive: true,
    })
  }

  const startEdit = (row: WarehouseRow) => {
    setEditingId(row.id)
    setForm({
      name: row.name,
      code: row.code,
      city: row.city,
      country: row.country,
      isActive: row.isActive,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.code) {
      return showToast('error', 'Name and code are required')
    }
    setIsSubmitting(true)
    try {
      const csrfRes = await fetch('/api/csrf')
      const { csrfToken } = await csrfRes.json()

      const payload = { ...form }
      const url = editingId ? `/api/admin/warehouses/${editingId}` : '/api/admin/warehouses'
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save warehouse')
      showToast('success', editingId ? 'Warehouse updated' : 'Warehouse created')
      setEditingId(null)
      resetForm()
      router.refresh()
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to save warehouse')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this warehouse? This cannot be undone.')) return
    setIsSubmitting(true)
    try {
      const csrfRes = await fetch('/api/csrf')
      const { csrfToken } = await csrfRes.json()
      const res = await fetch(`/api/admin/warehouses/${id}`, {
        method: 'DELETE',
        headers: { 'x-csrf-token': csrfToken },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to delete warehouse')
      showToast('success', 'Warehouse deleted')
      router.refresh()
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to delete warehouse')
    } finally {
      setIsSubmitting(false)
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    resetForm()
  }

  if (rows.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-12 text-center">
        <Warehouse className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No warehouses found.</p>
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
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3 text-center">Active</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium">{row.name}</td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">{row.code}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {row.city && row.country ? `${row.city}, ${row.country}` : row.city || row.country || '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={row.isActive ? 'text-emerald-600' : 'text-muted-foreground'}>
                      {row.isActive ? '✓' : '✗'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {editingId === row.id ? (
                        <form onSubmit={handleSubmit} className="flex items-center gap-2">
                          <Input
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-40"
                            placeholder="Name"
                          />
                          <Input
                            value={form.code}
                            onChange={(e) => setForm({ ...form, code: e.target.value })}
                            className="w-32"
                            placeholder="Code"
                          />
                          <Button type="submit" size="sm" disabled={isSubmitting}>
                            Save
                          </Button>
                          <Button type="button" size="sm" variant="ghost" onClick={cancelEdit}>
                            Cancel
                          </Button>
                        </form>
                      ) : (
                        <Button variant="ghost" size="sm" onClick={() => startEdit(row)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                      )}
                      {editingId !== row.id && (
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(row.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingId === null && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-4">Add Warehouse</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Main Warehouse" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Code *</Label>
                <Input id="code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="MAIN" required />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" value={form.city || ''} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Nairobi" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="Kenya" />
              </div>
              <div className="flex items-center gap-2">
                <Switch id="isActive" checked={form.isActive} onCheckedChange={(checked) => setForm({ ...form, isActive: checked })} />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
              {isSubmitting ? 'Saving...' : 'Create Warehouse'}
            </Button>
          </form>
        </div>
      )}

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