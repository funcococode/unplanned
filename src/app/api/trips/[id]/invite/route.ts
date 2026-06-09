import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';
import { randomBytes } from 'crypto';

type Params = { params: Promise<{ id: string }> };

/** GET — return existing invite link (creator only) */
export async function GET(_req: NextRequest, { params }: Params) {
  const { id: tripId } = await params;
  const result = await requireAuth();
  if (result.error) return result.error;
  const { userId } = result;

  const trip = await prisma.trip.findUnique({ where: { id: tripId }, select: { creatorId: true, inviteToken: true } });
  if (!trip) return Response.json({ error: 'Not found' }, { status: 404 });
  if (trip.creatorId !== userId) return Response.json({ error: 'Forbidden' }, { status: 403 });

  return Response.json({ token: trip.inviteToken });
}

/** POST — generate (or regenerate) an invite token (creator only) */
export async function POST(_req: NextRequest, { params }: Params) {
  const { id: tripId } = await params;
  const result = await requireAuth();
  if (result.error) return result.error;
  const { userId } = result;

  const trip = await prisma.trip.findUnique({ where: { id: tripId }, select: { creatorId: true } });
  if (!trip) return Response.json({ error: 'Not found' }, { status: 404 });
  if (trip.creatorId !== userId) return Response.json({ error: 'Forbidden' }, { status: 403 });

  const token = randomBytes(16).toString('hex');
  await prisma.trip.update({ where: { id: tripId }, data: { inviteToken: token } });

  return Response.json({ token });
}

/** DELETE — revoke the invite link (creator only) */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id: tripId } = await params;
  const result = await requireAuth();
  if (result.error) return result.error;
  const { userId } = result;

  const trip = await prisma.trip.findUnique({ where: { id: tripId }, select: { creatorId: true } });
  if (!trip) return Response.json({ error: 'Not found' }, { status: 404 });
  if (trip.creatorId !== userId) return Response.json({ error: 'Forbidden' }, { status: 403 });

  await prisma.trip.update({ where: { id: tripId }, data: { inviteToken: null } });
  return new Response(null, { status: 204 });
}
