'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import { BudgetRange, TripType, BUDGET_RANGE_LABELS, TRIP_TYPE_LABELS } from '@/types';
import { Search, SlidersHorizontal } from 'lucide-react';

interface TripFiltersProps {
  searchParams: Record<string, string | undefined>;
}

export function TripFilters({ searchParams }: TripFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(
        Object.fromEntries(
          Object.entries(searchParams).filter(([, v]) => v !== undefined) as [string, string][],
        ),
      );
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete('page');
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname],
  );

  const clearFilters = () => router.push(pathname);

  const hasFilters = Object.keys(searchParams).some(
    (k) => k !== 'sort' && searchParams[k],
  );

  return (
    <div className="mb-8 space-y-4">
      {/* Search + Sort row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by destination..."
            defaultValue={searchParams.destination ?? ''}
            onChange={(e) => updateFilter('destination', e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>
        <select
          value={searchParams.sort ?? 'newest'}
          onChange={(e) => updateFilter('sort', e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
        >
          <option value="newest">Newest first</option>
          <option value="popular">Most popular</option>
        </select>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filters:
        </span>

        <select
          value={searchParams.tripType ?? ''}
          onChange={(e) => updateFilter('tripType', e.target.value)}
          className="px-3 py-1.5 border border-gray-200 rounded-full text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
        >
          <option value="">All Types</option>
          {Object.values(TripType).map((t) => (
            <option key={t} value={t}>{TRIP_TYPE_LABELS[t]}</option>
          ))}
        </select>

        <select
          value={searchParams.budgetRange ?? ''}
          onChange={(e) => updateFilter('budgetRange', e.target.value)}
          className="px-3 py-1.5 border border-gray-200 rounded-full text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
        >
          <option value="">Any Budget</option>
          {Object.values(BudgetRange).map((b) => (
            <option key={b} value={b}>{BUDGET_RANGE_LABELS[b]}</option>
          ))}
        </select>

        <div className="flex items-center gap-1.5">
          <input
            type="date"
            value={searchParams.startDate ?? ''}
            onChange={(e) => updateFilter('startDate', e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-full text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
          />
          <span className="text-xs text-gray-400">–</span>
          <input
            type="date"
            value={searchParams.endDate ?? ''}
            onChange={(e) => updateFilter('endDate', e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-full text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
          />
        </div>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
