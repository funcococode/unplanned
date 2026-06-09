import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, MapPin, Users, Wallet, ShieldCheck, Lock, CalendarDays, Package, Wrench, ArrowRight, CheckCircle2 } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Avatar } from '@/components/shared/avatar';
import { Badge } from '@/components/shared/badge';
import { TripNav } from '@/components/shared/trip-nav';
import { TripActions } from '@/features/trips/trip-actions';
import { PersonalPacking } from '@/features/trips/personal-packing';
import { TripWeather } from '@/features/trips/trip-weather';
import { TripStatusBadge } from '@/features/trips/trip-status';
import { BUDGET_RANGE_LABELS, TRIP_TYPE_LABELS } from '@/types';
import { formatDateRange, tripDurationDays } from '@/lib/utils';

export default async function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [session, trip, members, itineraryDays, essentialItems] = await Promise.all([
    auth(),
    prisma.trip.findUnique({ where: { id }, include: { creator: true, _count: { select: { members: true } } }, }),
    prisma.tripMember.findMany({ where: { tripId: id }, select: { id: true, role: true, userId: true, user: { select: { id: true, name: true, image: true, city: true, country: true, username: true } } } }),
    prisma.itineraryDay.findMany({
      where: { tripId: id }, orderBy: { dayNumber: 'asc' },
      include: { items: { orderBy: [{ order: 'asc' }, { time: 'asc' }] } },
    }),
    prisma.tripEssentialItem.findMany({ where: { tripId: id }, orderBy: [{ category: 'asc' }, { order: 'asc' }] }),
  ]);
  if (!trip) notFound();

  const userId = session?.user?.id;
  const isLoggedIn = !!session;
  const duration = tripDurationDays(trip.startDate, trip.endDate);
  const spotsLeft = trip.maxMembers - trip._count.members;
  const isCreator = userId === trip.creatorId;
  const isMember = members.some((m) => m.userId === userId);
  const pendingRequest = userId && !isMember && !isCreator
    ? await prisma.joinRequest.findUnique({ where: { tripId_userId: { tripId: id, userId } } }) : null;
  const hasPendingRequest = pendingRequest?.status === 'PENDING';

  // Flatten up to 3 itinerary items across days for the preview
  const itineraryPreview = itineraryDays
    .flatMap((d) => d.items.map((item) => ({ day: d.dayNumber, title: item.title, time: item.time })))
    .slice(0, 3);
  const totalItineraryItems = itineraryDays.reduce((s, d) => s + d.items.length, 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <div className="relative h-72 sm:h-96 bg-gradient-to-br from-gray-100 to-gray-200">
          {trip.coverImage
            ? <Image src={trip.coverImage} alt={trip.title} fill className="object-cover" priority sizes="100vw" />
            : <div className="absolute inset-0 flex items-center justify-center"><MapPin className="h-16 w-16 text-gray-300" /></div>}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="default">{TRIP_TYPE_LABELS[trip.tripType as keyof typeof TRIP_TYPE_LABELS]}</Badge>
                <TripStatusBadge status={trip.status as 'PLANNING' | 'CONFIRMED' | 'ONGOING' | 'COMPLETED'} />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">{trip.title}</h1>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* TripNav — members/creator only */}
          {(isCreator || isMember) && (
            <div className="mb-8">
              <TripNav tripId={id} isMember={true} />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* ── Main ── */}
            <div className="lg:col-span-2 space-y-8">

              {/* Stats */}
              <div className={`grid gap-3 ${isLoggedIn ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3'}`}>
                {/* Destination */}
                <div className="group relative overflow-hidden bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-2xl p-4">
                  <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center mb-3">
                    <MapPin className="h-4 w-4 text-orange-500" />
                  </div>
                  <p className="text-[11px] font-medium text-orange-400 uppercase tracking-wide mb-0.5">Destination</p>
                  <p className="text-sm font-bold text-gray-900 leading-snug">{trip.destination}</p>
                </div>

                {/* Dates */}
                <div className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center mb-3">
                    <Calendar className="h-4 w-4 text-blue-500" />
                  </div>
                  <p className="text-[11px] font-medium text-blue-400 uppercase tracking-wide mb-0.5">Dates</p>
                  <p className="text-sm font-bold text-gray-900 leading-snug">{formatDateRange(trip.startDate, trip.endDate)}</p>
                  <p className="text-xs text-blue-400 mt-0.5">{duration} days</p>
                </div>

                {/* Members */}
                {isLoggedIn && (
                  <div className="group relative overflow-hidden bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 rounded-2xl p-4">
                    <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center mb-3">
                      <Users className="h-4 w-4 text-violet-500" />
                    </div>
                    <p className="text-[11px] font-medium text-violet-400 uppercase tracking-wide mb-0.5">Members</p>
                    <p className="text-sm font-bold text-gray-900 leading-snug">{trip._count.members} <span className="font-normal text-gray-400">/ {trip.maxMembers}</span></p>
                    <p className="text-xs text-violet-400 mt-0.5">{spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left</p>
                  </div>
                )}

                {/* Budget */}
                {isLoggedIn && (
                  <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 rounded-2xl p-4">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center mb-3">
                      <Wallet className="h-4 w-4 text-emerald-500" />
                    </div>
                    <p className="text-[11px] font-medium text-emerald-400 uppercase tracking-wide mb-0.5">Budget</p>
                    <p className="text-sm font-bold text-gray-900 leading-snug">{BUDGET_RANGE_LABELS[trip.budgetRange as keyof typeof BUDGET_RANGE_LABELS]}</p>
                  </div>
                )}
              </div>

              {/* About */}
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">About this trip</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{trip.description}</p>
              </section>

              {/* Itinerary preview */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-orange-500" />Itinerary
                  </h2>
                  <Link href={`/trips/${id}/itinerary`}
                    className="flex items-center gap-1 text-sm text-orange-500 hover:text-orange-600 font-medium">
                    View all <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
                {itineraryPreview.length > 0 ? (
                  <div className="space-y-2">
                    {itineraryPreview.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <span className="text-xs font-bold text-orange-400 w-10 shrink-0">Day {item.day}</span>
                        <p className="text-sm font-medium text-gray-900 flex-1 truncate">{item.title}</p>
                        {item.time && <span className="text-xs text-gray-400 shrink-0">{item.time}</span>}
                      </div>
                    ))}
                    <Link href={`/trips/${id}/itinerary`}
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-dashed border-gray-200 text-sm text-gray-400 hover:border-orange-300 hover:text-orange-500 transition-colors mt-1">
                      {totalItineraryItems > 3 ? `+${totalItineraryItems - 3} more stops` : 'Open full itinerary'}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                ) : (
                  <Link href={`/trips/${id}/itinerary`}
                    className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors group">
                    <CalendarDays className="h-8 w-8 text-gray-200 group-hover:text-orange-300 transition-colors" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">No itinerary planned yet</p>
                      <p className="text-xs text-gray-400">Open the itinerary page to add days and stops →</p>
                    </div>
                  </Link>
                )}
              </section>

              {/* Meeting point */}
              {trip.meetingPoint && (isLoggedIn ? (
                <section>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-orange-500" />Meeting Point
                  </h2>
                  <p className="text-gray-600">{trip.meetingPoint}</p>
                </section>
              ) : (
                <section>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-orange-500" />Meeting Point
                  </h2>
                  <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <Lock className="h-4 w-4 text-gray-400 shrink-0" />
                    <p className="text-sm text-gray-500">
                      <Link href={`/login?callbackUrl=/trips/${id}`} className="text-orange-500 font-medium hover:underline">Sign in</Link>{' '}to see the meeting point.
                    </p>
                  </div>
                </section>
              ))}

              {/* Rules */}
              {trip.rules && (
                <section>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-orange-500" />Trip Rules
                  </h2>
                  <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{trip.rules}</p>
                  </div>
                </section>
              )}

              {/* Travelers */}
              {isLoggedIn ? (
                <section>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-orange-500" />Travelers ({members.length})
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {members.map((m) => (
                      <Link key={m.id} href={m.user.username ? `/profile/${m.user.username}` : '#'}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-orange-50 hover:border-orange-100 border border-transparent transition-colors group">
                        <Avatar src={m.user.image} name={m.user.name} size="md" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 group-hover:text-orange-600 transition-colors truncate">{m.user.name}</p>
                          {m.user.city && <p className="text-xs text-gray-500">{m.user.city}, {m.user.country}</p>}
                        </div>
                        {m.role === 'CREATOR' && <Badge variant="outline" className="ml-auto shrink-0">Creator</Badge>}
                      </Link>
                    ))}
                  </div>
                </section>
              ) : (
                <section>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-orange-500" />Travelers
                  </h2>
                  <Link href={`/login?callbackUrl=/trips/${id}`} className="flex items-center gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50 transition-colors group">
                    <div className="flex -space-x-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="w-9 h-9 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center" />
                      ))}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">Sign in to see travelers</p>
                      <p className="text-xs text-gray-500 mt-0.5">{trip._count.members} traveler{trip._count.members !== 1 ? 's' : ''} joined</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-orange-400 transition-colors shrink-0" />
                  </Link>
                </section>
              )}

              {/* Packing preview — members/creator only */}
              {(isCreator || isMember) && essentialItems.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <Package className="h-5 w-5 text-orange-500" />Packing
                    </h2>
                    <Link href={`/trips/${id}/packing`}
                      className="flex items-center gap-1 text-sm text-orange-500 hover:text-orange-600 font-medium">
                      View all <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                  <div className="space-y-2">
                    {essentialItems.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <CheckCircle2 className="h-4 w-4 text-gray-300 shrink-0" />
                        <p className="text-sm font-medium text-gray-900 flex-1 truncate">{item.text}</p>
                        {item.category && <span className="text-xs text-gray-400 shrink-0">{item.category}</span>}
                      </div>
                    ))}
                    {essentialItems.length > 3 && (
                      <Link href={`/trips/${id}/packing`}
                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-dashed border-gray-200 text-sm text-gray-400 hover:border-orange-300 hover:text-orange-500 transition-colors mt-1">
                        +{essentialItems.length - 3} more items <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </div>
                </section>
              )}

              {/* Trip tools entry — members/creator only */}
              {(isCreator || isMember) && (
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <Wrench className="h-5 w-5 text-orange-500" />Trip Tools
                    </h2>
                  </div>
                  <Link href={`/trips/${id}/tools`}
                    className="flex items-center gap-4 p-5 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-100 hover:border-orange-300 transition-colors group">
                    <div className="flex gap-3 text-2xl">
                      <span>💸</span><span>🗳️</span><span>🚨</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">Expenses, Polls & Emergency Info</p>
                      <p className="text-xs text-gray-500 mt-0.5">Manage shared costs, vote on plans, and keep emergency contacts safe.</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-orange-400 transition-colors shrink-0" />
                  </Link>
                </section>
              )}
            </div>

            {/* ── Sidebar ── */}
            <div className="space-y-6">
              <TripActions
                tripId={id}
                userId={userId ?? null}
                isCreator={isCreator}
                isMember={isMember}
                isLoggedIn={isLoggedIn}
                isFull={spotsLeft <= 0}
                hasPendingRequest={hasPendingRequest}
              />

              <TripWeather
                destination={trip.destination}
                startDate={trip.startDate.toISOString()}
                endDate={trip.endDate.toISOString()}
              />

              {(isCreator || isMember) && (
                <PersonalPacking
                  tripId={id}
                  essentialItems={essentialItems.map((e) => ({ id: e.id, text: e.text, category: e.category ?? '' }))}
                />
              )}
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
