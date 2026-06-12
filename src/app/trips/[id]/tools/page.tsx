import { notFound, redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { TripNav } from '@/components/shared/trip-nav';
import { ExpenseTracker } from '@/features/trips/expense-tracker';
import { TripPolls } from '@/features/trips/trip-polls';
import { EmergencyInfoCard } from '@/features/trips/emergency-info';
import { TripTasks } from '@/features/trips/trip-tasks';
import { InviteLink } from '@/features/trips/invite-link';
import { TripStatusControl } from '@/features/trips/trip-status';

export default async function TripToolsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [session, trip, members] = await Promise.all([
    auth(),
    prisma.trip.findUnique({ where: { id }, select: { id: true, title: true, coverImage: true, creatorId: true, status: true } }),
    prisma.tripMember.findMany({ where: { tripId: id }, select: { userId: true, user: { select: { id: true, name: true, image: true } } } }),
  ]);
  if (!trip) notFound();

  const userId = session?.user?.id;
  const isCreator = userId === trip.creatorId;
  const isMember = members.some((m) => m.userId === userId);

  if (!isCreator && !isMember) redirect(`/trips/${id}`);

  const memberList = members.map((m) => ({ id: m.user.id, name: m.user.name, image: m.user.image }));

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="relative h-36 bg-gradient-to-br from-night-soft to-night">
          {trip.coverImage && (
            <Image src={trip.coverImage} alt={trip.title} fill className="object-cover" priority sizes="100vw" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/10" />
          <div className="absolute inset-0 flex items-end">
            <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 pb-4 flex items-center gap-3">
              <Link href={`/trips/${id}`} className="text-zinc-950/80 dark:text-white/70 hover:text-zinc-950 dark:hover:text-white transition-colors">
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div>
                <p className="text-zinc-950/70 dark:text-white/60 text-xs">Trip Tools</p>
                <h1 className="text-zinc-950 dark:text-white font-semibold text-lg leading-tight">{trip.title}</h1>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <TripNav tripId={id} isMember={true} />

          <div className="space-y-6">
            {/* Trip status */}
            <div className="bg-night-soft border border-zinc-950/10 dark:border-white/10 rounded-2xl p-6">
              <h3 className="font-semibold text-zinc-950 dark:text-white mb-4">Trip Status</h3>
              <TripStatusControl
                tripId={trip.id}
                initialStatus={trip.status as 'PLANNING' | 'CONFIRMED' | 'ONGOING' | 'COMPLETED'}
                isCreator={isCreator}
              />
            </div>

            {/* Invite link — creator only */}
            {isCreator && (
              <div className="bg-night-soft border border-zinc-950/10 dark:border-white/10 rounded-2xl p-6">
                <InviteLink tripId={trip.id} />
              </div>
            )}

            {/* Tasks */}
            <div className="bg-night-soft border border-zinc-950/10 dark:border-white/10 rounded-2xl p-6">
              <TripTasks
                tripId={trip.id}
                members={memberList}
                currentUserId={userId ?? ''}
                isCreator={isCreator}
              />
            </div>

            {/* Expense tracker */}
            <div className="bg-night-soft border border-zinc-950/10 dark:border-white/10 rounded-2xl p-6">
              <ExpenseTracker
                tripId={trip.id}
                members={memberList}
                currentUserId={userId ?? ''}
                isCreator={isCreator}
              />
            </div>

            {/* Polls */}
            <div className="bg-night-soft border border-zinc-950/10 dark:border-white/10 rounded-2xl p-6">
              <TripPolls tripId={trip.id} isCreator={isCreator} currentUserId={userId ?? ''} />
            </div>

            {/* Emergency info */}
            <div className="bg-night-soft border border-zinc-950/10 dark:border-white/10 rounded-2xl p-6">
              <EmergencyInfoCard tripId={trip.id} isCreator={isCreator} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
