import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';
import { ensureUser } from '@/lib/ensure-user';
import { MemberRole } from '@/types';
import { tripToSummary } from '@/lib/trip-utils';
import { getDestinationImage } from '@/lib/destination-image';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const destination = searchParams.get('destination');
  const budgetRange = searchParams.get('budgetRange');
  const tripType = searchParams.get('tripType');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const sort = searchParams.get('sort') ?? 'newest';
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '12'));

  const where = {
    ...(destination && { destination: { contains: destination, mode: 'insensitive' as const } }),
    ...(budgetRange && { budgetRange: budgetRange as never }),
    ...(tripType && { tripType: tripType as never }),
    ...(startDate && { startDate: { gte: new Date(startDate) } }),
    ...(endDate && { endDate: { lte: new Date(endDate) } }),
  };

  const orderBy = sort === 'popular'
    ? { members: { _count: 'desc' as const } }
    : { createdAt: 'desc' as const };

  const [trips, total] = await Promise.all([
    prisma.trip.findMany({
      where, orderBy, skip: (page - 1) * limit, take: limit,
      include: { creator: true, _count: { select: { members: true } } },
    }),
    prisma.trip.count({ where }),
  ]);

  return Response.json({
    data: trips.map(tripToSummary),
    total, page, limit,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(req: NextRequest) {
  const result = await requireAuth();
  if (result.error) return result.error;
  const { userId, session } = result;
  await ensureUser(userId, session);

  const body = await req.json();
  if (!body.coverImage && body.destination) {
    body.coverImage = await getDestinationImage(body.destination);
  }
  const trip = await prisma.trip.create({
    data: {
      ...body,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      creatorId: userId,
      members: { create: { userId, role: MemberRole.CREATOR } },
    },
    include: { creator: true, _count: { select: { members: true } } },
  });
  return Response.json(tripToSummary(trip));
}
