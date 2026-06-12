'use client';

import Link from 'next/link';
import {
  ArrowRight, CalendarDays, Wallet, Vote, Package,
  ShieldAlert, ListChecks, MessageCircle, CloudSun, Link2,
  Users, Bell, UserCircle, CheckCircle2, ArrowUpRight, MapPin,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { TripCard } from '@/components/shared/trip-card';
import type { TripSummaryDto } from '@/types';
import { FadeUp, StaggerGroup, StaggerItem, SplitWords, useGsapScroll } from '@/components/motion';

const FEATURES = [
  { icon: CalendarDays,  title: 'Itinerary Builder',    description: 'Day-by-day plans, built together. Members suggest, host approves.' },
  { icon: Wallet,        title: 'Expense Tracker',      description: 'Shared expenses with instant settlement breakdowns.' },
  { icon: Vote,          title: 'Group Polls',          description: 'Vote on dates and activities — results are instant.' },
  { icon: Package,       title: 'Packing Lists',        description: 'Curated essentials plus a personal checklist for everyone.' },
  { icon: ListChecks,    title: 'Task Management',      description: 'Pre-trip tasks with owners and due dates.' },
  { icon: MessageCircle, title: 'Real-time Chat',       description: 'A dedicated group chat for every trip.' },
  { icon: ShieldAlert,   title: 'Emergency Info',       description: 'Contacts shared privately with the host.' },
  { icon: CloudSun,      title: 'Weather Forecast',     description: 'Automatic 7-day forecast for your destination.' },
  { icon: Link2,         title: 'Instant Invite Links', description: 'One link — anyone who opens it joins.' },
  { icon: Users,         title: 'Traveler Profiles',    description: 'Travel style, languages, bio, trip history.' },
  { icon: Bell,          title: 'Smart Notifications',  description: 'Know when someone asks to join or gets approved.' },
  { icon: UserCircle,    title: 'Trip Status',          description: 'Planning → Confirmed → Ongoing → Completed.' },
];

const STEPS = [
  { step: '01', title: 'Post your trip',       description: 'Destination, dates, budget, vibe. Takes under 2 minutes. Your trip goes live for the right travelers to find.' },
  { step: '02', title: 'Build your crew',      description: 'Travelers request to join. Review their profiles and travel style, approve the good fits — or skip the queue with an instant invite link.' },
  { step: '03', title: 'Plan it all together', description: 'Itinerary, packing, tasks, expenses, chat — everything lives in one place. Everyone shows up prepared, nobody flakes.' },
];

const DESTINATIONS = ['Spiti Valley', 'Bali', 'Meghalaya', 'Lisbon', 'Ladakh', 'Hampi', 'Vietnam', 'Gokarna', 'Georgia', 'Rishikesh', 'Sri Lanka', 'Kasol'];

const HERO_CARDS = [
  { gradient: 'from-violet-500/80 to-indigo-700/80', place: 'Spiti Valley', meta: 'Dec ’26 · 3 spots left',  offset: 'lg:ml-0' },
  { gradient: 'from-sky-500/80 to-cyan-700/80',      place: 'Vietnam',      meta: '4 strangers, 1 van',      offset: 'lg:ml-14' },
  { gradient: 'from-orange-500/80 to-rose-600/80',   place: 'Gokarna',      meta: 'Long weekend · chill',    offset: 'lg:ml-4' },
];

const BTN_PRIMARY =
  'inline-flex items-center justify-center gap-2 px-8 py-4 bg-orange-500 text-white text-base font-bold rounded-xl ' +
  'shadow-[0_0_28px_-10px_rgba(249,115,22,0.6)] transition-all duration-300 ' +
  'hover:bg-orange-400 hover:shadow-[0_0_44px_-8px_rgba(249,115,22,0.85)]';
const BTN_SECONDARY =
  'inline-flex items-center justify-center gap-2 px-8 py-4 bg-zinc-950/[0.05] dark:bg-white/[0.06] text-zinc-950 dark:text-white text-base font-bold rounded-xl ' +
  'ring-1 ring-zinc-950/15 dark:ring-white/15 transition-all duration-300 hover:bg-zinc-950/[0.06] dark:hover:bg-white/10 hover:ring-zinc-950/30 dark:hover:ring-white/30';

const EYEBROW = 'font-display text-xs font-semibold uppercase tracking-[0.3em] text-orange-400';

function GlowOrb({ className }: { className?: string }) {
  return (
    <div
      className={`absolute rounded-full blur-3xl pointer-events-none animate-pulse-glow ${className}`}
      aria-hidden="true"
    />
  );
}

function GlassCard({
  gradient, place, meta, offset, index,
}: {
  gradient: string; place: string; meta: string; offset: string; index: number;
}) {
  return (
    <motion.div
      className={`w-full max-w-xs ${offset}`}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: 80, damping: 18, delay: 0.8 + index * 0.25 }}
    >
      <div
        className="animate-float-slow rounded-2xl bg-zinc-950/[0.05] dark:bg-white/[0.06] backdrop-blur-md ring-1 ring-zinc-950/10 dark:ring-white/10 p-3 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8)] transition-colors duration-300 hover:ring-orange-500/40"
        style={{ animationDelay: `${index * 0.9}s` }}
      >
        <div className={`h-24 rounded-xl bg-gradient-to-br ${gradient}`} />
        <div className="flex items-center gap-1.5 mt-3 px-1">
          <MapPin className="h-3.5 w-3.5 text-orange-400 shrink-0" />
          <p className="text-sm font-semibold text-zinc-950 dark:text-white truncate">{place}</p>
        </div>
        <p className="text-xs text-zinc-950/55 dark:text-white/40 px-1 pb-1 mt-0.5">{meta}</p>
      </div>
    </motion.div>
  );
}

// ── How it works — sticky rail left, steps + drawn line right ─────────────────
function HowItWorks() {
  const ref = useGsapScroll(({ gsap, el }) => {
    const line = el.querySelector('[data-line]') as SVGPathElement | null;
    if (!line) return;
    const len = line.getTotalLength();
    gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });
    gsap.to(line, {
      strokeDashoffset: 0,
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top 60%', end: 'bottom 70%', scrub: 0.8 },
    });
  });

  return (
    <section ref={ref} className="relative py-28 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[5fr,7fr] gap-14 lg:gap-20">

        {/* Sticky rail */}
        <div className="lg:sticky lg:top-28 self-start">
          <FadeUp>
            <span className={EYEBROW}>How it works</span>
          </FadeUp>
          <FadeUp delay={0.08}>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-zinc-950 dark:text-white mt-4 leading-tight">
              Three steps.<br />Zero flaking.
            </h2>
          </FadeUp>
          <FadeUp delay={0.16}>
            <p className="text-zinc-950/60 dark:text-white/50 text-lg mt-6 max-w-sm leading-relaxed">
              From “I wish someone would come along” to boarding passes — without a single planning spreadsheet.
            </p>
          </FadeUp>
          <FadeUp delay={0.24}>
            <Link
              href="/trips/new"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-orange-400 mt-8 transition-colors duration-300 hover:text-orange-300 group"
            >
              Start your first trip
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </FadeUp>
        </div>

        {/* Steps with drawn vertical line */}
        <div className="relative">
          <svg
            className="hidden sm:block absolute left-[27px] top-6 h-[calc(100%-3rem)] w-1 pointer-events-none"
            viewBox="0 0 2 100" preserveAspectRatio="none" fill="none" aria-hidden="true"
          >
            <path data-line d="M1 0 L1 100" stroke="#F97316" strokeOpacity="0.4" strokeWidth="2" />
          </svg>

          <div className="space-y-14">
            {STEPS.map(({ step, title, description }) => (
              <FadeUp key={step}>
                <div className="flex gap-6 sm:gap-8">
                  <div className="shrink-0 w-14 h-14 rounded-full bg-night-soft ring-1 ring-orange-500/40 flex items-center justify-center relative z-10">
                    <span className="font-display text-lg font-bold bg-gradient-to-br from-orange-400 to-amber-300 bg-clip-text text-transparent">
                      {step}
                    </span>
                  </div>
                  <div className="pt-1">
                    <h3 className="font-display text-2xl font-bold text-zinc-950 dark:text-white mb-3">{title}</h3>
                    <p className="text-zinc-950/60 dark:text-white/50 leading-relaxed max-w-lg">{description}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function MarketingLanding({ featuredTrips }: { featuredTrips: TripSummaryDto[] }) {
  return (
    <main className="bg-night text-zinc-950 dark:text-white overflow-x-clip">

      {/* ── Hero — split ──────────────────────────────────────────────────── */}
      <section className="relative pt-20 pb-24 sm:pt-28 sm:pb-32 px-4 sm:px-6 night-grid overflow-hidden">
        <GlowOrb className="w-[560px] h-[560px] bg-orange-600/20 -top-48 -right-32" />
        <GlowOrb className="w-[400px] h-[400px] bg-amber-500/10 bottom-0 -left-48" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-night pointer-events-none" />

        <div className="relative max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[7fr,5fr] gap-16 items-center">
          {/* Left — copy */}
          <div>
            <FadeUp>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-zinc-950/[0.05] dark:bg-white/[0.06] backdrop-blur-sm text-orange-300 text-xs font-display font-semibold uppercase tracking-[0.25em] rounded-full ring-1 ring-orange-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                12 features live — free while in beta
              </span>
            </FadeUp>

            <h1 className="font-display text-5xl sm:text-6xl lg:text-[4.6rem] font-bold leading-[1.05] tracking-tight mt-8 text-zinc-950 dark:text-white">
              <SplitWords text="Never cancel a trip" />
              <br />
              <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-orange-400 bg-clip-text text-transparent">
                <SplitWords text="because your friends" delay={0.3} />
              </span>
              <br />
              <SplitWords text="said no." delay={0.6} />
            </h1>

            <FadeUp delay={0.9} className="mt-8">
              <p className="text-lg sm:text-xl text-zinc-950/60 dark:text-white/50 leading-relaxed max-w-xl">
                Post the trip anyway. Find a crew of travelers who actually show up,
                and plan everything together — in one place, not five group chats.
              </p>
            </FadeUp>

            <FadeUp delay={1.0} className="mt-10">
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/trips/new" className={BTN_PRIMARY}>
                  Create a Trip <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/trips" className={BTN_SECONDARY}>
                  Explore Trips
                </Link>
              </div>
            </FadeUp>

            <FadeUp delay={1.1} className="mt-8">
              <div className="flex flex-wrap items-center gap-5 text-sm text-zinc-950/50 dark:text-white/35">
                {['No credit card', 'Sign in with Google', 'Free to use'].map((label) => (
                  <span key={label} className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-orange-400/70" />
                    {label}
                  </span>
                ))}
              </div>
            </FadeUp>
          </div>

          {/* Right — stacked glass cards */}
          <div className="hidden lg:flex flex-col gap-5 items-start relative">
            <GlowOrb className="w-[300px] h-[300px] bg-orange-500/15 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            {HERO_CARDS.map((card, i) => (
              <GlassCard key={card.place} {...card} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Destination ticker ────────────────────────────────────────────── */}
      <section className="relative py-5 border-y border-zinc-950/10 dark:border-white/10 bg-zinc-950/[0.02] dark:bg-white/[0.02] overflow-hidden" aria-hidden="true">
        <div className="marquee-track">
          {[...DESTINATIONS, ...DESTINATIONS].map((d, i) => (
            <span key={i} className="flex items-center shrink-0">
              <span className="font-display text-sm font-semibold uppercase tracking-[0.25em] text-zinc-950/55 dark:text-white/40 px-8">{d}</span>
              <span className="w-1 h-1 rounded-full bg-orange-500/70 shrink-0" />
            </span>
          ))}
        </div>
      </section>

      {/* ── How it works — split ──────────────────────────────────────────── */}
      <HowItWorks />

      {/* ── Features — split, rail on the right ───────────────────────────── */}
      <section className="relative py-28 px-4 sm:px-6">
        <GlowOrb className="w-[480px] h-[480px] bg-orange-600/10 top-32 -left-56" />
        <div className="relative max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[7fr,5fr] gap-14 lg:gap-20">

          {/* Feature grid — left */}
          <StaggerGroup className="grid grid-cols-1 sm:grid-cols-2 gap-4 order-2 lg:order-1" stagger={0.05}>
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <StaggerItem key={title}>
                <div className="h-full bg-zinc-950/[0.04] dark:bg-white/[0.04] backdrop-blur-sm rounded-2xl p-5 ring-1 ring-zinc-950/10 dark:ring-white/10 transition-colors duration-300 hover:ring-orange-500/40 hover:bg-zinc-950/[0.05] dark:hover:bg-white/[0.06]">
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className="w-9 h-9 bg-orange-500/10 text-orange-400 rounded-lg flex items-center justify-center shrink-0">
                      <Icon className="h-[18px] w-[18px]" />
                    </div>
                    <h3 className="font-display text-[15px] font-bold text-zinc-950 dark:text-white">{title}</h3>
                  </div>
                  <p className="text-sm text-zinc-950/60 dark:text-white/50 leading-relaxed">{description}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>

          {/* Sticky rail — right */}
          <div className="lg:sticky lg:top-28 self-start order-1 lg:order-2">
            <FadeUp>
              <span className={EYEBROW}>The whole toolkit</span>
            </FadeUp>
            <FadeUp delay={0.08}>
              <h2 className="font-display text-4xl sm:text-5xl font-bold text-zinc-950 dark:text-white mt-4 leading-tight">
                Everything your trip needs
              </h2>
            </FadeUp>
            <FadeUp delay={0.16}>
              <p className="text-zinc-950/60 dark:text-white/50 text-lg mt-6 max-w-sm leading-relaxed">
                Twelve features built and live — every pain point from planning to post-trip, covered.
                No plugins, no premium tier, no “coming soon.”
              </p>
            </FadeUp>
            <FadeUp delay={0.24}>
              <div className="flex items-center gap-3 mt-8">
                <span className="font-display text-5xl font-bold bg-gradient-to-br from-orange-400 to-amber-300 bg-clip-text text-transparent">12</span>
                <span className="text-sm text-zinc-950/55 dark:text-white/40 leading-snug">features shipped<br />and counting</span>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── Featured trips — split rail left, cards right ─────────────────── */}
      {featuredTrips.length > 0 && (
        <section className="relative py-28 px-4 sm:px-6 border-t border-zinc-950/5 dark:border-white/5">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[4fr,8fr] gap-14 lg:gap-20">

            {/* Sticky rail */}
            <div className="lg:sticky lg:top-28 self-start">
              <FadeUp>
                <span className={EYEBROW}>Live right now</span>
              </FadeUp>
              <FadeUp delay={0.08}>
                <h2 className="font-display text-4xl font-bold text-zinc-950 dark:text-white mt-4 leading-tight">
                  Trips with open spots
                </h2>
              </FadeUp>
              <FadeUp delay={0.16}>
                <p className="text-zinc-950/60 dark:text-white/50 mt-6 max-w-xs leading-relaxed">
                  Real trips from real travelers, waiting on a crew. Yours could be next.
                </p>
              </FadeUp>
              <FadeUp delay={0.24}>
                <Link
                  href="/trips"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-orange-400 mt-8 transition-colors duration-300 hover:text-orange-300 group"
                >
                  View all trips
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </FadeUp>
            </div>

            {/* Cards */}
            <StaggerGroup className="grid grid-cols-1 sm:grid-cols-2 gap-6" stagger={0.1}>
              {featuredTrips.map((trip) => (
                <StaggerItem key={trip.id}>
                  <TripCard trip={trip} />
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </section>
      )}

      {/* ── CTA — split panel ─────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 pb-24 pt-4">
        <FadeUp>
          <div className="relative max-w-6xl mx-auto bg-night-soft rounded-3xl overflow-hidden ring-1 ring-zinc-950/10 dark:ring-white/10">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(249,115,22,0.16),transparent_60%)] pointer-events-none" aria-hidden="true" />
            <GlowOrb className="w-[300px] h-[300px] bg-orange-500/20 -bottom-32 -right-16" />

            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 px-8 py-14 sm:p-16 items-center">
              <div>
                <span className={`${EYEBROW} inline-block mb-5`}>Your move</span>
                <h2 className="font-display text-4xl sm:text-5xl font-bold text-zinc-950 dark:text-white leading-tight">
                  Stop saying “maybe next time.”
                </h2>
                <p className="text-zinc-950/60 dark:text-white/50 text-lg mt-5 max-w-md">
                  Create a trip in under 2 minutes. Find your crew, build a plan, and actually go.
                </p>
              </div>

              <div className="flex flex-col items-start lg:items-end gap-6">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-orange-500 text-white text-lg font-bold rounded-xl shadow-[0_0_44px_-10px_rgba(249,115,22,0.7)] transition-all duration-300 hover:bg-orange-400 hover:shadow-[0_0_70px_-10px_rgba(249,115,22,0.95)]"
                >
                  Get started free <ArrowRight className="h-5 w-5" />
                </Link>
                <div className="flex flex-col gap-2 text-sm text-zinc-950/50 dark:text-white/35">
                  {['No credit card needed', 'Sign in with Google', 'Free while in beta'].map((label) => (
                    <span key={label} className="flex items-center gap-1.5 lg:flex-row-reverse">
                      <CheckCircle2 className="h-4 w-4 text-orange-400/70" />
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </FadeUp>
      </section>
    </main>
  );
}
