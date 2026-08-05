'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Plus, Trash2, Edit2, Check, X, MapPin } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { useToast } from '@/providers/ToastProvider'

interface ShippingZone {
  id: string
  name: string
  description: string | null
  counties: string[]
  baseCost: string | number
  isActive: boolean
  sortOrder: number
}

interface ShippingSettingsClientProps {
  initialZones: ShippingZone[]
}

export function ShippingSettingsClient({ initialZones }: ShippingSettingsClientProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [zones, setZones] = useState<ShippingZone[]>(initialZones)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [zoneDeletingId, setZoneDeletingId] = useState<string | null>(null)

  // Form states
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [baseCost, setBaseCost] = useState('')
  const [countyInput, setCountyInput] = useState('')
  const [counties, setCounties] = useState<string[]>([])
  const [isActive, setIsActive] = useState(true)

  const handleAddCounty = () => {
    if (countyInput.trim() && !counties.includes(countyInput.trim())) {
      setCounties([...counties, countyInput.trim()])
      setCountyInput('')
    }
  }

  const handleRemoveCounty = (index: number) => {
    setCounties(counties.filter((_, i) => i !== index))
  }

  const resetForm = () => {
    setName('')
    setDescription('')
    setBaseCost('')
    setCounties([])
    setCountyInput('')
    setIsActive(true)
    setIsAdding(false)
    setEditingId(null)
    setZoneDeletingId(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !baseCost) {
      return showToast('error', 'Name and base cost are required.')
    }

    const payload = {
      name,
      description: description || null,
      counties,
      baseCost: parseFloat(baseCost),
      isActive,
      sortOrder: 0,
    }

    try {
      const url = editingId ? `/api/admin/shipping-zones/${editingId}` : '/api/admin/shipping-zones'
      const method = editingId ? 'PUT' : 'POST'

      const csrfRes = await fetch('/api/csrf')
      const { csrfToken } = await csrfRes.json()

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to save zone')
      }

      const savedZone = await res.json()
      
      if (editingId) {
        setZones(zones.map(z => z.id === editingId ? savedZone : z))
        showToast('success', 'Shipping zone updated successfully!')
      } else {
        setZones([...zones, savedZone])
        showToast('success', 'Shipping zone created successfully!')
      }
      
      resetForm()
      router.refresh()
    } catch (error: any) {
      showToast('error', error.message || 'An error occurred')
    }
  }

  const handleEdit = (zone: ShippingZone) => {
    setEditingId(zone.id)
    setName(zone.name)
    setDescription(zone.description || '')
    setBaseCost(String(zone.baseCost))
    setCounties(zone.counties)
    setIsActive(zone.isActive)
    setIsAdding(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const csrfRes = await fetch('/api/csrf')
      const { csrfToken } = await csrfRes.json()

      const res = await fetch(`/api/admin/shipping-zones/${id}`, {
        method: 'DELETE',
        headers: {
          'x-csrf-token': csrfToken,
        },
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to delete zone')
      }

      setZones(zones.filter(z => z.id !== id))
      showToast('success', 'Shipping zone deleted successfully!')
      setZoneDeletingId(null)
      router.refresh()
    } catch (error: any) {
      showToast('error', error.message || 'Failed to delete shipping zone')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-serif">Shipping Zones</h1>
          <p className="text-sm text-muted-foreground">Manage regions and pricing for shipping & delivery</p>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add Shipping Zone
          </Button>
        )}
      </div>

      {isAdding && (
        <Card className="border border-border bg-white dark:bg-zinc-900 shadow-sm">
          <CardHeader>
            <CardTitle className="font-serif">{editingId ? 'Edit Shipping Zone' : 'Add New Shipping Zone'}</CardTitle>
            <CardDescription>Configure delivery price and boundaries</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Zone Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Nairobi CBD, Upcountry"
                    className="bg-white dark:bg-zinc-950"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cost">Base Cost (KES) *</Label>
                  <Input
                    id="cost"
                    type="number"
                    value={baseCost}
                    onChange={(e) => setBaseCost(e.target.value)}
                    placeholder="e.g. 200"
                    className="bg-white dark:bg-zinc-950"
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Nairobi Central Business District delivery"
                    className="bg-white dark:bg-zinc-950"
                  />
                </div>
                
                {/* Counties list configuration */}
                <div className="space-y-2 md:col-span-2 border-t border-slate-100 dark:border-zinc-800 pt-4">
                  <Label>Associated Counties (Optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      value={countyInput}
                      onChange={(e) => setCountyInput(e.target.value)}
                      placeholder="e.g. Nairobi, Kiambu"
                      className="bg-white dark:bg-zinc-950"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddCounty()
                        }
                      }}
                    />
                    <Button type="button" variant="outline" onClick={handleAddCounty}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {counties.map((c, i) => (
                      <span
                        key={c}
                        className="inline-flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full text-xs font-medium border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200"
                      >
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                        {c}
                        <button
                          type="button"
                          onClick={() => handleRemoveCounty(i)}
                          className="hover:text-destructive transition-colors ml-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 md:col-span-2">
                  <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
                  <Label htmlFor="isActive">Active (available at checkout)</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-zinc-800 pt-4">
                <Button type="button" variant="ghost" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingId ? 'Update Zone' : 'Create Zone'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-zinc-800/40 border-b border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400">
              <th className="p-4 font-semibold text-xs uppercase tracking-wider">Name</th>
              <th className="p-4 font-semibold text-xs uppercase tracking-wider">Description</th>
              <th className="p-4 font-semibold text-xs uppercase tracking-wider">Counties</th>
              <th className="p-4 font-semibold text-xs uppercase tracking-wider">Cost</th>
              <th className="p-4 font-semibold text-xs uppercase tracking-wider">Status</th>
              <th className="p-4 font-semibold text-xs uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
            {zones.length > 0 ? (
              zones.map((zone) => (
                <tr key={zone.id} className="hover:bg-slate-50/30 dark:hover:bg-zinc-800/10 transition-colors">
                  <td className="p-4 font-medium text-slate-800 dark:text-zinc-200">{zone.name}</td>
                  <td className="p-4 text-sm text-muted-foreground">{zone.description || '—'}</td>
                  <td className="p-4 text-sm text-slate-600 dark:text-zinc-300">
                    {zone.counties.length > 0 ? zone.counties.join(', ') : 'All Counties'}
                  </td>
                  <td className="p-4 font-bold text-sm text-slate-900 dark:text-white">{formatPrice(Number(zone.baseCost))}</td>
                  <td className="p-4">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                        zone.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {zone.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {zoneDeletingId === zone.id ? (
                      <div className="inline-flex items-center gap-1.5 animate-fade-in">
                        <span className="text-[11px] text-muted-foreground font-semibold">Delete?</span>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(zone.id)} className="h-7 px-2.5 text-xs font-bold">
                          Yes
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setZoneDeletingId(null)} className="h-7 px-2.5 text-xs">
                          No
                        </Button>
                      </div>
                    ) : (
                      <div className="inline-flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(zone)} className="h-8 w-8">
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setZoneDeletingId(zone.id)} className="h-8 w-8 text-destructive hover:bg-destructive/10">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  No shipping zones configured yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
