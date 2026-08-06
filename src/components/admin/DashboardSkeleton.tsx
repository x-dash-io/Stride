'use client'

export function DashboardSkeleton() {
  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="text-left">
          <div className="h-10 w-64 bg-muted animate-pulse rounded" />
          <div className="h-5 w-96 bg-muted animate-pulse rounded mt-2" />
        </div>
        <div className="h-10 w-32 bg-muted animate-pulse rounded self-start md:self-end" />
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-5 gap-6">
        {/* Primary - spans 2 columns */}
        <div className="md:col-span-3 lg:col-span-2">
          <div className="bg-card rounded-xl p-6 shadow-sm border-2 border-secondary/20 bg-gradient-to-br from-secondary/10 via-secondary/5 to-transparent animate-pulse">
            <div className="flex flex-col justify-between h-full space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="h-3 w-24 bg-muted rounded" />
                  <div className="h-10 w-40 bg-muted rounded mt-2" />
                </div>
                <div className="h-10 w-10 bg-muted rounded-xl" />
              </div>
              <div className="h-3 w-64 bg-muted rounded" />
            </div>
          </div>
        </div>
        
        {/* Secondary cards */}
        <div className="md:col-span-3 lg:col-span-1">
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border/50 animate-pulse">
            <div className="flex flex-col justify-between h-full space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="h-3 w-24 bg-muted rounded" />
                  <div className="h-10 w-24 bg-muted rounded mt-1" />
                </div>
                <div className="h-10 w-10 bg-muted rounded-xl" />
              </div>
              <div className="h-3 w-48 bg-muted rounded" />
            </div>
          </div>
        </div>
        
        <div className="md:col-span-3 lg:col-span-1">
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border/50 animate-pulse">
            <div className="flex flex-col justify-between h-full space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="h-3 w-24 bg-muted rounded" />
                  <div className="h-10 w-24 bg-muted rounded mt-1" />
                </div>
                <div className="h-10 w-10 bg-muted rounded-xl" />
              </div>
              <div className="h-3 w-48 bg-muted rounded" />
            </div>
          </div>
        </div>
        
        <div className="md:col-span-3 lg:col-span-1">
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border/50 animate-pulse">
            <div className="flex flex-col justify-between h-full space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="h-3 w-24 bg-muted rounded" />
                  <div className="h-10 w-24 bg-muted rounded mt-1" />
                </div>
                <div className="h-10 w-10 bg-muted rounded-xl" />
              </div>
              <div className="h-3 w-48 bg-muted rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Chart Skeleton */}
      <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border">
          <div className="h-6 w-48 bg-muted animate-pulse rounded" />
        </div>
        <div className="p-6">
          <div className="h-[300px] w-full bg-muted animate-pulse rounded" />
        </div>
      </div>

      {/* Detail Tables Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left panel */}
        <div className="bg-card rounded-xl border border-border/50 shadow-sm lg:col-span-6 overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div className="h-6 w-40 bg-muted animate-pulse rounded" />
            <div className="h-8 w-24 bg-muted animate-pulse rounded" />
          </div>
          <div className="divide-y divide-border">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-48 bg-muted animate-pulse rounded mt-1" />
                </div>
                <div className="text-right flex flex-col items-end gap-1.5">
                  <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                  <div className="h-5 w-20 bg-muted animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div className="bg-card rounded-xl border border-border/50 shadow-sm lg:col-span-6 overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div className="h-6 w-40 bg-muted animate-pulse rounded" />
          </div>
          <div className="divide-y divide-border">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <div className="h-4 w-40 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-48 bg-muted animate-pulse rounded mt-1" />
                </div>
                <div className="text-right flex flex-col items-end gap-1.5">
                  <div className="h-5 w-24 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-20 bg-muted animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}