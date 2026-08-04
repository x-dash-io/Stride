import * as React from 'react'
import { cn } from '@/lib/utils'

interface SpinnerProps extends React.SVGAttributes<SVGSVGElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'primary' | 'secondary' | 'muted' | 'white'
}

const sizeClasses = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-3',
  xl: 'w-12 h-12 border-4',
}

const variantClasses = {
  default: 'border-muted-foreground/30 border-t-foreground',
  primary: 'border-primary/30 border-t-primary',
  secondary: 'border-secondary/30 border-t-secondary',
  muted: 'border-muted border-t-muted-foreground',
  white: 'border-white/30 border-t-white',
}

export function Spinner({
  size = 'md',
  variant = 'default',
  className,
  ...props
}: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        'inline-block rounded-full animate-spin',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...(props as any)}
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}

export function LoadingSection({
  label = 'Loading...',
  className,
}: {
  label?: string
  className?: string
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-12 gap-3 text-center', className)}>
      <Spinner size="lg" variant="primary" />
      {label && <p className="text-sm text-muted-foreground font-medium">{label}</p>}
    </div>
  )
}

export function LoadingOverlay({
  message = 'Loading...',
  className,
}: {
  message?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-xs transition-opacity',
        className
      )}
    >
      <div className="bg-card border border-border p-6 rounded-2xl shadow-xl flex flex-col items-center gap-4 max-w-xs text-center">
        <Spinner size="xl" variant="primary" />
        <p className="text-sm font-medium text-foreground">{message}</p>
      </div>
    </div>
  )
}
