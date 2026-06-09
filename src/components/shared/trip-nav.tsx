'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, Package, Wrench, LayoutDashboard } from 'lucide-react';

const TABS = [
  { label: 'Overview',  href: '',           icon: LayoutDashboard },
  { label: 'Itinerary', href: '/itinerary', icon: CalendarDays },
  { label: 'Packing',   href: '/packing',   icon: Package },
  { label: 'Trip Tools',href: '/tools',     icon: Wrench },
];

interface Props {
  tripId: string;
  /** Hide Trip Tools tab for non-members */
  isMember?: boolean;
}

export function TripNav({ tripId, isMember = false }: Props) {
  const pathname = usePathname();
  const base = `/trips/${tripId}`;

  const tabs = TABS.filter((t) => t.href !== '/tools' || isMember);

  return (
    <nav className="flex items-center gap-1 bg-gray-50 rounded-2xl p-1 overflow-x-auto">
      {tabs.map((tab, i) => {
        const href = `${base}${tab.href}`;
        const isActive = tab.href === ''
          ? pathname === base
          : pathname.startsWith(href);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={href}
            className={`
              relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-1 justify-center
              ${isActive
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'}
            `}
          >
            <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-orange-500' : ''}`} />
            <span>{tab.label}</span>
            {/* step indicator dot */}
            {isActive && (
              <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-orange-500" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
