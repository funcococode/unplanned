import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';

type Params = { params: Promise<{ id: string; expenseId: string }> };

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id: tripId, expenseId } = await params;
  const result = await requireAuth();
  if (result.error) return result.error;
  const { userId } = result;

  const [expense, trip] = await Promise.all([
    prisma.expense.findUnique({ where: { id: expenseId } }),
    prisma.trip.findUnique({ where: { id: tripId } }),
  ]);
  if (!expense) return Response.json({ error: 'Not found' }, { status: 404 });
  if (expense.paidById !== userId && trip?.creatorId !== userId) return Response.json({ error: 'Forbidden' }, { status: 403 });

  await prisma.expense.delete({ where: { id: expenseId } });
  return new Response(null, { status: 204 });
}
