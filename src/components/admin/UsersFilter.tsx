'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'

interface UsersFilterProps {
  search: string
  role: string
}

export function UsersFilter({ search, role }: UsersFilterProps) {
  const roleOptions = ['ALL', 'CUSTOMER', 'ADMIN', 'SUPER_ADMIN', 'STAFF']

  const handleRoleChange = (value: string) => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    params.set('role', value)
    params.set('page', '1')
    window.location.href = `/admin/users?${params.toString()}`
  }

  return (
    <form method="get" className="mb-6 flex flex-wrap gap-4 max-w-4xl">
      <div className="relative flex-1 max-w-md">
        <Input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Search by name or email..."
          className="pl-9"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      </div>
      <Select defaultValue={role} onValueChange={handleRoleChange}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Filter by role" />
        </SelectTrigger>
        <SelectContent>
          {roleOptions.map((r) => (
            <SelectItem key={r} value={r}>{r}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </form>
  )
}