export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ensureUser } from '@/lib/ensure-user';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { TripCard } from '@/components/shared/trip-card';
import { Avatar } from '@/components/shared/avatar';
import { Badge } from '@/components/shared/badge';
import { JoinRequestActions } from '@/features/dashboard/join-request-actions';
import type { TripSummaryDto, JoinRequestDto } from '@/types';
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

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');
  const userId = session.user.id;

  // Guarantee the user row exists (handles stale tokens / first-visit edge cases)
  await ensureUser(userId, session);

  const now = new Date();

  const [upcomingTripsRaw, tripsCreated, pendingRequests, myJoinRequests] = await Promise.all([
    // Upcoming trips = any trip the user is part of (as creator OR member) starting from now
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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {session.user.name?.split(' ')[0]} 👋</h1>
          <p className="text-gray-500 mt-1">Here&apos;s everything happening with your trips.</p>
        </div>

        <div className="space-y-10">
          {pendingRequests.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Pending Requests ({pendingRequests.length})</h2>
              <div className="space-y-3">
                {pendingRequests.map((req) => (
                  <div key={req.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
                    <Avatar src={req.user.image} name={req.user.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{req.user.name}</p>
                      <p className="text-xs text-gray-500">
                        wants to join{' '}
                        <Link href={`/trips/${req.tripId}`} className="font-medium text-gray-700 hover:text-gray-900">{req.trip.title}</Link>
                        {' · '}{formatDate(req.createdAt)}
                      </p>
                    </div>
                    <JoinRequestActions requestId={req.id} />
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Upcoming Trips</h2>
              <Link href="/trips" className="text-sm text-gray-500 hover:text-gray-700">Browse more →</Link>
            </div>
            {upcomingTrips.length === 0 ? (
              <EmptyState message="No upcoming trips yet" cta={{ label: 'Explore Trips', href: '/trips' }} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingTrips.map((t) => <TripCard key={t.id} trip={t} />)}
              </div>
            )}
          </section>

          {myJoinRequests.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">My Join Requests</h2>
              <div className="space-y-3">
                {myJoinRequests.map((req) => (
                  <div key={req.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <Link href={`/trips/${req.tripId}`} className="text-sm font-semibold text-gray-900 hover:text-orange-600 transition-colors">{req.trip.title}</Link>
                      <p className="text-xs text-gray-500 mt-0.5">{req.trip.destination} · {formatDate(req.trip.startDate)}</p>
                    </div>
                    <Badge variant={req.status === 'APPROVED' ? 'success' : req.status === 'REJECTED' ? 'danger' : 'warning'}>
                      {req.status.charAt(0) + req.status.slice(1).toLowerCase()}
                    </Badge>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Trips I Created</h2>
              <Link href="/trips/new" className="text-sm text-orange-500 hover:text-orange-600 font-medium">+ Create new</Link>
            </div>
            {created.length === 0 ? (
              <EmptyState message="You haven't created any trips yet" cta={{ label: 'Create a Trip', href: '/trips/new' }} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {created.map((t) => <TripCard key={t.id} trip={t} />)}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function EmptyState({ message, cta }: { message: string; cta: { label: string; href: string } }) {
  return (
   