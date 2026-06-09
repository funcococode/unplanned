import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';

export async function GET() {
  const result = await requireAuth();
  if (result.error) return result.error;
  const { userId } = result;

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  const unreadCount = await prisma.notification.count({
    where: { userId, read: false },
  });

  return Response.json({ notifications, unreadCount });
}
