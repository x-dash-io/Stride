import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface ErrorFallbackProps {
  reset?: () => void
  message?: string
  backHref?: string
  backLabel?: string
}

export function ErrorFallback({ reset, message = 'Something went wrong', backHref, backLabel }: ErrorFallbackProps) {
  return (
    <div className="container-max section-padding min-h-[50vh] flex flex-col items-center justify-center text-center">
      <h2 className="text-2xl font-serif font-bold mb-2">{message}</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        An unexpected error occurred. Please try again or go back.
      </p>
      <div className="flex gap-4">
        {reset && <Button onClick={reset}>Try Again</Button>}
        {backHref && (
          <Button variant="outline" asChild>
            <Link href={backHref}>{backLabel || 'Go Back'}</Link>
          </Button>
        )}
      </div>
    </div>
  )
}