export default function AdminLoading() {
  return (
    <div className="container-max py-12 animate-pulse">
      <div className="h-10 bg-muted rounded w-1/4 mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-6 space-y-3">
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-3 bg-muted rounded w-2/3" />
          </div>
        ))}
      </div>
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="h-6 bg-muted rounded w-1/3 mb-4" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded" />
          ))}
        </div>
      </div>
    </div>
  )
}
