'use client';

import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { useSession } from 'next-auth/react';

export function Footer() {
  const { status } = useSession();

  return (
    <footer className="bg-gray-50 border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900 mb-3">
              <MapPin className="h-5 w-5 text-orange-500" />
              Unplanned
            </Link>
            <p className="text-sm text-gray-500 max-w-xs">
              Never cancel a trip because your friends said no. Find travel companions who share your
              spirit.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Explore</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/trips" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  Browse Trips
                </Link>
              </li>
              <li>
                <Link href="/trips/new" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  Create a Trip
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Account</h3>
            <ul className="space-y-2">
              {status !== 'authenticated' && (
                <li>
                  <Link href="/login" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                    Sign In
                  </Link>
                </li>
              )}
              <li>
                <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Unplanned. Built for travelers, by travelers.
          </p>
          <p className="text-xs text-gray-400">Phase 1 MVP</p>
        </div>
      </div>
    </footer>
  );
}
