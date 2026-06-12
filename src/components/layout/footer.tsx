'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

const linkCls = 'text-sm text-zinc-950/55 dark:text-white/40 transition-colors duration-300 hover:text-orange-400';
const headCls = 'font-display text-xs font-semibold uppercase tracking-[0.2em] text-zinc-950/80 dark:text-white/70 mb-4';

export function Footer() {
  const { status } = useSession();

  return (
    <footer className="bg-night border-t border-zinc-950/10 dark:border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-1.5 mb-3">
              <Image src="/favicon.svg" alt="" width={24} height={24} className="shrink-0" />
              <span className="font-display font-bold text-lg tracking-tight text-zinc-950 dark:text-white">
                Trip <span className="text-orange-500">Unplanned</span>
              </span>
            </Link>
            <p className="text-sm max-w-xs leading-relaxed text-zinc-950/55 dark:text-white/40">
              Never cancel a trip because your friends said no. Find travel companions who share
              your spirit.
            </p>
          </div>
          <div>
            <h3 className={headCls}>Explore</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/trips" className={linkCls}>
                  Browse Trips
                </Link>
              </li>
              <li>
                <Link href="/trips/new" className={linkCls}>
                  Create a Trip
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className={headCls}>Account</h3>
            <ul className="space-y-2">
              {status !== 'authenticated' && (
                <li>
                  <Link href="/login" className={linkCls}>
                    Sign In
                  </Link>
                </li>
              )}
              <li>
                <Link href="/dashboard" className={linkCls}>
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-8 border-t border-zinc-950/10 dark:border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-zinc-950/40 dark:text-white/25">
            © {new Date().getFullYear()} Trip Unplanned. Built for travelers, by travelers.
          </p>
          <p className="text-xs text-zinc-950/40 dark:text-white/25">Phase 1 MVP</p>
        </div>
      </div>
    </footer>
  );
}
