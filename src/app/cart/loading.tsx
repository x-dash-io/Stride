import { CartItemSkeleton } from '@/components/skeleton-loader'

export default function CartLoading() {
  return (
    <div className="container-max py-12">
      <div className="h-10 bg-muted rounded w-1/4 animate-pulse mb-8" />
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <CartItemSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
