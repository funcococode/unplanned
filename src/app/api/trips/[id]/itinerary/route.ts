import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id: tripId } = await params;
  const days = await prisma.itineraryDay.findMany({
    where: { tripId },
    orderBy: { dayNumber: 'asc' },
    include: {
      items: {
        orderBy: [{ order: 'asc' }, { time: 'asc' }],
        include: { suggester: { select: { id: true, name: true, image: true, username: true } } },
      },
    },
  });
  return Response.json(days);
}

export async function POST(req: NextRequest, { params }: Params) {
  const { id: tripId } = await params;
  const result = await requireAuth();
  if (result.error) return result.error;
  const { userId } = result;

  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) return Response.json({ error: 'Not found' }, { status: 404 });
  if (trip.creatorId !== userId) return Response.json({ error: 'Only the host can add days' }, { status: 403 });

  const body = await req.json();
  const lastDay = await prisma.itineraryDay.findFirst({ where: { tripId }, orderBy: { dayNumber: 'desc' } });
  const dayNumber = (lastDay?.dayNumber ?? 0) + 1;

  const day = await prisma.itineraryDay.create({
    data: {
      tripId,
      dayNumber,
      title: body.title ?? `Day ${dayNumber}`,
      date: body.date ? new Date(body.date) : null,
      description: body.description ?? null,
    },
    include: { items: true },
  });
  return Response.json(day, { status: 201 });
}
