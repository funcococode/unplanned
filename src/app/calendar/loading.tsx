import { Skeleton } from '@/components/shared/skeleton';

export default function CalendarLoading() {
  return (
    <div className="min-h-screen bg-night">
      <div className="border-b border-zinc-950/10 dark:border-white/10 night-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
          <Skeleton className="h-3 w-24 mb-5" />
          <Skeleton className="h-12 w-96 max-w-full mb-4" />
          <Skeleton className="h-5 w-80 max-w-full" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-8 w-28" />
        </div>
        <Skeleton className="h-[560px]" />
      </div>
    </div>
  );
}
