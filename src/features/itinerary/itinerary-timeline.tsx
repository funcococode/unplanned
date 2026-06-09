'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import {
  Plus, Pencil, Trash2, Check, X, Clock, MapPin,
  Utensils, Car, Home, Camera, Zap, Circle,
  CalendarDays, ChevronDown, ChevronUp, Lightbulb,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';

// ── Types ─────────────────────────────────────────────────────────────────────

type ItemType = 'ACTIVITY' | 'FOOD' | 'TRANSPORT' | 'ACCOMMODATION' | 'SIGHTSEEING' | 'OTHER';
type ItemStatus = 'APPROVED' | 'PENDING_REVIEW' | 'REJECTED';

interface Suggester { id: string; name: string; image: string | null; username: string | null }

interface ItineraryItem {
  id: string; dayId: string; order: number;
  time: string | null; title: string; description: string | null;
  location: string | null; type: ItemType; status: ItemStatus;
  suggestedBy: string | null; suggester: Suggester | null;
}

interface ItineraryDay {
  id: string; dayNumber: number; date: string | null;
  title: string; description: string | null;
  items: ItineraryItem[];
}

interface Props {
  tripId: string;
  initialDays: ItineraryDay[];
  isCreator: boolean;
  isMember: boolean;
  isLoggedIn: boolean;
  currentUserId?: string;
}

// ── Config ────────────────────────────────────────────────────────────────────

const ITEM_TYPES: { value: ItemType; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'ACTIVITY',      label: 'Activity',      Icon: Zap      },
  { value: 'FOOD',          label: 'Food & Drink',  Icon: Utensils },
  { value: 'TRANSPORT',     label: 'Transport',     Icon: Car      },
  { value: 'ACCOMMODATION', label: 'Stay',          Icon: Home     },
  { value: 'SIGHTSEEING',   label: 'Sightseeing',   Icon: Camera   },
  { value: 'OTHER',         label: 'Other',         Icon: Circle   },
];

const TYPE_COLORS: Record<ItemType, string> = {
  ACTIVITY:      'bg-orange-100 text-orange-600 border-orange-200',
  FOOD:          'bg-green-100 text-green-600 border-green-200',
  TRANSPORT:     'bg-blue-100 text-blue-600 border-blue-200',
  ACCOMMODATION: 'bg-violet-100 text-violet-600 border-violet-200',
  SIGHTSEEING:   'bg-cyan-100 text-cyan-600 border-cyan-200',
  OTHER:         'bg-gray-100 text-gray-500 border-gray-200',
};

const TYPE_DOT: Record<ItemType, string> = {
  ACTIVITY:      'bg-orange-500',
  FOOD:          'bg-green-500',
  TRANSPORT:     'bg-blue-500',
  ACCOMMODATION: 'bg-violet-500',
  SIGHTSEEING:   'bg-cyan-500',
  OTHER:         'bg-gray-400',
};

// ── Small helpers ─────────────────────────────────────────────────────────────

function TypeIcon({ type, className }: { type: ItemType; className?: string }) {
  const found = ITEM_TYPES.find((t) => t.value === type);
  if (!found) return null;
  const { Icon } = found;
  return <Icon className={className} />;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('default', { weekday: 'long', month: 'short', day: 'numeric' });
}

// ── Item form (add / edit) ────────────────────────────────────────────────────

interface ItemFormProps {
  initial?: Partial<ItineraryItem>;
  onSave: (data: Partial<ItineraryItem>) => Promise<void>;
  onCancel: () => void;
  isSuggestion?: boolean;
}

function ItemForm({ initial, onSave, onCancel, isSuggestion }: ItemFormProps) {
  const [title, setTitle]       = useState(initial?.title ?? '');
  const [time, setTime]         = useState(initial?.time ?? '');
  const [location, setLocation] = useState(initial?.location ?? '');
  const [description, setDesc]  = useState(initial?.description ?? '');
  const [type, setType]         = useState<ItemType>(initial?.type ?? 'ACTIVITY');
  const [saving, setSaving]     = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    await onSave({ title: title.trim(), time: time || null, location: location || null, description: description || null, type });
    setSaving(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3 shadow-sm">
      {isSuggestion && (
        <div className="flex items-center gap-2 text-xs font-medium text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
          <Lightbulb className="h-3.5 w-3.5" />
          This will be sent to the host for approval
        </div>
      )}
      <input
        value={title} onChange={(e) => setTitle(e.target.value)}
        placeholder="Stop title *"
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
        autoFocus
      />
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2">
          <Clock className="h-3.5 w-3.5 text-gray-400 shrink-0" />
          <input value={time} onChange={(e) => setTime(e.target.value)} type="time"
            className="flex-1 text-sm focus:outline-none min-w-0" />
        </div>
        <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2">
          <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location"
            className="flex-1 text-sm focus:outline-none min-w-0" />
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {ITEM_TYPES.map(({ value, label, Icon }) => (
          <button key={value} onClick={() => setType(value)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors
              ${type === value ? TYPE_COLORS[value] : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'}`}>
            <Icon className="h-3 w-3" />{label}
          </button>
        ))}
      </div>
      <textarea value={description} onChange={(e) => setDesc(e.target.value)} placeholder="Description (optional)"
        rows={2}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none" />
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
          Cancel
        </button>
        <button onClick={handleSave} disabled={!title.trim() || saving}
          className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-colors">
          {saving ? 'Saving…' : isSuggestion ? 'Submit suggestion' : 'Save'}
        </button>
      </div>
    </div>
  );
}

// ── Day form ──────────────────────────────────────────────────────────────────

function DayForm({ initial, onSave, onCancel }: { initial?: Partial<ItineraryDay>; onSave: (d: Partial<ItineraryDay>) => Promise<void>; onCancel: () => void }) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [date, setDate]   = useState(initial?.date ? initial.date.slice(0, 10) : '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    await onSave({ title: title.trim(), date: date || null });
    setSaving(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3 shadow-sm">
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Day title (e.g. Arrival in Goa)"
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500" autoFocus />
      <input value={date} onChange={(e) => setDate(e.target.value)} type="date"
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500" />
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
        <button onClick={handleSave} disabled={!title.trim() || saving}
          className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-colors">
          {saving ? 'Saving…' : 'Save Day'}
        </button>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ItineraryTimeline({ tripId, initialDays, isCreator, isMember, isLoggedIn, currentUserId }: Props) {
  const [days, setDays] = useState<ItineraryDay[]>(initialDays);
  const [addingDay, setAddingDay]    = useState(false);
  const [editingDay, setEditingDay]  = useState<string | null>(null);
  const [addingItem, setAddingItem]  = useState<string | null>(null);  // dayId
  const [editingItem, setEditingItem] = useState<string | null>(null); // itemId
  const [suggestingIn, setSuggestingIn] = useState<string | null>(null); // dayId
  const [collapsedDays, setCollapsedDays] = useState<Set<string>>(new Set());
  const [error, setError]            = useState<string | null>(null);

  const toggleDay = (dayId: string) =>
    setCollapsedDays((prev) => { const n = new Set(prev); n.has(dayId) ? n.delete(dayId) : n.add(dayId); return n; });

  const refetch = useCallback(async () => {
    const fresh = await apiClient.get<ItineraryDay[]>(`/trips/${tripId}/itinerary`);
    setDays(fresh);
  }, [tripId]);

  const handleAddDay = async (data: Partial<ItineraryDay>) => {
    await apiClient.post(`/trips/${tripId}/itinerary`, data);
    await refetch();
    setAddingDay(false);
  };

  const handleEditDay = async (dayId: string, data: Partial<ItineraryDay>) => {
    await apiClient.patch(`/trips/${tripId}/itinerary/days/${dayId}`, data);
    await refetch();
    setEditingDay(null);
  };

  const handleDeleteDay = async (dayId: string) => {
    if (!confirm('Delete this day and all its stops?')) return;
    await apiClient.delete(`/trips/${tripId}/itinerary/days/${dayId}`);
    setDays((prev) => prev.filter((d) => d.id !== dayId));
  };

  const handleAddItem = async (dayId: string, data: Partial<ItineraryItem>) => {
    try {
      await apiClient.post(`/trips/${tripId}/itinerary/items`, { ...data, dayId });
      await refetch();
      setAddingItem(null);
      setSuggestingIn(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    }
  };

  const handleEditItem = async (itemId: string, data: Partial<ItineraryItem>) => {
    await apiClient.patch(`/trips/${tripId}/itinerary/items/${itemId}`, data);
    await refetch();
    setEditingItem(null);
  };

  const handleDeleteItem = async (itemId: string) => {
    await apiClient.delete(`/trips/${tripId}/itinerary/items/${itemId}`);
    setDays((prev) => prev.map((d) => ({ ...d, items: d.items.filter((i) => i.id !== itemId) })));
  };

  const handleReview = async (itemId: string, status: 'APPROVED' | 'REJECTED') => {
    await apiClient.patch(`/trips/${tripId}/itinerary/items/${itemId}`, { status });
    await refetch();
  };

  // Filter items based on role
  const visibleItems = (items: ItineraryItem[]) =>
    items.filter((item) => {
      if (item.status === 'APPROVED') return true;
      if (isCreator) return true;
      if (item.suggestedBy === currentUserId) return true;
      return false;
    });

  const pendingCount = days.flatMap((d) => d.items).filter((i) => i.status === 'PENDING_REVIEW').length;

  // Empty state
  if (days.length === 0) {
    if (isCreator) {
      return (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl">
          <CalendarDays className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-700 mb-1">No itinerary yet</p>
          <p className="text-xs text-gray-400 mb-4">Build a day-by-day plan for your travelers</p>
          <button onClick={() => setAddingDay(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors">
            <Plus className="h-4 w-4" /> Add First Day
          </button>
          {addingDay && (
            <div className="mt-4 max-w-md mx-auto text-left">
              <DayForm onSave={handleAddDay} onCancel={() => setAddingDay(false)} />
            </div>
          )}
        </div>
      );
    }
    return (
      <div className="text-center py-10 bg-gray-50 rounded-2xl">
        <CalendarDays className="h-8 w-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-400">The host hasn&apos;t built the itinerary yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</div>
      )}

      {/* Pending suggestions banner (host only) */}
      {isCreator && pendingCount > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
          <Lightbulb className="h-4 w-4 text-amber-500 shrink-0" />
          <p className="text-sm font-medium text-amber-700">
            {pendingCount} pending suggestion{pendingCount > 1 ? 's' : ''} awaiting your review
          </p>
        </div>
      )}

      {/* Days */}
      {days.map((day) => {
        const collapsed  = collapsedDays.has(day.id);
        const items      = visibleItems(day.items);
        const pendingDay = day.items.filter((i) => i.status === 'PENDING_REVIEW').length;

        return (
          <div key={day.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            {/* Day header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50/60">
              <button onClick={() => toggleDay(day.id)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                <span className="flex items-center justify-center w-7 h-7 bg-orange-500 text-white text-xs font-bold rounded-full shrink-0">
                  {day.dayNumber}
                </span>
                <div className="min-w-0">
                  {editingDay !== day.id && (
                    <>
                      <p className="text-sm font-semibold text-gray-900 truncate">{day.title}</p>
                      {day.date && <p className="text-xs text-gray-400">{formatDate(day.date)}</p>}
                    </>
                  )}
                </div>
                {pendingDay > 0 && (
                  <span className="ml-auto shrink-0 flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                    <Lightbulb className="h-3 w-3" />{pendingDay}
                  </span>
                )}
                {collapsed ? <ChevronDown className="h-4 w-4 text-gray-400 ml-auto shrink-0" /> : <ChevronUp className="h-4 w-4 text-gray-400 ml-auto shrink-0" />}
              </button>
              {isCreator && (
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => setEditingDay(editingDay === day.id ? null : day.id)}
                    className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => handleDeleteDay(day.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Edit day form */}
            {editingDay === day.id && (
              <div className="px-5 py-4 border-b border-gray-100">
                <DayForm initial={day}
                  onSave={(data) => handleEditDay(day.id, data)}
                  onCancel={() => setEditingDay(null)} />
              </div>
            )}

            {/* Items */}
            {!collapsed && (
              <div className="px-5 py-4 space-y-0">
                {items.length === 0 && !addingItem && !suggestingIn ? (
                  <p className="text-xs text-gray-400 py-2">No stops yet for this day.</p>
                ) : (
                  <div className="relative">
                    {/* Vertical line */}
                    {items.length > 0 && (
                      <div className="absolute left-[11px] top-4 bottom-4 w-px bg-gray-100" />
                    )}
                    <div className="space-y-1">
                      {items.map((item) => {
                        const isPending  = item.status === 'PENDING_REVIEW';
                        const isRejected = item.status === 'REJECTED';
                        const canEdit    = isCreator || (item.suggestedBy === currentUserId && isPending);
                        const canDelete  = isCreator || (item.suggestedBy === currentUserId && isPending);

                        return (
                          <div key={item.id}>
                            {editingItem === item.id ? (
                              <div className="pl-7 pb-3">
                                <ItemForm initial={item}
                                  onSave={(data) => handleEditItem(item.id, data)}
                                  onCancel={() => setEditingItem(null)} />
                              </div>
                            ) : (
                              <div className={`flex gap-3 py-2.5 rounded-xl px-2 group transition-colors
                                ${isPending ? 'bg-amber-50/60' : isRejected ? 'bg-gray-50 opacity-50' : 'hover:bg-gray-50'}`}>
                                {/* Dot */}
                                <div className="relative flex flex-col items-center shrink-0 pt-0.5">
                                  <span className={`w-5 h-5 rounded-full border-2 border-white shadow-sm flex items-center justify-center
                                    ${isPending ? 'bg-amber-400' : isRejected ? 'bg-gray-300' : TYPE_DOT[item.type]}`}>
                                    <TypeIcon type={item.type} className="h-2.5 w-2.5 text-white" />
                                  </span>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        {item.time && (
                                          <span className="text-xs font-mono text-gray-400 shrink-0">{item.time}</span>
                                        )}
                                        <span className="text-sm font-medium text-gray-900">{item.title}</span>
                                        {isPending && (
                                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full">
                                            <Lightbulb className="h-2.5 w-2.5" />SUGGESTION
                                          </span>
                                        )}
                                      </div>
                                      {item.location && (
                                        <p className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                                          <MapPin className="h-3 w-3" />{item.location}
                                        </p>
                                      )}
                                      {item.description && (
                                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{item.description}</p>
                                      )}
                                      {/* Suggester info */}
                                      {item.suggester && (
                                        <div className="flex items-center gap-1.5 mt-1.5">
                                          {item.suggester.image ? (
                                            <Image src={item.suggester.image} alt={item.suggester.name} width={14} height={14} className="rounded-full" />
                                          ) : (
                                            <div className="w-3.5 h-3.5 rounded-full bg-gray-200 flex items-center justify-center text-[8px] font-bold text-gray-500">
                                              {item.suggester.name[0]}
                                            </div>
                                          )}
                                          <span className="text-[10px] text-gray-400">Suggested by {item.suggester.name}</span>
                                        </div>
                                      )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1 shrink-0">
                                      {/* Approve/Reject (host only, pending items) */}
                                      {isCreator && isPending && (
                                        <>
                                          <button onClick={() => handleReview(item.id, 'APPROVED')}
                                            title="Approve"
                                            className="p-1.5 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                                            <Check className="h-3.5 w-3.5" />
                                          </button>
                                          <button onClick={() => handleReview(item.id, 'REJECTED')}
                                            title="Reject"
                                            className="p-1.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                                            <X className="h-3.5 w-3.5" />
                                          </button>
                                        </>
                                      )}
                                      {canEdit && (
                                        <button onClick={() => setEditingItem(item.id)}
                                          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                                          <Pencil className="h-3.5 w-3.5" />
                                        </button>
                                      )}
                                      {canDelete && (
                                        <button onClick={() => handleDeleteItem(item.id)}
                                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Add / Suggest form */}
                {(addingItem === day.id || suggestingIn === day.id) && (
                  <div className="mt-3">
                    <ItemForm
                      isSuggestion={suggestingIn === day.id}
                      onSave={(data) => handleAddItem(day.id, data)}
                      onCancel={() => { setAddingItem(null); setSuggestingIn(null); }} />
                  </div>
                )}

                {/* Action buttons */}
                {addingItem !== day.id && suggestingIn !== day.id && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
                    {isCreator && (
                      <button onClick={() => setAddingItem(day.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <Plus className="h-3.5 w-3.5" /> Add stop
                      </button>
                    )}
                    {isMember && !isCreator && (
                      <button onClick={() => setSuggestingIn(day.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors">
                        <Lightbulb className="h-3.5 w-3.5" /> Suggest a spot
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Add day button (host) */}
      {isCreator && (
        <div>
          {addingDay ? (
            <DayForm onSave={handleAddDay} onCancel={() => setAddingDay(false)} />
          ) : (
            <button onClick={() => setAddingDay(true)}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 text-sm font-medium text-gray-500 rounded-2xl hover:border-orange-300 hover:text-orange-500 transition-colors">
              <Plus className="h-4 w-4" /> Add Day
            </button>
          )}
        </div>
      )}
    </div>
  );
}
