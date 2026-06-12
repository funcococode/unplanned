'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  link: string | null;
  createdAt: string;
}

export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await apiClient.get<{ notifications: Notification[]; unreadCount: number }>('/notifications');
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {
      // silently ignore (user might not be logged in)
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleOpen = async () => {
    setOpen((o) => !o);
    if (!open && unreadCount > 0) {
      await apiClient.post('/notifications/read-all');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  };

  const handleClick = (n: Notification) => {
    setOpen(false);
    if (n.link) router.push(n.link);
  };

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  const icon = (type: string) => {
    if (type === 'JOIN_REQUEST_APPROVED') return '✅';
    if (type === 'JOIN_REQUEST_REJECTED') return '❌';
    return '🔔';
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-lg hover:bg-zinc-950/[0.06] dark:hover:bg-white/10 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-zinc-950/70 dark:text-white/60" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-night-soft rounded-2xl shadow-xl ring-1 ring-black/5 z-20 overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-950/10 dark:border-white/10 flex items-center justify-between">
              <p className="text-sm font-semibold text-zinc-950 dark:text-white">Notifications</p>
              {notifications.length > 0 && (
                <button
                  onClick={async () => {
                    await apiClient.post('/notifications/read-all');
                    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
                    setUnreadCount(0);
                  }}
                  className="text-xs text-zinc-950/55 dark:text-white/40 hover:text-zinc-950/70 dark:hover:text-white/60"
                >
                  Mark all read
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="h-8 w-8 text-zinc-950/35 dark:text-white/20 mx-auto mb-2" />
                <p className="text-sm text-zinc-950/55 dark:text-white/40">No notifications yet</p>
              </div>
            ) : (
              <ul className="max-h-96 overflow-y-auto divide-y divide-zinc-950/5 dark:divide-white/5">
                {notifications.map((n) => (
                  <li
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={cn(
                      'flex gap-3 px-4 py-3 cursor-pointer hover:bg-zinc-950/[0.04] dark:hover:bg-white/[0.04] transition-colors',
                      !n.read && 'bg-orange-50/60',
                    )}
                  >
                    <span className="text-lg shrink-0 mt-0.5">{icon(n.type)}</span>
                    <div className="min-w-0 flex-1">
                      <p className={cn('text-sm text-zinc-950 dark:text-white', !n.read && 'font-semibold')}>{n.title}</p>
                      <p className="text-xs text-zinc-950/60 dark:text-white/50 mt-0.5 line-clamp-2">{n.body}</p>
                      <p className="text-xs text-zinc-950/55 dark:text-white/40 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                    {!n.read && <span className="h-2 w-2 rounded-full bg-orange-500 shrink-0 mt-1.5" />}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
