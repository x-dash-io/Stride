'use client'

import { useState, useEffect, useRef } from 'react'
import { Calendar, X, Filter, ChevronDown, Save, Download } from 'lucide-react'
import { format, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns'
import { Button } from '@/components/ui/button'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  SelectGroup,
  SelectLabel
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface DateRange {
  from: Date | undefined
  to: Date | undefined
}

interface DashboardFiltersProps {
  defaultRange?: DateRange
  onRangeChange?: (range: DateRange) => void
  onFilterChange?: (filters: Record<string, string[]>) => void
  statusOptions?: string[]
  paymentStatusOptions?: string[]
  showPresets?: boolean
  onPresetSave?: (name: string, range: DateRange, filters: Record<string, string[]>) => void
  presets?: Array<{ id: string; name: string; range: DateRange; filters: Record<string, string[]> }>
}

const PRESET_RANGES = [
  { label: 'Today', from: startOfDay(new Date()), to: endOfDay(new Date()) },
  { label: 'Yesterday', from: startOfDay(subDays(new Date(), 1)), to: endOfDay(subDays(new Date(), 1)) },
  { label: 'Last 7 days', from: startOfDay(subDays(new Date(), 7)), to: endOfDay(new Date()) },
  { label: 'Last 30 days', from: startOfDay(subDays(new Date(), 30)), to: endOfDay(new Date()) },
  { label: 'This month', from: startOfMonth(new Date()), to: endOfMonth(new Date()) },
  { label: 'Last month', from: startOfMonth(subDays(new Date(), 30)), to: endOfMonth(subDays(new Date(), 30)) },
  { label: 'This week', from: startOfWeek(new Date()), to: endOfWeek(new Date()) },
  { label: 'Last week', from: startOfWeek(subDays(new Date(), 7)), to: endOfWeek(subDays(new Date(), 7)) },
]

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function endOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)
}

export function DashboardFilters({
  defaultRange,
  onRangeChange,
  onFilterChange,
  statusOptions = [],
  paymentStatusOptions = [],
  showPresets = true,
  onPresetSave,
  presets = []
}: DashboardFiltersProps) {
  const [range, setRange] = useState<DateRange>(defaultRange || { from: startOfDay(subDays(new Date(), 30)), to: endOfDay(new Date()) })
  const [statusFilters, setStatusFilters] = useState<string[]>([])
  const [paymentStatusFilters, setPaymentStatusFilters] = useState<string[]>([])
  const [showPresetModal, setShowPresetModal] = useState(false)
  const [presetName, setPresetName] = useState('')
  const [showDateDropdown, setShowDateDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (onRangeChange) onRangeChange(range)
  }, [range, onRangeChange])

  useEffect(() => {
    if (onFilterChange) {
      onFilterChange({
        status: statusFilters,
        paymentStatus: paymentStatusFilters,
      })
    }
  }, [statusFilters, paymentStatusFilters, onFilterChange])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDateDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handlePresetSelect = (preset: typeof PRESET_RANGES[0]) => {
    setRange({ from: preset.from, to: preset.to })
    setShowDateDropdown(false)
  }

  const clearAllFilters = () => {
    setStatusFilters([])
    setPaymentStatusFilters([])
  }

  const hasActiveFilters = statusFilters.length > 0 || paymentStatusFilters.length > 0

  const handleSavePreset = () => {
    if (presetName.trim() && onPresetSave) {
      onPresetSave(presetName.trim(), range, {
        status: statusFilters,
        paymentStatus: paymentStatusFilters,
      })
      setShowPresetModal(false)
      setPresetName('')
    }
  }

  return (
    <div className="bg-card border border-border/50 rounded-xl p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Date Range Picker */}
        <div className="relative" ref={dropdownRef}>
          <Button 
            variant="outline" 
            className="h-10 gap-2 min-w-[280px] justify-between"
            aria-label="Select date range"
            onClick={() => setShowDateDropdown(!showDateDropdown)}
          >
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="truncate flex-1 text-left">
              {range.from ? format(range.from, 'MMM d, yyyy') : 'From'} 
              {' '}–{' '}
              {range.to ? format(range.to, 'MMM d, yyyy') : 'To'}
            </span>
            <ChevronDown className={cn('w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform', showDateDropdown && 'rotate-180')} />
          </Button>

          {showDateDropdown && (
            <div className="absolute z-50 top-full mt-1 left-0 w-80 bg-popover border border-border rounded-lg shadow-lg p-2 animate-in slide-in-from-top-2 duration-150">
              <div className="grid grid-cols-2 gap-1 mb-2">
                {PRESET_RANGES.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => handlePresetSelect(preset)}
                    className="px-3 py-2 text-sm rounded-md hover:bg-accent text-left transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <div className="border-t border-border pt-2">
                <p className="text-xs text-muted-foreground px-2 mb-2">Custom Range</p>
                <div className="px-2 space-y-2">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">From</label>
                    <input
                      type="date"
                      value={range.from ? format(range.from, 'yyyy-MM-dd') : ''}
                      onChange={(e) => setRange(prev => ({ ...prev, from: e.target.value ? new Date(e.target.value) : undefined }))}
                      className="w-full px-2 py-1.5 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">To</label>
                    <input
                      type="date"
                      value={range.to ? format(range.to, 'yyyy-MM-dd') : ''}
                      onChange={(e) => setRange(prev => ({ ...prev, to: e.target.value ? new Date(e.target.value) : undefined }))}
                      className="w-full px-2 py-1.5 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Status Filter */}
        {statusOptions.length > 0 && (
          <Select
            value={statusFilters.join(',') || 'all'}
            onValueChange={(value) => {
              const vals = value.split(',').filter(Boolean)
              setStatusFilters(vals)
            }}
          >
            <SelectTrigger className="h-10 w-full sm:w-[180px] min-w-[180px]" aria-label="Filter by order status">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent side="right" align="end">
              <SelectGroup>
                <SelectLabel>Order Status</SelectLabel>
                <SelectItem value="all">All Statuses</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        )}

        {/* Payment Status Filter */}
        {paymentStatusOptions.length > 0 && (
          <Select
            value={paymentStatusFilters.join(',') || 'all'}
            onValueChange={(value) => {
              const vals = value.split(',').filter(Boolean)
              setPaymentStatusFilters(vals)
            }}
          >
            <SelectTrigger className="h-10 w-full sm:w-[180px] min-w-[180px]" aria-label="Filter by payment status">
              <SelectValue placeholder="All Payment Statuses" />
            </SelectTrigger>
            <SelectContent side="right" align="end">
              <SelectGroup>
                <SelectLabel>Payment Status</SelectLabel>
                <SelectItem value="all">All Payment Statuses</SelectItem>
                {paymentStatusOptions.map((status) => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        )}

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearAllFilters}
            className="gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </Button>
        )}

        {/* Save Preset */}
        {showPresets && (
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowPresetModal(true)}
              className="gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              Save View
            </Button>
            
            {presets.length > 0 && (
              <Select>
                <SelectTrigger className="h-10 w-full sm:w-[160px] min-w-[160px]" aria-label="Load saved view">
                  <SelectValue placeholder="Saved Views" />
                </SelectTrigger>
                <SelectContent side="right" align="end">
                  <SelectGroup>
                    <SelectLabel>Saved Views</SelectLabel>
                    {presets.map((preset) => (
                      <SelectItem key={preset.id} value={preset.id}>{preset.name}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          </div>
        )}

        {/* Export */}
        <Button variant="outline" size="sm" className="gap-1.5">
          <Download className="w-3.5 h-3.5" />
          Export
        </Button>
      </div>

      {/* Active Filters Chips */}
      {(statusFilters.length > 0 || paymentStatusFilters.length > 0) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {statusFilters.map((status) => (
            <span 
              key={status} 
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-primary/10 text-primary rounded-full"
            >
              {status}
              <button
                onClick={() => setStatusFilters(prev => prev.filter(s => s !== status))}
                className="text-primary hover:text-primary/70"
                aria-label={`Remove ${status} filter`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {paymentStatusFilters.map((status) => (
            <span 
              key={`payment-${status}`} 
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-green-500/10 text-green-700 dark:text-green-400 rounded-full"
            >
              {status}
              <button
                onClick={() => setPaymentStatusFilters(prev => prev.filter(s => s !== status))}
                className="text-green-700 dark:text-green-400 hover:text-green-700/70"
                aria-label={`Remove ${status} filter`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Save Preset Modal */}
      {showPresetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-xl p-6 w-full max-w-md shadow-xl animate-in slide-in-from-top-2 duration-200">
            <h3 className="text-lg font-semibold mb-4">Save Current View</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Save this date range and filter combination for quick access later.
            </p>
            <input
              type="text"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder="e.g., 'Last 30 days - Pending orders'"
              className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => { setShowPresetModal(false); setPresetName('') }}>
                Cancel
              </Button>
              <Button onClick={handleSavePreset} disabled={!presetName.trim()}>
                Save View
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}