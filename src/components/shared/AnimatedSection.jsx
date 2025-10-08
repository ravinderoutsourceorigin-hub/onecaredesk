import React, { useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/lib/animations';

/**
 * Animated Section Component
 * Automatically animates children when they come into view
 */
export default function AnimatedSection({ 
  children, 
  className = '', 
  stagger = false,
  delay = 0,
  ...props 
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.section
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={stagger ? staggerContainer : fadeInUp}
      transition={{ delay }}
      {...props}
    >
      {children}
    </motion.section>
  );
}
