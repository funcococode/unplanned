import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';

type Params = { params: Promise<{ id: string }> };

function msgToDto(m: any) {
  return {
    id: m.id, tripId: m.tripId, senderId: m.senderId,
    sender: { id: m.sender.id, name: m.sender.name, username: m.sender.username, image: m.sender.image },
    content: m.content, createdAt: m.createdAt.toISOString(),
  };
}

export async function GET(req: NextRequest, { params }: Params) {
  const { id: tripId } = await params;
  const result = await requireAuth();
  if (result.error) return result.error;
  const { userId } = result;

  const member = await prisma.tripMember.findUnique({ where: { tripId_userId: { tripId, userId } } });
  if (!member) return Response.json({ error: 'Not a member' }, { status: 403 });

  const after = req.nextUrl.searchParams.get('after');
  const messages = await prisma.message.findMany({
    where: { tripId, ...(after && { createdAt: { gt: new Date(after) } }) },
    include: { sender: true },
    orderBy: { createdAt: 'asc' },
    take: 100,
  });
  return Response.json(messages.map(msgToDto));
}

export async function POST(req: NextRequest, { params }: Params) {
  const { id: tripId } = await params;
  const result = await requireAuth();
  if (result.error) return result.error;
  const { userId } = result;

  const member = await prisma.tripMember.findUnique({ where: { tripId_userId: { tripId, userId } } });
  if (!member) return Response.json({ error: 'Not a member' }, { status: 403 });

  const { content } = await req.json();
  if (!content?.trim()) return Response.json({ error: 'Message cannot be empty' }, { status: 400 });

  const message = await prisma.message.create({
    data: { tripId, senderId: userId, content: content.trim() },
    include: { sender: true },
  });
  return Response.json(msgToDto(message), { status: 201 });
}
