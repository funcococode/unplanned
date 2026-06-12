import Link from 'next/link';
import { Lock, MapPin } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TripCard } from '@/components/shared/trip-card';
import { TripFilters } from './trip-filters';
import type { TripSummaryDto } from '@/types';

const GUEST_LIMIT = 10;

interface Props { searchParams: Record<string, string | undefined> }

export async function TripDiscovery({ searchParams }: Props) {
  const session = await auth();
  const isLoggedIn = !!session;

  const { destination, startDate, endDate, budgetRange, tripType, sort = 'newest', page = '1', limit = '12' } = searchParams;
  const p = Math.max(1, parseInt(page));
  const l = Math.min(50, parseInt(limit));

  const where = {
    ...(destination && { destination: { contains: destination, mode: 'insensitive' as const } }),
    ...(budgetRange && { budgetRange: budgetRange as never }),
    ...(tripType && { tripType: tripType as never }),
    ...(startDate && { startDate: { gte: new Date(startDate) } }),
    ...(endDate && { endDate: { lte: new Date(endDate) } }),
  };

  const orderBy = sort === 'popular'
    ? { members: { _count: 'desc' as const } }
    : { createdAt: 'desc' as const };

  const [trips, total] = await Promise.all([
    prisma.trip.findMany({
      where, orderBy, skip: (p - 1) * l, take: l,
      include: { creator: true, _count: { select: { members: true } } },
    }),
    prisma.trip.count({ where }),
  ]);

  const data: TripSummaryDto[] = trips.map((t) => ({
    id: t.id, creatorId: t.creatorId,
    creator: { id: t.creator.id, name: t.creator.name, username: t.creator.username, image: t.creator.image },
    title: t.title, destination: t.destination,
    startDate: t.startDate.toISOString(), endDate: t.endDate.toISOString(),
    budgetRange: t.budgetRange as never, maxMembers: t.maxMembers,
    currentMemberCount: t._count.members, tripType: t.tripType as never,
    coverImage: t.coverImage, createdAt: t.createdAt.toISOString(),
  }));

  // Guests see at most GUEST_LIMIT trips; the rest are replaced with a login card
  const visibleTrips = isLoggedIn ? data : data.slice(0, GUEST_LIMIT);
  const showLoginGate = !isLoggedIn && data.length === l; // more trips exist beyond what guest sees

  const totalPages = isLoggedIn ? Math.ceil(total / l) : 1;

  return (
    <div>
      <TripFilters searchParams={searchParams} />
      {data.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-zinc-950/55 dark:text-white/40 text-lg mb-2">No trips found</p>
          <p className="text-zinc-950/55 dark:text-white/40 text-sm">Try adjusting your filters or check back soon.</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-zinc-950/60 dark:text-white/50">
              {isLoggedIn ? `${total} trip${total !== 1 ? 's' : ''} found` : `Showing ${visibleTrips.length} trips — sign in to see all`}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleTrips.map((trip) => <TripCard key={trip.id} trip={trip} />)}

            {/* Login gate card */}
            {showLoginGate && (
              <Link
                href="/login?callbackUrl=/trips"
                className="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-950/10 dark:border-white/10 bg-night-soft hover:border-orange-500/50 hover:bg-orange-500/10 transition-all duration-200 min-h-[280px] p-8 text-center"
              >
                <div className="w-14 h-14 bg-zinc-950/[0.05] dark:bg-white/[0.06] group-hover:bg-orange-500/15 rounded-2xl flex items-center justify-center mb-4 transition-colors">
                  <Lock className="h-6 w-6 text-zinc-950/55 dark:text-white/40 group-hover:text-orange-500 transition-colors" />
                </div>
                <p className="text-base font-semibold text-zinc-950 dark:text-white mb-2 group-hover:text-orange-400 transition-colors">
                  See all trips
                </p>
                <p className="text-sm text-zinc-950/60 dark:text-white/50 mb-5 leading-relaxed">
                  Sign in to unlock the full list of trips, traveler profiles, and more.
                </p>
                <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500/80 group-hover:bg-orange-500 text-white text-sm font-semibold rounded-xl transition-colors">
                  <MapPin className="h-4 w-4" />
                  Sign in to explore
                </span>
              </Link>
            )}
          </div>

          {/* Pagination — only for logged-in users */}
          {isLoggedIn && totalPages > 1 && (
            <div className="flex justify-center mt-10 gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                <a
                  key={pg}
                  href={`?${new URLSearchParams({ ...searchParams, page: String(pg) }).toString()}`}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${pg === p ? 'bg-orange-500 text-white' : 'bg-night-soft text-zinc-950/90 dark:text-white/80 border border-zinc-950/10 dark:border-white/10 hover:bg-zinc-950/[0.04] dark:hover:bg-white/[0.04]'}`}
                >
                  {pg}
                </a>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
