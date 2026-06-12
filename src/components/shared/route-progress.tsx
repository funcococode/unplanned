'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

function ProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [active, setActive] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Start on any same-origin link click that navigates somewhere new
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as HTMLElement).closest?.('a');
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return;
      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      const url = new URL(anchor.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search) return;
      setActive(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setActive(false), 10000); // safety
    };
    document.addEventListener('click', onClick, true);
    return () => {
      document.removeEventListener('click', onClick, true);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  // Finish when the route actually changes
  useEffect(() => {
    setActive(false);
    if (timer.current) clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="fixed top-0 inset-x-0 z-[100] h-[3px] pointer-events-none"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.35, delay: 0.15 } }}
          aria-hidden="true"
        >
          <motion.div
            className="h-full bg-gradient-to-r from-orange-500 via-amber-300 to-orange-500 shadow-[0_0_14px_rgba(249,115,22,0.9)]"
            initial={{ width: '0%' }}
            animate={{ width: ['0%', '55%', '82%', '92%'] }}
            exit={{ width: '100%', transition: { duration: 0.2 } }}
            transition={{ duration: 8, times: [0, 0.15, 0.55, 1], ease: 'easeOut' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function RouteProgress() {
  return (
    <Suspense fallback={null}>
      <ProgressBar />
    </Suspense>
  );
}
