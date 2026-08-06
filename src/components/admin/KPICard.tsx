'use client'

import Link from 'next/link'
import { TrendingUp, TrendingDown, Minus, Target, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KPICardProps {
  label: string
  value: string | number
  delta: number
  deltaLabel?: string
  target?: number
  targetLabel?: string
  icon: React.ReactNode
  iconBg: string
  trend?: 'up' | 'down' | 'neutral'
  href?: string
  description?: string
  isPrimary?: boolean
  className?: string
}

function DeltaIndicator({ delta, label }: { delta: number; label?: string }) {
  if (delta > 0) {
    return (
      <span className="inline-flex flex-wrap items-center gap-1 text-green-600 dark:text-green-400 font-semibold text-sm">
        <TrendingUp className="w-3.5 h-3.5 shrink-0" />
        <span>+{delta.toFixed(1)}%</span>
        {label && <span className="text-muted-foreground font-normal text-xs">{label}</span>}
      </span>
    )
  }
  if (delta < 0) {
    return (
      <span className="inline-flex flex-wrap items-center gap-1 text-red-600 dark:text-red-400 font-semibold text-sm">
        <TrendingDown className="w-3.5 h-3.5 shrink-0" />
        <span>{delta.toFixed(1)}%</span>
        {label && <span className="text-muted-foreground font-normal text-xs">{label}</span>}
      </span>
    )
  }
  return (
    <span className="inline-flex flex-wrap items-center gap-1 text-muted-foreground font-semibold text-sm">
      <Minus className="w-3.5 h-3.5 shrink-0" />
      <span>0%</span>
      {label && <span className="text-muted-foreground font-normal text-xs">{label}</span>}
    </span>
  )
}

function TargetIndicator({ current, target, label }: { current: number; target: number; label?: string }) {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0
  const isOnTrack = percentage >= 100
  const isWarning = percentage >= 80 && percentage < 100

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex-1 min-w-[64px] max-w-[120px] h-1.5 bg-muted rounded-full overflow-hidden">
        <div 
          className={cn(
            'h-full rounded-full transition-all duration-500',
            isOnTrack ? 'bg-green-500' : isWarning ? 'bg-amber-500' : 'bg-primary'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className={cn('text-xs font-semibold', isOnTrack ? 'text-green-600' : isWarning ? 'text-amber-600' : 'text-primary')}>
        {Math.round(percentage)}%
      </span>
      {label && <span className="text-muted-foreground text-xs">{label}</span>}
    </div>
  )
}

export function KPICard({
  label,
  value,
  delta,
  deltaLabel = 'vs prior period',
  target,
  targetLabel = 'of target',
  icon,
  iconBg,
  trend,
  href,
  description,
  isPrimary = false,
  className
}: KPICardProps) {
  const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value
  
  const cardContent = (
    <div className={cn('flex flex-col justify-between h-full space-y-4', isPrimary ? 'space-y-5' : '')}>
      <div className="flex items-start justify-between gap-3">
        <div className="text-left min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground truncate">{label}</p>
          <p className={cn('mt-2 font-extrabold tracking-tight text-foreground break-words leading-tight', isPrimary ? 'text-3xl md:text-4xl' : 'text-2xl md:text-3xl')}>
            {value}
          </p>
          {description && (
            <p className="text-[11px] text-muted-foreground font-medium text-left mt-2">{description}</p>
          )}
        </div>
        <div className={cn('rounded-xl p-2.5 flex-shrink-0', iconBg)}>
          {icon}
        </div>
      </div>
      
      <div className="space-y-2 pt-2 border-t border-border/50">
        <DeltaIndicator delta={delta} label={deltaLabel} />
        
        {target !== undefined && (
          <TargetIndicator current={numericValue} target={target} label={targetLabel} />
        )}
        
        {trend === 'up' && (
          <div className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold text-sm">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Trending up</span>
          </div>
        )}
        {trend === 'down' && (
          <div className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 font-semibold text-sm">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Trending down</span>
          </div>
        )}
      </div>
    </div>
  )

  if (href) {
    return (
      <Link 
        href={href}
        className={cn(
          'group bg-card rounded-xl p-6 shadow-sm transition-all duration-300 hover:shadow-md',
          isPrimary 
            ? 'border-2 border-secondary/20 bg-gradient-to-br from-secondary/10 via-secondary/5 to-transparent hover:border-secondary/30'
            : 'border border-border/50 hover:border-primary/20 hover:-translate-y-0.5',
          className
        )}
      >
        {cardContent}
      </Link>
    )
  }

  return (
    <div className={cn(
      'bg-card rounded-xl p-6 shadow-sm border border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5',
      className
    )}>
      {cardContent}
    </div>
  )
}