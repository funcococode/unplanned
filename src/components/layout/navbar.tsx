'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Plus, User, LogOut, LayoutDashboard, Compass, CalendarDays, Pencil } from 'lucide-react';
import { NotificationBell } from '@/components/shared/notification-bell';
import { ThemeToggle } from '@/components/shared/theme-toggle';

const navLink = 'flex items-center gap-1.5 text-sm font-semibold text-zinc-950/70 dark:text-white/60 transition-colors duration-300 hover:text-zinc-950 dark:hover:text-white';
const ctaCls =
  'flex items-center gap-1.5 px-4 py-2 bg-orange-500 text-white text-sm font-bold rounded-xl ' +
  'shadow-[0_0_24px_-8px_rgba(249,115,22,0.6)] transition-all duration-300 hover:bg-orange-400 hover:shadow-[0_0_36px_-6px_rgba(249,115,22,0.85)]';
const menuItem = 'flex items-center gap-2 px-4 py-2 text-sm text-zinc-950/80 dark:text-white/70 transition-colors duration-200 hover:bg-zinc-950/[0.05] dark:hover:bg-white/[0.06] hover:text-zinc-950 dark:hover:text-white';
const mobileItem = 'flex items-center gap-2 px-3 py-2 text-sm font-semibold text-zinc-950/90 dark:text-white/80 rounded-xl hover:bg-zinc-950/[0.06] dark:hover:bg-white/10';

export function Navbar() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen]     = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const user = session?.user;

  const profileHref = '/profile/me';

  return (
    <nav className="sticky top-0 z-50 bg-night/80 backdrop-blur-md border-b border-zinc-950/10 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          <Link href="/" className="flex items-center gap-1.5">
            <Image src="/favicon.svg" alt="" width={26} height={26} className="shrink-0" />
            <span className="font-display font-bold text-lg tracking-tight text-zinc-950 dark:text-white">
              Trip <span className="text-orange-500">Unplanned</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <ThemeToggle />
            <Link href="/trips" className={navLink}>
              <Compass className="h-4 w-4" /> Explore
            </Link>
            {status === 'authenticated' && (
              <Link href="/calendar" className={navLink}>
                <CalendarDays className="h-4 w-4" /> Calendar
              </Link>
            )}
            {status === 'authenticated' && <NotificationBell />}
            {status === 'authenticated' ? (
              <>
                <Link href="/trips/new" className={ctaCls}>
                  <Plus className="h-4 w-4" /> Create Trip
                </Link>

                {/* Avatar dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 rounded-full transition-shadow duration-300 hover:shadow-[0_0_0_3px_rgba(249,115,22,0.35)]"
                    aria-label="Open profile menu"
                  >
                    {user?.image
                      ? <Image src={user.image} alt={user.name ?? 'Profile'} width={36} height={36} className="rounded-full ring-2 ring-zinc-950/20 dark:ring-white/20" />
                      : <div className="w-9 h-9 rounded-full bg-zinc-950/[0.06] dark:bg-white/10 flex items-center justify-center text-sm font-bold text-zinc-950 dark:text-white">{user?.name?.[0] ?? 'U'}</div>}
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -6, scale: 0.97 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          className="absolute right-0 mt-2 w-56 bg-night-soft backdrop-blur-md rounded-xl shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)] ring-1 ring-zinc-950/10 dark:ring-white/10 py-1 z-20 origin-top-right"
                        >
                          <div className="px-4 py-3 border-b border-zinc-950/10 dark:border-white/10">
                            <p className="text-sm font-bold text-zinc-950 dark:text-white truncate">{user?.name}</p>
                            <p className="text-xs text-zinc-950/55 dark:text-white/40 truncate">{user?.email}</p>
                          </div>
                          <Link href={profileHref} onClick={() => setProfileOpen(false)} className={menuItem}>
                            <User className="h-4 w-4" /> My Profile
                          </Link>
                          <Link href="/dashboard" onClick={() => setProfileOpen(false)} className={menuItem}>
                            <LayoutDashboard className="h-4 w-4" /> Dashboard
                          </Link>
                          <Link href="/profile/edit" onClick={() => setProfileOpen(false)} className={menuItem}>
                            <Pencil className="h-4 w-4" /> Edit Profile
                          </Link>
                          <div className="border-t border-zinc-950/10 dark:border-white/10 mt-1 pt-1">
                            <button onClick={() => signOut({ callbackUrl: '/' })} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-400 transition-colors duration-200 hover:bg-red-500/10">
                              <LogOut className="h-4 w-4" /> Sign Out
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <Link href="/login" className={ctaCls}>
                Sign In
              </Link>
            )}
          </div>

          <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            className="p-2 rounded-xl text-zinc-950 dark:text-white transition-colors duration-300 hover:bg-zinc-950/[0.06] dark:hover:bg-white/10"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 32 }}
            className="md:hidden border-t border-zinc-950/10 dark:border-white/10 bg-night overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              <Link href="/trips" onClick={() => setMenuOpen(false)} className={mobileItem}>
                <Compass className="h-4 w-4" /> Explore Trips
              </Link>
              {status === 'authenticated' && (
                <Link href="/calendar" onClick={() => setMenuOpen(false)} className={mobileItem}>
                  <CalendarDays className="h-4 w-4" /> Calendar
                </Link>
              )}
              {status === 'authenticated' ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-2 mb-1">
                    {user?.image
                      ? <Image src={user.image} alt="" width={32} height={32} className="rounded-full ring-2 ring-zinc-950/20 dark:ring-white/20" />
                      : <div className="w-8 h-8 rounded-full bg-zinc-950/[0.06] dark:bg-white/10 flex items-center justify-center text-sm font-bold text-zinc-950 dark:text-white">{user?.name?.[0]}</div>}
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-zinc-950 dark:text-white truncate">{user?.name}</p>
                      <p className="text-xs text-zinc-950/55 dark:text-white/40 truncate">{user?.email}</p>
                    </div>
                  </div>
                  <Link href={profileHref} onClick={() => setMenuOpen(false)} className={mobileItem}>
                    <User className="h-4 w-4" /> My Profile
                  </Link>
                  <Link href="/trips/new" onClick={() => setMenuOpen(false)} className={mobileItem}>
                    <Plus className="h-4 w-4" /> Create Trip
                  </Link>
                  <Link href="/dashboard" onClick={() => setMenuOpen(false)} className={mobileItem}>
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Link>
                  <Link href="/profile/edit" onClick={() => setMenuOpen(false)} className={mobileItem}>
                    <Pencil className="h-4 w-4" /> Edit Profile
                  </Link>
                  <button
                    onClick={() => { signOut({ callbackUrl: '/' }); setMenuOpen(false); }}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/10 rounded-xl w-full"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </>
              ) : (
                <Link href="/login" onClick={() => setMenuOpen(false)} className={mobileItem}>
                  <User className="h-4 w-4" /> Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
