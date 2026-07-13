import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquareCode, Send, X } from 'lucide-react';

export default function WhatsAppChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  const phoneNo = '+919384292229'; // matching official contact

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    const uri = `https://wa.me/${phoneNo.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(uri, '_blank');
    setMessage('');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="mb-4 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-navy-900 to-navy-800 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold-400 flex items-center justify-center text-navy-950 font-bold font-display shadow-inner">
                  M
                </div>
                <div>
                  <h4 className="font-display font-semibold text-xs tracking-wide text-gold-300">Meris Support</h4>
                  <p className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online • Responds Instantly
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition p-1 rounded-full hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Simulated Chat Screen */}
            <div className="p-4 bg-gray-50 flex-1 text-xs space-y-3 max-h-48 overflow-y-auto">
              <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm text-gray-700 border border-gray-100">
                Greetings from active Meris family! How can we assist you with our handcrafted stencils, toys, or gift packages today?
              </div>
            </div>

            {/* Input Action Form */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-100 flex gap-2">
              <input
                type="text"
                placeholder="Type your question..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-gold-400 focus:outline-none focus:border-gold-400"
              />
              <button
                type="submit"
                className="p-2.5 bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-600 hover:to-gold-500 rounded-xl text-navy-950 shadow-md shadow-gold-500/10 transition active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating launcher trigger */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-tr from-gold-500 via-gold-400 to-gold-300 rounded-full flex items-center justify-center text-navy-950 shadow-lg shadow-gold-500/20 cursor-pointer border border-gold-200 relative focus:outline-none"
      >
        <MessageSquareCode className="w-6 h-6 animate-pulse" />
        <span className="absolute top-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
      </motion.button>
    </div>
  );
}
