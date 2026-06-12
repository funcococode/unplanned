import { Skeleton } from '@/components/shared/skeleton';

export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-night">
      <div className="border-b border-zinc-950/10 dark:border-white/10 night-grid">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-0">
          <Skeleton className="h-3 w-32 mb-6" />
          <div className="flex items-end justify-between gap-6">
            <Skeleton className="h-14 w-72 max-w-full" />
            <div className="flex gap-8">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-14" />)}
            </div>
          </div>
          <div className="mt-10 -mb-14">
            <Skeleton className="h-28 w-28 rounded-full" />
          </div>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-12 space-y-6">
        <Skeleton className="h-5 w-2/3" />
        <div className="grid grid-cols-1 lg:grid-cols-[7fr,5fr] gap-6">
          <div className="space-y-6">
            <Skeleton className="h-44" />
            <Skeleton className="h-56" />
          </div>
          <Skeleton className="h-48" />
        </div>
      </div>
    </div>
  );
}
