'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';

interface TripActionsProps {
  tripId: string;
  isCreator: boolean;
  isMember: boolean;
  isLoggedIn: boolean;
  isFull: boolean;
  userId?: string | null;
  hasPendingRequest: boolean;
}

export function TripActions({ tripId, isCreator, isMember, isLoggedIn, isFull, hasPendingRequest  }: TripActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [requested, setRequested] = useState(hasPendingRequest);
  const [error, setError] = useState<string | null>(null);

  if (isCreator) {
    return (
      <Link href={`/trips/${tripId}/edit`} className="w-full flex items-center justify-center px-4 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors">
        Edit Trip
      </Link>
    );
  }
  if (isMember) {
    return (
      <div className="w-full flex items-center justify-center px-4 py-3 bg-green-50 text-green-700 text-sm font-semibold rounded-xl border border-green-100">
        ✓ You're on this trip
      </div>
    );
  }
  if (!isLoggedIn) {
    return (
      <Link href={`/login?callbackUrl=/trips/${tripId}`} className="w-full flex items-center justify-center px-4 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors">
        Sign in to Request to Join
      </Link>
    );
  }
  if (isFull) {
    return (
      <div className="w-full flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-400 text-sm font-semibold rounded-xl cursor-not-allowed">
        Trip is Full
      </div>
    );
  }
  if (requested) {
    return (
      <div className="w-full flex items-center justify-center px-4 py-3 bg-blue-50 text-blue-700 text-sm font-semibold rounded-xl border border-blue-100">
        ⏳ Request sent — awaiting approval
      </div>
    );
  }

  const handleJoin = async () => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.post(`/trips/${tripId}/join`);
      setRequested(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button onClick={handleJoin} disabled={loading} className="w-full flex items-center justify-center px-4 py-3 bg-orange-500 text-white text-sm font-semibold rounded-xl hover:bg-orange-600 disabled:opacity-60 transition-colors">
        {loading ? 'Sending request...' : 'Request to Join'}
      </button>
      {error && <p className="text-xs text-red-500 text-center">{error}</p>}
    </div>
  );
}
