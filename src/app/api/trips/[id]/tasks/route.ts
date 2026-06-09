import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';
import { ensureUser } from '@/lib/ensure-user';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id: tripId } = await params;
  const result = await requireAuth();
  if (result.error) return result.error;
  const { userId } = result;

  const member = await prisma.tripMember.findUnique({ where: { tripId_userId: { tripId, userId } } });
  const trip = await prisma.trip.findUnique({ where: { id: tripId }, select: { creatorId: true } });
  if (!trip) return Response.json({ error: 'Not found' }, { status: 404 });
  if (!member && trip.creatorId !== userId) return Response.json({ error: 'Not a member' }, { status: 403 });

  const tasks = await prisma.tripTask.findMany({
    where: { tripId },
    orderBy: [{ status: 'asc' }, { dueDate: 'asc' }, { createdAt: 'asc' }],
    include: {
      createdBy:  { select: { id: true, name: true, image: true } },
      assignedTo: { select: { id: true, name: true, image: true } },
    },
  });
  return Response.json(tasks);
}

export async function POST(req: NextRequest, { params }: Params) {
  const { id: tripId } = await params;
  const result = await requireAuth();
  if (result.error) return result.error;
  const { userId, session } = result;
  await ensureUser(userId, session);

  const trip = await prisma.trip.findUnique({ where: { id: tripId }, select: { creatorId: true } });
  if (!trip) return Response.json({ error: 'Not found' }, { status: 404 });
  const member = await prisma.tripMember.findUnique({ where: { tripId_userId: { tripId, userId } } });
  if (!member && trip.creatorId !== userId) return Response.json({ error: 'Not a member' }, { status: 403 });

  const body = await req.json();
  const task = await prisma.tripTask.create({
    data: {
      tripId,
      createdById: userId,
      title: body.title,
      description: body.description ?? null,
      assignedToId: body.assignedToId ?? null,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
    },
    include: {
      createdBy:  { select: { id: true, name: true, image: true } },
      assignedTo: { select: { id: true, name: true, image: true } },
    },
  });
  return Response.json(task, { status: 201 });
}
