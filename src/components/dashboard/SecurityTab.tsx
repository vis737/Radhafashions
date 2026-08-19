import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck } from 'lucide-react';

export default function SecurityTab() {
  return (
    <motion.div
      key="security"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className="space-y-6 text-left"
    >
      <h3 className="font-display font-medium text-sm text-gray-900 uppercase tracking-widest pb-1 border-b border-gray-100">Security Settings</h3>
      <div className="text-center py-10 space-y-2">
        <ShieldCheck className="w-8 h-8 text-gray-300 mx-auto" />
        <p className="text-xs text-gray-500">Security and Activity Logs will appear here.</p>
      </div>
    </motion.div>
  );
}
