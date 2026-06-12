'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { MapPin, Calendar, Users, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface TripPreview {
  id: string; title: string; destination: string; coverImage: string | null;
  startDate: string; endDate: string; maxMembers: number; _count: { members: number };
}

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [trip, setTrip]     = useState<TripPreview | null>(null);
  const [error, setError]   = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined]   = useState(false);

  useEffect(() => {
    apiClient.get<TripPreview>(`/invite/${token}`)
      .then(setTrip)
      .catch(() => setError('This invite link is invalid or has been revoked.'));
  }, [token]);

  const handleJoin = async () => {
    setJoining(true);
    try {
      const res = await apiClient.post<{ tripId: string }>(`/invite/${token}`, {});
      setJoined(true);
      setTimeout(() => router.push(`/trips/${res.tripId}`), 1500);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to join';
      if (msg.includes('401') || msg.toLowerCase().includes('unauthorized')) {
        router.push(`/login?callbackUrl=/invite/${token}`);
      } else {
        setError(msg);
        setJoining(false);
      }
    }
  };

  const fmt = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="min-h-screen bg-night flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {!trip && !error && (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-950/45 dark:text-white/30" />
          </div>
        )}

        {error && (
          <div className="bg-night-soft rounded-3xl border border-zinc-950/10 dark:border-white/10 p-8 text-center shadow-sm">
            <AlertCircle className="h-12 w-12 text-red-300 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-zinc-950 dark:text-white mb-2">Invalid Invite</h2>
            <p className="text-sm text-zinc-950/60 dark:text-white/50">{error}</p>
          </div>
        )}

        {trip && !error && (
          <div className="bg-night-soft rounded-3xl border border-zinc-950/10 dark:border-white/10 shadow-sm overflow-hidden">
            {/* Cover */}
            <div className="relative h-48 bg-gradient-to-br from-orange-500/20 to-amber-500/20">
              {trip.coverImage
                ? <Image src={trip.coverImage} alt={trip.title} fill className="object-cover" />
                : <div className="absolute inset-0 flex items-center justify-center"><MapPin className="h-12 w-12 text-orange-200" /></div>}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-4 left-5">
                <p className="text-zinc-950/80 dark:text-white/70 text-xs mb-0.5">You're invited to join</p>
                <h1 className="text-zinc-950 dark:text-white font-bold text-xl leading-tight">{trip.title}</h1>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm text-zinc-950/70 dark:text-white/60">
                  <MapPin className="h-4 w-4 text-orange-400 shrink-0" />
                  {trip.destination}
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-950/70 dark:text-white/60">
                  <Calendar className="h-4 w-4 text-orange-400 shrink-0" />
                  {fmt(trip.startDate)} — {fmt(trip.endDate)}
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-950/70 dark:text-white/60">
                  <Users className="h-4 w-4 text-orange-400 shrink-0" />
                  {trip._count.members} / {trip.maxMembers} members
                </div>
              </div>

              {joined ? (
                <div className="flex items-center gap-2 justify-center py-3 text-green-400 font-medium">
                  <CheckCircle2 className="h-5 w-5" />
                  Joined! Redirecting…
                </div>
              ) : (
                <button
                  onClick={handleJoin}
                  disabled={joining || trip._count.members >= trip.maxMembers}
                  className="w-full py-3 bg-orange-500 text-white font-semibold rounded-2xl hover:bg-orange-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {joining ? <><Loader2 className="h-4 w-4 animate-spin" />Joining…</> : trip._count.members >= trip.maxMembers ? 'Trip is full' : 'Join this trip'}
                </button>
              )}
              <p className="text-center text-xs text-zinc-950/55 dark:text-white/40">You'll be added as a member immediately.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
