import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id: tripId } = await params;
  const result = await requireAuth();
  if (result.error) return result.error;
  const { userId } = result;

  const polls = await prisma.poll.findMany({
    where: { tripId },
    orderBy: { createdAt: 'desc' },
    include: {
      options: {
        orderBy: { order: 'asc' },
        include: { votes: { select: { userId: true } } },
      },
    },
  });
  // Attach whether current user voted on each option
  return Response.json(polls.map((p) => ({
    ...p,
    options: p.options.map((o) => ({
      ...o,
      voteCount: o.votes.length,
      hasVoted: o.votes.some((v) => v.userId === userId),
      votes: undefined,
    })),
  })));
}

export async function POST(req: NextRequest, { params }: Params) {
  const { id: tripId } = await params;
  const result = await requireAuth();
  if (result.error) return result.error;
  const { userId } = result;

  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip || trip.creatorId !== userId) return Response.json({ error: 'Only the host can create polls' }, { status: 403 });

  const body = await req.json();
  const poll = await prisma.poll.create({
    data: {
      tripId,
      createdById: userId,
      question: body.question,
      allowMultiple: body.allowMultiple ?? false,
      options: {
        create: (body.options as string[]).map((text, i) => ({ text, order: i })),
      },
    },
    include: {
      options: { orderBy: { order: 'asc' }, include: { votes: { select: { userId: true } } } },
    },
  });
  return Response.json(poll, { status: 201 });
}
