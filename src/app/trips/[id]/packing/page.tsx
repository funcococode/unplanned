import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { TripNav } from '@/components/shared/trip-nav';
import { EssentialItems } from '@/features/trips/essential-items';
import { PersonalPacking } from '@/features/trips/personal-packing';

export default async function TripPackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [session, trip, members, essentialItems] = await Promise.all([
    auth(),
    prisma.trip.findUnique({ where: { id }, select: { id: true, title: true, coverImage: true, creatorId: true } }),
    prisma.tripMember.findMany({ where: { tripId: id }, select: { userId: true } }),
    prisma.tripEssentialItem.findMany({ where: { tripId: id }, orderBy: [{ category: 'asc' }, { order: 'asc' }] }),
  ]);
  if (!trip) notFound();

  const userId = session?.user?.id;
  const isCreator = userId === trip.creatorId;
  const isMember = members.some((m) => m.userId === userId);
  const isLoggedIn = !!session;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Compact hero */}
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
                <p className="text-zinc-950/70 dark:text-white/60 text-xs">Packing</p>
                <h1 className="text-zinc-950 dark:text-white font-semibold text-lg leading-tight">{trip.title}</h1>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <TripNav tripId={id} isMember={isCreator || isMember} />

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Essential items — host-curated */}
            <div className="lg:col-span-3">
              <EssentialItems
                tripId={trip.id}
                initialItems={essentialItems}
                isCreator={isCreator}
                isMember={isMember}
              />
            </div>

            {/* Personal checklist — per-user */}
            {isLoggedIn && (
              <div className="lg:col-span-2">
                <PersonalPacking tripId={trip.id} essentialItems={essentialItems} />
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
