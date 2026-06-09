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
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
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
                    <a href={`https://instagram.com/${u