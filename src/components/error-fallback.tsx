import { ErrorState } from '@/components/ui/error-state'

interface ErrorFallbackProps {
  reset?: () => void
  message?: string
  backHref?: string
  backLabel?: string
  title?: string
}

export function ErrorFallback({
  reset,
  message = 'An unexpected error occurred. Please try again or go back.',
  backHref,
  backLabel = 'Go Back',
  title = 'Something went wrong',
}: ErrorFallbackProps) {
  return (
    <ErrorState
      title={title}
      message={message}
      reset={reset}
      backHref={backHref}
      backLabel={backLabel}
      variant="default"
    />
  )
}