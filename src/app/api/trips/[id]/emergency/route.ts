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

  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) return Response.json({ error: 'Not found' }, { status: 404 });

  if (trip.creatorId === userId) {
    // Host sees all
    const all = await prisma.emergencyInfo.findMany({
      where: { tripId },
      include: { user: { select: { id: true, name: true, image: true } } },
    });
    return Response.json(all);
  }
  // Member sees only their own
  const own = await prisma.emergencyInfo.findUnique({ where: { userId_tripId: { userId, tripId } } });
  return Response.json(own ? [own] : []);
}

export async function POST(req: NextRequest, { params }: Params) {
  const { id: tripId } = await params;
  const result = await requireAuth();
  if (result.error) return result.error;
  const { userId, session } = result;
  await ensureUser(userId, session);

  const body = await req.json();
  const info = await prisma.emergencyInfo.upsert({
    where: { userId_tripId: { userId, tripId } },
    create: { userId, tripId, contactName: body.contactName, contactPhone: body.contactPhone, bloodGroup: body.bloodGroup ?? null, allergies: body.allergies ?? null, notes: body.notes ?? null },
    update: { contactName: body.contactName, contactPhone: body.contactPhone, bloodGroup: body.bloodGroup ?? null, allergies: body.allergies ?? null, notes: body.notes ?? null },
  });
  return Response.json(info);
}
