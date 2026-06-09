'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { MapPin, Menu, X, Plus, User, LogOut, LayoutDashboard, Compass, CalendarDays, Pencil } from 'lucide-react';
import { NotificationBell } from '@/components/shared/notification-bell';

export function Navbar() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen]     = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const user = session?.user;

  const profileHref = '/profile/me';

  const menuItem = 'flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors';
  const mobileItem = 'flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50';

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900">
            <MapPin className="h-5 w-5 text-orange-500" />
            <span>Unplanned</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/trips" className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              <Compass className="h-4 w-4" /> Explore
            </Link>
            {status === 'authenticated' && (
              <Link href="/calendar" className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                <CalendarDays className="h-4 w-4" /> Calendar
              </Link>
            )}
            {status === 'authenticated' && <NotificationBell />}
            {status === 'authenticated' ? (
              <>
                <Link href="/trips/new" className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
                  <Plus className="h-4 w-4" /> Create Trip
                </Link>

                {/* Avatar dropdown */}
                <div className="relative">
                  <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    {user?.image
                      ? <Image src={user.image} alt={user.name ?? 'Profile'} width={36} height={36} className="rounded-full ring-2 ring-gray-100" />
                      : <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-700">{user?.name?.[0] ?? 'U'}</div>}
                  </button>

                  {profileOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg ring-1 ring-black/5 py-1 z-20">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                          <p className="text-xs text-gray-400 truncate">{user?.email}</p>
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
                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <button onClick={() => signOut({ callbackUrl: '/' })} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                            <LogOut className="h-4 w-4" /> Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <Link href="/login" className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
                Sign In
              </Link>
            )}
          </div>

          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
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
                    ? <Image src={user.image} alt="" width={32} height={32} className="rounded-full" />
                    : <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">{user?.name?.[0]}</div>}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user?.email}</p>
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
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg w-full"
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
        </div>
      )}
    </nav>
  );
}
