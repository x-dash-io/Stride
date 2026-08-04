import { HeroSkeleton, ProductGridSkeleton } from '@/components/skeleton-loader'

export default function HomeLoading() {
  return (
    <div className="w-full animate-pulse">
      <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden border-b border-border/40">
        <HeroSkeleton />
      </section>

      <section className="container-max min-h-[100dvh] flex flex-col justify-center py-20">
        <div className="mb-10 space-y-2">
          <div className="h-4 bg-muted-foreground/20 rounded w-32" />
          <div className="h-10 bg-muted-foreground/20 rounded w-64" />
        </div>
        <ProductGridSkeleton count={4} />
        <div className="text-center mt-8">
          <div className="h-12 bg-muted-foreground/20 rounded w-48 mx-auto" />
        </div>
      </section>

      <section className="bg-muted/30 py-20">
        <div className="container-max">
          <div className="mb-10 space-y-2">
            <div className="h-4 bg-muted-foreground/20 rounded w-24" />
            <div className="h-10 bg-muted-foreground/20 rounded w-48" />
          </div>
          <ProductGridSkeleton count={4} />
          <div className="text-center mt-8">
            <div className="h-12 bg-muted-foreground/20 rounded w-48 mx-auto" />
          </div>
        </div>
      </section>

      <section className="container-max py-20">
        <div className="mb-10 space-y-2">
          <div className="h-4 bg-muted-foreground/20 rounded w-40" />
          <div className="h-10 bg-muted-foreground/20 rounded w-48" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="aspect-square bg-muted-foreground/20 rounded-xl" />
          ))}
        </div>
      </section>
    </div>
  )
}
