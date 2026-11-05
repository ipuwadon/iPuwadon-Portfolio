'use client';

import { animate, motion, MotionConfig, useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, type ReactNode } from 'react';

const EASE = [0.21, 0.47, 0.32, 0.98] as const;

/** Fade + rise in when scrolled into view. Respects prefers-reduced-motion. */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <MotionConfig reducedMotion='user'>
      <motion.div
        className={className}
        initial={reduce ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.6, delay, ease: EASE }}
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}

/** Container that staggers its StaggerItem children into view. */
export function Stagger({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <MotionConfig reducedMotion='user'>
      <motion.div
        className={className}
        initial='hidden'
        whileInView='show'
        viewport={{ once: true, margin: '-40px' }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
      }}
    >
      {children}
    </motion.div>
  );
}

/** Hero entrance animation played on load. */
export function HeroIntro({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <MotionConfig reducedMotion='user'>
      <motion.div
        className={className}
        initial={reduce ? false : { opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE }}
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}

/** Animated count-up number, e.g. the years-of-experience counter. */
export function CountUp({
  to,
  suffix = '',
  className,
}: {
  to: number;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!inView || !ref.current) return;
    if (reduce) {
      ref.current.textContent = `${to}${suffix}`;
      return;
    }
    const controls = animate(0, to, {
      duration: 1.6,
      ease: 'easeOut',
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = `${Math.round(v)}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [inView, reduce, to, suffix]);

  return (
    <span ref={ref} className={className} aria-label={`${to}${suffix}`}>
      0{suffix}
    </span>
  );
}
