export default function NewProductLoading() {
  return (
    <div className="container-max py-12 animate-pulse">
      <div className="h-10 bg-muted rounded w-1/3 mb-8" />
      <div className="bg-card border border-border rounded-lg p-8 space-y-6 max-w-3xl">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-muted rounded w-1/4" />
            <div className="h-10 bg-muted rounded" />
          </div>
        ))}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-1/4" />
            <div className="h-10 bg-muted rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-1/4" />
            <div className="h-10 bg-muted rounded" />
          </div>
        </div>
        <div className="h-12 bg-muted rounded w-32" />
      </div>
    </div>
  )
}
