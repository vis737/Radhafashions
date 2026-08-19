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
            <div className="bg-[#075E54] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#128C7E] flex items-center justify-center text-white font-bold font-display shadow-inner">
                  M
                </div>
                <div>
                  <h4 className="font-display font-semibold text-xs tracking-wide text-white">Radha Fashions Support</h4>
                  <p className="text-[10px] text-emerald-300 font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                    Online - Responds Instantly
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-200 hover:text-white transition p-1 rounded-full hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Simulated Chat Screen */}
            <div className="p-4 bg-gray-50 flex-1 text-xs space-y-3 max-h-48 overflow-y-auto">
              <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm text-gray-700 border border-gray-100">
                Greetings from active Radha Fashions family! How can we assist you with our handcrafted stencils, toys, or gift packages today?
              </div>
            </div>

            {/* Input Action Form */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-100 flex gap-2">
              <input
                type="text"
                placeholder="Type your question..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-emerald-400 focus:outline-none focus:border-emerald-400"
              />
              <button
                type="submit"
                className="p-2.5 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-600 hover:to-emerald-500 rounded-xl text-white shadow-md shadow-emerald-500/10 transition active:scale-95"
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
        className="w-14 h-14 bg-[#25D366] hover:bg-[#20ba59] rounded-full flex items-center justify-center text-white shadow-lg shadow-[#25D366]/30 cursor-pointer border border-emerald-400 relative focus:outline-none"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 448 512" 
          className="w-6 h-6 fill-current"
        >
          <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
        </svg>
        <span className="absolute top-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
      </motion.button>
    </div>
  );
}


