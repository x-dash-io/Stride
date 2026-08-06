'use client'

import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Minus, Search, Download, Columns, Eye, EyeOff } from 'lucide-react'
import { useState, useMemo, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface Column<T> {
  key: string
  header: string
  render: (row: T) => React.ReactNode
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  visible?: boolean
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  keyExtractor: (row: T) => string
  searchable?: boolean
  searchPlaceholder?: string
  sortable?: boolean
  defaultSort?: { key: string; direction: 'asc' | 'desc' }
  pageSize?: number
  pageSizeOptions?: number[]
  showPagination?: boolean
  showColumnToggle?: boolean
  showExport?: boolean
  onExport?: (data: T[]) => void
  emptyMessage?: string
  loading?: boolean
  rowClassName?: (row: T) => string
  onRowClick?: (row: T) => void
  stickyHeader?: boolean
}

function SortIcon({ direction }: { direction: 'asc' | 'desc' | null }) {
  if (direction === 'asc') return <ChevronUp className="w-4 h-4 text-primary" />
  if (direction === 'desc') return <ChevronDown className="w-4 h-4 text-primary" />
  return <Minus className="w-4 h-4 text-muted-foreground" />
}

function ColumnToggle<T>({ columns, visibleColumns, onToggle }: { 
  columns: Column<T>[]
  visibleColumns: Set<string>
  onToggle: (key: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <Button 
        variant="outline" 
        size="sm" 
        className="gap-1.5 whitespace-nowrap"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Columns className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Columns</span>
        <ChevronDown className="w-3.5 h-3.5" />
      </Button>
      {isOpen && (
        <div className="absolute left-0 top-full mt-1 z-50 bg-card border border-border rounded-lg shadow-lg min-w-[160px] p-1.5">
          {columns.map(col => (
            <label key={col.key} className="flex items-center gap-2.5 px-2.5 py-1.5 text-sm hover:bg-accent rounded cursor-pointer select-none">
              <input
                type="checkbox"
                checked={visibleColumns.has(col.key)}
                onChange={() => onToggle(col.key)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary flex-shrink-0 accent-primary"
              />
              <span>{col.header}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

function PageSizeSelect({ value, onChange, options }: { value: number; onChange: (value: string) => void; options: number[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <Button 
        variant="outline" 
        size="sm" 
        className="h-8 text-xs w-[100px] min-w-[100px] gap-1.5 justify-between whitespace-nowrap"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{value} per page</span>
        <ChevronDown className="w-3.5 h-3.5" />
      </Button>
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 z-10 bg-card border border-border rounded-lg shadow-lg min-w-[120px] p-1">
          {options.map(size => (
            <button
              key={size}
              onClick={() => { onChange(String(size)); setIsOpen(false) }}
              className={`w-full px-3 py-1.5 text-sm text-left rounded transition-colors ${
                value === size ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
              }`}
            >
              {size} per page
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  searchable = true,
  searchPlaceholder = 'Search...',
  sortable = true,
  defaultSort,
  pageSize = 10,
  pageSizeOptions = [10, 25, 50, 100],
  showPagination = true,
  showColumnToggle = true,
  showExport = false,
  onExport,
  emptyMessage = 'No data available',
  loading = false,
  rowClassName,
  onRowClick,
  stickyHeader = true,
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(defaultSort || null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSizeState, setPageSizeState] = useState(pageSize)
  const [searchQuery, setSearchQuery] = useState('')
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set(columns.map(c => c.key)))
  const [columnMenuOpen, setColumnMenuOpen] = useState(false)

  // Reset page when search or sort changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1)
  }, [searchQuery, sortConfig])

  const toggleColumn = (key: string) => {
    setVisibleColumns(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const handleSort = (key: string) => {
    if (!sortable) return
    setSortConfig(prev => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
      }
      return { key, direction: 'asc' }
    })
  }

  const filteredData = useMemo(() => {
    let result = [...data]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(row => 
        columns.some(col => 
          String(col.render(row)).toLowerCase().includes(query)
        )
      )
    }

    if (sortConfig) {
      const col = columns.find(c => c.key === sortConfig.key)
      if (col) {
        result.sort((a, b) => {
          const aVal = col.render(a)
          const bVal = col.render(b)
          const aStr = String(aVal).toLowerCase()
          const bStr = String(bVal).toLowerCase()
          const direction = sortConfig.direction === 'asc' ? 1 : -1
          return aStr.localeCompare(bStr) * direction
        })
      }
    }

    return result
  }, [data, searchQuery, sortConfig, columns])

  const paginatedData = useMemo(() => {
    if (!showPagination) return filteredData
    const start = (currentPage - 1) * pageSizeState
    return filteredData.slice(start, start + pageSizeState)
  }, [filteredData, currentPage, pageSizeState, showPagination, pageSizeState])

  const totalPages = Math.ceil(filteredData.length / pageSizeState)

  const handleExport = () => {
    if (onExport) {
      onExport(filteredData)
    } else {
      const headers = columns.filter(c => visibleColumns.has(c.key)).map(c => c.header).join(',')
      const rows = filteredData.map(row => 
        columns.filter(c => visibleColumns.has(c.key)).map(c => `"${String(c.render(row)).replace(/"/g, '""')}"`).join(',')
      )
      const csv = [headers, ...rows].join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `export-${new Date().toISOString().split('T')[0]}.csv`
      link.click()
    }
  }

  const visibleCols = columns.filter(c => visibleColumns.has(c.key))

  if (loading) {
    return (
      <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="h-6 w-1/4 bg-muted animate-pulse rounded" />
        </div>
        <div className="divide-y divide-border">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4 space-y-2">
              <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
              <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-border flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2 items-center flex-wrap">
          {searchable && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 h-8 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary w-48 sm:w-60"
                aria-label="Search table"
              />
            </div>
          )}
          {showColumnToggle && (
            <ColumnToggle columns={columns} visibleColumns={visibleColumns} onToggle={toggleColumn} />
          )}
          {showExport && (
            <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5">
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {showPagination && (
            <PageSizeSelect 
              value={pageSizeState} 
              onChange={v => { setPageSizeState(Number(v)); setCurrentPage(1) }}
              options={pageSizeOptions}
            />
          )}
          <span className="whitespace-nowrap text-xs">Showing {paginatedData.length} of {filteredData.length} rows</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full" role="grid">
          <thead className={cn('bg-muted/50', stickyHeader && 'sticky top-0 z-10')}>
            <tr>
              {visibleCols.map(col => (
                  <th
                    key={col.key}
                    scope="col"
                    className={cn(
                      'px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground',
                      col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left',
                      col.sortable && sortable && 'cursor-pointer hover:bg-muted select-none'
                    )}
                    style={{ width: col.width }}
                    onClick={() => col.sortable && sortable && handleSort(col.key)}
                  >
                    <div className={cn(
                      'flex items-center gap-1.5',
                      col.align === 'center' ? 'justify-center' : col.align === 'right' ? 'justify-end' : 'justify-start'
                    )}>
                      {col.header}
                      {col.sortable && sortable && sortConfig?.key === col.key && <SortIcon direction={sortConfig.direction} />}
                      {col.sortable && sortable && sortConfig?.key !== col.key && <SortIcon direction={null} />}
                    </div>
                  </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={visibleCols.length} className="px-4 py-12 text-center text-muted-foreground">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map(row => (
                <tr
                  key={keyExtractor(row)}
                  className={cn(
                    'transition-colors',
                    onRowClick && 'cursor-pointer hover:bg-accent/50',
                    rowClassName && rowClassName(row)
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {visibleCols.map(col => (
                    <td
                      key={col.key}
                      className={cn(
                        'px-4 py-3 text-sm',
                        col.align === 'center' && 'text-center',
                        col.align === 'right' && 'text-right'
                      )}
                      style={{ width: col.width }}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="px-4 py-3 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages} ({filteredData.length} total)
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="px-3 text-sm font-medium w-12 text-center">{currentPage}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}