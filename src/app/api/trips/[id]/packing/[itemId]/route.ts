import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';

type Params = { params: Promise<{ id: string; itemId: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const { itemId } = await params;
  const result = await requireAuth();
  if (result.error) return result.error;
  const { userId } = result;

  const item = await prisma.userPackingItem.findUnique({ where: { id: itemId } });
  if (!item || item.userId !== userId) return Response.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const updated = await prisma.userPackingItem.update({
    where: { id: itemId },
    data: {
      ...(body.checked !== undefined && { checked: body.checked }),
      ...(body.text && { text: body.text }),
    },
  });
  return Response.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { itemId } = await params;
  const result = await requireAuth();
  if (result.error) return result.error;
  const { userId } = result;

  const item = await prisma.userPackingItem.findUnique({ where: { id: itemId } });
  if (!item || item.userId !== userId) return Response.json({ error: 'Forbidden' }, { status: 403 });

  await prisma.userPackingItem.delete({ where: { id: itemId } });
  return new Response(null, { status: 204 });
}
