import type { Metadata } from 'next';
import { Geist, Space_Grotesk } from 'next/font/google';
import { SessionProvider } from 'next-auth/react';
import { Providers } from './providers';
import { RouteProgress } from '@/components/shared/route-progress';
import './globals.css';

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: {
    default: 'Trip Unplanned — Find Your Travel Companion',
    template: '%s | Trip Unplanned',
  },
  description: 'Never cancel a trip because your friends said no. Create trips, meet travelers, explore together.',
  keywords: ['travel', 'travel companion', 'trip planning', 'travel community', 'backpacking'],
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  openGraph: {
    title: 'Trip Unplanned — Find Your Travel Companion',
    description: 'Never cancel a trip because your friends said no.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{if(localStorage.getItem('theme')==='light'){document.documentElement.classList.remove('dark')}}catch(e){}})()",
          }}
        />
      </head>
      <body className={`${geist.variable} ${spaceGrotesk.variable} font-sans min-h-screen`}>
        <RouteProgress />
        <SessionProvider>
          <Providers>{children}</Providers>
        </SessionProvider>
      </body>
    </html>
  );
}
