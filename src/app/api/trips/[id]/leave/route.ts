import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id: tripId } = await params;
  const result = await requireAuth();
  if (result.error) return result.error;
  const { userId } = result;

  const member = await prisma.tripMember.findUnique({
    where: { tripId_userId: { tripId, userId } },
  });
  if (!member) return Response.json({ error: 'Not a member' }, { status: 404 });
  if (member.role === 'CREATOR') return Response.json({ error: 'Creator cannot leave. Delete the trip instead.' }, { status: 400 });

  await prisma.tripMember.delete({ where: { tripId_userId: { tripId, userId } } });
  return new Response(null, { status: 204 });
}
