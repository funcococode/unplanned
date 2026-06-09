import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';

export async function GET() {
  const result = await requireAuth();
  if (result.error) return result.error;
  const { userId } = result;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return Response.json({ error: 'Not found' }, { status: 404 });
  return Response.json({ ...user, createdAt: user.createdAt.toISOString(), updatedAt: user.updatedAt.toISOString() });
}

export async function PATCH(req: NextRequest) {
  const result = await requireAuth();
  if (result.error) return result.error;
  const { userId } = result;

  const body = await req.json();
  const { username, bio, city, country, travelStyle, languages, instagram, phone } = body;

  if (username) {
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing && existing.id !== userId) return Response.json({ error: 'Username already taken' }, { status: 409 });
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(username   !== undefined && { username }),
      ...(bio        !== undefined && { bio }),
      ...(city       !== undefined && { city }),
      ...(country    !== undefined && { country }),
      ...(travelStyle !== undefined && { travelStyle }),
      ...(languages  !== undefined && { languages })