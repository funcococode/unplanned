'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, MapPin, Users, Calendar } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import type { TripSummaryDto } from '@/types';
import { TRIP_TYPE_LABELS } from '@/types';

const TYPE_COLORS: Record<string, string> = {
  ADVENTURE:   'bg-orange-500',
  BACKPACKING: 'bg-emerald-500',
  ROAD_TRIP:   'bg-blue-500',
  WORKATION:   'bg-violet-500',
  LEISURE:     'bg-pink-500',
  PHOTOGRAPHY: 'bg-amber-500',
};

const TYPE_LIGHT: Record<string, string> = {
  ADVENTURE:   'bg-orange-500/10 text-orange-300 border-orange-500/40',
  BACKPACKING: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/40',
  ROAD_TRIP:   'bg-blue-500/10 text-blue-300 border-blue-500/40',
  WORKATION:   'bg-violet-500/10 text-violet-300 border-violet-500/40',
  LEISURE:     'bg-pink-500/10 text-pink-300 border-pink-500/40',
  PHOTOGRAPHY: 'bg-amber-500/10 text-amber-300 border-amber-500/40',
};

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function firstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export function TripCalendar() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [trips, setTrips] = useState<TripSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Fetch trips for a ±3 month window so navigation feels instant
  useEffect(() => {
    setLoading(true);
    const from = new Date(year, month - 1, 1);
    const to   = new Date(year, month + 2, 0);
    apiClient
      .get<{ data: TripSummaryDto[] }>(
        `/trips?startDate=${isoDate(from)}&endDate=${isoDate(to)}&limit=50`,
      )
      .then((res) => setTrips(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [year, month]);

  // Map every calendar date → trips active that day
  const tripsByDate = useMemo(() => {
    const map = new Map<string, TripSummaryDto[]>();
    trips.forEach((trip) => {
      const start = new Date(trip.startDate);
      const end   = new Date(trip.endDate);
      const cursor = new Date(start);
      while (cursor <= end) {
        const key = isoDate(cursor);
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(trip);
        cursor.setDate(cursor.getDate() + 1);
      }
    });
    return map;
  }, [trips]);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
    setSelectedDate(null);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
    setSelectedDate(null);
  };
  const goToday = () => {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
    setSelectedDate(isoDate(today));
  };

  const days        = daysInMonth(year, month);
  const startOffset = firstDayOfMonth(year, month);
  const totalCells  = Math.ceil((startOffset + days) / 7) * 7;
  const monthName   = new Date(year, month, 1).toLocaleString('default', { month: 'long' });

  const selectedTrips = selectedDate ? (tripsByDate.get(selectedDate) ?? []) : [];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      {/* Calendar grid */}
      <div className="xl:col-span-2">
        <div className="bg-night-soft rounded-2xl border border-zinc-950/10 dark:border-white/10 overflow-hidden shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-950/10 dark:border-white/10">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-zinc-950 dark:text-white">{monthName} {year}</h2>
              {loading && (
                <span className="h-4 w-4 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={goToday}
                className="px-3 py-1.5 text-xs font-medium text-zinc-950/70 dark:text-white/60 bg-zinc-950/[0.05] dark:bg-white/[0.06] hover:bg-zinc-950/[0.06] dark:hover:bg-white/10 rounded-lg transition-colors"
              >
                Today
              </button>
              <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-zinc-950/[0.06] dark:hover:bg-white/10 transition-colors">
                <ChevronLeft className="h-4 w-4 text-zinc-950/70 dark:text-white/60" />
              </button>
              <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-zinc-950/[0.06] dark:hover:bg-white/10 transition-colors">
                <ChevronRight className="h-4 w-4 text-zinc-950/70 dark:text-white/60" />
              </button>
            </div>
          </div>

          {/* Day labels */}
          <div className="grid grid-cols-7 border-b border-zinc-950/10 dark:border-white/10">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="py-2 text-center text-xs font-semibold text-zinc-950/55 dark:text-white/40 uppercase tracking-wide">
                {d}
              </div>
            ))}
          </div>

          {/* Date cells */}
          <div className="grid grid-cols-7">
            {Array.from({ length: totalCells }).map((_, i) => {
              const dayNum = i - startOffset + 1;
              const isValid = dayNum >= 1 && dayNum <= days;
              if (!isValid) {
                return <div key={i} className="min-h-[90px] border-b border-r border-zinc-950/5 dark:border-white/5 bg-zinc-950/[0.02] dark:bg-white/[0.02]" />;
              }

              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayTrips = tripsByDate.get(dateStr) ?? [];
              const isToday = dateStr === isoDate(today);
              const isSelected = dateStr === selectedDate;
              const MAX_SHOWN = 2;

              return (
                <div
                  key={i}
                  onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                  className={`min-h-[90px] p-1.5 border-b border-r border-zinc-950/10 dark:border-white/10 cursor-pointer transition-colors group
                    ${isSelected ? 'bg-orange-500/10' : 'hover:bg-zinc-950/[0.04] dark:hover:bg-white/[0.04]'}`}
                >
                  <div className="flex justify-end mb-1">
                    <span className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full
                      ${isToday ? 'bg-orange-500 text-white' : isSelected ? 'text-orange-400' : 'text-zinc-950/60 dark:text-white/50 group-hover:text-zinc-950 dark:group-hover:text-white'}`}>
                      {dayNum}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    {dayTrips.slice(0, MAX_SHOWN).map((trip) => {
                      const isStart = isoDate(new Date(trip.startDate)) === dateStr;
                      return (
                        <div
                          key={trip.id}
                          title={trip.title}
                          className={`text-[10px] font-medium px-1.5 py-0.5 rounded-sm truncate
                            ${isStart
                              ? `${TYPE_COLORS[trip.tripType] ?? 'bg-zinc-950/30 dark:bg-white/30'} text-white`
                              : 'bg-zinc-950/[0.05] dark:bg-white/[0.06] text-zinc-950/60 dark:text-white/50'
                            }`}
                        >
                          {isStart ? '▶ ' : ''}{trip.title}
                        </div>
                      );
                    })}
                    {dayTrips.length > MAX_SHOWN && (
                      <div className="text-[10px] font-medium text-zinc-950/55 dark:text-white/40 px-1.5">
                        +{dayTrips.length - MAX_SHOWN} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-3 px-1">
          {Object.entries(TRIP_TYPE_LABELS).map(([key, label]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className={`h-2.5 w-2.5 rounded-sm ${TYPE_COLORS[key] ?? 'bg-zinc-950/30 dark:bg-white/30'}`} />
              <span className="text-xs text-zinc-950/60 dark:text-white/50">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Side panel */}
      <div className="xl:col-span-1">
        <div className="sticky top-24">
          {selectedDate ? (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-4 w-4 text-orange-500" />
                <h3 className="font-semibold text-zinc-950 dark:text-white">
                  {new Date(selectedDate + 'T12:00:00').toLocaleDateString('default', {
                    weekday: 'long', month: 'long', day: 'numeric',
                  })}
                </h3>
              </div>

              {selectedTrips.length === 0 ? (
                <div className="bg-night-soft rounded-2xl border border-zinc-950/10 dark:border-white/10 p-8 text-center">
                  <MapPin className="h-8 w-8 text-zinc-950/35 dark:text-white/20 mx-auto mb-2" />
                  <p className="text-sm text-zinc-950/55 dark:text-white/40">No trips on this day</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedTrips.map((trip) => (
                    <Link key={trip.id} href={`/trips/${trip.id}`}>
                      <article className="bg-night-soft rounded-2xl border border-zinc-950/10 dark:border-white/10 overflow-hidden hover:shadow-md hover:border-zinc-950/10 dark:hover:border-white/10 transition-all group">
                        {trip.coverImage ? (
                          <div className="relative h-28 overflow-hidden">
                            <Image
                              src={trip.coverImage}
                              alt={trip.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              sizes="400px"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                          </div>
                        ) : (
                          <div className={`h-28 flex items-center justify-center bg-gradient-to-br ${getGradient(trip.destination)}`}>
                            <MapPin className="h-6 w-6 text-zinc-950/80 dark:text-white/70" />
                          </div>
                        )}
                        <div className="p-3">
                          <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border mb-2 ${TYPE_LIGHT[trip.tripType] ?? 'bg-zinc-950/[0.04] dark:bg-white/[0.04] text-zinc-950/70 dark:text-white/60 border-zinc-950/10 dark:border-white/10'}`}>
                            {TRIP_TYPE_LABELS[trip.tripType as keyof typeof TRIP_TYPE_LABELS]}
                          </div>
                          <h4 className="text-sm font-semibold text-zinc-950 dark:text-white line-clamp-1 group-hover:text-orange-400 transition-colors">
                            {trip.title}
                          </h4>
                          <div className="flex items-center gap-1 text-xs text-zinc-950/60 dark:text-white/50 mt-1">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="truncate">{trip.destination}</span>
                          </div>
                          <div className="flex items-center justify-between mt-2 text-xs text-zinc-950/55 dark:text-white/40">
                            <span>
                              {new Date(trip.startDate).toLocaleDateString('default', { month: 'short', day: 'numeric' })}
                              {' → '}
                              {new Date(trip.endDate).toLocaleDateString('default', { month: 'short', day: 'numeric' })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {trip.currentMemberCount}/{trip.maxMembers}
                            </span>
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-night-soft rounded-2xl border border-zinc-950/10 dark:border-white/10 p-8 text-center">
              <Calendar className="h-10 w-10 text-zinc-950/35 dark:text-white/20 mx-auto mb-3" />
              <p className="text-sm font-medium text-zinc-950/60 dark:text-white/50 mb-1">Select a date</p>
              <p className="text-xs text-zinc-950/55 dark:text-white/40">Click any day to see trips happening then</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const GRADIENTS = [
  'from-orange-400 to-pink-500', 'from-blue-400 to-cyan-500',
  'from-emerald-400 to-teal-500', 'from-violet-400 to-purple-500',
  'from-amber-400 to-orange-500', 'from-sky-400 to-blue-500',
];
function getGradient(destination: string) {
  let h = 0;
  for (let i = 0; i < destination.length; i++) h = (h * 31 + destination.charCodeAt(i)) >>> 0;
  return GRADIENTS[h % GRADIENTS.length];
}
