import { ProductGridSkeleton } from '@/components/skeleton-loader'

export default function SearchLoading() {
  return (
    <div className="container-max py-16 md:py-24">
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="h-4 bg-muted-foreground/20 rounded w-32" />
          <div className="h-10 bg-muted-foreground/20 rounded w-1/2" />
        </div>
        <div className="space-y-4">
          <div className="h-12 bg-muted-foreground/20 rounded" />
          <div className="flex gap-4">
            <div className="h-10 bg-muted-foreground/20 rounded w-32" />
            <div className="h-10 bg-muted-foreground/20 rounded w-32" />
          </div>
        </div>
        <ProductGridSkeleton count={8} />
      </div>
    </div>
  )
}
