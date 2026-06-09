import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';

export async function POST() {
  const result = await requireAuth();
  if (result.error) return result.error;
  const { userId } = result;

  await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });

  return Response.json({ ok: true });
}
