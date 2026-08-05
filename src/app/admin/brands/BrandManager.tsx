'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Plus, Trash2, Pencil, X, Tag } from 'lucide-react'
import { useToast } from '@/providers/ToastProvider'
import { EmptyState } from '@/components/ui/empty-state'

interface BrandRow {
  id: string
  name: string
  slug: string
  description: string | null
  logoUrl: string | null
  coverImageUrl: string | null
  websiteUrl: string | null
  originCountry: string | null
  isFeatured: boolean
  isActive: boolean
  sortOrder: number
  productCount: number
}

interface BrandManagerProps {
  initialBrands: BrandRow[]
}

const emptyForm = {
  name: '',
  slug: '',
  description: '',
  logoUrl: '',
  coverImageUrl: '',
  websiteUrl: '',
  originCountry: '',
  isFeatured: false,
  isActive: true,
  sortOrder: 0,
}

export function BrandManager({ initialBrands }: BrandManagerProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [brands, setBrands] = useState<BrandRow[]>(initialBrands)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const set = (key: keyof typeof emptyForm, value: string | boolean | number) =>
    setForm((f) => ({ ...f, [key]: value }))

  const startAdd = () => {
    setForm(emptyForm)
    setEditingId(null)
    setIsAdding(true)
  }

  const startEdit = (brand: BrandRow) => {
    setForm({
      name: brand.name,
      slug: brand.slug,
      description: brand.description ?? '',
      logoUrl: brand.logoUrl ?? '',
      coverImageUrl: brand.coverImageUrl ?? '',
      websiteUrl: brand.websiteUrl ?? '',
      originCountry: brand.originCountry ?? '',
      isFeatured: brand.isFeatured,
      isActive: brand.isActive,
      sortOrder: brand.sortOrder,
    })
    setEditingId(brand.id)
    setIsAdding(true)
  }

  const cancel = () => {
    setIsAdding(false)
    setEditingId(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.slug) {
      return showToast('error', 'Name and slug are required.')
    }
    setIsSubmitting(true)
    try {
      const csrfRes = await fetch('/api/csrf')
      const { csrfToken } = await csrfRes.json()
      const url = editingId ? `/api/admin/brands/${editingId}` : '/api/admin/brands'
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save brand')
      showToast('success', editingId ? 'Brand updated' : 'Brand created')
      cancel()
      router.refresh()
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to save brand')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (brand: BrandRow) => {
    if (!window.confirm(`Delete brand "${brand.name}"? Products referencing it must be moved first.`)) return
    try {
      const csrfRes = await fetch('/api/csrf')
      const { csrfToken } = await csrfRes.json()
      const res = await fetch(`/api/admin/brands/${brand.id}`, {
        method: 'DELETE',
        headers: { 'x-csrf-token': csrfToken },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to delete brand')
      setBrands((prev) => prev.filter((b) => b.id !== brand.id))
      showToast('success', 'Brand deleted')
      router.refresh()
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to delete brand')
    }
  }

  return (
    <div className="space-y-6">
      {!isAdding && (
        <Button onClick={startAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Brand
        </Button>
      )}

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{editingId ? 'Edit Brand' : 'New Brand'}</h2>
            <Button type="button" variant="ghost" size="icon" onClick={cancel} aria-label="Cancel">
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="brand-name">Name *</Label>
              <Input id="brand-name" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Nike" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand-slug">Slug *</Label>
              <Input id="brand-slug" value={form.slug} onChange={(e) => set('slug', e.target.value)} placeholder="nike" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand-origin">Origin Country</Label>
              <Input id="brand-origin" value={form.originCountry} onChange={(e) => set('originCountry', e.target.value)} placeholder="e.g. Kenya" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand-website">Website URL</Label>
              <Input id="brand-website" value={form.websiteUrl} onChange={(e) => set('websiteUrl', e.target.value)} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand-logo">Logo URL</Label>
              <Input id="brand-logo" value={form.logoUrl} onChange={(e) => set('logoUrl', e.target.value)} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand-cover">Cover Image URL</Label>
              <Input id="brand-cover" value={form.coverImageUrl} onChange={(e) => set('coverImageUrl', e.target.value)} placeholder="https://..." />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="brand-description">Description</Label>
              <Textarea id="brand-description" value={form.description} onChange={(e) => set('description', e.target.value)} rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand-sort">Sort Order</Label>
              <Input id="brand-sort" type="number" value={form.sortOrder} onChange={(e) => set('sortOrder', Number(e.target.value) || 0)} />
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <Switch id="brand-active" checked={form.isActive} onCheckedChange={(v) => set('isActive', v)} />
              <Label htmlFor="brand-active">Active</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="brand-featured" checked={form.isFeatured} onCheckedChange={(v) => set('isFeatured', v)} />
              <Label htmlFor="brand-featured">Featured</Label>
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editingId ? 'Save Changes' : 'Create Brand'}
            </Button>
            <Button type="button" variant="outline" onClick={cancel}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {brands.length === 0 ? (
        <EmptyState
          title="No brands yet"
          description="Add your first brand to start merchandising products."
          variant="card"
          className="py-12"
        />
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">Brand</th>
                  <th className="px-4 py-3">Origin</th>
                  <th className="px-4 py-3">Products</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {brands.map((brand) => (
                  <tr key={brand.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {brand.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={brand.logoUrl} alt="" className="w-8 h-8 object-contain rounded" />
                        ) : (
                          <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                            <Tag className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{brand.name}</p>
                          <p className="text-xs text-muted-foreground">/{brand.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{brand.originCountry || '—'}</td>
                    <td className="px-4 py-3">{brand.productCount}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${brand.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {brand.isActive ? 'Active' : 'Inactive'}
                        {brand.isFeatured && ' • Featured'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => startEdit(brand)} aria-label={`Edit ${brand.name}`}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(brand)} aria-label={`Delete ${brand.name}`}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
