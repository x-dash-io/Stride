'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'

interface NewsletterFilterProps {
  search: string
  subscribed: string
}

export function NewsletterFilter({ search, subscribed }: NewsletterFilterProps) {
  const handleSubscribedChange = (value: string) => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    params.set('subscribed', value)
    params.set('page', '1')
    window.location.href = `/admin/newsletter?${params.toString()}`
  }

  return (
    <form method="get" className="mb-6 flex flex-wrap gap-4 max-w-4xl">
      <div className="relative flex-1 max-w-md">
        <Input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Search by email..."
          className="pl-9"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      </div>
      <Select
        defaultValue={subscribed}
        onValueChange={handleSubscribedChange}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All</SelectItem>
          <SelectItem value="ACTIVE">Active</SelectItem>
          <SelectItem value="UNSUBSCRIBED">Unsubscribed</SelectItem>
        </SelectContent>
      </Select>
      <Button variant="outline" asChild>
        <a href="/api/admin/newsletter/export" download>
          Export CSV
        </a>
      </Button>
    </form>
  )
}