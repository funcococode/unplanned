import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';

type Params = { params: Promise<{ id: string; dayId: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id: tripId, dayId } = await params;
  const result = await requireAuth();
  if (result.error) return result.error;
  const { userId } = result;

  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip || trip.creatorId !== userId) return Response.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const day = await prisma.itineraryDay.update({
    where: { id: dayId },
    data: {
      title: body.title,
      date: body.date ? new Date(body.date) : null,
      description: body.description ?? null,
    },
    include: { items: { include: { suggester: { select: { id: true, name: true, image: true, username: true } } } } },
  });
  return Response.json(day);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id: tripId, dayId } = await params;
  const result = await requireAuth();
  if (result.error) return result.error;
  const { userId } = result;

  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip || trip.creatorId !== userId) return Response.json({ error: 'Forbidden' }, { status: 403 });

  await prisma.itineraryDay.delete({ where: { id: dayId } });
  return new Response(null, { status: 204 });
}
