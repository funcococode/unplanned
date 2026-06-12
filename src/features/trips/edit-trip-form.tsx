'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { BudgetRange, TripType, BUDGET_RANGE_LABELS, TRIP_TYPE_LABELS } from '@/types';
import type { TripDto } from '@/types';
import { apiClient } from '@/lib/api-client';

export function EditTripForm({ trip }: { trip: TripDto }) {
  const router = useRouter();
  const [submitting, setSubmitting]         = useState(false);
  const [error, setError]                   = useState<string | null>(null);
  const [showDelete, setShowDelete]         = useState(false);
  const [deleteInput, setDeleteInput]       = useState('');
  const [deleting, setDeleting]             = useState(false);

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

  const handleDelete = async () => {
    if (deleteInput !== trip.title) return;
    setDeleting(true);
    try {
      await apiClient.delete(`/trips/${trip.id}`);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete trip');
      setDeleting(false);
    }
  };

  const cls = 'w-full px-4 py-2.5 bg-night-soft text-zinc-950 dark:text-white placeholder:text-zinc-950/45 dark:placeholder:text-white/30 border border-zinc-950/10 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent';
  const lbl = 'block text-sm font-medium text-zinc-950/90 dark:text-white/80 mb-1.5';

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-night-soft rounded-2xl border border-zinc-950/10 dark:border-white/10 p-6 sm:p-8 space-y-6">
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
          <p className="text-xs text-zinc-950/55 dark:text-white/40 mt-1">Must be ≥ current member count ({trip.currentMemberCount})</p>
        </div>
        <div><label className={lbl}>Meeting Point</label><input {...register('meetingPoint')} className={cls} /></div>
        <div><label className={lbl}>Trip Rules</label><textarea {...register('rules')} rows={3} className={cls} /></div>
        {error && <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/30"><p className="text-sm text-red-400">{error}</p></div>}
        <div className="flex gap-3">
          <button type="button" onClick={() => router.back()} className="flex-1 py-3 border border-zinc-950/10 dark:border-white/10 text-zinc-950/90 dark:text-white/80 text-sm font-semibold rounded-xl hover:bg-zinc-950/[0.04] dark:hover:bg-white/[0.04] transition-colors">Cancel</button>
          <button type="submit" disabled={submitting} className="flex-1 py-3 bg-orange-500 text-white text-sm font-semibold rounded-xl hover:bg-orange-400 disabled:opacity-60 transition-colors">
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* Danger zone */}
      <div className="bg-night-soft rounded-2xl border border-red-500/30 p-6">
        <h2 className="text-xs font-semibold text-red-400 uppercase tracking-widest mb-4">Danger Zone</h2>
        {!showDelete ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-950 dark:text-white">Delete this trip</p>
              <p className="text-xs text-zinc-950/55 dark:text-white/40 mt-0.5">Permanently removes the trip and all its data.</p>
            </div>
            <button onClick={() => setShowDelete(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-400 border border-red-500/40 rounded-xl hover:bg-red-500/10 transition-colors shrink-0 ml-4">
              <Trash2 className="h-4 w-4" /> Delete trip
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-red-500/10 rounded-xl">
              <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-300">
                This will permanently delete <strong>{trip.title}</strong> including all itinerary, expenses, polls, and messages.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-950/90 dark:text-white/80 mb-1.5">
                Type <span className="font-mono font-bold">{trip.title}</span> to confirm
              </label>
              <input
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                placeholder={trip.title}
                className="w-full px-4 py-2.5 border border-red-500/40 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setShowDelete(false); setDeleteInput(''); }}
                className="px-4 py-2 text-sm text-zinc-950/70 dark:text-white/60 hover:bg-zinc-950/[0.06] dark:hover:bg-white/10 rounded-xl">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleteInput !== trip.title || deleting}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-50">
                {deleting ? <><Loader2 className="h-4 w-4 animate-spin" />Deleting...</> : <><Trash2 className="h-4 w-4" />Yes, delete forever</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
