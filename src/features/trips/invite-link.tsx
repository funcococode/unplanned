'use client';

import { useEffect, useState } from 'react';
import { Link2, Copy, RefreshCw, Trash2, Check, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface Props { tripId: string }

export function InviteLink({ tripId }: Props) {
  const [token, setToken]     = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [copied, setCopied]   = useState(false);

  const link = token ? `${typeof window !== 'undefined' ? window.location.origin : ''}/invite/${token}` : '';

  useEffect(() => {
    apiClient.get<{ token: string | null }>(`/trips/${tripId}/invite`)
      .then((d) => setToken(d.token))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tripId]);

  const generate = async () => {
    setWorking(true);
    const d = await apiClient.post<{ token: string }>(`/trips/${tripId}/invite`, {});
    setToken(d.token);
    setWorking(false);
  };

  const revoke = async () => {
    setWorking(true);
    await apiClient.delete(`/trips/${tripId}/invite`);
    setToken(null);
    setWorking(false);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <h3 className="font-semibold text-zinc-950 dark:text-white flex items-center gap-2 mb-4">
        <Link2 className="h-5 w-5 text-indigo-500" /> Invite Link
      </h3>

      {loading ? (
        <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-zinc-950/45 dark:text-white/30" /></div>
      ) : token ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 rounded-xl px-3 py-2">
            <span className="text-xs text-indigo-300 flex-1 truncate font-mono">{link}</span>
            <button onClick={copy} className="shrink-0 text-indigo-500 hover:text-indigo-300">
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <div className="flex gap-2">
            <button onClick={generate} disabled={working}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-950/60 dark:text-white/50 hover:text-zinc-950/90 dark:hover:text-white/80 bg-zinc-950/[0.05] dark:bg-white/[0.06] hover:bg-zinc-950/[0.06] dark:hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50">
              <RefreshCw className="h-3 w-3" /> Regenerate
            </button>
            <button onClick={revoke} disabled={working}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-500 hover:text-red-300 bg-red-500/10 hover:bg-red-500/15 rounded-lg transition-colors disabled:opacity-50">
              <Trash2 className="h-3 w-3" /> Revoke
            </button>
          </div>
          <p className="text-[10px] text-zinc-950/55 dark:text-white/40">Anyone with this link joins immediately — no approval needed. Revoke to disable it.</p>
        </div>
      ) : (
        <div className="text-center py-6 bg-zinc-950/[0.04] dark:bg-white/[0.04] rounded-2xl">
          <Link2 className="h-8 w-8 text-zinc-950/35 dark:text-white/20 mx-auto mb-2" />
          <p className="text-sm text-zinc-950/60 dark:text-white/50 mb-3">No active invite link.</p>
          <button onClick={generate} disabled={working}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50">
            {working ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
            Generate invite link
          </button>
        </div>
      )}
    </div>
  );
}
