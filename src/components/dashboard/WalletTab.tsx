import React from 'react';
import { motion } from 'motion/react';
import { Wallet } from 'lucide-react';

export default function WalletTab() {
  return (
    <motion.div
      key="wallet"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className="space-y-6 text-left"
    >
      <h3 className="font-display font-medium text-sm text-navy-900 uppercase tracking-widest pb-1 border-b border-gray-100">Wallet & Rewards</h3>
      <div className="text-center py-10 space-y-2">
        <Wallet className="w-8 h-8 text-gold-400 mx-auto" />
        <p className="text-xs text-gray-500">Your wallet balance is Rs.0</p>
      </div>
    </motion.div>
  );
}
