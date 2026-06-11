import Link from 'next/link';
import {
  ArrowRight, CalendarDays, Wallet, Vote, Package,
  ShieldAlert, ListChecks, MessageCircle, CloudSun, Link2,
  Users, Bell, UserCircle, CheckCircle2, Star, ArrowUpRight,
  Plus, Compass, MapPin, Clock,
} from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { TripCard } from '@/components/shared/trip-card';
import { Avatar } from '@/components/shared/avatar';
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

async function getUserDashboardData(userId: string) {
  const now = new Date();
  const [upcomingTrips, createdTrips, pendingRequests] = await Promise.all([
    prisma.trip.findMany({
      where: {
        startDate: { gte: now },
        OR: [{ creatorId: userId }, { members: { some: { userId } } }],
      },
      include: { creator: true, _count: { select: { members: true } } },
      orderBy: { startDate: 'asc' },
      take: 3,
    }),
    prisma.trip.count({ where: { creatorId: userId } }),
    prisma.joinRequest.count({ where: { status: 'PENDING', trip: { creatorId: userId } } }),
  ]);
  return { upcomingTrips, createdTrips, pendingRequests };
}

const FEATURES = [
  { icon: CalendarDays, title: 'Itinerary Builder',   description: 'Build day-by-day plans together. Members suggest stops, host approves.',        color: 'bg-orange-50 text-orange-500', border: 'border-orange-100' },
  { icon: Wallet,       title: 'Expense Tracker',     description: 'Log shared expenses and get an instant settlement breakdown.',                   color: 'bg-green-50 text-green-500',   border: 'border-green-100' },
  { icon: Vote,         title: 'Group Polls',          description: 'Create polls for dates, activities, or anything — members vote, results instant.', color: 'bg-blue-50 text-blue-500',     border: 'border-blue-100' },
  { icon: Package,      title: 'Packing Lists',        description: 'Host curates essentials. Every member gets their own checklist.',                color: 'bg-amber-50 text-amber-500',   border: 'border-amber-100' },
  { icon: ListChecks,   title: 'Task Management',      description: 'Assign pre-trip tasks with due dates — nothing falls through.',                  color: 'bg-violet-50 text-violet-500', border: 'border-violet-100' },
  { icon: ShieldAlert,  title: 'Emergency Info',       description: 'Members share emergency contacts privately with the host.',                      color: 'bg-red-50 text-red-500',       border: 'border-red-100' },
  { icon: MessageCircle,title: 'Real-time Chat',       description: 'A dedicated group chat for every trip.',                                         color: 'bg-sky-50 text-sky-500',       border: 'border-sky-100' },
  { icon: CloudSun,     title: 'Weather Forecast',     description: 'Automatic 7-day forecast for your destination.',                                 color: 'bg-cyan-50 text-cyan-500',     border: 'border-cyan-100' },
  { icon: Link2,        title: 'Instant Invite Links', description: 'Generate a shareable link — anyone who opens it joins immediately.',             color: 'bg-indigo-50 text-indigo-500', border: 'border-indigo-100' },
  { icon: Users,        title: 'Traveler Profiles',    description: 'Travel style, languages, bio, Instagram, and trip history.',                    color: 'bg-pink-50 text-pink-500',     border: 'border-pink-100' },
  { icon: Bell,         title: 'Smart Notifications',  description: 'Get notified when someone requests to join or gets approved.',                   color: 'bg-yellow-50 text-yellow-500', border: 'border-yellow-100' },
  { icon: UserCircle,   title: 'Trip Status',          description: 'Planning → Confirmed → Ongoing → Completed lifecycle.',                          color: 'bg-teal-50 text-teal-500',     border: 'border-teal-100' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Post your trip',              description: 'Destination, dates, budget, vibe. Takes under 2 minutes.',                                    accent: 'bg-orange-500' },
  { step: '02', title: 'Build your crew',             description: 'Travelers request to join. Review profiles and approve, or share an invite link.',             accent: 'bg-violet-500' },
  { step: '03', title: 'Plan everything together',    description: 'Itinerary, packing, tasks, expenses — all in one place. Show up prepared.',                    accent: 'bg-blue-500'   },
];

export default async function HomePage() {
  const [session, featuredTrips] = await Promise.all([auth(), getFeaturedTrips()]);

  // ── Logged-in home ───────────────────────────────────────────────────────────
  if (session?.user?.id) {
    const userId = session.user.id;
    const { upcomingTrips, createdTrips, pendingRequests } = await getUserDashboardData(userId);

    const toSummary = (t: any): TripSummaryDto => ({
      id: t.id, creatorId: t.creatorId,
      creator: { id: t.creator.id, name: t.creator.name, username: t.creator.username, image: t.creator.image },
      title: t.title, destination: t.destination,
      startDate: t.startDate.toISOString(), endDate: t.endDate.toISOString(),
      budgetRange: t.budgetRange, maxMembers: t.maxMembers,
      currentMemberCount: t._count?.members ?? 0,
      tripType: t.tripType, coverImage: t.coverImage,
      createdAt: t.createdAt.toISOString(),
    });

    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">

          {/* Welcome */}
          <div className="flex items-center gap-4 mb-10">
            <Avatar src={session.user.image} name={session.user.name} size="lg" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Hey, {session.user.name?.split(' ')[0]} 👋
              </h1>
              <p className="text-gray-500 text-sm mt-0.5">Where to next?</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            {[
              { label: 'Trips created',    value: createdTrips,    href: '/dashboard', color: 'text-orange-500' },
              { label: 'Upcoming trips',   value: upcomingTrips.length, href: '/dashboard', color: 'text-blue-500' },
              { label: 'Pending requests', value: pendingRequests, href: '/dashboard', color: 'text-violet-500' },
            ].map(({ label, value, href, color }) => (
              <Link key={label} href={href}
                className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-orange-200 transition-colors group">
                <p className={`text-3xl font-bold ${color} mb-1`}>{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </Link>
            ))}
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
            {[
              { href: '/trips/new',   icon: Plus,    label: 'Create a Trip',   desc: 'Start planning something new',  bg: 'bg-orange-500' },
              { href: '/trips',       icon: Compass, label: 'Explore Trips',   desc: 'Find trips to join',            bg: 'bg-blue-500'   },
              { href: '/dashboard',   icon: Clock,   label: 'My Dashboard',    desc: 'Requests, history & more',      bg: 'bg-violet-500' },
            ].map(({ href, icon: Icon, label, desc, bg }) => (
              <Link key={href} href={href}
                className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:border-orange-200 hover:shadow-sm transition-all group">
                <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center shrink-0`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">{label}</p>
                  <p className="text-xs text-gray-400 truncate">{desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-orange-400 ml-auto shrink-0 transition-colors" />
              </Link>
            ))}
          </div>

          {/* Upcoming trips */}
          {upcomingTrips.length > 0 && (
            <section className="mb-10">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-gray-900">Your upcoming trips</h2>
                <Link href="/dashboard" className="text-sm text-orange-500 hover:text-orange-600 font-medium">View all →</Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {upcomingTrips.map((t) => <TripCard key={t.id} trip={toSummary(t)} />)}
              </div>
            </section>
          )}

          {upcomingTrips.length === 0 && (
            <div className="mb-10 flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-dashed border-gray-200 text-center">
              <MapPin className="h-10 w-10 text-gray-200 mb-4" />
              <p className="text-gray-500 font-medium mb-1">No upcoming trips yet</p>
              <p className="text-sm text-gray-400 mb-5">Create one or explore trips to join</p>
              <div className="flex gap-3">
                <Link href="/trips/new" className="px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-xl hover:bg-orange-600">
                  Create a Trip
                </Link>
                <Link href="/trips" className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200">
                  Explore
                </Link>
              </div>
            </div>
          )}

          {/* Discover new trips */}
          {featuredTrips.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-gray-900">Discover trips</h2>
                <Link href="/trips" className="text-sm text-orange-500 hover:text-orange-600 font-medium">Browse all →</Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {featuredTrips.map((trip) => <TripCard key={trip.id} trip={trip} />)}
              </div>
            </section>
          )}

        </main>
        <Footer />
      </div>
    );
  }

  // ── Marketing home (logged out) ──────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-20 pb-28 px-4 sm:px-6 overflow-hidden bg-gradient-to-b from-gray-50 to-white">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-100/50 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-100/40 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />
        <div className="relative max-w-5xl mx-auto text-center">
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
            <Link href="/trips" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-700 text-base font-semibold rounded-2xl border-2 border-gray-200 hover:border-gray-300 transition-colors">
              Explore Trips
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
            {['No credit card needed', 'Sign in with Google', 'Free to use'].map((label) => (
              <span key={label} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-green-400" />{label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-orange-500 uppercase tracking-[0.15em] mb-3">Simple by design</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Three steps to your next trip</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map(({ step, title, description, accent }) => (
              <div key={step} className="relative bg-gray-50 rounded-3xl p-8 border border-gray-100">
                <div className={`inline-flex items-center justify-center w-10 h-10 ${accent} text-white text-sm font-bold rounded-xl mb-6`}>{step}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-orange-500 uppercase tracking-[0.15em] mb-3">Everything included</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">All the tools your trip needs</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">12 features built and live — every pain point from planning to post-trip covered.</p>
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

      {/* Featured trips */}
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

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6 bg-gray-900">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to stop saying &ldquo;maybe next time&rdquo;?
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
            Create a trip in under 2 minutes. Find your crew, build a plan, and actually go.
          </p>
          <Link href="/login" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-orange-500 text-white text-base font-semibold rounded-2xl hover:bg-orange-600 transition-colors">
            Get started free <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
