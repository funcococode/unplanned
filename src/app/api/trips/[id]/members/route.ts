import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id: tripId } = await params;
  const members = await prisma.tripMember.findMany({
    where: { tripId },
    include: { user: true },
  });
  return Response.json(members.map((m) => ({
    id: m.id, tripId: m.tripId, userId: m.userId, role: m.role,
    user: { id: m.user.id, name: m.user.name, username: m.user.username, image: m.user.image, city: m.user.city, country: m.user.country },
  })));
}
