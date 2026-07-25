export function ProductCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden animate-pulse">
      <div className="aspect-square bg-muted" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-muted rounded w-1/3" />
        <div className="h-4 bg-muted rounded w-2/3" />
        <div className="h-4 bg-muted rounded w-1/2" />
        <div className="h-8 bg-muted rounded" />
      </div>
    </div>
  )
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {[...Array(count)].map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function CartItemSkeleton() {
  return (
    <div className="bg-card border border-border rounded-lg p-6 animate-pulse flex gap-6">
      <div className="w-24 h-24 bg-muted rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-3">
        <div className="h-4 bg-muted rounded w-2/3" />
        <div className="h-3 bg-muted rounded w-1/2" />
        <div className="h-3 bg-muted rounded w-1/3" />
      </div>
      <div className="w-20 space-y-2">
        <div className="h-4 bg-muted rounded" />
        <div className="h-8 bg-muted rounded" />
      </div>
    </div>
  )
}

export function CheckoutFormSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-3">
        <div className="h-4 bg-muted rounded w-1/4" />
        <div className="h-10 bg-muted rounded" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="h-4 bg-muted rounded w-1/4" />
          <div className="h-10 bg-muted rounded" />
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-muted rounded w-1/4" />
          <div className="h-10 bg-muted rounded" />
        </div>
      </div>
      <div className="h-10 bg-accent rounded" />
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="container-max py-12 space-y-8">
      <div className="h-10 bg-muted rounded w-1/3 animate-pulse" />
      <ProductGridSkeleton count={8} />
    </div>
  )
}

export function ProductDetailSkeleton() {
  return (
    <div className="container-max py-12 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="aspect-square bg-muted rounded-lg" />
        <div className="space-y-6">
          <div className="h-4 bg-muted rounded w-1/4" />
          <div className="h-8 bg-muted rounded w-2/3" />
          <div className="h-6 bg-muted rounded w-1/3" />
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded" />
            <div className="h-4 bg-muted rounded" />
            <div className="h-4 bg-muted rounded w-2/3" />
          </div>
          <div className="h-12 bg-accent rounded" />
        </div>
      </div>
    </div>
  )
}
