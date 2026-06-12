'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

export function LoginShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-night night-grid px-4 relative overflow-hidden">
      <div className="absolute w-[560px] h-[560px] rounded-full blur-3xl bg-orange-600/20 -top-48 -right-32 pointer-events-none animate-pulse-glow" aria-hidden="true" />
      <div className="absolute w-[400px] h-[400px] rounded-full blur-3xl bg-amber-500/10 bottom-0 -left-40 pointer-events-none animate-pulse-glow" aria-hidden="true" />

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 120, damping: 16 }}
        >
          <Link href="/" className="inline-flex items-center gap-2 mb-3">
            <Image src="/favicon.svg" alt="" width={30} height={30} className="shrink-0" />
            <span className="font-display font-bold text-2xl text-zinc-950 dark:text-white tracking-tight">
              Trip <span className="text-orange-500">Unplanned</span>
            </span>
          </Link>
          <p className="text-zinc-950/55 dark:text-white/40 text-sm">
            Never cancel a trip because your friends said no.
          </p>
        </motion.div>

        <motion.div
          className="bg-zinc-950/[0.05] dark:bg-white/[0.05] backdrop-blur-md rounded-2xl ring-1 ring-zinc-950/10 dark:ring-white/10 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.8)] p-8"
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 110, damping: 15, delay: 0.15 }}
        >
          <h1 className="font-display text-2xl font-bold text-zinc-950 dark:text-white mb-2 text-center">
            Welcome back
          </h1>
          <p className="text-zinc-950/55 dark:text-white/40 text-sm text-center mb-8">
            Sign in to find travel companions and join trips
          </p>

          {children}

          <p className="text-xs text-zinc-950/40 dark:text-white/25 text-center mt-6 leading-relaxed">
            By signing in, you agree to our Terms of Service and Privacy Policy. Trip Unplanned is
            in beta — things may change.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
