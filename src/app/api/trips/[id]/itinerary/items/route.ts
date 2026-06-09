import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';
import { createNotification } from '@/lib/notifications';

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { id: tripId } = await params;
  const result = await requireAuth();
  if (result.error) return result.error;
  const { userId, session } = result;

  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) return Response.json({ error: 'Not found' }, { status: 404 });

  const isCreator = trip.creatorId === userId;
  const member = !isCreator && await prisma.tripMember.findUnique({
    where: { tripId_userId: { tripId, userId } },
  });
  if (!isCreator && !member) return Response.json({ error: 'Not a trip member' }, { status: 403 });

  const body = await req.json();
  const status = isCreator ? 'APPROVED' : 'PENDING_REVIEW';

  const lastItem = await prisma.itineraryItem.findFirst({
    where: { dayId: body.dayId }, orderBy: { order: 'desc' },
  });

  const item = await prisma.itineraryItem.create({
    data: {
      dayId: body.dayId,
      tripId,
      title: body.title,
      description: body.description ?? null,
      time: body.time ?? null,
      location: body.location ?? null,
      type: body.type ?? 'ACTIVITY',
      order: (lastItem?.order ?? 0) + 1,
      status,
      suggestedBy: isCreator ? null : userId,
    },
    include: { suggester: { select: { id: true, name: true, image: true, username: true } } },
  });

  if (!isCreator) {
    const userName = session.user?.name ?? 'A traveler';
    await createNotification({
      userId: trip.creatorId,
      type: 'JOIN_REQUEST_RECEIVED',
      title: 'New itinerary suggestion',
      body: `${userName} suggested "${body.title}" for your trip`,
      link: `/trips/${tripId}`,
    });
  }

  return Response.json(item, { status: 201 });
}
