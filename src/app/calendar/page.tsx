import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { TripCalendar } from '@/features/trips/trip-calendar';

export const metadata = { title: 'Trip Calendar' };

export default function CalendarPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Trip Calendar</h1>
          <p className="text-gray-500">See when trips are happening around the world.</p>
        </div>
        <TripCalendar />
      </main>
      <Footer />
    </div>
  );
}
