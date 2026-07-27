import { ProductGridSkeleton } from '@/components/skeleton-loader'

export default function HomeLoading() {
  return (
    <div className="w-full animate-pulse">
      <section className="min-h-[70vh] flex items-center justify-center bg-muted">
        <div className="container-max py-20 md:py-32">
          <div className="max-w-3xl space-y-6">
            <div className="h-4 bg-muted-foreground/20 rounded w-48" />
            <div className="h-16 bg-muted-foreground/20 rounded w-2/3" />
            <div className="h-6 bg-muted-foreground/20 rounded w-1/2" />
            <div className="flex gap-4">
              <div className="h-12 bg-muted-foreground/20 rounded w-36" />
              <div className="h-12 bg-muted-foreground/20 rounded w-36" />
            </div>
          </div>
        </div>
      </section>

      <section className="container-max py-16 md:py-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-start gap-4 p-4">
              <div className="w-12 h-12 rounded-lg bg-muted-foreground/20 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted-foreground/20 rounded w-24" />
                <div className="h-3 bg-muted-foreground/20 rounded w-32" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-max py-16 md:py-24">
        <div className="mb-12 space-y-2">
          <div className="h-4 bg-muted-foreground/20 rounded w-32" />
          <div className="h-10 bg-muted-foreground/20 rounded w-64" />
        </div>
        <ProductGridSkeleton count={4} />
      </section>
    </div>
  )
}
