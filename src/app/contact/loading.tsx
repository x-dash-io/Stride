export default function ContactLoading() {
  return (
    <div className="container-max py-16 md:py-24">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="space-y-4">
          <div className="h-4 bg-muted-foreground/20 rounded w-32" />
          <div className="h-10 bg-muted-foreground/20 rounded w-3/4" />
          <div className="h-6 bg-muted-foreground/20 rounded w-1/2" />
        </div>
        <div className="space-y-4">
          <div className="h-12 bg-muted-foreground/20 rounded" />
          <div className="h-12 bg-muted-foreground/20 rounded" />
          <div className="h-32 bg-muted-foreground/20 rounded" />
          <div className="h-12 bg-muted-foreground/20 rounded w-1/3" />
        </div>
      </div>
    </div>
  )
}
