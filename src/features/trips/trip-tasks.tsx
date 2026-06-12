'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Plus, Trash2, CheckCircle2, Circle, Clock, Loader2, ListChecks } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
interface Member  { id: string; name: string; image: string | null }
interface Task {
  id: string; title: string; description: string | null; status: TaskStatus;
  dueDate: string | null;
  createdBy:  { id: string; name: string; image: string | null };
  assignedTo: { id: string; name: string; image: string | null } | null;
}
interface Props { tripId: string; members: Member[]; currentUserId: string; isCreator: boolean }

const STATUS_CYCLE: Record<TaskStatus, TaskStatus> = { TODO: 'IN_PROGRESS', IN_PROGRESS: 'DONE', DONE: 'TODO' };
const STATUS_LABEL: Record<TaskStatus, string>     = { TODO: 'To do', IN_PROGRESS: 'In progress', DONE: 'Done' };
const STATUS_COLOR: Record<TaskStatus, string>     = {
  TODO:        'text-zinc-950/55 dark:text-white/40',
  IN_PROGRESS: 'text-amber-500',
  DONE:        'text-green-500',
};

function StatusIcon({ status }: { status: TaskStatus }) {
  if (status === 'DONE')        return <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />;
  if (status === 'IN_PROGRESS') return <Clock        className="h-4 w-4 text-amber-500 shrink-0" />;
  return <Circle className="h-4 w-4 text-zinc-950/45 dark:text-white/30 shrink-0" />;
}

function MemberAvatar({ member }: { member: Member }) {
  if (member.image) return <Image src={member.image} alt={member.name} width={18} height={18} className="rounded-full" />;
  return <div className="w-4.5 h-4.5 rounded-full bg-zinc-950/[0.06] dark:bg-white/10 flex items-center justify-center text-[9px] font-bold text-zinc-950/70 dark:text-white/60">{member.name[0]}</div>;
}

export function TripTasks({ tripId, members, currentUserId, isCreator }: Props) {
  const [tasks, setTasks]   = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding]   = useState(false);
  const [saving, setSaving]   = useState(false);
  const [form, setForm]       = useState({ title: '', description: '', assignedToId: '', dueDate: '' });

  const refetch = () => apiClient.get<Task[]>(`/trips/${tripId}/tasks`).then(setTasks).catch(() => {});

  useEffect(() => { refetch().finally(() => setLoading(false)); }, [tripId]);

  const handleAdd = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    await apiClient.post(`/trips/${tripId}/tasks`, {
      title:        form.title.trim(),
      description:  form.description.trim() || null,
      assignedToId: form.assignedToId || null,
      dueDate:      form.dueDate || null,
    });
    await refetch();
    setForm({ title: '', description: '', assignedToId: '', dueDate: '' });
    setAdding(false);
    setSaving(false);
  };

  const cycleStatus = async (task: Task) => {
    const next = STATUS_CYCLE[task.status];
    setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, status: next } : t));
    await apiClient.patch(`/trips/${tripId}/tasks/${task.id}`, { status: next });
  };

  const handleDelete = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    await apiClient.delete(`/trips/${tripId}/tasks/${taskId}`);
  };

  const groups: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-zinc-950 dark:text-white flex items-center gap-2">
          <ListChecks className="h-5 w-5 text-violet-500" /> Trip Tasks
        </h3>
        {!adding && (
          <button onClick={() => setAdding(true)} className="flex items-center gap-1.5 text-xs font-medium text-violet-400 hover:text-violet-300">
            <Plus className="h-3.5 w-3.5" />Add task
          </button>
        )}
      </div>

      {adding && (
        <div className="bg-violet-500/10 border border-violet-500/30 rounded-2xl p-4 space-y-3 mb-4">
          <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="What needs to be done?" autoFocus
            className="w-full px-3 py-2 text-sm border border-zinc-950/10 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500" />
          <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Details (optional)"
            className="w-full px-3 py-2 text-sm border border-zinc-950/10 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500" />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-zinc-950/60 dark:text-white/50 mb-1 block">Assign to</label>
              <select value={form.assignedToId} onChange={(e) => setForm((f) => ({ ...f, assignedToId: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-zinc-950/10 dark:border-white/10 rounded-xl focus:outline-none bg-night-soft">
                <option value="">Anyone</option>
                {members.map((m) => <option key={m.id} value={m.id}>{m.name.split(' ')[0]}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-950/60 dark:text-white/50 mb-1 block">Due date</label>
              <input type="date" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-zinc-950/10 dark:border-white/10 rounded-xl focus:outline-none bg-night-soft" />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setAdding(false)} className="px-4 py-2 text-sm text-zinc-950/70 dark:text-white/60 hover:bg-zinc-950/[0.06] dark:hover:bg-white/10 rounded-xl">Cancel</button>
            <button onClick={handleAdd} disabled={!form.title.trim() || saving}
              className="px-4 py-2 text-sm font-medium bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:opacity-50">
              {saving ? 'Saving…' : 'Add'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-zinc-950/45 dark:text-white/30" /></div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-8 bg-zinc-950/[0.04] dark:bg-white/[0.04] rounded-2xl">
          <ListChecks className="h-8 w-8 text-zinc-950/35 dark:text-white/20 mx-auto mb-2" />
          <p className="text-sm text-zinc-950/55 dark:text-white/40">No tasks yet. Add one to get organised.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => {
            const groupTasks = tasks.filter((t) => t.status === group);
            if (groupTasks.length === 0) return null;
            return (
              <div key={group}>
                <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${STATUS_COLOR[group]}`}>
                  {STATUS_LABEL[group]} · {groupTasks.length}
                </p>
                <div className="space-y-1.5">
                  {groupTasks.map((task) => {
                    const canDelete = isCreator || task.createdBy.id === currentUserId;
                    const overdue = task.dueDate && task.status !== 'DONE' && new Date(task.dueDate) < new Date();
                    return (
                      <div key={task.id} className="flex items-start gap-3 p-3 bg-night-soft border border-zinc-950/10 dark:border-white/10 rounded-xl group">
                        <button onClick={() => cycleStatus(task)} className="mt-0.5 shrink-0 hover:scale-110 transition-transform">
                          <StatusIcon status={task.status} />
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${task.status === 'DONE' ? 'line-through text-zinc-950/55 dark:text-white/40' : 'text-zinc-950 dark:text-white'}`}>
                            {task.title}
                          </p>
                          {task.description && <p className="text-xs text-zinc-950/55 dark:text-white/40 mt-0.5 truncate">{task.description}</p>}
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            {task.assignedTo && (
                              <div className="flex items-center gap-1">
                                <MemberAvatar member={task.assignedTo} />
                                <span className="text-[10px] text-zinc-950/60 dark:text-white/50">{task.assignedTo.name.split(' ')[0]}</span>
                              </div>
                            )}
                            {task.dueDate && (
                              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${overdue ? 'bg-red-500/10 text-red-500' : 'bg-zinc-950/[0.05] dark:bg-white/[0.06] text-zinc-950/60 dark:text-white/50'}`}>
                                {overdue ? '⚠️ ' : ''}{new Date(task.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                              </span>
                            )}
                          </div>
                        </div>
                        {canDelete && (
                          <button onClick={() => handleDelete(task.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-zinc-950/45 dark:text-white/30 hover:text-red-400 transition-all shrink-0">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
