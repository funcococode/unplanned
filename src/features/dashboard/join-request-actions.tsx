'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Check, X } from 'lucide-react';

export function JoinRequestActions({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null);
  const [done, setDone] = useState(false);

  const handle = async (action: 'approve' | 'reject') => {
    setLoading(action);
    try {
      await apiClient.post(`/join-requests/${requestId}/${action}`);
      setDone(true);
      router.refresh();
    } catch { setLoading(null); }
  };

  if (done) return <span className="text-xs text-gray-400">Done</span>;

  return (
    <div className="flex items-center gap-2 shrink-0">
      <button onClick={() => handle('approve')} disabled={!!loading} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 text-xs font-semibold rounded-lg hover:bg-green-100 disabled:opacity-60 transition-colors">
        <Check className="h-3.5 w-3.5" />{loading === 'approve' ? '...' : 'Approve'}
      </button>
      <button onClick={() => handle('reject')} disabled={!!loading} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100 disabled:opacity-60 transition-colors">
        <X className="h-3.5 w-3.5" />{loading === 'reject' ? '...' : 'Decline'}
      </button>
    </div>
  );
}
