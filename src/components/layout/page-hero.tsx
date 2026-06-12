'use client';

import type { ReactNode } from 'react';
import { FadeUp } from '@/components/motion';

// Editorial split page header used across app pages.
export function PageHero({
  eyebrow, title, description, children,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <header className="relative overflow-hidden border-b border-zinc-950/10 dark:border-white/10 night-grid">
      <div className="absolute w-[480px] h-[480px] rounded-full blur-3xl bg-orange-600/15 -top-64 -right-24 pointer-events-none animate-pulse-glow" aria-hidden="true" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-12 grid gap-8 lg:grid-cols-[1fr,auto] items-end">
        <div>
          <FadeUp>
            <span className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-orange-400">{eyebrow}</span>
          </FadeUp>
          <FadeUp delay={0.08}>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-zinc-950 dark:text-white mt-4 leading-tight">{title}</h1>
          </FadeUp>
          {description && (
            <FadeUp delay={0.16}>
              <p className="text-zinc-950/60 dark:text-white/50 text-lg mt-4 max-w-xl leading-relaxed">{description}</p>
            </FadeUp>
          )}
        </div>
        {children && (
          <FadeUp delay={0.2}>
            <div>{children}</div>
          </FadeUp>
        )}
      </div>
    </header>
  );
}
