import React from 'react';
import { motion } from 'framer-motion';

/**
 * Floating Card Component
 * Card with subtle floating animation and premium shadow
 */
export default function FloatingCard({ 
  children, 
  className = '',
  delay = 0,
  hover = true
}) {
  return (
    <motion.div
      className={`relative bg-white rounded-2xl shadow-lg border border-gray-100 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.22, 1, 0.36, 1]
      }}
      whileHover={hover ? {
        y: -8,
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        transition: { duration: 0.3 }
      } : {}}
    >
      {children}
    </motion.div>
  );
}
