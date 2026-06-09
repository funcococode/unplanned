import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';

type Params = { params: Promise<{ id: string }> };

const VALID = ['PLANNING', 'CONFIRMED', 'ONGOING', 'COMPLETED'] as const;

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id: tripId } = await params;
  const result = await requireAuth();
  if (result.error) return result.error;
  const { userId } = result;

  const trip = await prisma.trip.findUnique({ where: { id: tripId }, select: { creatorId: true } });
  if (!trip) return Response.json({ error: 'Not found' }, { status: 404 });
  if (trip.creatorId !== userId) return Response.json({ error: 'Only the host can change trip status' }, { status: 403 });

  const { status } = await req.json();
  if (!VALID.includes(status)) return Response.json({ error: 'Invalid status' }, { status: 400 });

  const updated = await prisma.trip.update({ where: { id: tripId }, data: { status }, select: { status: true } });
  return Response.json(updated);
}
