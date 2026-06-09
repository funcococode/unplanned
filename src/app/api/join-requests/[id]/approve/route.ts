import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';
import { MemberRole } from '@/types';
import { createNotification } from '@/lib/notifications';

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const result = await requireAuth();
  if (result.error) return result.error;
  const { userId } = result;

  const request = await prisma.joinRequest.findUnique({
    where: { id },
    include: { trip: { include: { _count: { select: { members: true } } } } },
  });
  if (!request) return Response.json({ error: 'Not found' }, { status: 404 });
  if (request.trip.creatorId !== userId) return Response.json({ error: 'Forbidden' }, { status: 403 });
  if (request.status !== 'PENDING') return Response.json({ error: `Already ${request.status.toLowerCase()}` }, { status: 400 });
  if (request.trip._count.members >= request.trip.maxMembers) return Response.json({ error: 'Trip is full' }, { status: 400 });

  const [updated] = await prisma.$transaction([
    prisma.joinRequest.update({ where: { id }, data: { status: 'APPROVED' } }),
    prisma.tripMember.create({ data: { tripId: request.tripId, userId: request.userId, role: MemberRole.MEMBER } }),
  ]);

  // Notify the requester
  await createNotification({
    userId: request.userId,
    type: 'JOIN_REQUEST_APPROVED',
    title: 'Request approved! 🎉',
    body: `You've been approved to join "${request.trip.title}"`,
    link: `/trips/${request.tripId}`,
  });

  return Response.json(updated);
}
