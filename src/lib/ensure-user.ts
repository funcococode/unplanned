import { prisma } from './prisma';
import type { Session } from 'next-auth';

/**
 * Guarantees the authenticated user has a row in the `users` table.
 * Handles the edge case where the JWT token carries a dbId that was never
 * persisted (e.g. the jwt callback threw silently on first sign-in).
 */
export async function ensureUser(userId: string, session: Session) {
  const exists = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (exists) return;
  if (!session.user?.email) return;
  await prisma.user.upsert({
    where: { email: session.user.email },
    create: {
      id: userId,
      email: session.user.email,
      name: session.user.name ?? 'Traveler',
      image: session.user.image ?? null,
    },
    update: {
      name: session.user.name ?? undefined,
      image: session.user.image ?? undefined,
    },
  });
}
