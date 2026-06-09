import { auth } from './auth';
import type { Session } from 'next-auth';

export type AuthResult =
  | { session: Session; userId: string; error?: never }
  | { session?: never; userId?: never; error: Response };

export async function requireAuth(): Promise<AuthResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      error: Response.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }
  return { session, userId: session.user.id };
}
