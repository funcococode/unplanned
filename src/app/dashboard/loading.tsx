import { Skeleton } from '@/components/shared/skeleton';

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-night">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[300px,1fr] gap-12 lg:gap-16">
          <div className="space-y-8">
            <div className="flex items-center gap-4 lg:flex-col lg:items-start">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-7 w-44" />
              </div>
            </div>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
            </div>
            <div className="space-y-2.5">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-11" />)}
            </div>
          </div>
          <div className="space-y-10">
            <div>
              <Skeleton className="h-4 w-40 mb-5" />
              <div className="space-y-3">
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
              </div>
            </div>
            <div>
              <Skeleton className="h-8 w-52 mb-6" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-2xl ring-1 ring-zinc-950/10 dark:ring-white/10 overflow-hidden">
                    <Skeleton className="h-44 rounded-none" />
                    <div className="p-4 space-y-2.5">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
