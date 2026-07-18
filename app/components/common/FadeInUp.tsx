'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

type FadeInUpProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  distance?: number;
  duration?: number;
  amount?: number;
};

export default function FadeInUp({
  children,
  className = '',
  delay = 0,
  distance = 24,
  duration = 0.8,
  amount = 0.15,
}: FadeInUpProps): React.ReactElement {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={`w-full ${className}`.trim()}
      initial={{
        opacity: shouldReduceMotion ? 1 : 0,
        y: shouldReduceMotion ? 0 : distance,
      }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{
        duration: shouldReduceMotion ? 0 : duration,
        delay: shouldReduceMotion ? 0 : delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
