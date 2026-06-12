import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Navbar } from '@/components/layout/navbar';
import { FadeUp } from '@/components/motion';
import { CreateTripForm } from '@/features/trips/create-trip-form';

export const metadata = { title: 'Create a Trip' };

const STEPS = [
  { n: '01', title: 'Describe the trip', desc: 'Destination, dates, budget and the vibe you want.' },
  { n: '02', title: 'It goes live',      desc: 'Travelers browsing Explore can request to join.' },
  { n: '03', title: 'Approve your crew', desc: 'You decide who is in. Then plan everything together.' },
];

export default async function CreateTripPage() {
  const session = await auth();
  if (!session) redirect('/login?callbackUrl=/trips/new');
  return (
    <div className="min-h-screen bg-night relative overflow-x-clip">
      <div className="absolute w-[480px] h-[480px] rounded-full blur-3xl bg-orange-600/15 -top-48 -left-32 pointer-events-none animate-pulse-glow" aria-hidden="true" />
      <Navbar />
      <main className="relative max-w-6xl mx-auto px-4 sm:px-6 py-14 grid grid-cols-1 lg:grid-cols-[5fr,7fr] gap-14 lg:gap-20">

        {/* Sticky rail */}
        <div className="lg:sticky lg:top-28 self-start">
          <FadeUp>
            <span className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-orange-400">New trip</span>
          </FadeUp>
          <FadeUp delay={0.08}>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-zinc-950 dark:text-white mt-4 leading-tight">
              Where to <span className="bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">next?</span>
            </h1>
          </FadeUp>
          <FadeUp delay={0.16}>
            <p className="text-zinc-950/60 dark:text-white/50 text-lg mt-5 max-w-sm leading-relaxed">
              Share your plan and let the right travelers find you. Takes under two minutes.
            </p>
          </FadeUp>

          <div className="mt-10 space-y-7">
            {STEPS.map(({ n, title, desc }, i) => (
              <FadeUp key={n} delay={0.24 + i * 0.08}>
                <div className="flex gap-4">
                  <span className="font-display text-2xl font-bold bg-gradient-to-br from-orange-400 to-amber-300 bg-clip-text text-transparent shrink-0">{n}</span>
                  <div>
                    <p className="text-sm font-semibold text-zinc-950 dark:text-white">{title}</p>
                    <p className="text-sm text-zinc-950/55 dark:text-white/40 mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>

        {/* Form */}
        <FadeUp delay={0.15}>
          <CreateTripForm />
        </FadeUp>
      </main>
    </div>
  );
}
