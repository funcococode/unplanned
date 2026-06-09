import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';

export async function GET() {
  const result = await requireAuth();
  if (result.error) return result.error;
  const { userId } = result;

  const now = new Date();

  const [upcomingMemberships, tripsCreated, pendingRequests, myJoinRequests] = await Promise.all([
    prisma.tripMember.findMany({
      where: { userId, role: 'MEMBER', trip: { startDate: { gte: now } } },
      include: { trip: { include: { creator: true, _count: { select: { members: true } } } } },
      orderBy: { trip: { startDate: 'asc' } }, take: 10,
    }),
    prisma.trip.findMany({
      where: { creatorId: userId },
      include: { creator: true, _count: { select: { members: true } } },
      orderBy: { createdAt: 'desc' }, take: 10,
    }),
    prisma.joinRequest.findMany({
      where: { status: 'PENDING', trip: { creatorId: userId } },
      include: {
        trip: { include: { creator: true, _count: { select: { members: true } } } },
        user: true,
      },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.joinRequest.findMany({
      where: { userId },
      include: {
        trip: { include: { creator: true, _count: { select: { members: true } } } },
        user: true,
      },
      orderBy: { createdAt: 'desc' }, take: 20,
    }),
  ]);

  const toTrip = (t: any) => ({
    id: t.id, creatorId: t.creatorId,
    creator: { id: t.creator.id, name: t.creator.name, username: t.creator.username, image: t.creator.image },
    title: t.title, destination: t.destination,
    startDate: t.startDate.toISOString(), endDate: t.endDate.toISOString(),
    budgetRange: t.budgetRange, maxMembers: t.maxMembers,
    currentMemberCount: t._count?.members ?? 0,
    tripType: t.tripType, coverImage: t.coverImage,
    createdAt: t.createdAt.toISOString(),
  });

  const toReq = (r: any) => ({
    id: r.id, tripId: r.tripId, userId: r.userId, status: r.status,
    createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString(),
    trip: toTrip(r.trip),
    user: { id: r.user.id, name: r.user.name, username: r.user.username, image: r.user.image, city: r.user.city, country: r.user.country },
  });

  return Response.json({
    upcomingTrips: upcomingMemberships.map((m) => toTrip(m.trip)),
    tripsCreated: tripsCreated.map(toTrip),
    pendingRequests: pendingRequests.map(toReq),
    myJoinRequests: myJoinRequests.map(toReq),
  });
}
