import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';

type Params = { params: Promise<{ id: string; pollId: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { id: tripId, pollId } = await params;
  const result = await requireAuth();
  if (result.error) return result.error;
  const { userId } = result;

  const body = await req.json();

  // Close poll
  if (body.action === 'close') {
    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (trip?.creatorId !== userId) return Response.json({ error: 'Forbidden' }, { status: 403 });
    await prisma.poll.update({ where: { id: pollId }, data: { closed: true } });
    return Response.json({ ok: true });
  }

  // Vote
  const poll = await prisma.poll.findUnique({ where: { id: pollId }, include: { options: true } });
  if (!poll || poll.closed) return Response.json({ error: 'Poll not available' }, { status: 400 });

  const optionId: string = body.optionId;
  if (!poll.options.find((o) => o.id === optionId)) return Response.json({ error: 'Invalid option' }, { status: 400 });

  if (!poll.allowMultiple) {
    // Remove any existing votes for this poll by this user before adding new one
    const existingVotes = await prisma.pollVote.findMany({
      where: { option: { pollId }, userId },
    });
    if (existingVotes.some((v) => v.optionId === optionId)) {
      // Toggle off
      await prisma.pollVote.deleteMany({ where: { optionId, userId } });
      return Response.json({ ok: true });
    }
    await prisma.pollVote.deleteMany({ where: { option: { pollId }, userId } });
  }

  await prisma.pollVote.upsert({
    where: { optionId_userId: { optionId, userId } },
    create: { optionId, userId },
    update: {},
  });
  return Response.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id: tripId, pollId } = await params;
  const result = await requireAuth();
  if (result.error) return result.error;
  const { userId } = result;

  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (trip?.creatorId !== userId) return Response.json({ error: 'Forbidden' }, { status: 403 });
  await prisma.poll.delete({ where: { id: pollId } });
  return new Response(null, { status: 204 });
}
