import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Calendar, Plane, Globe, Instagram, Pencil } from 'lucide-react';
import { auth } from '@/lib/auth';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Avatar } from '@/components/shared/avatar';
import { Badge } from '@/components/shared/badge';
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

export default async function PublicProfilePage({ params }: Params) {
  const { username } = await params;
  const [session, user] = await Promise.all([auth(), getUser(username)]);
  if (!user) notFound();

  const isOwn = session?.user?.id === user.id;
  const totalTrips = user._count.tripsCreated + user._count.tripMembers;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
              <Avatar src={user.image} name={user.name} size="xl"
                className="ring-4 ring-white shadow-lg !h-28 !w-28 !text-3xl shrink-0" />

              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                  {user.travelStyle && (
                    <Badge variant="default" className="self-center sm:self-auto">
                      {TRAVEL_STYLE_LABELS[user.travelStyle]}
                    </Badge>
                  )}
                </div>
                {user.username && <p className="text-gray-400 text-sm mb-2">@{user.username}</p>}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-sm text-gray-500">
                  {user.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-orange-400" />
                      {user.city}{user.country ? `, ${user.country}` : ''}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-orange-400" />
                    Member since {formatDate(user.createdAt.toISOString())}
                  </span>
                  {user.instagram && (
                    <a
                      href={`https://instagram.com/${user.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-pink-500 hover:text-pink-600 transition-colors font-medium"
                    >
                      <Instagram className="h-3.5 w-3.5" />@{user.instagram.replace('@', '')}
                    </a>
                  )}
                </div>
              </div>

              {isOwn && (
                <Link
                  href="/profile/edit"
                  className="shrink-0 flex items-center gap-2 px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-xl border border-gray-200 hover:border-orange-300 hover:text-orange-600 transition-colors shadow-sm"
                >
                  <Pencil className="h-4 w-4" /> Edit profile
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Main */}
            <div className="lg:col-span-2 space-y-5">
              {user.bio && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">About</h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{user.bio}</p>
                </div>
              )}

              {(user.languages.length > 0 || user.travelStyle) && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Travel Profile</h2>
                  <div className="space-y-4">
                    {user.travelStyle && (
                      <div className="flex items-start gap-3">
                        <Plane className="h-4 w-4 text-orange-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs text-gray-400 mb-1.5">Travel style</p>
                          <Badge variant="default">{TRAVEL_STYLE_LABELS[user.travelStyle]}</Badge>
                        </div>
                      </div>
                    )}
                    {user.languages.length > 0 && (
                      <div className="flex items-start gap-3">
                        <Globe className="h-4 w-4 text-orange-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs text-gray-400 mb-1.5">Languages</p>
                          <div className="flex flex-wrap gap-1.5">
                            {user.languages.map((lang) => (
                              <span key={lang} className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                                {lang}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {user.tripsCreated.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Trips Hosted</h2>
                  <div className="space-y-1">
                    {user.tripsCreated.map((trip) => (
                      <Link
                        key={trip.id}
                        href={`/trips/${trip.id}`}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center shrink-0 overflow-hidden">
                          {trip.coverImage
                            ? <img src={trip.coverImage} alt="" className="w-full h-full object-cover" />
                            : <Plane className="h-4 w-4 text-orange-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 group-hover:text-orange-600 transition-colors truncate">{trip.title}</p>
                          <p className="text-xs text-gray-400">{trip.destination} · {new Date(trip.startDate).getFullYear()}</p>
                        </div>
                        <span className="text-xs text-gray-300 shrink-0">{TRIP_TYPE_LABELS[trip.tripType]}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Stats</h2>
                <div className="space-y-3">
                  {[
                    { label: 'Trips created', value: user._count.tripsCreated },
                    { label: 'Trips joined',  value: user._count.tripMembers  },
                    { label: 'Total trips',   value: totalTrips                },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{label}</span>
                      <span className="text-lg font-bold text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {isOwn && (
                <Link
                  href="/profile/edit"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-orange-500 text-white text-sm font-semibold rounded-2xl hover:bg-orange-600 transition-colors"
                >
                  <Pencil className="h-4 w-4" /> Edit your profile
                </Link>
              )}
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
