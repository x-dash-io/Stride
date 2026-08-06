'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'

interface PaymentsFilterProps {
  search: string
  status: string
}

export function PaymentsFilter({ search, status }: PaymentsFilterProps) {
  const statusOptions = ['ALL', 'PENDING', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED']

  const handleStatusChange = (value: string) => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    params.set('status', value)
    params.set('page', '1')
    window.location.href = `/admin/payments?${params.toString()}`
  }

  return (
    <form method="get" className="mb-6 flex flex-wrap gap-4 max-w-4xl">
      <div className="relative flex-1 max-w-md">
        <Input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Search by transaction ID, order number, or email..."
          className="pl-9"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      </div>
      <Select defaultValue={status} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((s) => (
            <SelectItem key={s} value={s}>{s}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </form>
  )
}