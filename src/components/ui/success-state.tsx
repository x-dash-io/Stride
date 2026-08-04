import * as React from 'react'
import Link from 'next/link'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface SuccessStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  message?: string
  referenceId?: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  secondaryAction?: {
    label: string
    href?: string
    onClick?: () => void
  }
  variant?: 'default' | 'card' | 'full'
  children?: React.ReactNode
}

export function SuccessState({
  title = 'Action Successful',
  message = 'Your request has been completed successfully.',
  referenceId,
  action,
  secondaryAction,
  variant = 'default',
  children,
  className,
  ...props
}: SuccessStateProps) {
  return (
    <div
      aria-live="polite"
      className={cn(
        'flex flex-col items-center justify-center text-center p-8',
        variant === 'full' && 'min-h-[60vh] container-max py-20',
        variant === 'card' && 'bg-card border border-border rounded-xl shadow-xs py-12 px-6',
        variant === 'default' && 'py-16 px-6',
        className
      )}
      {...props}
    >
      <div className="relative mb-6 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 flex items-center justify-center ring-8 ring-green-500/5">
          <CheckCircle2 className="w-8 h-8 stroke-[1.5]" />
        </div>
      </div>

      <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-3">
        {title}
      </h2>

      <p className="text-sm md:text-base text-muted-foreground max-w-md mb-6 leading-relaxed">
        {message}
      </p>

      {referenceId && (
        <div className="bg-muted/50 border border-border px-4 py-2 rounded-lg text-xs font-mono text-muted-foreground mb-6">
          Reference: <span className="font-semibold text-foreground">{referenceId}</span>
        </div>
      )}

      {children}

      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
          {action && (
            action.href ? (
              <Link href={action.href}>
                <Button variant="default" className="gap-2">
                  {action.label}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <Button variant="default" onClick={action.onClick} className="gap-2">
                {action.label}
              </Button>
            )
          )}

          {secondaryAction && (
            secondaryAction.href ? (
              <Link href={secondaryAction.href}>
                <Button variant="outline">
                  {secondaryAction.label}
                </Button>
              </Link>
            ) : (
              <Button variant="outline" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            )
          )}
        </div>
      )}
    </div>
  )
}
