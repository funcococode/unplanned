import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { PageHero } from '@/components/layout/page-hero';
import { TripDiscovery } from '@/features/trips/trip-discovery';

export const metadata = { title: 'Explore Trips' };

export default async function TripsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;

  return (
    <div className="min-h-screen flex flex-col bg-night">
      <Navbar />
      <PageHero
        eyebrow="Explore"
        title={<>Find your <span className="bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">next crew.</span></>}
        description="Real trips from real travelers, all with open spots. Pick one, request to join, pack your bag."
      >
        <Link
          href="/trips/new"
          className="group flex items-center gap-4 bg-zinc-950/[0.04] dark:bg-white/[0.04] backdrop-blur-sm rounded-2xl ring-1 ring-zinc-950/10 dark:ring-white/10 p-5 max-w-xs transition-colors duration-300 hover:ring-orange-500/40"
        >
          <div>
            <p className="text-sm font-semibold text-zinc-950 dark:text-white">Hosting one?</p>
            <p className="text-xs text-zinc-950/55 dark:text-white/40 mt-0.5">Post your trip and let the crew find you.</p>
          </div>
          <ArrowRight className="h-4 w-4 text-orange-400 shrink-0 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </PageHero>
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <Suspense fallback={<TripDiscoverySkeleton />}>
          <TripDiscovery searchParams={params} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

function TripDiscoverySkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-night-soft rounded-2xl border border-zinc-950/10 dark:border-white/10 overflow-hidden animate-pulse">
          <div className="h-52 bg-zinc-950/[0.05] dark:bg-white/[0.06]" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-zinc-950/[0.05] dark:bg-white/[0.06] rounded w-3/4" />
            <div className="h-3 bg-zinc-950/[0.05] dark:bg-white/[0.06] rounded w-1/2" />
            <div className="h-3 bg-zinc-950/[0.05] dark:bg-white/[0.06] rounded w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
