import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';
import { tripToSummary } from '@/lib/trip-utils';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const trip = await prisma.trip.findUnique({
    where: { id },
    include: {
      creator: true,
      members: { include: { user: true } },
      _count: { select: { members: true } },
    },
  });
  if (!trip) return Response.json({ error: 'Not found' }, { status: 404 });

  return Response.json({
    ...tripToSummary(trip),
    description: trip.description,
    meetingPoint: trip.meetingPoint,
    rules: trip.rules,
    updatedAt: trip.updatedAt.toISOString(),
  });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const result = await requireAuth();
  if (result.error) return result.error;
  const { userId } = result;

  const trip = await prisma.trip.findUnique({ where: { id } });
  if (!trip) return Response.json({ error: 'Not found' }, { status: 404 });
  if (trip.creatorId !== userId) return Response.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const updated = await prisma.trip.update({
    where: { id },
    data: {
      ...body,
      ...(body.startDate && { startDate: new Date(body.startDate) }),
      ...(body.endDate && { endDate: new Date(body.endDate) }),
    },
    include: { creator: true, _count: { select: { members: true } } },
  });
  return Response.json(tripToSummary(updated));
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const result = await requireAuth();
  if (result.error) return result.error;
  const { userId } = result;

  const trip = await prisma.trip.findUnique({ where: { id } });
  if (!trip) return Response.json({ error: 'Not found' }, { status: 404 });
  if (trip.creatorId !== userId) return Response.json({ error: 'Forbidden' }, { status: 403 });

  await prisma.trip.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
