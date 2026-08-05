'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Plus, Trash2, Pencil, X, Layers, Search } from 'lucide-react'
import { useToast } from '@/providers/ToastProvider'
import { EmptyState } from '@/components/ui/empty-state'
import { format } from 'date-fns'

interface CollectionRow {
  id: string
  name: string
  slug: string
  description: string | null
  bannerUrl: string | null
  bannerMobileUrl: string | null
  isActive: boolean
  isFeatured: boolean
  startDate: Date | null
  endDate: Date | null
  sortOrder: number
  productCount: number
  productIds: string[]
}

interface ProductOption {
  id: string
  name: string
  slug: string
  imageUrl: string | null
}

interface CollectionManagerProps {
  initialCollections: CollectionRow[]
  products: ProductOption[]
}

const emptyForm = {
  name: '',
  slug: '',
  description: '',
  bannerUrl: '',
  bannerMobileUrl: '',
  isActive: true,
  isFeatured: false,
  startDate: '',
  endDate: '',
  sortOrder: 0,
  productIds: [] as string[],
}

function toLocalInput(value: Date | null): string {
  if (!value) return ''
  const d = new Date(value)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function toIso(value: string): string | null {
  return value ? new Date(value).toISOString() : null
}

export function CollectionManager({ initialCollections, products }: CollectionManagerProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [collections, setCollections] = useState<CollectionRow[]>(initialCollections)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [productSearch, setProductSearch] = useState('')

  const set = (key: keyof typeof emptyForm, value: string | boolean | number | string[]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const toggleProduct = (productId: string) => {
    const ids = form.productIds.includes(productId)
      ? form.productIds.filter((id) => id !== productId)
      : [...form.productIds, productId]
    set('productIds', ids)
  }

  const startAdd = () => {
    setForm(emptyForm)
    setEditingId(null)
    setProductSearch('')
    setIsAdding(true)
  }

  const startEdit = (collection: CollectionRow) => {
    setForm({
      name: collection.name,
      slug: collection.slug,
      description: collection.description ?? '',
      bannerUrl: collection.bannerUrl ?? '',
      bannerMobileUrl: collection.bannerMobileUrl ?? '',
      isActive: collection.isActive,
      isFeatured: collection.isFeatured,
      startDate: toLocalInput(collection.startDate),
      endDate: toLocalInput(collection.endDate),
      sortOrder: collection.sortOrder,
      productIds: collection.productIds,
    })
    setEditingId(collection.id)
    setProductSearch('')
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
      const payload = {
        name: form.name,
        slug: form.slug,
        description: form.description || null,
        bannerUrl: form.bannerUrl || null,
        bannerMobileUrl: form.bannerMobileUrl || null,
        isActive: form.isActive,
        isFeatured: form.isFeatured,
        startDate: toIso(form.startDate),
        endDate: toIso(form.endDate),
        sortOrder: Number(form.sortOrder) || 0,
        productIds: form.productIds,
      }
      const csrfRes = await fetch('/api/csrf')
      const { csrfToken } = await csrfRes.json()
      const url = editingId ? `/api/admin/collections/${editingId}` : '/api/admin/collections'
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save collection')
      showToast('success', editingId ? 'Collection updated' : 'Collection created')
      cancel()
      router.refresh()
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to save collection')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (collection: CollectionRow) => {
    if (!window.confirm(`Delete collection "${collection.name}"?`)) return
    try {
      const csrfRes = await fetch('/api/csrf')
      const { csrfToken } = await csrfRes.json()
      const res = await fetch(`/api/admin/collections/${collection.id}`, {
        method: 'DELETE',
        headers: { 'x-csrf-token': csrfToken },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to delete collection')
      setCollections((prev) => prev.filter((c) => c.id !== collection.id))
      showToast('success', 'Collection deleted')
      router.refresh()
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to delete collection')
    }
  }

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  )

  const isScheduled = (c: CollectionRow) => {
    const now = new Date()
    if (c.startDate && new Date(c.startDate) > now) return 'Scheduled'
    if (c.endDate && new Date(c.endDate) < now) return 'Expired'
    return 'Live'
  }

  return (
    <div className="space-y-6">
      {!isAdding && (
        <Button onClick={startAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Collection
        </Button>
      )}

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{editingId ? 'Edit Collection' : 'New Collection'}</h2>
            <Button type="button" variant="ghost" size="icon" onClick={cancel} aria-label="Cancel">
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="collection-name">Name *</Label>
              <Input id="collection-name" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Festive Season Edit" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="collection-slug">Slug *</Label>
              <Input id="collection-slug" value={form.slug} onChange={(e) => set('slug', e.target.value)} placeholder="festive-season-edit" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="collection-description">Description</Label>
              <Textarea id="collection-description" value={form.description} onChange={(e) => set('description', e.target.value)} rows={2} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="collection-banner">Banner URL</Label>
              <Input id="collection-banner" value={form.bannerUrl} onChange={(e) => set('bannerUrl', e.target.value)} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="collection-sort">Sort Order</Label>
              <Input id="collection-sort" type="number" value={form.sortOrder} onChange={(e) => set('sortOrder', Number(e.target.value) || 0)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="collection-starts">Start Date</Label>
              <Input id="collection-starts" type="datetime-local" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="collection-ends">End Date</Label>
              <Input id="collection-ends" type="datetime-local" value={form.endDate} onChange={(e) => set('endDate', e.target.value)} />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch id="collection-active" checked={form.isActive} onCheckedChange={(v) => set('isActive', v)} />
              <Label htmlFor="collection-active">Active</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="collection-featured" checked={form.isFeatured} onCheckedChange={(v) => set('isFeatured', v)} />
              <Label htmlFor="collection-featured">Featured</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Products ({form.productIds.length} selected)</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search products to add..."
                className="pl-9"
              />
            </div>
            <div className="border border-border rounded-lg max-h-64 overflow-y-auto divide-y divide-border">
              {filteredProducts.length === 0 && (
                <p className="p-4 text-sm text-muted-foreground">No products match your search.</p>
              )}
              {filteredProducts.map((product) => (
                <div key={product.id} className="flex items-center gap-3 p-2.5 hover:bg-muted/40">
                  <Switch
                    checked={form.productIds.includes(product.id)}
                    onCheckedChange={() => toggleProduct(product.id)}
                  />
                  {product.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.imageUrl} alt="" className="w-8 h-8 object-cover rounded" />
                  ) : (
                    <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                      <Layers className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                  <span className="text-sm font-medium truncate">{product.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editingId ? 'Save Changes' : 'Create Collection'}
            </Button>
            <Button type="button" variant="outline" onClick={cancel}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {collections.length === 0 ? (
        <EmptyState
          title="No collections yet"
          description="Group products into seasonal or promotional collections."
          variant="card"
          className="py-12"
        />
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">Collection</th>
                  <th className="px-4 py-3">Products</th>
                  <th className="px-4 py-3">Window</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {collections.map((collection) => (
                  <tr key={collection.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium">{collection.name}</p>
                      <p className="text-xs text-muted-foreground">/{collection.slug}</p>
                    </td>
                    <td className="px-4 py-3">{collection.productCount}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {collection.startDate || collection.endDate
                        ? `${collection.startDate ? format(new Date(collection.startDate), 'MMM d') : '—'} → ${collection.endDate ? format(new Date(collection.endDate), 'MMM d') : '—'}`
                        : 'No window'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          !collection.isActive
                            ? 'bg-gray-100 text-gray-600'
                            : isScheduled(collection) === 'Live'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {!collection.isActive ? 'Inactive' : isScheduled(collection)}
                        {collection.isFeatured && ' • Featured'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => startEdit(collection)} aria-label={`Edit ${collection.name}`}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(collection)} aria-label={`Delete ${collection.name}`}>
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
