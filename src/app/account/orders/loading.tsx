export default function OrdersLoading() {
  return (
    <div className="container-max py-12 animate-pulse">
      <div className="h-10 bg-muted rounded w-1/4 mb-8" />
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-6 flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-muted rounded w-1/4" />
              <div className="h-3 bg-muted rounded w-1/3" />
            </div>
            <div className="h-6 bg-muted rounded w-20" />
            <div className="h-4 bg-muted rounded w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}
