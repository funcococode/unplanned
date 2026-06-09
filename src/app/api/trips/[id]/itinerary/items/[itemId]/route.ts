import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';
import { createNotification } from '@/lib/notifications';

type Params = { params: Promise<{ id: string; itemId: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id: tripId, itemId } = await params;
  const result = await requireAuth();
  if (result.error) return result.error;
  const { userId } = result;

  const [trip, item] = await Promise.all([
    prisma.trip.findUnique({ where: { id: tripId } }),
    prisma.itineraryItem.findUnique({ where: { id: itemId } }),
  ]);
  if (!trip || !item) return Response.json({ error: 'Not found' }, { status: 404 });

  const isCreator = trip.creatorId === userId;
  const isSuggester = item.suggestedBy === userId;
  if (!isCreator && !isSuggester) return Response.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const updateData: Record<string, unknown> = {};

  if (isCreator) {
    // Host can approve/reject and edit everything
    if (body.status === 'APPROVED' || body.status === 'REJECTED') {
      updateData.status = body.status;
      if (item.suggestedBy) {
        await createNotification({
          userId: item.suggestedBy,
          type: body.status === 'APPROVED' ? 'JOIN_REQUEST_APPROVED' : 'JOIN_REQUEST_REJECTED',
          title: body.status === 'APPROVED' ? 'Suggestion approved!' : 'Suggestion not added',
          body: body.status === 'APPROVED'
            ? `Your suggestion "${item.title}" was added to the itinerary`
            : `Your suggestion "${item.title}" was not added`,
          link: `/trips/${tripId}`,
        });
      }
    }
    if (body.title)       updateData.title       = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.time !== undefined)        updateData.time        = body.time;
    if (body.location !== undefined)    updateData.location    = body.location;
    if (body.type)        updateData.type        = body.type;
    if (body.order !== undefined)       updateData.order       = body.order;
  } else {
    // Suggester can only edit their own pending item
    if (item.status !== 'PENDING_REVIEW') return Response.json({ error: 'Cannot edit after review' }, { status: 400 });
    if (body.title)       updateData.title       = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.time !== undefined)        updateData.time        = body.time;
    if (body.location !== undefined)    updateData.location    = body.location;
    if (body.type)        updateData.type        = body.type;
  }

  const updated = await prisma.itineraryItem.update({
    where: { id: itemId },
    data: updateData,
    include: { suggester: { select: { id: true, name: true, image: true, username: true } } },
  });
  return Response.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id: tripId, itemId } = await params;
  const result = await requireAuth();
  if (result.error) return result.error;
  const { userId } = result;

  const [trip, item] = await Promise.all([
    prisma.trip.findUnique({ where: { id: tripId } }),
    prisma.itineraryItem.findUnique({ where: { id: itemId } }),
  ]);
  if (!trip || !item) return Response.json({ error: 'Not found' }, { status: 404 });

  const isCreator = trip.creatorId === userId;
  const isSuggester = item.suggestedBy === userId && item.status === 'PENDING_REVIEW';
  if (!isCreator && !isSuggester) return Response.json({ error: 'Forbidden' }, { status: 403 });

  await prisma.itineraryItem.delete({ where: { id: itemId } });
  return new Response(null, { status: 204 });
}
