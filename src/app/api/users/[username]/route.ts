import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ username: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { username } = await params;
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      _count: { select: { tripsCreated: true, tripMembers: { where: { role: 'MEMBER' } } } },
    },
  });
  if (!user) return Response.json({ error: 'Not found' }, { status: 404 });
  return Response.json({
    id: user.id, name: user.name, username: user.username, image: user.image,
    bio: user.bio, city: user.city, country: user.country, travelStyle: user.travelStyle,
    tripsCreated: user._count.tripsCreated, tripsJoined: user._count.tripMembers,
    createdAt: user.createdAt.toISOString(),
  });
}
