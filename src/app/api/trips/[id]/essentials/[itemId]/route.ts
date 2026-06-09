import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';

type Params = { params: Promise<{ id: string; itemId: string }> };

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id: tripId, itemId } = await params;
  const result = await requireAuth();
  if (result.error) return result.error;
  const { userId } = result;

  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip || trip.creatorId !== userId) return Response.json({ error: 'Forbidden' }, { status: 403 });

  await prisma.tripEssentialItem.delete({ where: { id: itemId } });
  return new Response(null, { status: 204 });
}
