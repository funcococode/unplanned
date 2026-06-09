import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';
import { createNotification } from '@/lib/notifications';

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const result = await requireAuth();
  if (result.error) return result.error;
  const { userId } = result;

  const request = await prisma.joinRequest.findUnique({
    where: { id },
    include: { trip: true },
  });
  if (!request) return Response.json({ error: 'Not found' }, { status: 404 });
  if (request.trip.creatorId !== userId) return Response.json({ error: 'Forbidden' }, { status: 403 });
  if (request.status !== 'PENDING') return Response.json({ error: `Already ${request.status.toLowerCase()}` }, { status: 400 });

  const updated = await prisma.joinRequest.update({ where: { id }, data: { status: 'REJECTED' } });

  // Notify the requester
  await createNotification({
    userId: request.userId,
    type: 'JOIN_REQUEST_REJECTED',
    title: 'Request not approved',
    body: `Your request to join "${request.trip.title}" was not approved`,
    link: `/trips`,
  });

  return Response.json(updated);
}
