import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Navbar } from '@/components/layout/navbar';
import { EditProfileForm } from '@/features/profile/edit-profile-form';
import type { UserDto } from '@/types';

export const metadata = { title: 'Edit Profile — Unplanned' };

export default async function EditProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id } });
  const user = dbUser ? {
    ...dbUser,
    travelStyle: dbUser.travelStyle as UserDto['travelStyle'],
    languages:   (dbUser as any).languages ?? [],
    instagram:   (dbUser as any).instagram ?? null,
    phone:       (dbUser as any).phone     ?? null,
    createdAt:   dbUser.createdAt.toISOString(),
    updatedAt:   dbUser.updatedAt.toISOString(),
  } as UserDto : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-xl mx-auto px-4 sm:px-6 py-10 pb-20">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Edit Profile</h1>
          <p className="text-gray-500 text-sm">Help other travelers get to know you.</p>
        </div>
        <EditProfileForm user={user} />
      </main>
    </div>
  );
}
