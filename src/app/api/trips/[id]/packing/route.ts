import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';
import { ensureUser } from '@/lib/ensure-user';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id: tripId } = await params;
  const result = await requireAuth();
  if (result.error) return result.error;
  const { userId } = result;

  const items = await prisma.userPackingItem.findMany({
    where: { tripId, userId },
    orderBy: { order: 'asc' },
  });
  return Response.json(items);
}

export async function POST(req: NextRequest, { params }: Params) {
  const { id: tripId } = await params;
  const result = await requireAuth();
  if (result.error) return result.error;
  const { userId, session } = result;

  await ensureUser(userId, session);

  const body = await req.json();

  if (Array.isArray(body.items)) {
    const existing = await prisma.userPackingItem.findMany({ where: { tripId, userId } });
    const existingTexts = new Set(existing.map((i) => i.text.toLowerCase()));
    const last = existing.reduce((m, i) => Math.max(m, i.order), 0);
    const toCreate = (body.items as string[])
      .filter((t) => !existingTexts.has(t.toLowerCase()))
      .map((text, i) => ({ userId, tripId, text, order: last + i + 1 }));
    if (toCreate.length > 0) await prisma.userPackingItem.createMany({ data: toCreate });
    return Response.json({ created: toCreate.length }, { status: 201 });
  }

  const last = await prisma.userPackingItem.findFirst({ where: { tripId, userId }, orderBy: { order: 'desc' } });
  const item = await prisma.userPackingItem.create({
    data: { userId, tripId, text: body.text, order: (last?.order ?? 0) + 1 },
  });
  return Response.json(item, { status: 201 });
}
