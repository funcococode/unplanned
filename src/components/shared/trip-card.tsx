import Link from 'next/link';
import Image from 'next/image';
import { Calendar, MapPin, Users } from 'lucide-react';
import type { TripSummaryDto } from '@/types';
import { BUDGET_RANGE_LABELS, TRIP_TYPE_LABELS } from '@/types';
import { formatDateRange, tripDurationDays } from '@/lib/utils';

// Deterministic gradient based on destination string
const GRADIENTS = [
  'from-orange-400 to-pink-500',
  'from-blue-400 to-cyan-500',
  'from-emerald-400 to-teal-500',
  'from-violet-400 to-purple-500',
  'from-amber-400 to-orange-500',
  'from-rose-400 to-red-500',
  'from-sky-400 to-blue-500',
  'from-lime-400 to-green-500',
];

function destinationGradient(destination: string) {
  let hash = 0;
  for (let i = 0; i < destination.length; i++) hash = (hash * 31 + destination.charCodeAt(i)) >>> 0;
  return GRADIENTS[hash % GRADIENTS.length];
}

interface TripCardProps {
  trip: TripSummaryDto;
}

export function TripCard({ trip }: TripCardProps) {
  const duration = tripDurationDays(trip.startDate, trip.endDate);
  const spotsLeft = trip.maxMembers - trip.currentMemberCount;

  return (
    <Link href={`/trips/${trip.id}`} className="group block">
      <article className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md hover:border-gray-200 transition-all duration-200">
        {/* Cover Image */}
        <div className={`relative h-52 overflow-hidden ${trip.coverImage ? 'bg-gray-100' : `bg-gradient-to-br ${destinationGradient(trip.destination)}`}`}>
          {trip.coverImage ? (
            <Image
              src={trip.coverImage}
              alt={trip.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <MapPin className="h-8 w-8 text-white/80" />
              <span className="text-white/90 text-sm font-medium px-4 text-center line-clamp-1">
                {trip.destination.split(',')[0].trim()}
              </span>
            </div>
          )}

          {/* Trip type badge */}
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 bg-white/90 backdrop-blur text-xs font-semibold text-gray-700 rounded-full">
              {TRIP_TYPE_LABELS[trip.tripType]}
            </span>
          </div>

          {/* Spots badge */}
          {spotsLeft <= 3 && spotsLeft > 0 && (
            <div className="absolute top-3 right-3">
              <span className="px-2.5 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full">
                {spotsLeft} spot{spotsLeft > 1 ? 's' : ''} left
              </span>
            </div>
          )}
          {spotsLeft === 0 && (
            <div className="absolute top-3 right-3">
              <span className="px-2.5 py-1 bg-gray-900 text-white text-xs font-semibold rounded-full">
                Full
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 text-base leading-snug group-hover:text-orange-600 transition-colors line-clamp-2 mb-1">
            {trip.title}
          </h3>

          <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{trip.destination}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
              <span className="text-gray-300">·</span>
              <span>{duration}d</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              <span>
                {trip.currentMemberCount}/{trip.maxMembers}
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            {/* Creator */}
            <div className="flex items-center gap-2">
              {trip.creator.image ? (
                <Image
                  src={trip.creator.image}
                  alt={trip.creator.name}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                  {trip.creator.name[0]}
                </div>
              )}
              <span className="text-xs text-gray-500">{trip.creator.name}</span>
            </div>

            {/* Budget */}
            <span className="text-xs font-medium text-gray-700 bg-gray-50 px-2 py-0.5 rounded-full">
              {BUDGET_RANGE_LABELS[trip.budgetRange]}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
