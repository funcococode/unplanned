export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, Compass, CalendarDays, Inbox } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ensureUser } from '@/lib/ensure-user';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { TripCard } from '@/components/shared/trip-card';
import { Avatar } from '@/components/shared/avatar';
import { Badge } from '@/components/shared/badge';
import { JoinRequestActions } from '@/features/dashboard/join-request-actions';
import { FadeUp, StaggerGroup, StaggerItem } from '@/components/motion';
import type { TripSummaryDto } from '@/types';
import { formatDate } from '@/lib/utils';

export const metadata = { title: 'Dashboard' };

function tripToSummary(t: any): TripSummaryDto {
  return {
    id: t.id, creatorId: t.creatorId,
    creator: { id: t.creator.id, name: t.creator.name, username: t.creator.username, image: t.creator.image },
    title: t.title, destination: t.destination,
    startDate: t.startDate.toISOString(), endDate: t.endDate.toISOString(),
    budgetRange: t.budgetRange, maxMembers: t.maxMembers,
    currentMemberCount: t._count?.members ?? 0,
    tripType: t.tripType, coverImage: t.coverImage,
    createdAt: t.createdAt.toISOString(),
  };
}

const sectionLabel = 'font-display text-xs font-semibold uppercase tracking-[0.3em] text-orange-400';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');
  const userId = session.user.id;

  await ensureUser(userId, session);

  const now = new Date();

  const [upcomingTripsRaw, tripsCreated, pendingRequests, myJoinRequests] = await Promise.all([
    prisma.trip.findMany({
      where: {
        startDate: { gte: now },
        OR: [
          { creatorId: userId },
          { members: { some: { userId } } },
        ],
      },
      include: { creator: true, _count: { select: { members: true } } },
      orderBy: { startDate: 'asc' },
      take: 10,
    }),
    prisma.trip.findMany({
      where: { creatorId: userId },
      include: { creator: true, _count: { select: { members: true } } },
      orderBy: { createdAt: 'desc' }, take: 10,
    }),
    prisma.joinRequest.findMany({
      where: { status: 'PENDING', trip: { creatorId: userId } },
      include: { trip: { include: { creator: true, _count: { select: { members: true } } } }, user: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.joinRequest.findMany({
      where: { userId },
      include: { trip: { include: { creator: true, _count: { select: { members: true } } } }, user: true },
      orderBy: { createdAt: 'desc' }, take: 20,
    }),
  ]);

  const upcomingTrips = upcomingTripsRaw.map(tripToSummary);
  const created = tripsCreated.map(tripToSummary);

  const stats = [
    { label: 'Upcoming trips',   value: upcomingTrips.length,   color: 'text-orange-400' },
    { label: 'Trips created',    value: created.length,         color: 'text-amber-300' },
    { label: 'Pending requests', value: pendingRequests.length, color: 'text-sky-400' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-night relative overflow-x-clip">
      <div className="absolute w-[520px] h-[520px] rounded-full blur-3xl bg-orange-600/15 -top-56 -left-40 pointer-events-none animate-pulse-glow" aria-hidden="true" />
      <Navbar />
      <main className="relative flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[300px,1fr] gap-12 lg:gap-16">

          {/* ── Sticky profile rail ── */}
          <aside className="lg:sticky lg:top-24 self-start">
            <FadeUp>
              <div className="flex items-center gap-4 lg:flex-col lg:items-start">
                <Avatar src={session.user.image} name={session.user.name} size="xl" className="ring-2 ring-orange-500/40" />
                <div>
                  <span className={sectionLabel}>Dashboard</span>
                  <h1 className="font-display text-2xl font-bold text-zinc-950 dark:text-white mt-1.5 leading-tight">
                    {session.user.name?.split(' ')[0]}&rsquo;s missions
                  </h1>
                </div>
              </div>
            </FadeUp>

            <StaggerGroup className="mt-8 space-y-3" stagger={0.07}>
              {stats.map(({ label, value, color }) => (
                <StaggerItem key={label}>
                  <div className="flex items-baseline justify-between bg-zinc-950/[0.04] dark:bg-white/[0.04] rounded-xl ring-1 ring-zinc-950/10 dark:ring-white/10 px-4 py-3">
                    <span className="text-sm text-zinc-950/60 dark:text-white/50">{label}</span>
                    <span className={`font-display text-2xl font-bold ${color}`}>{value}</span>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGroup>

            <FadeUp delay={0.3}>
              <div className="mt-8 space-y-2.5">
                <Link href="/trips/new" className="flex items-center justify-center gap-2 w-full py-3 bg-orange-500 text-white text-sm font-bold rounded-xl shadow-[0_0_24px_-8px_rgba(249,115,22,0.6)] transition-all duration-300 hover:bg-orange-400">
                  <Plus className="h-4 w-4" /> Create a Trip
                </Link>
                <Link href="/trips" className="flex items-center justify-center gap-2 w-full py-3 bg-zinc-950/[0.05] dark:bg-white/[0.06] text-zinc-950 dark:text-white text-sm font-bold rounded-xl ring-1 ring-zinc-950/15 dark:ring-white/15 transition-all duration-300 hover:bg-zinc-950/[0.06] dark:hover:bg-white/10">
                  <Compass className="h-4 w-4" /> Explore Trips
                </Link>
                <Link href="/calendar" className="flex items-center justify-center gap-2 w-full py-3 bg-zinc-950/[0.05] dark:bg-white/[0.06] text-zinc-950 dark:text-white text-sm font-bold rounded-xl ring-1 ring-zinc-950/15 dark:ring-white/15 transition-all duration-300 hover:bg-zinc-950/[0.06] dark:hover:bg-white/10">
                  <CalendarDays className="h-4 w-4" /> Calendar
                </Link>
              </div>
            </FadeUp>
          </aside>

          {/* ── Content column ── */}
          <div className="space-y-14 min-w-0">

            {pendingRequests.length > 0 && (
              <section>
                <FadeUp>
                  <div className="flex items-center gap-3 mb-5">
                    <span className={sectionLabel}>Needs your call</span>
                    <span className="px-2 py-0.5 bg-orange-500/15 text-orange-300 text-xs font-bold rounded-full">{pendingRequests.length}</span>
                  </div>
                </FadeUp>
                <StaggerGroup className="space-y-3" stagger={0.07}>
                  {pendingRequests.map((req) => (
                    <StaggerItem key={req.id}>
                      <div className="bg-zinc-950/[0.04] dark:bg-white/[0.04] backdrop-blur-sm rounded-2xl ring-1 ring-orange-500/25 p-4 flex items-center gap-4 transition-colors duration-300 hover:ring-orange-500/50">
                        <Avatar src={req.user.image} name={req.user.name} size="md" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-zinc-950 dark:text-white">{req.user.name}</p>
                          <p className="text-xs text-zinc-950/60 dark:text-white/50">
                            wants to join{' '}
                            <Link href={`/trips/${req.tripId}`} className="font-medium text-orange-300 transition-colors hover:text-orange-200">{req.trip.title}</Link>
                            {' · '}{formatDate(req.createdAt)}
                          </p>
                        </div>
                        <JoinRequestActions requestId={req.id} />
                      </div>
                    </StaggerItem>
                  ))}
                </StaggerGroup>
              </section>
            )}

            <section>
              <FadeUp>
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <span className={sectionLabel}>On the horizon</span>
                    <h2 className="font-display text-2xl font-bold text-zinc-950 dark:text-white mt-1.5">Upcoming trips</h2>
                  </div>
                  <Link href="/trips" className="text-sm font-bold text-zinc-950/60 dark:text-white/50 transition-colors duration-300 hover:text-orange-400">Browse more →</Link>
                </div>
              </FadeUp>
              {upcomingTrips.length === 0 ? (
                <EmptyState message="No upcoming trips yet" cta={{ label: 'Explore Trips', href: '/trips' }} />
              ) : (
                <StaggerGroup className="grid grid-cols-1 sm:grid-cols-2 gap-6" stagger={0.08}>
                  {upcomingTrips.map((t) => <StaggerItem key={t.id}><TripCard trip={t} /></StaggerItem>)}
                </StaggerGroup>
              )}
            </section>

            {myJoinRequests.length > 0 && (
              <section>
                <FadeUp>
                  <div className="mb-6">
                    <span className={sectionLabel}>Waiting on hosts</span>
                    <h2 className="font-display text-2xl font-bold text-zinc-950 dark:text-white mt-1.5">My join requests</h2>
                  </div>
                </FadeUp>
                <StaggerGroup className="space-y-3" stagger={0.06}>
                  {myJoinRequests.map((req) => (
                    <StaggerItem key={req.id}>
                      <div className="bg-zinc-950/[0.04] dark:bg-white/[0.04] rounded-2xl ring-1 ring-zinc-950/10 dark:ring-white/10 p-4 flex items-center gap-4 transition-colors duration-300 hover:ring-zinc-950/20 dark:hover:ring-white/20">
                        <div className="flex-1 min-w-0">
                          <Link href={`/trips/${req.tripId}`} className="text-sm font-semibold text-zinc-950 dark:text-white transition-colors hover:text-orange-400">{req.trip.title}</Link>
                          <p className="text-xs text-zinc-950/60 dark:text-white/50 mt-0.5">{req.trip.destination} · {formatDate(req.trip.startDate)}</p>
                        </div>
                        <Badge variant={req.status === 'APPROVED' ? 'success' : req.status === 'REJECTED' ? 'danger' : 'warning'}>
                          {req.status.charAt(0) + req.status.slice(1).toLowerCase()}
                        </Badge>
                      </div>
                    </StaggerItem>
                  ))}
                </StaggerGroup>
              </section>
            )}

            <section>
              <FadeUp>
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <span className={sectionLabel}>Captain&rsquo;s log</span>
                    <h2 className="font-display text-2xl font-bold text-zinc-950 dark:text-white mt-1.5">Trips I created</h2>
                  </div>
                  <Link href="/trips/new" className="text-sm font-bold text-orange-400 transition-colors duration-300 hover:text-orange-300">+ Create new</Link>
                </div>
              </FadeUp>
              {created.length === 0 ? (
                <EmptyState message="You haven't created any trips yet" cta={{ label: 'Create a Trip', href: '/trips/new' }} />
              ) : (
                <StaggerGroup className="grid grid-cols-1 sm:grid-cols-2 gap-6" stagger={0.08}>
                  {created.map((t) => <StaggerItem key={t.id}><TripCard trip={t} /></StaggerItem>)}
                </StaggerGroup>
              )}
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function EmptyState({ message, cta }: { message: string; cta: { label: string; href: string } }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 bg-zinc-950/[0.03] dark:bg-white/[0.03] rounded-2xl border border-dashed border-zinc-950/15 dark:border-white/15 text-center">
      <Inbox className="h-8 w-8 text-zinc-950/35 dark:text-white/20 mb-3" />
      <p className="text-zinc-950/60 dark:text-white/50 mb-4">{message}</p>
      <Link
        href={cta.href}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-xl shadow-[0_0_24px_-8px_rgba(249,115,22,0.6)] transition-all duration-300 hover:bg-orange-400"
      >
        {cta.label}
      </Link>
    </div>
  );
}
