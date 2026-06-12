'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CalendarDays, Package, Wrench, LayoutDashboard, Loader2 } from 'lucide-react';

const TABS = [
  { label: 'Overview',   href: '',           icon: LayoutDashboard, memberOnly: false },
  { label: 'Itinerary',  href: '/itinerary', icon: CalendarDays,    memberOnly: false },
  { label: 'Packing',    href: '/packing',   icon: Package,         memberOnly: false },
  { label: 'Trip Tools', href: '/tools',     icon: Wrench,          memberOnly: true  },
];

interface Props {
  tripId: string;
  isMember?: boolean;
  isCreator?: boolean;
}

export function TripNav({ tripId, isMember = false, isCreator = false }: Props) {
  const pathname = usePathname();
  const base = `/trips/${tripId}`;
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  // Clear the pending state once the route actually changed
  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  const tabs = TABS.filter((t) => {
    if (t.memberOnly) return isMember || isCreator;
    return true;
  });

  return (
    <nav className="flex items-center gap-1 bg-zinc-950/[0.04] dark:bg-white/[0.04] rounded-2xl ring-1 ring-zinc-950/10 dark:ring-white/10 p-1 overflow-x-auto">
      {tabs.map((tab) => {
        const href = `${base}${tab.href}`;
        const isActive = tab.href === ''
          ? pathname === base
          : pathname.startsWith(href);
        const isPending = pendingHref === href && !isActive;
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={href}
            onClick={() => { if (!isActive) setPendingHref(href); }}
            aria-busy={isPending || undefined}
            className={`
              relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 flex-1 justify-center
              ${isActive
                ? 'bg-night-soft text-zinc-950 dark:text-white shadow-sm ring-1 ring-zinc-950/10 dark:ring-white/10'
                : 'text-zinc-950/60 dark:text-white/50 hover:text-zinc-950/90 dark:hover:text-white/80'}
              ${isPending ? 'text-orange-400 dark:text-orange-400' : ''}
            `}
          >
            {isPending
              ? <Loader2 className="h-4 w-4 shrink-0 animate-spin text-orange-400" />
              : <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-orange-400' : ''}`} />}
            <span>{tab.label}</span>
            {isActive && (
              <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-orange-500" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
