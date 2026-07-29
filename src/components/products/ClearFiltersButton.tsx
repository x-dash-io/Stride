'use client'

import { Button } from '@/components/ui/button'

export function ClearFiltersButton() {
  return (
    <Button
      variant="default"
      onClick={() => { window.location.href = '/products' }}
    >
      Clear Filters
    </Button>
  )
}
