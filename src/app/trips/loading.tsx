import { Skeleton } from '@/components/shared/skeleton';

export default function TripsLoading() {
  return (
    <div className="min-h-screen bg-night">
      <div className="border-b border-zinc-950/10 dark:border-white/10 night-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
          <Skeleton className="h-3 w-24 mb-5" />
          <Skeleton className="h-12 w-80 max-w-full mb-4" />
          <Skeleton className="h-5 w-96 max-w-full" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex gap-3 mb-8">
          <Skeleton className="h-10 w-44" />
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-28" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl ring-1 ring-zinc-950/10 dark:ring-white/10 overflow-hidden">
              <Skeleton className="h-52 rounded-none" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
