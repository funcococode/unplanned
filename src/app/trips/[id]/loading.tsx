import { Skeleton } from '@/components/shared/skeleton';

export default function TripLoading() {
  return (
    <div className="min-h-screen bg-night">
      {/* Hero skeleton */}
      <div className="relative h-96 sm:h-[480px] overflow-hidden">
        <Skeleton className="absolute inset-0 rounded-none" />
        <div className="absolute bottom-0 left-0 right-0 p-6 pb-10">
          <div className="max-w-5xl mx-auto space-y-4">
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <Skeleton className="h-12 sm:h-16 w-2/3" />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Tab bar */}
        <Skeleton className="h-12 w-full max-w-md mb-8" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28" />
              ))}
            </div>
            <div className="space-y-3">
              <Skeleton className="h-6 w-44" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-6 w-36" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          </div>
          <div className="space-y-6">
            <Skeleton className="h-44" />
            <Skeleton className="h-56" />
          </div>
        </div>
      </div>
    </div>
  );
}
