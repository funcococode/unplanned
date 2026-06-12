import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { PageHero } from '@/components/layout/page-hero';
import { TripCalendar } from '@/features/trips/trip-calendar';

export const metadata = { title: 'Trip Calendar' };

export default function CalendarPage() {
  return (
    <div className="min-h-screen flex flex-col bg-night">
      <Navbar />
      <PageHero
        eyebrow="Calendar"
        title={<>When the world <span className="bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">takes off.</span></>}
        description="Every trip on the platform, mapped to its dates. Find one that fits your time off."
      />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <TripCalendar />
      </main>
      <Footer />
    </div>
  );
}
