export default function CookiePolicyLoading() {
  return (
    <div className="container-max py-16 md:py-24">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-4">
          <div className="h-4 bg-muted-foreground/20 rounded w-32" />
          <div className="h-10 bg-muted-foreground/20 rounded w-2/3" />
        </div>
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="h-6 bg-muted-foreground/20 rounded w-1/2" />
              <div className="h-4 bg-muted-foreground/20 rounded w-full" />
              <div className="h-4 bg-muted-foreground/20 rounded w-5/6" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
