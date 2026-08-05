'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Plus, Trash2, Pencil, X, Image as ImageIcon } from 'lucide-react'
import { useToast } from '@/providers/ToastProvider'
import { EmptyState } from '@/components/ui/empty-state'
import { format } from 'date-fns'

interface BannerRow {
  id: string
  title: string | null
  subtitle: string | null
  ctaText: string | null
  ctaUrl: string | null
  desktopImageUrl: string
  mobileImageUrl: string | null
  bgColor: string | null
  textColor: string | null
  placement: string
  isActive: boolean
  sortOrder: number
  startsAt: Date | null
  endsAt: Date | null
}

interface BannerManagerProps {
  initialBanners: BannerRow[]
}

const emptyForm = {
  title: '',
  subtitle: '',
  ctaText: '',
  ctaUrl: '',
  desktopImageUrl: '',
  mobileImageUrl: '',
  bgColor: '',
  textColor: '',
  placement: 'hero',
  isActive: true,
  sortOrder: 0,
  startsAt: '',
  endsAt: '',
}

function toLocalInput(value: Date | null): string {
  if (!value) return ''
  const d = new Date(value)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function toIso(value: string): string | undefined {
  return value ? new Date(value).toISOString() : undefined
}

export function BannerManager({ initialBanners }: BannerManagerProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [banners, setBanners] = useState<BannerRow[]>(initialBanners)
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

  const startEdit = (banner: BannerRow) => {
    setForm({
      title: banner.title ?? '',
      subtitle: banner.subtitle ?? '',
      ctaText: banner.ctaText ?? '',
      ctaUrl: banner.ctaUrl ?? '',
      desktopImageUrl: banner.desktopImageUrl,
      mobileImageUrl: banner.mobileImageUrl ?? '',
      bgColor: banner.bgColor ?? '',
      textColor: banner.textColor ?? '',
      placement: banner.placement,
      isActive: banner.isActive,
      sortOrder: banner.sortOrder,
      startsAt: toLocalInput(banner.startsAt),
      endsAt: toLocalInput(banner.endsAt),
    })
    setEditingId(banner.id)
    setIsAdding(true)
  }

  const cancel = () => {
    setIsAdding(false)
    setEditingId(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.desktopImageUrl) {
      return showToast('error', 'Desktop image URL is required.')
    }
    setIsSubmitting(true)
    try {
      const payload = {
        title: form.title || null,
        subtitle: form.subtitle || null,
        ctaText: form.ctaText || null,
        ctaUrl: form.ctaUrl || null,
        desktopImageUrl: form.desktopImageUrl,
        mobileImageUrl: form.mobileImageUrl || null,
        bgColor: form.bgColor || null,
        textColor: form.textColor || null,
        placement: form.placement,
        isActive: form.isActive,
        sortOrder: Number(form.sortOrder) || 0,
        startsAt: toIso(form.startsAt) || null,
        endsAt: toIso(form.endsAt) || null,
      }
      const csrfRes = await fetch('/api/csrf')
      const { csrfToken } = await csrfRes.json()
      const url = editingId ? `/api/admin/banners/${editingId}` : '/api/admin/banners'
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save banner')
      showToast('success', editingId ? 'Banner updated' : 'Banner created')
      cancel()
      router.refresh()
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to save banner')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (banner: BannerRow) => {
    if (!window.confirm('Delete this banner?')) return
    try {
      const csrfRes = await fetch('/api/csrf')
      const { csrfToken } = await csrfRes.json()
      const res = await fetch(`/api/admin/banners/${banner.id}`, {
        method: 'DELETE',
        headers: { 'x-csrf-token': csrfToken },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to delete banner')
      setBanners((prev) => prev.filter((b) => b.id !== banner.id))
      showToast('success', 'Banner deleted')
      router.refresh()
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to delete banner')
    }
  }

  const now = new Date()
  const isLive = (banner: BannerRow) =>
    banner.isActive &&
    (!banner.startsAt || new Date(banner.startsAt) <= now) &&
    (!banner.endsAt || new Date(banner.endsAt) >= now)

  return (
    <div className="space-y-6">
      {!isAdding && (
        <Button onClick={startAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Banner
        </Button>
      )}

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{editingId ? 'Edit Banner' : 'New Banner'}</h2>
            <Button type="button" variant="ghost" size="icon" onClick={cancel} aria-label="Cancel">
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="banner-title">Title</Label>
              <Input id="banner-title" value={form.title} onChange={(e) => set('title', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="banner-subtitle">Subtitle</Label>
              <Input id="banner-subtitle" value={form.subtitle} onChange={(e) => set('subtitle', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="banner-placement">Placement</Label>
              <Input id="banner-placement" value={form.placement} onChange={(e) => set('placement', e.target.value)} placeholder="hero" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="banner-sort">Sort Order</Label>
              <Input id="banner-sort" type="number" value={form.sortOrder} onChange={(e) => set('sortOrder', Number(e.target.value) || 0)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="banner-desktop">Desktop Image URL *</Label>
              <Input id="banner-desktop" value={form.desktopImageUrl} onChange={(e) => set('desktopImageUrl', e.target.value)} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="banner-mobile">Mobile Image URL</Label>
              <Input id="banner-mobile" value={form.mobileImageUrl} onChange={(e) => set('mobileImageUrl', e.target.value)} placeholder="https://..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="banner-cta">CTA Text</Label>
                <Input id="banner-cta" value={form.ctaText} onChange={(e) => set('ctaText', e.target.value)} placeholder="Shop Now" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="banner-cta-url">CTA URL</Label>
                <Input id="banner-cta-url" value={form.ctaUrl} onChange={(e) => set('ctaUrl', e.target.value)} placeholder="/products" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="banner-bg">Background Color</Label>
                <Input id="banner-bg" value={form.bgColor} onChange={(e) => set('bgColor', e.target.value)} placeholder="#0f172a" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="banner-text">Text Color</Label>
                <Input id="banner-text" value={form.textColor} onChange={(e) => set('textColor', e.target.value)} placeholder="#ffffff" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="banner-starts">Starts At</Label>
              <Input id="banner-starts" type="datetime-local" value={form.startsAt} onChange={(e) => set('startsAt', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="banner-ends">Ends At</Label>
              <Input id="banner-ends" type="datetime-local" value={form.endsAt} onChange={(e) => set('endsAt', e.target.value)} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch id="banner-active" checked={form.isActive} onCheckedChange={(v) => set('isActive', v)} />
            <Label htmlFor="banner-active">Active</Label>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editingId ? 'Save Changes' : 'Create Banner'}
            </Button>
            <Button type="button" variant="outline" onClick={cancel}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {banners.length === 0 ? (
        <EmptyState
          title="No banners yet"
          description="Create a banner to promote campaigns on the storefront."
          variant="card"
          className="py-12"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {banners.map((banner) => (
            <div key={banner.id} className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="relative h-32 bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={banner.desktopImageUrl} alt="" className="w-full h-full object-cover" />
                <span
                  className={`absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full font-medium ${
                    isLive(banner) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {isLive(banner) ? 'Live' : 'Inactive'}
                </span>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <ImageIcon className="w-4 h-4 text-muted-foreground" />
                  <p className="font-semibold truncate">{banner.title || 'Untitled banner'}</p>
                </div>
                <p className="text-xs text-muted-foreground mb-1">{banner.placement}</p>
                {banner.subtitle && <p className="text-sm text-muted-foreground line-clamp-2 mb-1">{banner.subtitle}</p>}
                <p className="text-xs text-muted-foreground mb-3">
                  {banner.startsAt || banner.endsAt
                    ? `${banner.startsAt ? format(new Date(banner.startsAt), 'MMM d') : 'now'} – ${banner.endsAt ? format(new Date(banner.endsAt), 'MMM d') : 'open-ended'}`
                    : 'No schedule'}
                </p>
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => startEdit(banner)} aria-label="Edit banner">
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(banner)} aria-label="Delete banner">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
