import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * /profile/me — server-side redirect to the current user's profile.
 * Works even before the JWT token has refreshed with the latest username.
 */
export default async function MeRedirectPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login?callbackUrl=/profile/me');

  const user = await prisma.user.findUnique({
    where:  { id: session.user.id },
    select: { username: true },
  });

  if (user?.username) {
    redirect(`/profile/${user.username}`);
  } else {
    // No username set yet — send them to edit profile
    redirect('/profile/edit');
  }
}
