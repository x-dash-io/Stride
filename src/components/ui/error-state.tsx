import * as React from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, Home, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  message?: string
  digest?: string
  error?: Error & { digest?: string }
  reset?: () => void
  backHref?: string
  backLabel?: string
  showHomeButton?: boolean
  showSupportButton?: boolean
  variant?: 'default' | 'card' | 'full'
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Our team has been notified and we are looking into it.',
  digest,
  error,
  reset,
  backHref,
  backLabel = 'Go Back',
  showHomeButton = true,
  showSupportButton = false,
  variant = 'default',
  className,
  ...props
}: ErrorStateProps) {
  const [showDetails, setShowDetails] = React.useState(false)
  const errorDigest = digest || error?.digest
  const errorMessage = error?.message && error.message !== message ? error.message : null

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        'flex flex-col items-center justify-center text-center p-8',
        variant === 'full' && 'min-h-[70vh] container-max py-20',
        variant === 'card' && 'bg-card border border-destructive/20 rounded-xl shadow-xs py-12 px-6',
        variant === 'default' && 'py-16 px-6',
        className
      )}
      {...props}
    >
      <div className="relative mb-6 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center ring-8 ring-destructive/5">
          <AlertTriangle className="w-8 h-8 stroke-[1.5]" />
        </div>
      </div>

      <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-3">
        {title}
      </h2>

      <p className="text-sm md:text-base text-muted-foreground max-w-md mb-6 leading-relaxed">
        {message}
      </p>

      {(errorDigest || errorMessage) && (
        <div className="w-full max-w-md mb-6 text-left">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mx-auto font-medium py-1"
          >
            {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {showDetails ? 'Hide technical details' : 'Show technical details'}
          </button>
          
          {showDetails && (
            <div className="mt-2 p-4 bg-muted/50 border border-border rounded-lg text-xs font-mono text-muted-foreground break-all space-y-1">
              {errorDigest && <p><span className="font-semibold text-foreground">Digest:</span> {errorDigest}</p>}
              {errorMessage && <p><span className="font-semibold text-foreground">Message:</span> {errorMessage}</p>}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        {reset && (
          <Button onClick={reset} variant="default" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        )}

        {backHref && (
          <Button variant="outline" asChild>
            <Link href={backHref}>{backLabel}</Link>
          </Button>
        )}

        {showHomeButton && !backHref && (
          <Button variant="outline" asChild className="gap-2">
            <Link href="/">
              <Home className="w-4 h-4" />
              Go to Home
            </Link>
          </Button>
        )}

        {showSupportButton && (
          <Button variant="ghost" asChild className="gap-2">
            <Link href="/contact">
              <HelpCircle className="w-4 h-4" />
              Contact Support
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}
