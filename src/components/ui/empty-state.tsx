import * as React from 'react'
import Link from 'next/link'
import { LucideIcon, PackageX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface EmptyStateAction {
  label: string
  href?: string
  onClick?: () => void
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'link'
  icon?: LucideIcon
}

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon
  title: string
  description?: string
  action?: EmptyStateAction
  secondaryAction?: EmptyStateAction
  variant?: 'default' | 'card' | 'minimal' | 'full'
  children?: React.ReactNode
}

export function EmptyState({
  icon: Icon = PackageX,
  title,
  description,
  action,
  secondaryAction,
  variant = 'default',
  children,
  className,
  ...props
}: EmptyStateProps) {
  const renderAction = (act: EmptyStateAction, key: string) => {
    const ActionIcon = act.icon
    const content = (
      <Button
        variant={act.variant || 'default'}
        onClick={act.onClick}
        className="gap-2"
      >
        {ActionIcon && <ActionIcon className="w-4 h-4" />}
        {act.label}
      </Button>
    )

    if (act.href) {
      return (
        <Link key={key} href={act.href}>
          {content}
        </Link>
      )
    }

    return <React.Fragment key={key}>{content}</React.Fragment>
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8',
        variant === 'full' && 'min-h-[60vh] container-max py-20',
        variant === 'card' && 'bg-card border border-border rounded-xl shadow-xs py-12 px-6',
        variant === 'minimal' && 'py-8 px-4',
        variant === 'default' && 'py-16 px-6',
        className
      )}
      {...props}
    >
      <div className="relative mb-6 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground ring-8 ring-muted/30">
          <Icon className="w-8 h-8 stroke-[1.5]" />
        </div>
      </div>

      <h3 className="text-xl md:text-2xl font-serif font-bold text-foreground mb-2">
        {title}
      </h3>

      {description && (
        <p className="text-sm md:text-base text-muted-foreground max-w-md mb-6 leading-relaxed">
          {description}
        </p>
      )}

      {children}

      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
          {action && renderAction(action, 'primary')}
          {secondaryAction && renderAction(secondaryAction, 'secondary')}
        </div>
      )}
    </div>
  )
}
