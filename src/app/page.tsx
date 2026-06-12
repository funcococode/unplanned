import Link from 'next/link';
import { ArrowRight, Plus, Compass, MapPin, Clock } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { TripCard } from '@/components/shared/trip-card';
import { Avatar } from '@/components/shared/avatar';
import { MarketingLanding } from '@/components/landing/marketing-landing';
import { FadeUp, StaggerGroup, StaggerItem } from '@/components/motion';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { TripSummaryDto } from '@/types';

async function getFeaturedTrips(): Promise<TripSummaryDto[]> {
  try {
    const trips = await prisma.trip.findMany({
      take: 3, orderBy: { createdAt: 'desc' },
      include: { creator: true, _count: { select: { members: true } } },
    });
    return trips.map((t) => ({
      id: t.id, creatorId: t.creatorId,
      creator: { id: t.creator.id, name: t.creator.name, username: t.creator.username, image: t.creator.image },
      title: t.title, destination: t.destination,
      startDate: t.startDate.toISOString(), endDate: t.endDate.toISOString(),
      budgetRange: t.budgetRange as never, maxMembers: t.maxMembers,
      currentMemberCount: t._count.members, tripType: t.tripType as never,
      coverImage: t.coverImage, createdAt: t.createdAt.toISOString(),
    }));
  } catch { return []; }
}

async function getUserDashboardData(userId: string) {
  const now = new Date();
  const [upcomingTrips, createdTrips, pendingRequests] = await Promise.all([
    prisma.trip.findMany({
      where: {
        startDate: { gte: now },
        OR: [{ creatorId: userId }, { members: { some: { userId } } }],
      },
      include: { creator: true, _count: { select: { members: true } } },
      orderBy: { startDate: 'asc' },
      take: 3,
    }),
    prisma.trip.count({ where: { creatorId: userId } }),
    prisma.joinRequest.count({ where: { status: 'PENDING', trip: { creatorId: userId } } }),
  ]);
  return { upcomingTrips, createdTrips, pendingRequests };
}

export default async function HomePage() {
  const [session, featuredTrips] = await Promise.all([auth(), getFeaturedTrips()]);

  // ── Logged-in home ───────────────────────────────────────────────────────────
  if (session?.user?.id) {
    const userId = session.user.id;
    const { upcomingTrips, createdTrips, pendingRequests } = await getUserDashboardData(userId);

    const toSummary = (t: any): TripSummaryDto => ({
      id: t.id, creatorId: t.creatorId,
      creator: { id: t.creator.id, name: t.creator.name, username: t.creator.username, image: t.creator.image },
      title: t.title, destination: t.destination,
      startDate: t.startDate.toISOString(), endDate: t.endDate.toISOString(),
      budgetRange: t.budgetRange, maxMembers: t.maxMembers,
      currentMemberCount: t._count?.members ?? 0,
      tripType: t.tripType, coverImage: t.coverImage,
      createdAt: t.createdAt.toISOString(),
    });

    return (
      <div className="min-h-screen flex flex-col bg-night relative overflow-x-clip">
        <div className="absolute w-[560px] h-[560px] rounded-full blur-3xl bg-orange-600/15 -top-48 -right-32 pointer-events-none animate-pulse-glow" aria-hidden="true" />
        <Navbar />
        <main className="relative flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">

          {/* Welcome + stats band */}
          <FadeUp>
            <div className="relative overflow-hidden bg-zinc-950/[0.03] dark:bg-white/[0.03] night-grid rounded-3xl ring-1 ring-zinc-950/10 dark:ring-white/10 px-6 sm:px-10 py-10 mb-10">
              <div className="absolute w-[320px] h-[320px] rounded-full blur-3xl bg-orange-600/15 -top-36 -right-16 pointer-events-none animate-pulse-glow" aria-hidden="true" />
              <div className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-8">
                <div className="flex items-center gap-5">
                  <Avatar src={session.user.image} name={session.user.name} size="xl" className="ring-2 ring-orange-500/40" />
                  <div>
                    <span className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-orange-400">Mission control</span>
                    <h1 className="font-display text-3xl sm:text-4xl font-bold text-zinc-950 dark:text-white mt-2">
                      Hey, {session.user.name?.split(' ')[0]} 👋
                    </h1>
                    <p className="text-zinc-950/60 dark:text-white/50 text-sm mt-1">Where to next?</p>
                  </div>
                </div>
                <div className="flex gap-8 sm:gap-10">
                  {[
                    { label: 'created',  value: createdTrips },
                    { label: 'upcoming', value: upcomingTrips.length },
                    { label: 'requests', value: pendingRequests },
                  ].map(({ label, value }) => (
                    <Link key={label} href="/dashboard" className="group">
                      <p className="font-display text-3xl font-bold bg-gradient-to-br from-orange-400 to-amber-300 bg-clip-text text-transparent">{value}</p>
                      <p className="text-xs uppercase tracking-[0.15em] text-zinc-950/55 dark:text-white/40 mt-1 transition-colors duration-300 group-hover:text-zinc-950/80 dark:group-hover:text-white/70">{label}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </FadeUp>

          {/* Quick actions */}
          <StaggerGroup className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10" stagger={0.08}>
            {[
              { href: '/trips/new',   icon: Plus,    label: 'Create a Trip',   desc: 'Start planning something new',  bg: 'bg-orange-500' },
              { href: '/trips',       icon: Compass, label: 'Explore Trips',   desc: 'Find trips to join',            bg: 'bg-sky-500'    },
              { href: '/dashboard',   icon: Clock,   label: 'My Dashboard',    desc: 'Requests, history & more',      bg: 'bg-violet-500' },
            ].map(({ href, icon: Icon, label, desc, bg }) => (
              <StaggerItem key={href}>
                <Link href={href}
                  className="flex items-center gap-4 p-4 bg-zinc-950/[0.04] dark:bg-white/[0.04] backdrop-blur-sm rounded-2xl ring-1 ring-zinc-950/10 dark:ring-white/10 transition-colors duration-300 hover:ring-orange-500/40 hover:bg-zinc-950/[0.05] dark:hover:bg-white/[0.06] group">
                  <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center shrink-0`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-zinc-950 dark:text-white transition-colors duration-300 group-hover:text-orange-300">{label}</p>
                    <p className="text-xs text-zinc-950/55 dark:text-white/40 truncate">{desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-zinc-950/45 dark:text-white/30 transition-colors duration-300 group-hover:text-orange-400 ml-auto shrink-0" />
                </Link>
              </StaggerItem>
            ))}
          </StaggerGroup>

          {/* Upcoming trips */}
          {upcomingTrips.length > 0 && (
            <section className="mb-10">
              <FadeUp>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-display text-lg font-semibold text-zinc-950 dark:text-white">Your upcoming trips</h2>
                  <Link href="/dashboard" className="text-sm text-orange-400 transition-colors duration-300 hover:text-orange-300 font-medium">View all →</Link>
                </div>
              </FadeUp>
              <StaggerGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" stagger={0.08}>
                {upcomingTrips.map((t) => (
                  <StaggerItem key={t.id}><TripCard trip={toSummary(t)} /></StaggerItem>
                ))}
              </StaggerGroup>
            </section>
          )}

          {upcomingTrips.length === 0 && (
            <FadeUp>
              <div className="mb-10 flex flex-col items-center justify-center py-16 bg-zinc-950/[0.03] dark:bg-white/[0.03] rounded-2xl border border-dashed border-zinc-950/15 dark:border-white/15 text-center">
                <MapPin className="h-10 w-10 text-zinc-950/35 dark:text-white/20 mb-4" />
                <p className="text-zinc-950/70 dark:text-white/60 font-medium mb-1">No upcoming trips yet</p>
                <p className="text-sm text-zinc-950/55 dark:text-white/40 mb-5">Create one or explore trips to join</p>
                <div className="flex gap-3">
                  <Link href="/trips/new" className="px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-xl shadow-[0_0_24px_-8px_rgba(249,115,22,0.6)] transition-all duration-300 hover:bg-orange-400">
                    Create a Trip
                  </Link>
                  <Link href="/trips" className="px-4 py-2 bg-zinc-950/[0.05] dark:bg-white/[0.06] text-zinc-950 dark:text-white text-sm font-semibold rounded-xl ring-1 ring-zinc-950/15 dark:ring-white/15 transition-all duration-300 hover:bg-zinc-950/[0.06] dark:hover:bg-white/10">
                    Explore
                  </Link>
                </div>
              </div>
            </FadeUp>
          )}

          {/* Discover new trips */}
          {featuredTrips.length > 0 && (
            <section>
              <FadeUp>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-display text-lg font-semibold text-zinc-950 dark:text-white">Discover trips</h2>
                  <Link href="/trips" className="text-sm text-orange-400 transition-colors duration-300 hover:text-orange-300 font-medium">Browse all →</Link>
                </div>
              </FadeUp>
              <StaggerGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" stagger={0.08}>
                {featuredTrips.map((trip) => (
                  <StaggerItem key={trip.id}><TripCard trip={trip} /></StaggerItem>
                ))}
              </StaggerGroup>
            </section>
          )}

        </main>
        <Footer />
      </div>
    );
  }

  // ── Marketing home (logged out) ──────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden bg-night">
      <Navbar />
      <MarketingLanding featuredTrips={featuredTrips} />
      <Footer />
    </div>
  );
}
