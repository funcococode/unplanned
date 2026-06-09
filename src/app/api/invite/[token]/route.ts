import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';
import { ensureUser } from '@/lib/ensure-user';
import { MemberRole } from '@/types';

type Params = { params: Promise<{ token: string }> };

/** GET — resolve token to trip info (public, no auth needed) */
export async function GET(_req: NextRequest, { params }: Params) {
  const { token } = await params;
  const trip = await prisma.trip.findUnique({
    where: { inviteToken: token },
    select: { id: true, title: true, destination: true, coverImage: true, startDate: true, endDate: true, _count: { select: { members: true } }, maxMembers: true },
  });
  if (!trip) return Response.json({ error: 'Invalid or expired invite link' }, { status: 404 });
  return Response.json(trip);
}

/** POST — accept invite and join the trip */
export async function POST(_req: NextRequest, { params }: Params) {
  const { token } = await params;
  const result = await requireAuth();
  if (result.error) return result.error;
  const { userId, session } = result;
  await ensureUser(userId, session);

  const trip = await prisma.trip.findUnique({
    where: { inviteToken: token },
    select: { id: true, maxMembers: true, _count: { select: { members: true } } },
  });
  if (!trip) return Response.json({ error: 'Invalid or expired invite link' }, { status: 404 });
  if (trip._count.members >= trip.maxMembers) return Response.json({ error: 'Trip is full' }, { status: 409 });

  // Idempotent — already a member? just return the trip id
  const existing = await prisma.tripMember.findUnique({ where: { tripId_userId: { tripId: trip.id, userId } } });
  if (existing) return Response.json({ tripId: trip.id });

  await prisma.tripMember.create({ data: { tripId: trip.id, userId, role: MemberRole.MEMBER } });
  return Response.json({ tripId: trip.id }, { status: 201 });
}
