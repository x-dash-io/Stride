import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const allItems = [
    { label: 'Home', href: '/' },
    ...items,
  ]

  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
      {allItems.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {index === 0 && <Home className="w-4 h-4" />}
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
          {index < allItems.length - 1 && (
            <ChevronRight className="w-4 h-4" />
          )}
        </div>
      ))}
    </nav>
  )
}
