import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';
import { createNotification } from '@/lib/notifications';
import { ensureUser } from '@/lib/ensure-user';

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  const { id: tripId } = await params;
  const result = await requireAuth();
  if (result.error) return result.error;
  const { userId, session } = result;

  await ensureUser(userId, session);

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: { _count: { select: { members: true } } },
  });
  if (!trip) return Response.json({ error: 'Trip not found' }, { status: 404 });
  if (trip.creatorId === userId) return Response.json({ error: 'You cannot join your own trip' }, { status: 400 });
  if (trip._count.members >= trip.maxMembers) return Response.json({ error: 'Trip is full' }, { status: 400 });

  const existing = await prisma.joinRequest.findUnique({
    where: { tripId_userId: { tripId, userId } },
  });
  if (existing) return Response.json({ error: `Request already exists: ${existing.status}` }, { status: 409 });

  const request = await prisma.joinRequest.create({
    data: { tripId, userId, status: 'PENDING' },
  });

  await createNotification({
    userId: trip.creatorId,
    type: 'JOIN_REQUEST_RECEIVED',
    title: 'New join request',
    body: `${session.user.name ?? 'Someone'} wants to join "${trip.title}"`,
    link: `/dashboard`,
  });

  return Response.json(request, { status: 201 });
}
