'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { BudgetRange, TripType, BUDGET_RANGE_LABELS, TRIP_TYPE_LABELS } from '@/types';
import type { TripDto } from '@/types';
import { apiClient } from '@/lib/api-client';

export function EditTripForm({ trip }: { trip: TripDto }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit } = useForm({
    defaultValues: {
      title: trip.title, description: trip.description, destination: trip.destination,
      startDate: trip.startDate.split('T')[0], endDate: trip.endDate.split('T')[0],
      budgetRange: trip.budgetRange, maxMembers: trip.maxMembers, tripType: trip.tripType,
      meetingPoint: trip.meetingPoint ?? '', rules: trip.rules ?? '',
    },
  });

  const onSubmit = async (data: Record<string, unknown>) => {
    setSubmitting(true); setError(null);
    try {
      await apiClient.patch(`/trips/${trip.id}`, { ...data, maxMembers: Number(data.maxMembers) });
      router.push(`/trips/${trip.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
      setSubmitting(false);
    }
  };

  const cls = 'w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent';
  const lbl = 'block text-sm font-medium text-gray-700 mb-1.5';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 space-y-6">
      <div><label className={lbl}>Trip Title</label><input {...register('title')} className={cls} /></div>
      <div><label className={lbl}>Description</label><textarea {...register('description')} rows={5} className={cls} /></div>
      <div><label className={lbl}>Destination</label><input {...register('destination')} className={cls} /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={lbl}>Start Date</label><input type="date" {...register('startDate')} className={cls} /></div>
        <div><label className={lbl}>End Date</label><input type="date" {...register('endDate')} className={cls} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={lbl}>Trip Type</label>
          <select {...register('tripType')} className={cls}>
            {Object.values(TripType).map((t) => <option key={t} value={t}>{TRIP_TYPE_LABELS[t]}</option>)}
          </select>
        </div>
        <div>
          <label className={lbl}>Budget Range</label>
          <select {...register('budgetRange')} className={cls}>
            {Object.values(BudgetRange).map((b) => <option key={b} value={b}>{BUDGET_RANGE_LABELS[b]}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className={lbl}>Max Members</label>
        <input type="number" min={trip.currentMemberCount} max={50} {...register('maxMembers', { valueAsNumber: true })} className={cls} />
        <p className="text-xs text-gray-400 mt-1">Must be ≥ current member count ({trip.currentMemberCount})</p>
      </div>
      <div><label className={lbl}>Meeting Point</label><input {...register('meetingPoint')} className={cls} /></div>
      <div><label className={lbl}>Trip Rules</label><textarea {...register('rules')} rows={3} className={cls} /></div>
      {error && <div className="p-3 bg-red-50 rounded-xl border border-red-100"><p className="text-sm text-red-600">{error}</p></div>}
      <div className="flex gap-3">
        <button type="button" onClick={() => router.back()} className="flex-1 py-3 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
        <button type="submit" disabled={submitting} className="flex-1 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 disabled:opacity-60 transition-colors">
          {submitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
