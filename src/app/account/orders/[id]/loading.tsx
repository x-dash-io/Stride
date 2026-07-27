export default function OrderDetailLoading() {
  return (
    <div className="container-max py-12 animate-pulse">
      <div className="h-10 bg-muted rounded w-1/3 mb-8" />
      <div className="space-y-6">
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 bg-muted rounded w-16" />
                <div className="h-4 bg-muted rounded w-24" />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="w-20 h-20 bg-muted rounded flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="h-3 bg-muted rounded w-1/3" />
                <div className="h-3 bg-muted rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
