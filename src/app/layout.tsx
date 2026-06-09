import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import { SessionProvider } from 'next-auth/react';
import { Providers } from './providers';
import './globals.css';

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
});

export const metadata: Metadata = {
  title: {
    default: 'Unplanned — Find Your Travel Companion',
    template: '%s | Unplanned',
  },
  description: 'Never cancel a trip because your friends said no. Create trips, meet travelers, explore together.',
  keywords: ['travel', 'travel companion', 'trip planning', 'travel community', 'backpacking'],
  openGraph: {
    title: 'Unplanned — Find Your Travel Companion',
    description: 'Never cancel a trip because your friends said no.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.variable} font-sans min-h-screen`}>
        <SessionProvider>
          <Providers>{children}</Providers>
        </SessionProvider>
      </body>
    </html>
  );
}
