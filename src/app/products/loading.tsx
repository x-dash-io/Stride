import { ProductGridSkeleton } from '@/components/skeleton-loader'

export default function ProductsLoading() {
  return (
    <div className="container-max py-12">
      <div className="mb-8 space-y-2">
        <div className="h-10 bg-muted rounded w-1/3 animate-pulse" />
        <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
      </div>
      <ProductGridSkeleton count={6} />
    </div>
  )
}
