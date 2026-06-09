'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { BudgetRange, TripType, BUDGET_RANGE_LABELS, TRIP_TYPE_LABELS } from '@/types';
import { apiClient } from '@/lib/api-client';

interface TripFormValues {
  title: string;
  description: string;
  destination: string;
  startDate: string;
  endDate: string;
  tripType: string;
  budgetRange: string;
  maxMembers: number;
  coverImage: string;
  meetingPoint: string;
  rules: string;
}

export function CreateTripForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, setValue } = useForm<TripFormValues>({
    defaultValues: { maxMembers: 6 },
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd, credentials: 'include' });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json() as { url: string };
      setCoverImageUrl(data.url);
      setValue('coverImage', data.url);
    } catch { setError('Image upload failed'); } finally { setUploading(false); }
  };

  const onSubmit = async (data: TripFormValues) => {
    setSubmitting(true); setError(null);
    try {
      const trip = await apiClient.post<{ id: string }>('/trips', data);
      router.push(`/trips/${trip.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create trip');
      setSubmitting(false);
    }
  };

  const cls = 'w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent';
  const lbl = 'block text-sm font-medium text-gray-700 mb-1.5';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 space-y-6">
      <div><label className={lbl}>Trip Title *</label><input {...register('title', { required: true })} placeholder="Spiti Valley Winter Expedition" className={cls} /></div>
      <div><label className={lbl}>Description *</label><textarea {...register('description', { required: true })} rows={5} placeholder="Tell travelers what this trip is about..." className={cls} /></div>
      <div><label className={lbl}>Destination *</label><input {...register('destination', { required: true })} placeholder="Spiti Valley, Himachal Pradesh" className={cls} /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={lbl}>Start Date *</label><input type="date" {...register('startDate', { required: true })} className={cls} /></div>
        <div><label className={lbl}>End Date *</label><input type="date" {...register('endDate', { required: true })} className={cls} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={lbl}>Trip Type *</label>
          <select {...register('tripType', { required: true })} className={cls}>
            <option value="">Select type</option>
            {Object.values(TripType).map((t) => <option key={t} value={t}>{TRIP_TYPE_LABELS[t]}</option>)}
          </select>
        </div>
        <div>
          <label className={lbl}>Budget Range *</label>
          <select {...register('budgetRange', { required: true })} className={cls}>
            <option value="">Select budget</option>
            {Object.values(BudgetRange).map((b) => <option key={b} value={b}>{BUDGET_RANGE_LABELS[b]}</option>)}
          </select>
        </div>
      </div>
      <div><label className={lbl}>Max Members *</label><input type="number" min={2} max={50} {...register('maxMembers', { required: true, valueAsNumber: true })} className={cls} /></div>
      <div>
        <label className={lbl}>Cover Image</label>
        {coverImageUrl ? (
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
            <span className="text-sm text-green-700 truncate flex-1">{coverImageUrl}</span>
            <button type="button" onClick={() => { setCoverImageUrl(''); setValue('coverImage', ''); }} className="text-xs text-red-500">Remove</button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-gray-300 hover:bg-gray-50">
            <span className="text-sm text-gray-500">{uploading ? 'Uploading...' : 'Click to upload an image'}</span>
            <span className="text-xs text-gray-400 mt-1">PNG, JPG, WebP up to 5MB</span>
            <input type="file" className="sr-only" accept="image/*" onChange={handleUpload} disabled={uploading} />
          </label>
        )}
      </div>
      <div><label className={lbl}>Meeting Point</label><input {...register('meetingPoint')} placeholder="Shimla ISBT Bus Stand" className={cls} /></div>
      <div><label className={lbl}>Trip Rules</label><textarea {...register('rules')} rows={3} placeholder="Any requirements for travelers joining..." className={cls} /></div>
      {error && <div className="p-3 bg-red-50 rounded-xl border border-red-100"><p className="text-sm text-red-600">{error}</p></div>}
      <button type="submit" disabled={submitting || uploading} className="w-full py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 disabled:opacity-60 transition-colors">
        {submitting ? 'Creating trip...' : 'Create Trip'}
      </button>
    </form>
  );
}
