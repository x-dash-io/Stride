import { Skeleton } from '@/components/ui/skeleton'

export function ProductCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xs flex flex-col">
      <div className="relative aspect-square w-full">
        <Skeleton className="w-full h-full rounded-none" />
        <Skeleton className="absolute top-3 left-3 w-16 h-5 rounded-full" />
      </div>
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-9 w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export function HeroSkeleton() {
  return (
    <div className="relative z-10 w-full min-h-[85vh] lg:min-h-[90vh] flex flex-col justify-between py-10 md:py-16 overflow-hidden bg-background">
      {/* Subtle Background Lighting Mesh */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-accent/15 blur-[140px] opacity-75" />
        <div className="absolute top-10 right-10 w-[350px] h-[350px] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <div className="container-max w-full my-auto">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          
          {/* Left Editorial Headline Section */}
          <div className="lg:col-span-6 text-center lg:text-left z-20 flex flex-col justify-center">
            
            <div className="mb-4 inline-flex items-center gap-2 mx-auto lg:mx-0 justify-center">
              <Skeleton className="h-px w-8 bg-accent" />
              <Skeleton className="h-3.5 w-28 rounded-sm" />
            </div>

            {/* Editorial Bold Main Title */}
            <h1 className="mb-6 text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-serif font-bold leading-[1.02] tracking-tight text-foreground text-balance">
              <Skeleton className="h-12 sm:h-14 lg:h-16 xl:h-20 w-3/4 mx-auto lg:mx-0 rounded-sm" />
              <Skeleton className="h-12 sm:h-14 lg:h-16 xl:h-20 w-1/2 mx-auto lg:mx-0 rounded-sm mt-2" />
            </h1>

            {/* Editorial Narrative Caption */}
            <Skeleton className="mx-auto lg:mx-0 mb-10 h-5 sm:h-6 w-full max-w-lg rounded-sm" />

            {/* Clean Editorial CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Skeleton className="h-12 w-44 rounded-xl" />
              <Skeleton className="h-12 w-44 rounded-xl" />
            </div>
          </div>

          {/* Right Product Spotlight Stage */}
          <div className="lg:col-span-6 relative flex flex-col items-center justify-center z-10 min-h-[420px] sm:min-h-[500px]">
            
            {/* Clean Frameless Floating Stage */}
            <div className="relative w-full h-[380px] sm:h-[460px] flex items-center justify-center">
              
              {/* Product Background Glow Spotlight */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Skeleton className="w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] rounded-full bg-accent/20" />
              </div>

              {/* Shoe Frameless Product Display */}
              <div className="relative flex flex-col items-center justify-center w-full h-full p-4">
                <Skeleton className="max-h-[300px] sm:max-h-[380px] lg:max-h-[420px] max-w-[90%] w-56 sm:w-64 h-56 sm:h-64 rounded-sm" />
              </div>

              {/* Floating Product Spotlight Badge */}
              <div className="absolute bottom-2 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-xs z-30 p-4 rounded-2xl border border-border/60 bg-background/85 dark:bg-background/90 backdrop-blur-xl">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <Skeleton className="h-2.5 w-36 rounded-sm" />
                    <Skeleton className="h-3.5 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-5 w-full rounded-sm" />
                  <div className="flex items-baseline justify-between gap-2 border-t border-border/40 pt-2 mt-1">
                    <div className="flex items-baseline gap-2">
                      <Skeleton className="h-4 w-16 rounded-sm" />
                      <Skeleton className="h-3 w-12 rounded-sm" />
                    </div>
                    <Skeleton className="h-3 w-12 rounded-sm" />
                  </div>
                </div>
              </div>

              {/* Left / Right Control Buttons */}
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-20 flex items-center justify-between px-1 pointer-events-none">
                <Skeleton className="pointer-events-auto h-10 w-10 rounded-full border border-border/60 bg-background/80" />
                <Skeleton className="pointer-events-auto h-10 w-10 rounded-full border border-border/60 bg-background/80" />
              </div>
            </div>

            {/* Interactive Thumbnail Selector & Counter */}
            <div className="mt-4 w-full flex flex-col items-center gap-3 z-20">
              {/* Thumbnails Row */}
              <div className="flex items-center justify-center gap-2.5 max-w-full overflow-x-auto p-1">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl border border-border/60 bg-muted/40" />
                ))}
              </div>

              {/* Progress Indicators & Count */}
              <div className="flex items-center gap-3">
                <Skeleton className="h-3.5 w-12 rounded-sm" />
                <div className="flex items-center gap-1.5">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className={i === 0 ? 'h-1.5 w-8 rounded-full bg-muted' : 'h-1.5 w-1.5 rounded-full bg-muted-foreground/30'} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle Bottom Trust Bar */}
      <div className="w-full border-t border-border/40 pt-6 mt-8">
        <div className="container-max flex flex-wrap items-center justify-center md:justify-between gap-6 text-xs text-muted-foreground font-medium">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 text-accent" />
            <Skeleton className="h-3.5 w-36 rounded-sm" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 text-accent" />
            <Skeleton className="h-3.5 w-40 rounded-sm" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(count)].map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function ProductsPageSkeleton() {
  return (
    <div className="min-h-screen">
      <div className="px-6 sm:px-8 lg:px-12 py-8 lg:py-12 max-w-7xl mx-auto border-b border-border">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-10 w-64 mb-3" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>

      <div className="px-6 sm:px-8 lg:px-12 py-8 lg:py-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8 md:gap-12">
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-card rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-12" />
            </div>

            <div className="space-y-3">
              <Skeleton className="h-5 w-28" />
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-6 rounded-full" />
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-4 border-t border-border">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-6 w-full" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-border">
              <Skeleton className="h-5 w-24" />
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-4 w-4 rounded-xs" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </div>
        </aside>

        <main className="lg:col-span-3 space-y-8">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-9 w-36 rounded-lg" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>

          <div className="flex justify-center gap-2 pt-8">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-10 w-10 rounded-lg" />
          </div>
        </main>
      </div>
    </div>
  )
}

export function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 sm:px-8 lg:px-12 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      <div className="px-6 sm:px-8 lg:px-12 py-8 lg:py-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          <div className="space-y-4">
            <div className="aspect-square w-full rounded-2xl overflow-hidden border border-border">
              <Skeleton className="w-full h-full rounded-none" />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden border border-border">
                  <Skeleton className="w-full h-full rounded-none" />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-3 border-b border-border pb-6">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-3/4" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-7 w-28" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>

            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>

            <div className="space-y-4">
              <Skeleton className="h-4 w-20" />
              <div className="flex gap-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="w-8 h-8 rounded-full" />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} className="h-11 rounded-lg" />
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-border">
              <Skeleton className="h-12 flex-1 rounded-xl" />
              <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
            </div>

            <div className="space-y-4 pt-6 border-t border-border">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex justify-between items-center py-3 border-b border-border">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-4" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 sm:px-8 lg:px-12 py-8 lg:py-12 max-w-7xl mx-auto border-t border-border">
        <Skeleton className="h-10 w-64 mb-8" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-card rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function CartItemSkeleton() {
  return (
    <div className="bg-card rounded-xl p-6 flex gap-6">
      <Skeleton className="w-24 h-24 rounded-lg shrink-0" />
      <div className="flex-1 space-y-3">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-1/4" />
      </div>
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-6 w-20" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-9 w-16 rounded-lg" />
          <Skeleton className="h-9 w-9 rounded-lg" />
        </div>
        <Skeleton className="h-9 w-9 rounded-lg" />
      </div>
    </div>
  )
}

export function CartPageSkeleton() {
  return (
    <div className="px-6 sm:px-8 lg:px-12 py-8 lg:py-12 max-w-7xl mx-auto">
      <div className="mb-8">
        <Skeleton className="h-4 w-12" />
      </div>

      <Skeleton className="h-10 w-32 mb-12" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-4">
          {[...Array(3)].map((_, i) => (
            <CartItemSkeleton key={i} />
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-muted/30 rounded-xl p-8 space-y-6 sticky top-24">
            <Skeleton className="h-7 w-40" />

            <div className="space-y-4 border-b border-border pb-6">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>

            <Skeleton className="h-12 w-full rounded-xl" />

            <Skeleton className="h-10 w-full rounded-lg" />

            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function CheckoutFormSkeleton() {
  return (
    <div className="space-y-8">
      {/* Step Indicators */}
      <div className="flex items-center gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="h-4 w-20 hidden sm:block" />
            {i < 2 && <Skeleton className="w-4 h-4 hidden sm:block" />}
          </div>
        ))}
      </div>

      {/* Form Section */}
      <div className="space-y-6">
        <Skeleton className="h-6 w-36" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
      </div>

      {/* Payment Method Section */}
      <div className="space-y-4 pt-6 border-t border-border">
        <Skeleton className="h-6 w-36" />
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-card p-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="w-5 h-5 rounded-full" />
                <Skeleton className="h-5 w-36" />
              </div>
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <Skeleton className="h-12 w-full rounded-xl" />
    </div>
  )
}

export function CheckoutPageSkeleton() {
  return (
    <div className="px-6 sm:px-8 lg:px-12 py-8 lg:py-12 max-w-7xl mx-auto">
      <Skeleton className="h-10 w-48 mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <CheckoutFormSkeleton />
        </div>
        <div className="lg:col-span-1">
          <div className="bg-card rounded-xl p-6 space-y-6 sticky top-24">
            <Skeleton className="h-6 w-36" />
            <div className="space-y-4 border-b border-border pb-6">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="w-16 h-16 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
            <div className="space-y-3 pt-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex justify-between font-bold pt-2 border-t border-border">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function AccountPageSkeleton() {
  return (
    <div className="px-6 sm:px-8 lg:px-12 py-8 lg:py-12 max-w-7xl mx-auto">
      <div className="mb-8 space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-5 w-48" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <div className="bg-card rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="w-16 h-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
            <div className="space-y-2 pt-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-11 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </aside>

        <main className="lg:col-span-3 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-7 w-36" />
              <Skeleton className="h-4 w-16" />
            </div>
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-card rounded-xl p-4 space-y-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-16 h-16 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-7 w-40" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-card rounded-xl p-4 space-y-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-24" />
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export function AdminPageSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-10 w-40 rounded-lg" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-card rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-8 w-24" />
              </div>
              <Skeleton className="w-10 h-10" />
            </div>
          </div>
        ))}
      </div>

      {/* Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Invoices list */}
        <div className="bg-card rounded-xl shadow-sm lg:col-span-2">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
          <div className="divide-y divide-border">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-6 flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick System info */}
        <div className="bg-card rounded-xl p-6 shadow-sm space-y-6">
          <div className="h-6 border-b border-border pb-3">
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex justify-between border-t border-border pt-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-16 rounded" />
            </div>
            <div className="flex justify-between border-t border-border pt-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-24 rounded" />
            </div>
          </div>
          <div className="bg-accent/50 p-4 rounded-xl border border-border space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function HeaderSearchSkeleton() {
  return (
    <div className="p-4 space-y-4">
      <div className="flex gap-2 pb-2 border-b border-border">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-7 w-20 rounded-full" />
        ))}
      </div>
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-2">
            <Skeleton className="w-12 h-12 rounded-md shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="container-max py-12 space-y-8">
      <div className="space-y-3">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-5 w-2/3" />
      </div>
      <ProductGridSkeleton count={8} />
    </div>
  )
}
