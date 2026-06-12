'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Check, Download, ListChecks, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface PackingItem { id: string; text: string; checked: boolean; order: number }
interface EssentialItem { id: string; text: string; category: string }

interface Props {
  tripId: string;
  essentialItems: EssentialItem[];
}

export function PersonalPacking({ tripId, essentialItems }: Props) {
  const [items, setItems]         = useState<PackingItem[]>([]);
  const [newText, setNewText]     = useState('');
  const [adding, setAdding]       = useState(false);
  const [loading, setLoading]     = useState(true);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    apiClient.get<PackingItem[]>(`/trips/${tripId}/packing`)
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tripId]);

  const handleAdd = async () => {
    if (!newText.trim()) return;
    const item = await apiClient.post<PackingItem>(`/trips/${tripId}/packing`, { text: newText.trim() });
    setItems((prev) => [...prev, item]);
    setNewText('');
    setAdding(false);
  };

  const handleToggle = async (item: PackingItem) => {
    setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, checked: !i.checked } : i));
    await apiClient.patch(`/trips/${tripId}/packing/${item.id}`, { checked: !item.checked });
  };

  const handleDelete = async (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await apiClient.delete(`/trips/${tripId}/packing/${id}`);
  };

  const handleImport = async () => {
    if (!essentialItems.length) return;
    setImporting(true);
    await apiClient.post(`/trips/${tripId}/packing`, { items: essentialItems.map((i) => i.text) });
    const updated = await apiClient.get<PackingItem[]>(`/trips/${tripId}/packing`);
    setItems(updated);
    setImporting(false);
  };

  const checked = items.filter((i) => i.checked).length;
  const total   = items.length;
  const pct     = total > 0 ? Math.round((checked / total) * 100) : 0;

  return (
    <div className="bg-night-soft border border-zinc-950/10 dark:border-white/10 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-zinc-950/5 dark:border-white/5">
        <div className="flex items-center gap-2 mb-2">
          <ListChecks className="h-4 w-4 text-violet-500 shrink-0" />
          <span className="text-xs font-semibold text-zinc-950 dark:text-white">My Packing List</span>
          <span className="ml-auto text-[10px] text-zinc-950/55 dark:text-white/40 italic">only you see this</span>
        </div>

        {/* Progress */}
        {total > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-zinc-950/55 dark:text-white/40">{checked} of {total} packed</span>
              <span className="text-[10px] font-semibold text-violet-400">{pct}%</span>
            </div>
            <div className="w-full bg-zinc-950/[0.05] dark:bg-white/[0.06] rounded-full h-1.5">
              <div
                className="bg-violet-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="px-3 py-3">
        {loading ? (
          <div className="flex items-center justify-center py-6 gap-2 text-zinc-950/45 dark:text-white/30">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-xs">Loading…</span>
          </div>
        ) : (
          <>
            {items.length === 0 && !adding ? (
              /* Empty state */
              <div className="text-center py-5">
                <div className="w-10 h-10 bg-violet-500/10 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <ListChecks className="h-5 w-5 text-violet-300" />
                </div>
                <p className="text-xs text-zinc-950/55 dark:text-white/40 mb-3">Nothing here yet.</p>
                {essentialItems.length > 0 && (
                  <button
                    onClick={handleImport}
                    disabled={importing}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-violet-400 bg-violet-500/10 hover:bg-violet-500/15 rounded-lg transition-colors disabled:opacity-60"
                  >
                    {importing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
                    {importing ? 'Importing…' : 'Copy from pack list'}
                  </button>
                )}
              </div>
            ) : (
              <ul className="space-y-0.5 mb-2">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-2 rounded-lg px-1 py-1.5 group hover:bg-zinc-950/[0.04] dark:hover:bg-white/[0.04] transition-colors"
                  >
                    {/* Checkbox */}
                    <button
                      onClick={() => handleToggle(item)}
                      className={`shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-all
                        ${item.checked
                          ? 'bg-violet-500 border-violet-500'
                          : 'border-zinc-950/15 dark:border-white/15 hover:border-violet-400'}`}
                    >
                      {item.checked && <Check className="h-2.5 w-2.5 text-zinc-950 dark:text-white" strokeWidth={3} />}
                    </button>

                    {/* Text */}
                    <span className={`text-xs flex-1 leading-snug ${item.checked ? 'line-through text-zinc-950/45 dark:text-white/30' : 'text-zinc-950/90 dark:text-white/80'}`}>
                      {item.text}
                    </span>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 text-zinc-950/45 dark:text-white/30 hover:text-red-400 transition-all shrink-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* Inline add input */}
            {adding ? (
              <div className="flex gap-1.5 mt-1">
                <input
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="Add an item…"
                  className="flex-1 px-2.5 py-1.5 text-xs border border-violet-500/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400 min-w-0"
                  autoFocus
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') { setAdding(false); setNewText(''); } }}
                />
                <button
                  onClick={handleAdd}
                  disabled={!newText.trim()}
                  className="px-2.5 py-1.5 text-xs font-medium bg-violet-500 text-white rounded-lg hover:bg-violet-600 disabled:opacity-40 transition-colors shrink-0"
                >
                  Add
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between mt-1">
                <button
                  onClick={() => setAdding(true)}
                  className="flex items-center gap-1 text-xs text-violet-500 hover:text-violet-400 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" /> Add item
                </button>
                {essentialItems.length > 0 && items.length > 0 && (
                  <button
                    onClick={handleImport}
                    disabled={importing}
                    className="flex items-center gap-1 text-[10px] text-zinc-950/55 dark:text-white/40 hover:text-violet-500 transition-colors disabled:opacity-60"
                  >
                    {importing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
                    Import
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
