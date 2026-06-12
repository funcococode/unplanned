import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Calendar, Plane, Globe, Instagram, Pencil } from 'lucide-react';
import { auth } from '@/lib/auth';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Avatar } from '@/components/shared/avatar';
import { Badge } from '@/components/shared/badge';
import { FadeUp, StaggerGroup, StaggerItem } from '@/components/motion';
import { prisma } from '@/lib/prisma';
import { TRAVEL_STYLE_LABELS, TRIP_TYPE_LABELS } from '@/types';
import { formatDate } from '@/lib/utils';

type Params = { params: Promise<{ username: string }> };

async function getUser(username: string) {
  return prisma.user.findUnique({
    where: { username },
    include: {
      _count: { select: { tripsCreated: true, tripMembers: { where: { role: 'MEMBER' } } } },
      tripsCreated: {
        take: 4,
        orderBy: { createdAt: 'desc' },
        select: { id: true, title: true, destination: true, coverImage: true, startDate: true, tripType: true },
      },
    },
  });
}

export async function generateMetadata({ params }: Params) {
  const { username } = await params;
  const user = await getUser(username);
  return { title: user ? `${user.name} — Unplanned` : 'Profile not found' };
}

const panelLabel = 'font-display text-xs font-semibold uppercase tracking-[0.3em] text-orange-400 mb-4 block';

export default async function PublicProfilePage({ params }: Params) {
  const { username } = await params;
  const [session, user] = await Promise.all([auth(), getUser(username)]);
  if (!user) notFound();

  const isOwn = session?.user?.id === user.id;
  const totalTrips = user._count.tripsCreated + user._count.tripMembers;

  return (
    <div className="min-h-screen flex flex-col bg-night">
      <Navbar />
      <main className="flex-1">

        {/* ── Banner ── */}
        <div className="relative overflow-hidden border-b border-zinc-950/10 dark:border-white/10 night-grid">
          <div className="absolute w-[520px] h-[520px] rounded-full blur-3xl bg-orange-600/20 -top-64 right-0 pointer-events-none animate-pulse-glow" aria-hidden="true" />
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-0">
            <FadeUp>
              <span className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-orange-400">Traveler profile</span>
            </FadeUp>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mt-6">
              <FadeUp delay={0.08}>
                <h1 className="font-display text-4xl sm:text-6xl font-bold text-zinc-950 dark:text-white leading-none">
                  {user.name}
                </h1>
                {user.username && <p className="text-zinc-950/55 dark:text-white/40 text-sm mt-3">@{user.username}</p>}
              </FadeUp>

              {/* Stat strip */}
              <FadeUp delay={0.16}>
                <div className="flex gap-8 sm:gap-10 pb-1">
                  {[
                    { label: 'created', value: user._count.tripsCreated },
                    { label: 'joined',  value: user._count.tripMembers },
                    { label: 'total',   value: totalTrips },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="font-display text-3xl font-bold bg-gradient-to-br from-orange-400 to-amber-300 bg-clip-text text-transparent">{value}</p>
                      <p className="text-xs uppercase tracking-[0.15em] text-zinc-950/55 dark:text-white/40 mt-1">{label}</p>
                    </div>
                  ))}
                </div>
              </FadeUp>
            </div>

            {/* Avatar overlaps the banner edge */}
            <div className="relative z-10 flex items-end justify-between mt-10 -mb-14">
              <FadeUp delay={0.2}>
                <Avatar src={user.image} name={user.name} size="xl"
                  className="ring-4 ring-night shadow-[0_0_50px_-10px_rgba(249,115,22,0.45)] !h-28 !w-28 !text-3xl shrink-0" />
              </FadeUp>
              {isOwn && (
                <FadeUp delay={0.24}>
                  <Link
                    href="/profile/edit"
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-950/[0.05] dark:bg-white/[0.06] backdrop-blur-sm text-zinc-950/90 dark:text-white/80 text-sm font-bold rounded-xl ring-1 ring-zinc-950/15 dark:ring-white/15 transition-all duration-300 hover:ring-orange-500/50 hover:text-orange-300 mb-2"
                  >
                    <Pencil className="h-4 w-4" /> Edit profile
                  </Link>
                </FadeUp>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-12">
          {/* Meta row */}
          <FadeUp>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-zinc-950/60 dark:text-white/50 mb-10">
              {user.travelStyle && <Badge variant="default">{TRAVEL_STYLE_LABELS[user.travelStyle]}</Badge>}
              {user.city && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-orange-400" />
                  {user.city}{user.country ? `, ${user.country}` : ''}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-orange-400" />
                Member since {formatDate(user.createdAt.toISOString())}
              </span>
              {user.instagram && (
                <a
                  href={`https://instagram.com/${user.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-pink-400 transition-colors duration-300 hover:text-pink-300 font-medium"
                >
                  <Instagram className="h-3.5 w-3.5" />@{user.instagram.replace('@', '')}
                </a>
              )}
            </div>
          </FadeUp>

          <StaggerGroup className="grid grid-cols-1 lg:grid-cols-[7fr,5fr] gap-6" stagger={0.1}>

            {/* Main */}
            <div className="space-y-6 min-w-0">
              {user.bio && (
                <StaggerItem>
                  <div className="bg-zinc-950/[0.04] dark:bg-white/[0.04] backdrop-blur-sm rounded-2xl ring-1 ring-zinc-950/10 dark:ring-white/10 p-7">
                    <span className={panelLabel}>About</span>
                    <p className="text-zinc-950/90 dark:text-white/80 text-lg leading-relaxed whitespace-pre-line">{user.bio}</p>
                  </div>
                </StaggerItem>
              )}

              {user.tripsCreated.length > 0 && (
                <StaggerItem>
                  <div className="bg-zinc-950/[0.04] dark:bg-white/[0.04] backdrop-blur-sm rounded-2xl ring-1 ring-zinc-950/10 dark:ring-white/10 p-7">
                    <span className={panelLabel}>Trips hosted</span>
                    <div className="space-y-1">
                      {user.tripsCreated.map((trip) => (
                        <Link
                          key={trip.id}
                          href={`/trips/${trip.id}`}
                          className="flex items-center gap-3 p-3 rounded-xl transition-colors duration-300 hover:bg-zinc-950/[0.05] dark:hover:bg-white/[0.05] group"
                        >
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center shrink-0 overflow-hidden">
                            {trip.coverImage
                              ? <img src={trip.coverImage} alt="" className="w-full h-full object-cover" />
                              : <Plane className="h-4 w-4 text-orange-400" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-zinc-950 dark:text-white transition-colors duration-300 group-hover:text-orange-300 truncate">{trip.title}</p>
                            <p className="text-xs text-zinc-950/55 dark:text-white/40">{trip.destination} · {new Date(trip.startDate).getFullYear()}</p>
                          </div>
                          <span className="text-xs text-zinc-950/45 dark:text-white/30 shrink-0">{TRIP_TYPE_LABELS[trip.tripType]}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </StaggerItem>
              )}
            </div>

            {/* Side */}
            <div className="space-y-6">
              {(user.languages.length > 0 || user.travelStyle) && (
                <StaggerItem>
                  <div className="bg-zinc-950/[0.04] dark:bg-white/[0.04] backdrop-blur-sm rounded-2xl ring-1 ring-zinc-950/10 dark:ring-white/10 p-7">
                    <span className={panelLabel}>Travel profile</span>
                    <div className="space-y-5">
                      {user.travelStyle && (
                        <div className="flex items-start gap-3">
                          <Plane className="h-4 w-4 text-orange-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs text-zinc-950/55 dark:text-white/40 mb-1.5">Travel style</p>
                            <Badge variant="default">{TRAVEL_STYLE_LABELS[user.travelStyle]}</Badge>
                          </div>
                        </div>
                      )}
                      {user.languages.length > 0 && (
                        <div className="flex items-start gap-3">
                          <Globe className="h-4 w-4 text-orange-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs text-zinc-950/55 dark:text-white/40 mb-1.5">Languages</p>
                            <div className="flex flex-wrap gap-1.5">
                              {user.languages.map((lang) => (
                                <span key={lang} className="px-2.5 py-1 bg-zinc-950/[0.05] dark:bg-white/[0.06] text-zinc-950/90 dark:text-white/80 rounded-full text-xs font-medium">
                                  {lang}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </StaggerItem>
              )}

              {isOwn && (
                <StaggerItem>
                  <Link
                    href="/profile/edit"
                    className="flex items-center justify-center gap-2 w-full py-3.5 bg-orange-500 text-white text-sm font-bold rounded-2xl shadow-[0_0_28px_-10px_rgba(249,115,22,0.6)] transition-all duration-300 hover:bg-orange-400"
                  >
                    <Pencil className="h-4 w-4" /> Edit your profile
                  </Link>
                </StaggerItem>
              )}
            </div>

          </StaggerGroup>
        </div>
      </main>
      <Footer />
    </div>
  );
}
