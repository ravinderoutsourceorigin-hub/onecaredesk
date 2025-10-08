import React from 'react';
import { motion } from 'framer-motion';

/**
 * Gradient Text Component
 * Premium animated gradient text effect
 */
export default function GradientText({ 
  children, 
  className = '',
  from = 'from-blue-600',
  via = 'via-indigo-600',
  to = 'to-purple-600',
  animate = true
}) {
  const gradientClass = `bg-gradient-to-r ${from} ${via} ${to} bg-clip-text text-transparent`;
  
  if (animate) {
    return (
      <motion.span
        className={`${gradientClass} bg-[length:200%_auto] ${className}`}
        initial={{ backgroundPosition: '0% center' }}
        animate={{ backgroundPosition: ['0% center', '100% center', '0% center'] }}
        transition={{
          duration: 5,
          ease: 'linear',
          repeat: Infinity
        }}
      >
        {children}
      </motion.span>
    );
  }

  return (
    <span className={`${gradientClass} ${className}`}>
      {children}
    </span>
  );
}
