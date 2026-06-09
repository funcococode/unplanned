import Link from 'next/link';
import {
  ArrowRight, CalendarDays, Wallet, Vote, Package,
  ShieldAlert, ListChecks, MessageCircle, CloudSun, Link2,
  Users, Bell, UserCircle, CheckCircle2, Star, ArrowUpRight,
} from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { TripCard } from '@/components/shared/trip-card';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { TripSummaryDto } from '@/types';

async function getFeaturedTrips(): Promise<TripSummaryDto[]> {
  try {
    const trips = await prisma.trip.findMany({
      take: 3, orderBy: { createdAt: 'desc' },
      include: { creator: true, _count: { select: { members: true } } },
    });
    return trips.map((t) => ({
      id: t.id, creatorId: t.creatorId,
      creator: { id: t.creator.id, name: t.creator.name, username: t.creator.username, image: t.creator.image },
      title: t.title, destination: t.destination,
      startDate: t.startDate.toISOString(), endDate: t.endDate.toISOString(),
      budgetRange: t.budgetRange as never, maxMembers: t.maxMembers,
      currentMemberCount: t._count.members, tripType: t.tripType as never,
      coverImage: t.coverImage, createdAt: t.createdAt.toISOString(),
    }));
  } catch { return []; }
}

const FEATURES = [
  {
    icon: CalendarDays,
    title: 'Itinerary Builder',
    description: 'Build day-by-day plans together. Members suggest stops, host approves. Everyone stays on the same page.',
    color: 'bg-orange-50 text-orange-500',
    border: 'border-orange-100',
  },
  {
    icon: Wallet,
    title: 'Expense Tracker',
    description: 'Log shared expenses, pick who paid, and get an instant settlement breakdown — who owes whom and how much.',
    color: 'bg-green-50 text-green-500',
    border: 'border-green-100',
  },
  {
    icon: Vote,
    title: 'Group Polls',
    description: 'Kill the WhatsApp back-and-forth. Create polls for dates, activities, or anything — members vote, results are instant.',
    color: 'bg-blue-50 text-blue-500',
    border: 'border-blue-100',
  },
  {
    icon: Package,
    title: 'Packing Lists',
    description: "Host curates an essential items list. Every member gets their own personal checklist synced to the trip.",
    color: 'bg-amber-50 text-amber-500',
    border: 'border-amber-100',
  },
  {
    icon: ListChecks,
    title: 'Task Management',
    description: 'Assign pre-trip tasks to members with due dates — book hotels, arrange transport, apply for visas. Nothing falls through.',
    color: 'bg-violet-50 text-violet-500',
    border: 'border-violet-100',
  },
  {
    icon: ShieldAlert,
    title: 'Emergency Info',
    description: 'Members privately share emergency contacts and blood group. Only the host sees it — critical for adventure trips.',
    color: 'bg-red-50 text-red-500',
    border: 'border-red-100',
  },
  {
    icon: MessageCircle,
    title: 'Real-time Chat',
    description: 'A dedicated group chat for every trip. No phone numbers, no group adds — just open it and start talking.',
    color: 'bg-sky-50 text-sky-500',
    border: 'border-sky-100',
  },
  {
    icon: CloudSun,
    title: 'Weather Forecast',
    description: "Automatic 7-day forecast for your destination. Updates to trip-date weather as your departure approaches.",
    color: 'bg-cyan-50 text-cyan-500',
    border: 'border-cyan-100',
  },
  {
    icon: Link2,
    title: 'Instant Invite Links',
    description: 'Generate a shareable link. Anyone who opens it joins immediately — no approval queue, no friction.',
    color: 'bg-indigo-50 text-indigo-500',
    border: 'border-indigo-100',
  },
  {
    icon: Users,
    title: 'Traveler Profiles',
    description: 'Travel style, languages, bio, Instagram, and trip history — know who you\'re travelling with before you go.',
    color: 'bg-pink-50 text-pink-500',
    border: 'border-pink-100',
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    description: 'Get notified when someone requests to join, gets approved, or rejects your request — nothing missed.',
    color: 'bg-yellow-50 text-yellow-500',
    border: 'border-yellow-100',
  },
  {
    icon: UserCircle,
    title: 'Trip Status',
    description: 'Planning → Confirmed → Ongoing → Completed. Auto-advances on trip dates. Everyone always knows where things stand.',
    color: 'bg-teal-50 text-teal-500',
    border: 'border-teal-100',
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Post your trip',
    description: 'Destination, dates, budget, vibe. Takes under 2 minutes. Share an invite link or let travelers discover it organically.',
    accent: 'bg-orange-500',
  },
  {
    step: '02',
    title: 'Build your crew',
    description: 'Travelers request to join. Review their profiles and approve. Or generate an invite link and skip the queue entirely.',
    accent: 'bg-violet-500',
  },
  {
    step: '03',
    title: 'Plan everything together',
    description: 'Itinerary, packing, tasks, expenses — all in one place. Chat in real-time. Show up prepared.',
    accent: 'bg-blue-500',
  },
];

export default async function LandingPage() {
  const [session, featuredTrips] = await Promise.all([auth(), getFeaturedTrips()]);
  const isLoggedIn = !!session;

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden bg-white">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative pt-20 pb-28 px-4 sm:px-6 overflow-hidden bg-gradient-to-b from-gray-50 to-white">
        {/* Blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-100/50 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-100/40 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Beta badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-50 border border-orange-200 text-orange-600 text-sm font-medium rounded-full mb-8">
            <Star className="h-3.5 w-3.5 fill-orange-400" />
            Phase 1 live — 12 features shipped
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-[1.08] tracking-tight mb-6">
            Never cancel a trip<br />
            <span className="text-orange-500">because your friends</span><br />
            said no.
          </h1>

          <p className="text-xl text-gray-500 mb-10 leading-relaxed max-w-2xl mx-auto">
            Create a trip, find companions, plan the itinerary, split expenses, and coordinate everything — without a single WhatsApp group spiralling out of control.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
            <Link href="/trips/new" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-900 text-white text-base font-semibold rounded-2xl hover:bg-gray-800 transition-colors">
              Create a Trip <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/trips" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-700 text-base font-semibold rounded-2xl border-2 border-gray-200 hover:border-gray-300 hover:text-gray-900 transition-colors">
              Explore Trips
            </Link>
          </div>

          {/* Social proof */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
            {[
              { label: 'No credit card needed' },
              { label: 'Sign in with Google' },
              { label: 'Free to use' },
            ].map(({ label }) => (
              <span key={label} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-orange-500 uppercase tracking-[0.15em] mb-3">Simple by design</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Three steps to your next trip</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map(({ step, title, description, accent }) => (
              <div key={step} className="relative bg-gray-50 rounded-3xl p-8 border border-gray-100">
                <div className={`inline-flex items-center justify-center w-10 h-10 ${accent} text-white text-sm font-bold rounded-xl mb-6`}>
                  {step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features grid ── */}
      <section className="py-24 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-orange-500 uppercase tracking-[0.15em] mb-3">Everything included</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">All the tools your trip needs</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">12 features built and live — every pain point from planning to the post-trip covered.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, title, description, color, border }) => (
              <div key={title} className={`bg-white rounded-2xl border ${border} p-6 hover:shadow-sm transition-shadow`}>
                <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured trips ── */}
      {featuredTrips.length > 0 && (
        <section className="py-24 px-4 sm:px-6 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-xs font-bold text-orange-500 uppercase tracking-[0.15em] mb-2">Live right now</p>
                <h2 className="text-3xl font-bold text-gray-900">Upcoming trips</h2>
                <p className="text-gray-500 mt-1">Real trips, spots still open.</p>
              </div>
              <Link href="/trips" className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-orange-500 transition-colors group">
                View all <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredTrips.map((trip) => <TripCard key={trip.id} trip={trip} />)}
            </div>
            <div className="mt-8 text-center sm:hidden">
              <Link href="/trips" className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-orange-500 transition-colors">
                View all trips
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="py-24 px-4 sm:px-6 bg-gray-900">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to stop saying &ldquo;maybe next time&rdquo;?
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
            Create a trip in under 2 minutes. Find your crew, build a plan, and actually go.
          </p>
          <Link
            href={isLoggedIn ? '/trips/new' : '/login'}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-orange-500 text-white text-base font-semibold rounded-2xl hover:bg-orange-600 transition-colors"
          >
            {isLoggedIn ? 'Create a Trip' : 'Get started free'} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
