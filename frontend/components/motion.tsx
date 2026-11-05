'use client';

import { motion, MotionConfig, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

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
