import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';

type Params = { params: Promise<{ id: string; taskId: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id: tripId, taskId } = await params;
  const result = await requireAuth();
  if (result.error) return result.error;
  const { userId } = result;

  const [task, trip] = await Promise.all([
    prisma.tripTask.findUnique({ where: { id: taskId } }),
    prisma.trip.findUnique({ where: { id: tripId }, select: { creatorId: true } }),
  ]);
  if (!task || !trip) return Response.json({ error: 'Not found' }, { status: 404 });

  // Creator, task creator, or assignee can update
  const canEdit = trip.creatorId === userId || task.createdById === userId || task.assignedToId === userId;
  if (!canEdit) return Response.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const updated = await prisma.tripTask.update({
    where: { id: taskId },
    data: {
      ...(body.title       !== undefined && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.status      !== undefined && { status: body.status }),
      ...(body.assignedToId !== undefined && { assignedToId: body.assignedToId }),
      ...(body.dueDate     !== undefined && { dueDate: body.dueDate ? new Date(body.dueDate) : null }),
    },
    include: {
      createdBy:  { select: { id: true, name: true, image: true } },
      assignedTo: { select: { id: true, name: true, image: true } },
    },
  });
  return Response.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id: tripId, taskId } = await params;
  const result = await requireAuth();
  if (result.error) return result.error;
  const { userId } = result;

  const [task, trip] = await Promise.all([
    prisma.tripTask.findUnique({ where: { id: taskId } }),
    prisma.trip.findUnique({ where: { id: tripId }, select: { creatorId: true } }),
  ]);
  if (!task || !trip) return Response.json({ error: 'Not found' }, { status: 404 });
  if (trip.creatorId !== userId && task.createdById !== userId) return Response.json({ error: 'Forbidden' }, { status: 403 });

  await prisma.tripTask.delete({ where: { id: taskId } });
  return new Response(null, { status: 204 });
}
