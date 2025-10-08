import React, { useState } from 'react';
import { motion } from 'framer-motion';
import GenericFormDebugPanel from '@/components/integrations/GenericFormDebugPanel';
import { FileText, CheckCircle, Clock, TrendingUp } from 'lucide-react';

export default function SignedDocuments() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Modern Header with Gradient */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-8 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 text-white shadow-2xl overflow-hidden"
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-xl">
            <FileText className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-2">
              Form Submissions
            </h1>
            <p className="text-white/90 text-base lg:text-lg">
              Review all data received from your integrated forms
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white p-6 rounded-2xl shadow-lg"
      >
        <GenericFormDebugPanel />
      </motion.div>
    </div>
  );
}
