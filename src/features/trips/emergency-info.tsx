'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ShieldAlert, Loader2, Pencil, Check, Lock } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

interface EmergencyEntry {
  id: string; userId: string; contactName: string; contactPhone: string;
  bloodGroup: string | null; allergies: string | null; notes: string | null;
  user?: { id: string; name: string; image: string | null };
}
interface Props { tripId: string; isCreator: boolean }

export function EmergencyInfoCard({ tripId, isCreator }: Props) {
  const [entries, setEntries] = useState<EmergencyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [form, setForm]       = useState({ contactName: '', contactPhone: '', bloodGroup: '', allergies: '', notes: '' });

  const refetch = async () => {
    const data = await apiClient.get<EmergencyEntry[]>(`/trips/${tripId}/emergency`);
    setEntries(data);
    if (!isCreator && data.length > 0) {
      const mine = data[0];
      setForm({ contactName: mine.contactName, contactPhone: mine.contactPhone, bloodGroup: mine.bloodGroup ?? '', allergies: mine.allergies ?? '', notes: mine.notes ?? '' });
    }
  };

  useEffect(() => { refetch().finally(() => setLoading(false)); }, [tripId]);

  const handleSave = async () => {
    setSaving(true);
    await apiClient.post(`/trips/${tripId}/emergency`, form);
    await refetch();
    setEditing(false);
    setSaving(false);
  };

  const myEntry = !isCreator ? entries[0] : null;
  const isFilled = !!myEntry?.contactName;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-zinc-950 dark:text-white flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-red-500" /> Emergency Info
        </h3>
        {!isCreator && !editing && (
          <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-400">
            <Pencil className="h-3.5 w-3.5" />{isFilled ? 'Edit' : 'Fill in'}
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-zinc-950/45 dark:text-white/30" /></div>
      ) : isCreator ? (
        /* Host view: see all members' info */
        entries.length === 0 ? (
          <div className="text-center py-8 bg-zinc-950/[0.04] dark:bg-white/[0.04] rounded-2xl">
            <ShieldAlert className="h-8 w-8 text-zinc-950/35 dark:text-white/20 mx-auto mb-2" />
            <p className="text-sm text-zinc-950/55 dark:text-white/40">No members have filled in emergency info yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((e) => (
              <div key={e.id} className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  {e.user?.image ? (
                    <Image src={e.user.image} alt={e.user.name ?? ''} width={24} height={24} className="rounded-full" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-red-200 flex items-center justify-center text-xs font-bold text-red-300">
                      {e.user?.name?.[0]}
                    </div>
                  )}
                  <span className="text-sm font-semibold text-zinc-950 dark:text-white">{e.user?.name}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-zinc-950/55 dark:text-white/40 block">Emergency contact</span><span className="font-medium text-zinc-950/95 dark:text-white/90">{e.contactName}</span></div>
                  <div><span className="text-zinc-950/55 dark:text-white/40 block">Phone</span><span className="font-medium text-zinc-950/95 dark:text-white/90">{e.contactPhone}</span></div>
                  {e.bloodGroup && <div><span className="text-zinc-950/55 dark:text-white/40 block">Blood group</span><span className="font-bold text-red-300">{e.bloodGroup}</span></div>}
                  {e.allergies && <div className="col-span-2"><span className="text-zinc-950/55 dark:text-white/40 block">Allergies</span><span className="font-medium text-zinc-950/95 dark:text-white/90">{e.allergies}</span></div>}
                  {e.notes && <div className="col-span-2"><span className="text-zinc-950/55 dark:text-white/40 block">Notes</span><span className="font-medium text-zinc-950/95 dark:text-white/90">{e.notes}</span></div>}
                </div>
              </div>
            ))}
          </div>
        )
      ) : editing ? (
        /* Member edit form */
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/15 rounded-lg px-3 py-2">
            <Lock className="h-3.5 w-3.5 shrink-0" />
            Only the trip host can see this information.
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-zinc-950/60 dark:text-white/50 mb-1 block">Contact name *</label>
              <input value={form.contactName} onChange={(e) => setForm((f) => ({ ...f, contactName: e.target.value }))}
                placeholder="Parent / Sibling / Friend"
                className="w-full px-3 py-2 text-sm border border-zinc-950/10 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400" />
            </div>
            <div>
              <label className="text-xs text-zinc-950/60 dark:text-white/50 mb-1 block">Phone *</label>
              <input value={form.contactPhone} onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))}
                placeholder="+91 00000 00000" type="tel"
                className="w-full px-3 py-2 text-sm border border-zinc-950/10 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400" />
            </div>
          </div>
          <div>
            <label className="text-xs text-zinc-950/60 dark:text-white/50 mb-1 block">Blood group</label>
            <div className="flex flex-wrap gap-1.5">
              {BLOOD_GROUPS.map((bg) => (
                <button key={bg} onClick={() => setForm((f) => ({ ...f, bloodGroup: f.bloodGroup === bg ? '' : bg }))}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors
                    ${form.bloodGroup === bg ? 'bg-red-500 text-white border-red-500' : 'bg-night-soft text-zinc-950/70 dark:text-white/60 border-zinc-950/10 dark:border-white/10 hover:border-red-300'}`}>
                  {bg}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-zinc-950/60 dark:text-white/50 mb-1 block">Allergies / medical conditions</label>
            <input value={form.allergies} onChange={(e) => setForm((f) => ({ ...f, allergies: e.target.value }))}
              placeholder="e.g. Peanuts, Penicillin, Asthma"
              className="w-full px-3 py-2 text-sm border border-zinc-950/10 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400" />
          </div>
          <div>
            <label className="text-xs text-zinc-950/60 dark:text-white/50 mb-1 block">Other notes</label>
            <input value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="e.g. Carries EpiPen, requires daily medication"
              className="w-full px-3 py-2 text-sm border border-zinc-950/10 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400" />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setEditing(false)} className="px-4 py-2 text-sm text-zinc-950/70 dark:text-white/60 hover:bg-zinc-950/[0.06] dark:hover:bg-white/10 rounded-xl">Cancel</button>
            <button onClick={handleSave} disabled={!form.contactName.trim() || !form.contactPhone.trim() || saving}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50">
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      ) : isFilled ? (
        /* Member read view: their own filled info */
        <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Check className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium text-green-300">Info shared with host</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div><span className="text-zinc-950/55 dark:text-white/40 block">Contact</span><span className="font-medium text-zinc-950/95 dark:text-white/90">{myEntry?.contactName}</span></div>
            <div><span className="text-zinc-950/55 dark:text-white/40 block">Phone</span><span className="font-medium text-zinc-950/95 dark:text-white/90">{myEntry?.contactPhone}</span></div>
            {myEntry?.bloodGroup && <div><span className="text-zinc-950/55 dark:text-white/40 block">Blood group</span><span className="font-bold text-red-400">{myEntry.bloodGroup}</span></div>}
          </div>
        </div>
      ) : (
        /* Member: not filled yet */
        <div className="text-center py-8 bg-red-500/10 rounded-2xl border border-red-500/30">
          <ShieldAlert className="h-8 w-8 text-red-200 mx-auto mb-2" />
          <p className="text-sm text-zinc-950/60 dark:text-white/50 mb-1 font-medium">Emergency info not filled</p>
          <p className="text-xs text-zinc-950/55 dark:text-white/40 mb-3">Only visible to the host. Helps in emergencies.</p>
          <button onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-red-500 text-white rounded-xl hover:bg-red-600">
            <ShieldAlert className="h-3.5 w-3.5" /> Fill in now
          </button>
        </div>
      )}
    </div>
  );
}
