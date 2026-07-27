export default function AccountLoading() {
  return (
    <div className="container-max py-12 animate-pulse">
      <div className="h-10 bg-muted rounded w-1/4 mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 bg-muted rounded" />
          ))}
        </div>
        <div className="md:col-span-2 space-y-6">
          <div className="h-40 bg-muted rounded" />
          <div className="h-32 bg-muted rounded" />
          <div className="h-48 bg-muted rounded" />
        </div>
      </div>
    </div>
  )
}
