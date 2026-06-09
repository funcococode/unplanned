import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id: tripId } = await params;
  const items = await prisma.tripEssentialItem.findMany({
    where: { tripId },
    orderBy: [{ category: 'asc' }, { order: 'asc' }],
  });
  return Response.json(items);
}

export async function POST(req: NextRequest, { params }: Params) {
  const { id: tripId } = await params;
  const result = await requireAuth();
  if (result.error) return result.error;
  const { userId } = result;

  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip || trip.creatorId !== userId) return Response.json({ error: 'Only the host can manage essentials' }, { status: 403 });

  const body = await req.json();
  const last = await prisma.tripEssentialItem.findFirst({
    where: { tripId, category: body.category ?? 'General' },
    orderBy: { order: 'desc' },
  });

  const item = await prisma.tripEssentialItem.create({
    data: {
      tripId,
      text: body.text,
      category: body.category ?? 'General',
      order: (last?.order ?? 0) + 1,
    },
  });
  return Response.json(item, { status: 201 });
}
