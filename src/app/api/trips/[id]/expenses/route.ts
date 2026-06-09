import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';
import { ensureUser } from '@/lib/ensure-user';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id: tripId } = await params;
  const result = await requireAuth();
  if (result.error) return result.error;

  const expenses = await prisma.expense.findMany({
    where: { tripId },
    orderBy: { createdAt: 'desc' },
    include: { paidBy: { select: { id: true, name: true, image: true } } },
  });
  return Response.json(expenses);
}

export async function POST(req: NextRequest, { params }: Params) {
  const { id: tripId } = await params;
  const result = await requireAuth();
  if (result.error) return result.error;
  const { userId, session } = result;
  await ensureUser(userId, session);

  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) return Response.json({ error: 'Not found' }, { status: 404 });

  const member = await prisma.tripMember.findUnique({ where: { tripId_userId: { tripId, userId } } });
  if (!member && trip.creatorId !== userId) return Response.json({ error: 'Not a member' }, { status: 403 });

  const body = await req.json();
  const expense = await prisma.expense.create({
    data: {
      tripId,
      paidById: body.paidById ?? userId,
      amount: Number(body.amount),
      description: body.description,
      category: body.category ?? 'OTHER',
    },
    include: { paidBy: { select: { id: true, name: true, image: true } } },
  });
  return Response.json(expense, { status: 201 });
}
