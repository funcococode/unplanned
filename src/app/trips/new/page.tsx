import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Navbar } from '@/components/layout/navbar';
import { CreateTripForm } from '@/features/trips/create-trip-form';

export const metadata = { title: 'Create a Trip' };

export default async function CreateTripPage() {
  const session = await auth();
  if (!session) redirect('/login?callbackUrl=/trips/new');
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create a Trip</h1>
          <p className="text-gray-500">Share your travel plans and find companions to join you.</p>
        </div>
        <CreateTripForm />
      </main>
    </div>
  );
}
