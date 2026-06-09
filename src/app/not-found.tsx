import Link from 'next/link';
import { MapPin } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <MapPin className="h-12 w-12 text-gray-200 mb-6" />
      <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
      <p className="text-gray-500 mb-8 text-center">
        This page got lost somewhere between departure and arrival.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}
