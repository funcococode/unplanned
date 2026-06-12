'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Plus, Trash2, Wallet, Loader2, Receipt, ArrowRight } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

const CATEGORIES = ['FOOD', 'TRANSPORT', 'ACCOMMODATION', 'ACTIVITY', 'OTHER'] as const;
const CAT_LABEL: Record<string, string> = { FOOD: '🍽️ Food', TRANSPORT: '🚌 Transport', ACCOMMODATION: '🏨 Stay', ACTIVITY: '🎯 Activity', OTHER: '📦 Other' };

interface Member { id: string; name: string; image: string | null }
interface Expense {
  id: string; description: string; amount: number; category: string; createdAt: string;
  paidBy: { id: string; name: string; image: string | null };
}
interface Props { tripId: string; members: Member[]; currentUserId: string; isCreator: boolean }

function Settlement({ expenses, members }: { expenses: Expense[]; members: Member[] }) {
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  if (total === 0 || members.length < 2) return null;
  const perPerson = total / members.length;

  const balances = new Map<string, number>();
  members.forEach((m) => balances.set(m.id, -perPerson));
  expenses.forEach((e) => balances.set(e.paidBy.id, (balances.get(e.paidBy.id) ?? 0) + e.amount));

  const debtors   = [...balances.entries()].filter(([, b]) => b < -0.5).sort(([, a], [, b]) => a - b);
  const creditors = [...balances.entries()].filter(([, b]) => b >  0.5).sort(([, a], [, b]) => b - a);
  const getName = (id: string) => members.find((m) => m.id === id)?.name ?? id;

  const settlements: { from: string; to: string; amount: number }[] = [];
  const d = debtors.map(([id, b]) => ({ id, b }));
  const c = creditors.map(([id, b]) => ({ id, b }));
  let di = 0, ci = 0;
  while (di < d.length && ci < c.length) {
    const amount = Math.min(-d[di].b, c[ci].b);
    settlements.push({ from: d[di].id, to: c[ci].id, amount });
    d[di].b += amount;
    c[ci].b -= amount;
    if (Math.abs(d[di].b) < 0.5) di++;
    if (Math.abs(c[ci].b) < 0.5) ci++;
  }

  return (
    <div className="mt-4 pt-4 border-t border-zinc-950/10 dark:border-white/10">
      <p className="text-xs font-semibold text-zinc-950/60 dark:text-white/50 uppercase tracking-wide mb-2">Who owes whom</p>
      <div className="space-y-2">
        {settlements.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-xs bg-amber-500/10 rounded-xl px-3 py-2">
            <span className="font-semibold text-zinc-950/95 dark:text-white/90">{getName(s.from)}</span>
            <ArrowRight className="h-3 w-3 text-amber-500 shrink-0" />
            <span className="font-semibold text-zinc-950/95 dark:text-white/90">{getName(s.to)}</span>
            <span className="ml-auto font-bold text-amber-300">₹{s.amount.toFixed(0)}</span>
          </div>
        ))}
        {settlements.length === 0 && (
          <p className="text-xs text-green-400 bg-green-500/10 rounded-xl px-3 py-2 font-medium">✓ All settled up!</p>
        )}
      </div>
      <p className="text-[10px] text-zinc-950/55 dark:text-white/40 mt-2">Total trip spend: ₹{total.toFixed(0)} · ₹{perPerson.toFixed(0)} per person</p>
    </div>
  );
}

export function ExpenseTracker({ tripId, members, currentUserId, isCreator }: Props) {
  const [expenses, setExpenses]     = useState<Expense[]>([]);
  const [loading, setLoading]       = useState(true);
  const [adding, setAdding]         = useState(false);
  const [saving, setSaving]         = useState(false);
  const [form, setForm]             = useState({ description: '', amount: '', category: 'FOOD', paidById: currentUserId });

  useEffect(() => {
    apiClient.get<Expense[]>(`/trips/${tripId}/expenses`).then(setExpenses).catch(() => {}).finally(() => setLoading(false));
  }, [tripId]);

  const handleAdd = async () => {
    if (!form.description.trim() || !form.amount) return;
    setSaving(true);
    const e = await apiClient.post<Expense>(`/trips/${tripId}/expenses`, { ...form, amount: parseFloat(form.amount) });
    setExpenses((prev) => [e, ...prev]);
    setForm({ description: '', amount: '', category: 'FOOD', paidById: currentUserId });
    setAdding(false);
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    await apiClient.delete(`/trips/${tripId}/expenses/${id}`);
  };

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-zinc-950 dark:text-white flex items-center gap-2">
          <Wallet className="h-5 w-5 text-green-500" /> Expense Tracker
        </h3>
        {!adding && <button onClick={() => setAdding(true)} className="flex items-center gap-1.5 text-xs font-medium text-green-400 hover:text-green-300"><Plus className="h-3.5 w-3.5" />Add expense</button>}
      </div>

      {adding && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 space-y-3 mb-4">
          <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="What was it for?" autoFocus
            className="w-full px-3 py-2 text-sm border border-zinc-950/10 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500" />
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-950/55 dark:text-white/40">₹</span>
              <input value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                placeholder="0" type="number" min="0"
                className="w-full pl-7 pr-3 py-2 text-sm border border-zinc-950/10 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="px-3 py-2 text-sm border border-zinc-950/10 dark:border-white/10 rounded-xl focus:outline-none bg-night-soft">
              {CATEGORIES.map((c) => <option key={c} value={c}>{CAT_LABEL[c]}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-zinc-950/60 dark:text-white/50 mb-1 block">Paid by</label>
            <div className="flex flex-wrap gap-2">
              {members.map((m) => (
                <button key={m.id} onClick={() => setForm((f) => ({ ...f, paidById: m.id }))}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors
                    ${form.paidById === m.id ? 'bg-green-500 text-white border-green-500' : 'bg-night-soft text-zinc-950/70 dark:text-white/60 border-zinc-950/10 dark:border-white/10 hover:border-green-300'}`}>
                  {m.image ? <Image src={m.image} alt={m.name} width={14} height={14} className="rounded-full" /> : <span className="w-3.5 h-3.5 rounded-full bg-zinc-950/10 dark:bg-white/15 flex items-center justify-center text-[8px]">{m.name[0]}</span>}
                  {m.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setAdding(false)} className="px-4 py-2 text-sm text-zinc-950/70 dark:text-white/60 hover:bg-zinc-950/[0.06] dark:hover:bg-white/10 rounded-xl">Cancel</button>
            <button onClick={handleAdd} disabled={!form.description.trim() || !form.amount || saving}
              className="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50">
              {saving ? 'Saving…' : 'Add'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-zinc-950/45 dark:text-white/30" /></div>
      ) : expenses.length === 0 ? (
        <div className="text-center py-8 bg-zinc-950/[0.04] dark:bg-white/[0.04] rounded-2xl">
          <Receipt className="h-8 w-8 text-zinc-950/35 dark:text-white/20 mx-auto mb-2" />
          <p className="text-sm text-zinc-950/55 dark:text-white/40">No expenses logged yet.</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {expenses.map((e) => (
              <div key={e.id} className="flex items-center gap-3 p-3 bg-night-soft border border-zinc-950/10 dark:border-white/10 rounded-xl group">
                <div className="text-lg shrink-0">{CAT_LABEL[e.category]?.slice(0, 2)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-950 dark:text-white truncate">{e.description}</p>
                  <p className="text-xs text-zinc-950/55 dark:text-white/40">Paid by {e.paidBy.name.split(' ')[0]}</p>
                </div>
                <span className="text-sm font-bold text-zinc-950 dark:text-white shrink-0">₹{e.amount.toFixed(0)}</span>
                {(e.paidBy.id === currentUserId || isCreator) && (
                  <button onClick={() => handleDelete(e.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-zinc-950/45 dark:text-white/30 hover:text-red-400 transition-all shrink-0">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-between items-center px-1">
            <span className="text-xs text-zinc-950/55 dark:text-white/40">{expenses.length} expense{expenses.length !== 1 ? 's' : ''}</span>
            <span className="text-sm font-bold text-zinc-950 dark:text-white">Total: ₹{total.toFixed(0)}</span>
          </div>
          <Settlement expenses={expenses} members={members} />
        </>
      )}
    </div>
  );
}
