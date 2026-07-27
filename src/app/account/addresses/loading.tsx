export default function AddressesLoading() {
  return (
    <div className="container-max py-12 animate-pulse">
      <div className="h-10 bg-muted rounded w-1/4 mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-6 space-y-3">
            <div className="h-5 bg-muted rounded w-1/3" />
            <div className="h-4 bg-muted rounded w-2/3" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="flex gap-3 pt-2">
              <div className="h-8 bg-muted rounded w-16" />
              <div className="h-8 bg-muted rounded w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
