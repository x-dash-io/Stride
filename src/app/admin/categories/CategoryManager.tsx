'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Plus, Trash2, Pencil, X, Search, Folder, ChevronLeft, ChevronRight } from 'lucide-react'
import { useToast } from '@/providers/ToastProvider'

interface CategoryRow {
  id: string
  name: string
  slug: string
  description: string | null
  parentId: string | null
  imageUrl: string | null
  icon: string | null
  sortOrder: number
  isActive: boolean
  productCount: number
}

interface CategoryManagerProps {
  rows: CategoryRow[]
  page: number
  totalPages: number
  search: string
}

function PaginationLink({ page, search, children }: { page: number; search: string; children: React.ReactNode }) {
  const params = new URLSearchParams()
  if (search) params.set('search', search)
  params.set('page', String(page))
  return (
    <Link href={`/admin/categories?${params.toString()}`} className="px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-muted">
      {children}
    </Link>
  )
}

export function CategoryManager({ rows, page, totalPages, search }: CategoryManagerProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<CategoryRow> & { parentId: string | null }>({
    name: '',
    slug: '',
    description: '',
    parentId: null,
    imageUrl: '',
    icon: '',
    sortOrder: 0,
    isActive: true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [allCategories, setAllCategories] = useState<CategoryRow[]>(rows)

  const resetForm = () => {
    setForm({
      name: '',
      slug: '',
      description: '',
      parentId: null,
      imageUrl: '',
      icon: '',
      sortOrder: 0,
      isActive: true,
    })
  }

  const startEdit = (row: CategoryRow) => {
    setEditingId(row.id)
    setForm({
      name: row.name,
      slug: row.slug,
      description: row.description || '',
      parentId: row.parentId,
      imageUrl: row.imageUrl || '',
      icon: row.icon || '',
      sortOrder: row.sortOrder,
      isActive: row.isActive,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.slug) {
      return showToast('error', 'Name and slug are required')
    }
    setIsSubmitting(true)
    try {
      const csrfRes = await fetch('/api/csrf')
      const { csrfToken } = await csrfRes.json()

      const payload = { ...form, parentId: form.parentId || null }
      const url = editingId ? `/api/admin/categories/${editingId}` : '/api/admin/categories'
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save category')
      showToast('success', editingId ? 'Category updated' : 'Category created')
      setEditingId(null)
      resetForm()
      router.refresh()
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to save category')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category? This cannot be undone.')) return
    setIsSubmitting(true)
    try {
      const csrfRes = await fetch('/api/csrf')
      const { csrfToken } = await csrfRes.json()
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
        headers: { 'x-csrf-token': csrfToken },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to delete category')
      showToast('success', 'Category deleted')
      router.refresh()
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to delete category')
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
        <Folder className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No categories found.</p>
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
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Parent</th>
                <th className="px-4 py-3 text-center">Products</th>
                <th className="px-4 py-3 text-center">Sort</th>
                <th className="px-4 py-3 text-center">Active</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium">{row.name}</td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">{row.slug}</td>
                  <td className="px-4 py-3">
                    {row.parentId && (
                      <span className="text-muted-foreground">
                        {allCategories.find(c => c.id === row.parentId)?.name || row.parentId}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">{row.productCount}</td>
                  <td className="px-4 py-3 text-center">{row.sortOrder}</td>
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
                            value={form.slug}
                            onChange={(e) => setForm({ ...form, slug: e.target.value })}
                            className="w-36"
                            placeholder="Slug"
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
                      {editingId !== row.id && row.productCount === 0 && (
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
          <h3 className="font-semibold mb-4">Add Category</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Running Shoes" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input id="slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="running-shoes" required />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Optional description" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="parentId">Parent Category</Label>
<select
                  id="parentId"
                  value={form.parentId || ''}
                  onChange={(e) => setForm({ ...form, parentId: e.target.value || null })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">None (top-level)</option>
                  {allCategories
                    .filter(c => c.id !== editingId)
                    .map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input id="imageUrl" value={form.imageUrl || ''} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="icon">Icon</Label>
                <Input id="icon" value={form.icon || ''} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="e.g., Running" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sortOrder">Sort Order</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                />
              </div>
              <div className="flex items-center gap-2">
                <Input
                  id="isActive"
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
              {isSubmitting ? 'Saving...' : 'Create Category'}
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