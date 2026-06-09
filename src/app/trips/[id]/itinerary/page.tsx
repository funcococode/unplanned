import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, ArrowLeft } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { TripNav } from '@/components/shared/trip-nav';
import { ItineraryTimeline } from '@/features/itinerary/itinerary-timeline';
import { ItineraryRouteMap } from '@/features/itinerary/itinerary-route-map';

export default async function TripItineraryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [session, trip, members, itineraryDays] = await Promise.all([
    auth(),
    prisma.trip.findUnique({ where: { id }, select: { id: true, title: true, coverImage: true, creatorId: true } }),
    prisma.tripMember.findMany({ where: { tripId: id }, select: { userId: true } }),
    prisma.itineraryDay.findMany({
      where: { tripId: id }, orderBy: { dayNumber: 'asc' },
      include: {
        items: {
          orderBy: [{ order: 'asc' }, { time: 'asc' }],
          include: { suggester: { select: { id: true, name: true, image: true, username: true } } },
        },
      },
    }),
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
        <div className="relative h-36 bg-gradient-to-br from-gray-100 to-gray-200">
          {trip.coverImage && (
            <Image src={trip.coverImage} alt={trip.title} fill className="object-cover" priority sizes="100vw" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/10" />
          <div className="absolute inset-0 flex items-end">
            <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 pb-4 flex items-center gap-3">
              <Link href={`/trips/${id}`} className="text-white/70 hover:text-white transition-colors">
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div>
                <p className="text-white/60 text-xs">Itinerary</p>
                <h1 className="text-white font-semibold text-lg leading-tight">{trip.title}</h1>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <TripNav tripId={id} isMember={isCreator || isMember} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                A rough plan — not written in stone. Suggest stops, vote on ideas, change on the go.
              </p>
              <ItineraryTimeline
                tripId={trip.id}
                initialDays={itineraryDays as any}
                isCreator={isCreator}
                isMember={isMember}
                isLoggedIn={isLoggedIn}
                currentUserId={userId}
              />
            </div>
            {itineraryDays.length > 0 && (
              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <ItineraryRouteMap
                    days={itineraryDays.map((d) => ({
                      dayNumber: d.dayNumber,
                      title: d.title,
                      date: d.date ? d.date.toISOString() : null,
                    }))}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
