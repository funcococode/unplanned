'use client';

import { useState } from 'react';
import { ChevronRight, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

type TripStatus = 'PLANNING' | 'CONFIRMED' | 'ONGOING' | 'COMPLETED';

interface Props {
  tripId: string;
  initialStatus: TripStatus;
  isCreator: boolean;
}

const STATUS_META: Record<TripStatus, { label: string; color: string; bg: string; dot: string; next: TripStatus | null; nextLabel: string }> = {
  PLANNING:  { label: 'Planning',  color: 'text-blue-600',  bg: 'bg-blue-50  border-blue-100',  dot: 'bg-blue-400',   next: 'CONFIRMED', nextLabel: 'Mark as Confirmed' },
  CONFIRMED: { label: 'Confirmed', color: 'text-green-600', bg: 'bg-green-50 border-green-100', dot: 'bg-green-400',  next: null,        nextLabel: '' },
  ONGOING:   { label: 'Ongoing',   color: 'text-orange-600',bg: 'bg-orange-50 border-orange-100',dot: 'bg-orange-400',next: 'COMPLETED', nextLabel: 'Mark as Completed' },
  COMPLETED: { label: 'Completed', color: 'text-gray-500',  bg: 'bg-gray-50  border-gray-200',  dot: 'bg-gray-400',   next: null,        nextLabel: '' },
};

const FLOW: TripStatus[] = ['PLANNING', 'CONFIRMED', 'ONGOING', 'COMPLETED'];

export function TripStatusBadge({ status }: { status: TripStatus }) {
  const meta = STATUS_META[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${meta.bg} ${meta.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

export function TripStatusControl({ tripId, initialStatus, isCreator }: Props) {
  const [status, setStatus]   = useState<TripStatus>(initialStatus);
  const [saving, setSaving]   = useState(false);
  const meta = STATUS_META[status];

  const advance = async () => {
    if (!meta.next) return;
    setSaving(true);
    const res = await apiClient.patch<{ status: TripStatus }>(`/trips/${tripId}/status`, { status: meta.next });
    setStatus(res.status);
    setSaving(false);
  };

  return (
    <div className="space-y-3">
      {/* Progress steps */}
      <div className="flex items-center gap-1">
        {FLOW.map((s, i) => {
          const idx    = FLOW.indexOf(status);
          const active = i === idx;
          const done   = i < idx;
          return (
            <div key={s} className="flex items-center gap-1 flex-1">
              <div className={`flex-1 h-1.5 rounded-full transition-colors ${done || active ? 'bg-orange-400' : 'bg-gray-100'}`} />
              {i === FLOW.length - 1 && (
                <div className={`w-1.5 h-1.5 rounded-full ${active || done ? 'bg-orange-400' : 'bg-gray-200'}`} />
              )}
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between">
        <TripStatusBadge status={status} />
        {isCreator && meta.next && (
          <button onClick={advance} disabled={saving}
            className="flex items-center gap-1 text-xs font-medium text-orange-600 hover:text-orange-700 disabled:opacity-50">
            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <ChevronRight className="h-3.5 w-3.5" />}
            {meta.nextLabel}
          </button>
        )}
      </div>
    </div>
  );
}
