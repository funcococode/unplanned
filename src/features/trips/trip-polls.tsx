'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Vote, Loader2, X, CheckCircle2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface PollOption { id: string; text: string; voteCount: number; hasVoted: boolean; order: number }
interface Poll { id: string; question: string; closed: boolean; allowMultiple: boolean; options: PollOption[]; createdAt: string }
interface Props { tripId: string; isCreator: boolean; currentUserId: string }

export function TripPolls({ tripId, isCreator }: Props) {
  const [polls, setPolls]   = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [question, setQuestion] = useState('');
  const [options, setOptions]   = useState(['', '']);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [saving, setSaving] = useState(false);

  const refetch = () => apiClient.get<Poll[]>(`/trips/${tripId}/polls`).then(setPolls).catch(() => {});

  useEffect(() => { refetch().finally(() => setLoading(false)); }, [tripId]);

  const handleCreate = async () => {
    const validOptions = options.filter((o) => o.trim());
    if (!question.trim() || validOptions.length < 2) return;
    setSaving(true);
    await apiClient.post(`/trips/${tripId}/polls`, { question: question.trim(), options: validOptions, allowMultiple });
    await refetch();
    setQuestion(''); setOptions(['', '']); setAllowMultiple(false); setCreating(false);
    setSaving(false);
  };

  const handleVote = async (pollId: string, optionId: string) => {
    await apiClient.post(`/trips/${tripId}/polls/${pollId}`, { optionId });
    await refetch();
  };

  const handleClose = async (pollId: string) => {
    await apiClient.post(`/trips/${tripId}/polls/${pollId}`, { action: 'close' });
    await refetch();
  };

  const handleDelete = async (pollId: string) => {
    await apiClient.delete(`/trips/${tripId}/polls/${pollId}`);
    setPolls((prev) => prev.filter((p) => p.id !== pollId));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Vote className="h-5 w-5 text-blue-500" /> Group Polls
        </h3>
        {isCreator && !creating && (
          <button onClick={() => setCreating(true)} className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700">
            <Plus className="h-3.5 w-3.5" />Create poll
          </button>
        )}
      </div>

      {creating && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 space-y-3 mb-4">
          <input value={question} onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask the group something…" autoFocus
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <div className="space-y-2">
            {options.map((opt, i) => (
              <div key={i} className="flex gap-2">
                <input value={opt} onChange={(e) => { const o = [...options]; o[i] = e.target.value; setOptions(o); }}
                  placeholder={`Option ${i + 1}`}
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                {options.length > 2 && (
                  <button onClick={() => setOptions(options.filter((_, j) => j !== i))} className="p-2 text-gray-400 hover:text-red-400">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            {options.length < 6 && (
              <button onClick={() => setOptions([...options, ''])} className="text-xs text-blue-500 hover:text-blue-600 font-medium">
                + Add option
              </button>
            )}
          </div>
          <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
            <input type="checkbox" checked={allowMultiple} onChange={(e) => setAllowMultiple(e.target.checked)} className="rounded" />
            Allow multiple votes
          </label>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setCreating(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button>
            <button onClick={handleCreate} disabled={!question.trim() || options.filter((o) => o.trim()).length < 2 || saving}
              className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Creating…' : 'Create poll'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-gray-300" /></div>
      ) : polls.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-2xl">
          <Vote className="h-8 w-8 text-gray-200 mx-auto mb-2" />
          <p className="text-sm text-gray-400">{isCreator ? 'Create a poll to get the group to vote.' : 'No polls yet.'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {polls.map((poll) => {
            const totalVotes = poll.options.reduce((s, o) => s + o.voteCount, 0);
            const hasVotedAny = poll.options.some((o) => o.hasVoted);
            return (
              <div key={poll.id} className={`border rounded-2xl p-4 ${poll.closed ? 'bg-gray-50 border-gray-100' : 'bg-white border-gray-100'}`}>
                <div className="flex items-start gap-2 mb-3">
                  <p className="flex-1 text-sm font-semibold text-gray-900">{poll.question}</p>
                  {poll.closed && <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full shrink-0">Closed</span>}
                  {isCreator && (
                    <div className="flex gap-1 shrink-0">
                      {!poll.closed && <button onClick={() => handleClose(poll.id)} className="text-xs text-gray-400 hover:text-gray-600 px-2 py-0.5 bg-gray-100 rounded-lg">Close</button>}
                      <button onClick={() => handleDelete(poll.id)} className="p-1 text-gray-300 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  {poll.options.map((opt) => {
                    const pct = totalVotes > 0 ? Math.round((opt.voteCount / totalVotes) * 100) : 0;
                    return (
                      <button key={opt.id} onClick={() => !poll.closed && handleVote(poll.id, opt.id)}
                        disabled={poll.closed}
                        className={`w-full text-left rounded-xl overflow-hidden border transition-all
                          ${opt.hasVoted ? 'border-blue-400' : 'border-gray-100 hover:border-blue-200'}
                          ${poll.closed ? 'cursor-default' : 'cursor-pointer'}`}>
                        <div className="relative px-3 py-2">
                          {(hasVotedAny || poll.closed) && (
                            <div className="absolute inset-0 bg-blue-50 rounded-xl" style={{ width: `${pct}%` }} />
                          )}
                          <div className="relative flex items-center gap-2">
                            {opt.hasVoted && <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 shrink-0" />}
                            <span className={`text-sm flex-1 ${opt.hasVoted ? 'font-semibold text-blue-700' : 'text-gray-700'}`}>{opt.text}</span>
                            {(hasVotedAny || poll.closed) && (
                              <span className="text-xs font-semibold text-gray-500 shrink-0">{pct}% · {opt.voteCount}</span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-gray-400 mt-2">{totalVotes} vote{totalVotes !== 1 ? 's' : ''}{poll.allowMultiple ? ' · multiple allowed' : ''}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
