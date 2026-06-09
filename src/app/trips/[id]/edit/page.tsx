import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Navbar } from '@/components/layout/navbar';
import { EditTripForm } from '@/features/trips/edit-trip-form';
import type { TripDto } from '@/types';

export const metadata = { title: 'Edit Trip' };

export default async function EditTripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session) redirect(`/login?callbackUrl=/trips/${id}/edit`);

  const trip = await prisma.trip.findUnique({
    where: { id },
    include: { creator: true, _count: { select: { members: true } } },
  });
  if (!trip) notFound();
  if (trip.creatorId !== session.user.id) redirect(`/trips/${id}`);

  const tripDto: TripDto = {
    id: trip.id, creatorId: trip.creatorId,
    creator: { id: trip.creator.id, name: trip.creator.name, username: trip.creator.username, image: trip.creator.image, bio: trip.creator.bio, city: trip.creator.city, country: trip.creator.country, travelStyle: trip.creator.travelStyle as never, tripsCreated: 0, tripsJoined: 0, createdAt: trip.creator.createdAt.toISOString() },
    title: trip.title, description: trip.description, destination: trip.destination,
    startDate: trip.startDate.toISOString(), endDate: trip.endDate.toISOString(),
    budgetRange: trip.budgetRange as never, maxMembers: trip.maxMembers,
    currentMemberCount: trip._count.members, tripType: trip.tripType as never,
    coverImage: trip.coverImage, meetingPoint: trip.meetingPoint, rules: trip.rules,
    createdAt: trip.createdAt.toISOString(), updatedAt: trip.updatedAt.toISOString(),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Trip</h1>
          <p className="text-gray-500">Update your trip details.</p>
        </div>
        <EditTripForm trip={tripDto} />
      </main>
    </div>
  );
}
