import React from 'react';
import { motion } from 'motion/react';
import { Award, ShieldAlert, Sparkles, TrendingUp, HelpCircle } from 'lucide-react';
import { UserMembership } from '../types';

interface MembershipDashboardProps {
  membership: UserMembership;
  onRedeemPoints?: (points: number) => void;
}

export default function MembershipDashboard({ membership }: MembershipDashboardProps) {
  const { level, loyaltyPoints, lifetimeSavings, joinDate, expiryDate, history } = membership;

  // Determine card styles based on level
  let cardGradient = 'from-amber-700 via-amber-800 to-amber-900 text-amber-100 border-amber-600/30';
  let cardBadgeColor = 'text-amber-300';
  let pointsToNext = 500;
  let currentProgress = (loyaltyPoints / 500) * 100;
  let nextLevel = 'Silver';

  if (level === 'Silver') {
    cardGradient = 'from-slate-400 via-slate-500 to-slate-600 text-gray-50 border-gray-300/30';
    cardBadgeColor = 'text-gray-800 dark:text-gray-200';
    pointsToNext = 1500;
    currentProgress = (loyaltyPoints / 1500) * 100;
    nextLevel = 'Gold';
  } else if (level === 'Gold') {
    cardGradient = 'from-pink-600 via-amber-600 to-pink-800 text-pink-50 border-pink-500/30';
    cardBadgeColor = 'text-pink-300';
    pointsToNext = 3000;
    currentProgress = (loyaltyPoints / 3000) * 100;
    nextLevel = 'Platinum';
  } else if (level === 'Platinum') {
    cardGradient = 'from-cyan-900 via-indigo-950 to-slate-900 text-cyan-100 border-cyan-500/30';
    cardBadgeColor = 'text-cyan-300';
    pointsToNext = 0;
    currentProgress = 100;
    nextLevel = 'Max Tier';
  }

  return (
    <div className="space-y-6 text-left">
      
      {/* Dynamic Membership Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative rounded-3xl p-6 bg-gradient-to-tr ${cardGradient} border shadow-2xl flex flex-col justify-between overflow-hidden h-52 select-none`}
      >
        {/* Glassmorphic card design overlays */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-black/10 rounded-full blur-xl pointer-events-none" />
        
        {/* Top Header of Card */}
        <div className="flex justify-between items-start relative z-10">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-80">
              Moris Privilege Club
            </span>
            <h3 className="font-display font-extrabold text-lg sm:text-xl tracking-wide uppercase leading-tight mt-1 flex items-center gap-1.5">
              <Award className={`w-6 h-6 ${cardBadgeColor}`} />
              {level} Member
            </h3>
          </div>
          <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 text-[9px] font-mono tracking-wider font-semibold">
            EST. {joinDate.split('-')[0] || '2026'}
          </div>
        </div>

        {/* Bottom Details */}
        <div className="relative z-10 flex justify-between items-end pt-8">
          <div>
            <p className="text-[9px] font-mono uppercase tracking-wider opacity-70">Loyalty Balance</p>
            <h4 className="font-display font-black text-2xl tracking-wide leading-none mt-1">
              {loyaltyPoints} <span className="text-xs font-sans font-medium">Points</span>
            </h4>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-mono uppercase tracking-wider opacity-70">Lifetime Savings</p>
            <h4 className="font-display font-semibold text-lg leading-none mt-1">
              Rs. {lifetimeSavings}
            </h4>
          </div>
        </div>
      </motion.div>

      {/* Progress to Next Tier Card */}
      {pointsToNext > 0 && (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-gray-900 dark:text-gray-50 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-[#D4648A]" /> Tier Progress
            </span>
            <span className="text-[10px] text-gray-400 font-mono">
              {loyaltyPoints}/{pointsToNext} to {nextLevel}
            </span>
          </div>
          
          {/* Progress bar container */}
          <div className="w-full bg-gray-100 dark:bg-gray-950 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(currentProgress, 100)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="bg-[#D4648A] h-full rounded-full"
            />
          </div>
          
          <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-normal font-sans">
            Earn {(pointsToNext - loyaltyPoints)} more points to unlock the <strong>{nextLevel}</strong> benefits and discount upgrades.
          </p>
        </div>
      )}

      {/* Tier Benefits Panel */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
        <h4 className="font-display font-bold text-xs uppercase tracking-wider text-gray-900 dark:text-gray-50 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-[#D4648A]" /> Member Benefits
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
          <div className="p-3 bg-gray-50 dark:bg-gray-950 rounded-2xl space-y-1">
            <p className="font-bold text-gray-950 dark:text-pink-300">Exclusive Discounts</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-500 font-light">
              Automatic checkout savings of {level === 'Bronze' ? 'Free Shipping' : level === 'Silver' ? '5% OFF' : level === 'Gold' ? '10% OFF' : '15% OFF'} on all catalog orders.
            </p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-950 rounded-2xl space-y-1">
            <p className="font-bold text-gray-950 dark:text-pink-300">Priority Support</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-500 font-light">
              Direct high-speed routing via our active helpdesk for expedited order processing.
            </p>
          </div>
        </div>
        {expiryDate && (
          <p className="text-[10px] text-gray-400 font-sans border-t pt-3 border-gray-50 dark:border-gray-800 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
            Membership expires on {expiryDate} and will automatically renew.
          </p>
        )}
      </div>

      {/* Point History Log Card */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
        <h4 className="font-display font-bold text-xs uppercase tracking-wider text-gray-900 dark:text-gray-50 flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-[#D4648A]" /> Points Ledger Audit
        </h4>
        <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
          {history && history.length > 0 ? (
            history.map((log, index) => (
              <div key={index} className="flex justify-between items-center text-xs border-b border-gray-50 dark:border-gray-800 pb-2 last:border-b-0 last:pb-0">
                <div className="text-left">
                  <p className="font-semibold text-gray-900 dark:text-gray-50">{log.action}</p>
                  <p className="text-[9px] text-gray-400 font-mono mt-0.5">{log.date}</p>
                </div>
                <span className={`font-mono font-bold ${log.points > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {log.points > 0 ? `+${log.points}` : log.points} PTS
                </span>
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-400 text-center py-4">No points history transactions found.</p>
          )}
        </div>
      </div>

    </div>
  );
}
