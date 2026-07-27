import { CheckoutFormSkeleton } from '@/components/skeleton-loader'

export default function CheckoutLoading() {
  return (
    <div className="container-max py-12">
      <div className="h-10 bg-muted rounded w-1/4 animate-pulse mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <CheckoutFormSkeleton />
        <div className="space-y-4 animate-pulse">
          <div className="h-6 bg-muted rounded w-1/3" />
          <div className="h-24 bg-muted rounded" />
          <div className="h-24 bg-muted rounded" />
        </div>
      </div>
    </div>
  )
}
