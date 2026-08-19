import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  text: string;
}

interface ToastNotificationProps {
  toasts: ToastMessage[];
  onClose: (id: string) => void;
}

export default function ToastNotification({ toasts, onClose }: ToastNotificationProps) {
  return (
    <div className="fixed bottom-6 right-6 z-[99999] flex flex-col gap-2.5 max-w-sm w-full select-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={onClose} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast, onClose }: { toast: ToastMessage; onClose: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  let icon = <CheckCircle className="w-4 h-4 text-emerald-500" />;
  let bgColor = 'bg-white dark:bg-gray-900 border-emerald-500/30';
  let textColor = 'text-gray-800 dark:text-gray-100';

  if (toast.type === 'error') {
    icon = <AlertTriangle className="w-4 h-4 text-red-500" />;
    bgColor = 'bg-white dark:bg-gray-900 border-red-500/30';
  } else if (toast.type === 'warning') {
    icon = <AlertTriangle className="w-4 h-4 text-amber-500" />;
    bgColor = 'bg-white dark:bg-gray-900 border-amber-500/30';
  } else if (toast.type === 'info') {
    icon = <Info className="w-4 h-4 text-[#D4648A]" />;
    bgColor = 'bg-white dark:bg-gray-900 border-[#D4648A]/30';
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`p-3.5 rounded-2xl border shadow-xl flex items-center justify-between gap-3 text-xs text-left ${bgColor} ${textColor}`}
    >
      <div className="flex items-center gap-2.5">
        {icon}
        <span className="font-medium font-sans leading-normal">{toast.text}</span>
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 hover:text-gray-600 transition shrink-0 cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}
