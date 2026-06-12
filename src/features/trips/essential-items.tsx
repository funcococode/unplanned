'use client';

import { useState } from 'react';
import { Plus, Trash2, Package } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

const CATEGORIES = ['Clothing', 'Gear & Equipment', 'Documents', 'Health & Safety', 'Electronics', 'Food & Water', 'General'];

const CATEGORY_EMOJI: Record<string, string> = {
  'Clothing': '🧤',
  'Gear & Equipment': '🎒',
  'Documents': '📋',
  'Health & Safety': '💊',
  'Electronics': '🔋',
  'Food & Water': '🥤',
  'General': '📦',
};

interface EssentialItem { id: string; text: string; category: string; order: number }

interface Props {
  tripId: string;
  initialItems: EssentialItem[];
  isCreator: boolean;
  isMember: boolean;
}

export function EssentialItems({ tripId, initialItems, isCreator }: Props) {
  const [items, setItems]     = useState<EssentialItem[]>(initialItems);
  const [newText, setNewText] = useState('');
  const [newCat, setNewCat]   = useState('General');
  const [adding, setAdding]   = useState(false);
  const [saving, setSaving]   = useState(false);

  const grouped = CATEGORIES
    .map((cat) => ({ cat, items: items.filter((i) => i.category === cat) }))
    .filter((g) => g.items.length > 0);

  const handleAdd = async () => {
    if (!newText.trim()) return;
    setSaving(true);
    const item = await apiClient.post<EssentialItem>(`/trips/${tripId}/essentials`, { text: newText.trim(), category: newCat });
    setItems((prev) => [...prev, item]);
    setNewText('');
    setSaving(false);
    setAdding(false);
  };

  const handleDelete = async (id: string) => {
    await apiClient.delete(`/trips/${tripId}/essentials/${id}`);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold text-zinc-950 dark:text-white flex items-center gap-2">
          <Package className="h-5 w-5 text-orange-500" />
          What to Pack
        </h2>
        {isCreator && !adding && (
          <button onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-orange-500 hover:text-orange-400 transition-colors">
            <Plus className="h-3.5 w-3.5" /> Add item
          </button>
        )}
      </div>

      {items.length === 0 && !adding && (
        <div className="text-center py-8 bg-zinc-950/[0.04] dark:bg-white/[0.04] rounded-2xl border-2 border-dashed border-zinc-950/10 dark:border-white/10">
          <Package className="h-7 w-7 text-zinc-950/45 dark:text-white/30 mx-auto mb-2" />
          <p className="text-sm text-zinc-950/55 dark:text-white/40">
            {isCreator ? 'Add items your travelers should pack for this trip.' : 'The host hasn\'t added packing suggestions yet.'}
          </p>
        </div>
      )}

      {grouped.length > 0 && (
        <div className="bg-night-soft border border-zinc-950/10 dark:border-white/10 rounded-2xl overflow-hidden">
          {grouped.map(({ cat, items: catItems }, gi) => (
            <div key={cat} className={gi > 0 ? 'border-t border-zinc-950/10 dark:border-white/10' : ''}>
              <div className="flex items-center gap-2 px-4 py-2.5 bg-zinc-950/[0.03] dark:bg-white/[0.03]">
                <span className="text-sm">{CATEGORY_EMOJI[cat] ?? '📦'}</span>
                <span className="text-xs font-semibold text-zinc-950/70 dark:text-white/60 uppercase tracking-wide">{cat}</span>
                <span className="ml-auto text-xs text-zinc-950/55 dark:text-white/40">{catItems.length}</span>
              </div>
              <ul className="divide-y divide-zinc-950/5 dark:divide-white/5">
                {catItems.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 px-4 py-2.5 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                    <span className="text-sm text-zinc-950/90 dark:text-white/80 flex-1">{item.text}</span>
                    {isCreator && (
                      <button onClick={() => handleDelete(item.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-zinc-950/45 dark:text-white/30 hover:text-red-500 transition-all">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {adding && (
        <div className="mt-3 bg-night-soft border border-zinc-950/10 dark:border-white/10 rounded-2xl p-4 space-y-3 shadow-sm">
          <input value={newText} onChange={(e) => setNewText(e.target.value)}
            placeholder="e.g. Thermal jacket, Sunscreen SPF 50..."
            className="w-full px-3 py-2 text-sm border border-zinc-950/10 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            autoFocus onKeyDown={(e) => e.key === 'Enter' && handleAdd()} />
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => (
              <button key={cat} onClick={() => setNewCat(cat)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors
                  ${newCat === cat ? 'bg-orange-500 text-white border-orange-500' : 'bg-zinc-950/[0.04] dark:bg-white/[0.04] text-zinc-950/70 dark:text-white/60 border-zinc-950/10 dark:border-white/10 hover:border-orange-500/50'}`}>
                {CATEGORY_EMOJI[cat]} {cat}
              </button>
            ))}
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => { setAdding(false); setNewText(''); }}
              className="px-4 py-2 text-sm text-zinc-950/70 dark:text-white/60 hover:bg-zinc-950/[0.06] dark:hover:bg-white/10 rounded-xl transition-colors">Cancel</button>
            <button onClick={handleAdd} disabled={!newText.trim() || saving}
              className="px-4 py-2 text-sm font-medium bg-orange-500 text-white rounded-xl hover:bg-orange-400 disabled:opacity-50 transition-colors">
              {saving ? 'Adding…' : 'Add'}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
