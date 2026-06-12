import Link from 'next/link';
import { MapPin } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-night night-grid relative overflow-hidden">
      <div className="absolute w-[560px] h-[560px] rounded-full blur-3xl bg-orange-600/15 -top-40 left-1/2 -translate-x-1/2 pointer-events-none animate-pulse-glow" aria-hidden="true" />
      <div className="relative text-center">
        <MapPin className="h-10 w-10 text-orange-400/60 mx-auto mb-8" />
        <h1 className="font-display text-[7rem] sm:text-[10rem] font-bold leading-none bg-gradient-to-br from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent">
          404
        </h1>
        <p className="font-display text-xl text-zinc-950 dark:text-white mt-4 mb-2">Off the itinerary.</p>
        <p className="text-zinc-950/55 dark:text-white/40 mb-10 max-w-sm mx-auto">
          This page got lost somewhere between departure and arrival.
        </p>
        <Link
          href="/"
          className="inline-flex px-8 py-4 bg-orange-500 text-white text-sm font-bold rounded-xl shadow-[0_0_28px_-10px_rgba(249,115,22,0.6)] transition-all duration-300 hover:bg-orange-400 hover:shadow-[0_0_44px_-8px_rgba(249,115,22,0.85)]"
        >
          Back to base camp
        </Link>
      </div>
    </div>
  );
}
