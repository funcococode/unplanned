'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { useEffect, useRef, type ReactNode, type CSSProperties } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// ── Springy fade-up reveal (in-view) ──────────────────────────────────────────
const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 110, damping: 18, delay },
  }),
};

export function FadeUp({
  children,
  delay = 0,
  className,
  as = 'div',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: 'div' | 'section' | 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'li';
}) {
  const Comp = (motion as any)[as] ?? motion.div;
  return (
    <Comp
      className={className}
      custom={delay}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={fadeUpVariants}
    >
      {children}
    </Comp>
  );
}

// ── Staggered children container ──────────────────────────────────────────────
export function StaggerGroup({
  children,
  className,
  stagger = 0.08,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: stagger } } }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 24, scale: 0.97 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { type: 'spring', stiffness: 130, damping: 16 },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

// ── Springy interactive wrapper (hover lift + tap squish) ─────────────────────
export function Springy({
  children,
  className,
  lift = -4,
  rotate = 0,
  style,
}: {
  children: ReactNode;
  className?: string;
  lift?: number;
  rotate?: number;
  style?: CSSProperties;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      style={style}
      whileHover={reduce ? undefined : { y: lift, rotate, scale: 1.02 }}
      whileTap={reduce ? undefined : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 320, damping: 18 }}
    >
      {children}
    </motion.div>
  );
}

// ── Word-by-word headline reveal ──────────────────────────────────────────────
export function SplitWords({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const words = text.split(' ');
  return (
    <motion.span
      className={className}
      initial="hidden"
      animate="visible"
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.055, delayChildren: delay } } }}
      aria-label={text}
    >
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom">
          <motion.span
            className="inline-block"
            variants={{
              hidden: { y: '110%', rotate: 4 },
              visible: {
                y: 0,
                rotate: 0,
                transition: { type: 'spring', stiffness: 150, damping: 20 },
              },
            }}
          >
            {word}
            {i < words.length - 1 ? ' ' : ''}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

// ── GSAP scroll-driven section (pinned horizontal-ish parallax helpers) ───────
export function useGsapScroll(fn: (ctx: { gsap: typeof gsap; el: HTMLElement }) => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;
    const ctx = gsap.context(() => fn({ gsap, el: ref.current! }), ref);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return ref;
}

// ── Parallax drift on scroll (GSAP) ───────────────────────────────────────────
export function ParallaxDrift({
  children,
  className,
  speed = 0.15,
  rotate = 0,
}: {
  children: ReactNode;
  className?: string;
  speed?: number;
  rotate?: number;
}) {
  const ref = useGsapScroll(({ gsap, el }) => {
    gsap.to(el.firstElementChild, {
      yPercent: speed * -100,
      rotate,
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1.2 },
    });
  });
  return (
    <div ref={ref} className={className}>
      <div>{children}</div>
    </div>
  );
}
