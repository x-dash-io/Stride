import { Search } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'

export default function NotFound() {
  return (
    <EmptyState
      icon={Search}
      title="Page Not Found"
      description="Sorry, we can't find the page you're looking for. It might have been moved or deleted."
      action={{ label: 'Go Home', href: '/' }}
      secondaryAction={{ label: 'Browse Products', href: '/products', variant: 'outline' }}
      variant="full"
    />
  )
}
