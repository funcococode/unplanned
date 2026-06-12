import { Skeleton } from '@/components/shared/skeleton';

export default function ChatLoading() {
  return (
    <div className="min-h-screen bg-night">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="space-y-4">
          <Skeleton className="h-12 w-2/3" />
          <Skeleton className="h-12 w-1/2 ml-auto" />
          <Skeleton className="h-12 w-3/5" />
          <Skeleton className="h-12 w-2/5 ml-auto" />
          <Skeleton className="h-12 w-1/2" />
        </div>
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}
