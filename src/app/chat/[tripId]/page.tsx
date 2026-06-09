import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Navbar } from '@/components/layout/navbar';
import { ChatRoom } from '@/features/chat/chat-room';
import type { TripDto, MessageDto } from '@/types';

export default async function ChatPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect(`/login?callbackUrl=/chat/${tripId}`);
  const userId = session.user.id;

  const [trip, members, messages] = await Promise.all([
    prisma.trip.findUnique({ where: { id: tripId }, include: { creator: true, _count: { select: { members: true } } } }),
    prisma.tripMember.findMany({ where: { tripId } }),
    prisma.message.findMany({
      where: { tripId }, include: { sender: true },
      orderBy: { createdAt: 'asc' }, take: 100,
    }),
  ]);

  if (!trip) notFound();
  const isMember = members.some((m) => m.userId === userId);
  if (!isMember) redirect(`/trips/${tripId}`);

  const tripDto: TripDto = {
    id: trip.id, creatorId: trip.creatorId,
    creator: {
      id: trip.creator.id,
      name: trip.creator.name,
      username: trip.creator.username,
      image: trip.creator.image,
      bio: trip.creator.bio,
      city: trip.creator.city,
      country: trip.creator.country,
      travelStyle: trip.creator.travelStyle as never,
      languages: trip.creator.languages ?? [],
      instagram: trip.creator.instagram ?? null,
      tripsCreated: 0,
      tripsJoined: 0,
      createdAt: trip.creator.createdAt.toISOString(),
    },
    title: trip.title, description: trip.description, destination: trip.destination,
    startDate: trip.startDate.toISOString(), endDate: trip.endDate.toISOString(),
    budgetRange: trip.budgetRange as never, maxMembers: trip.maxMembers,
    currentMemberCount: trip._count.members, tripType: trip.tripType as never,
    coverImage: trip.coverImage, meetingPoint: trip.meetingPoint, rules: trip.rules,
    createdAt: trip.createdAt.toISOString(), updatedAt: trip.updatedAt.toISOString(),
  };

  const initialMessages: MessageDto[] = messages.map((m) => ({
    id: m.id, tripId: m.tripId, senderId: m.senderId,
    sender: { id: m.sender.id, name: m.sender.name, username: m.sender.username, image: m.sender.image },
    content: m.content, createdAt: m.createdAt.toISOString(),
  }));

  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <ChatRoom trip={tripDto} initialMessages={initialMessages} currentUserId={userId} />
    </div>
  );
}
