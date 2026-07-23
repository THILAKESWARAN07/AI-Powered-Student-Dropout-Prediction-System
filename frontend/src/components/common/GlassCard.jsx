import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export default function GlassCard({ children, className, hoverEffect = true, delay = 0, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay, ease: 'easeOut' }}
      whileHover={hoverEffect ? { y: -4, scale: 1.01, transition: { duration: 0.2 } } : {}}
      className={cn(
        "glass-card rounded-2xl p-6 transition-all duration-200 border border-white/20 dark:border-white/5",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
