import React, { useState } from 'react';
import { motion } from 'motion/react';
import { RotateCcw, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SupportTab({ orders, onRequestRefund }: any) {
  const [selectedReturnOrder, setSelectedReturnOrder] = useState('');
  const [selectedReturnItem, setSelectedReturnItem] = useState('');
  const [returnReason, setReturnReason] = useState('');

  const handleTriggerRefundRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReturnOrder || !selectedReturnItem || !returnReason.trim()) return;

    onRequestRefund(selectedReturnOrder, selectedReturnItem, returnReason);
    setReturnReason('');
    setSelectedReturnItem('');
    setSelectedReturnOrder('');
    toast.success("Refund Request Submitted! Our audit team is reviewing your reason.");
  };

  return (
    <motion.div
      key="support"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className="space-y-6 text-left"
    >
      <h3 className="font-display font-medium text-sm text-gray-900 uppercase tracking-widest pb-1 border-b border-gray-100">Support & Returns</h3>
      
      {orders.length === 0 ? (
        <div className="text-center py-10 space-y-2 text-xs">
          <RotateCcw className="w-8 h-8 text-gray-300 mx-auto" />
          <p className="text-gray-400">Requesting a return requires an active order on file.</p>
        </div>
      ) : (
        <form onSubmit={handleTriggerRefundRequest} className="space-y-4 max-w-md">
          <div>
            <label className="block text-[10px] font-mono tracking-wider uppercase text-gray-400 mb-1">1. Select Order Record</label>
            <select
              required
              value={selectedReturnOrder}
              onChange={(e) => setSelectedReturnOrder(e.target.value)}
              className="w-full px-3 py-2 text-xs border rounded-xl focus:outline-none"
            >
              <option value="">-- Choose Order Number --</option>
              {orders.map((o: any) => (
                <option key={o.id} value={o.id}>{o.orderNumber} (Rs.{o.total})</option>
              ))}
            </select>
          </div>

          {selectedReturnOrder && (
            <div>
              <label className="block text-[10px] font-mono tracking-wider uppercase text-gray-400 mb-1">2. Select Product Item</label>
              <select
                required
                value={selectedReturnItem}
                onChange={(e) => setSelectedReturnItem(e.target.value)}
                className="w-full px-3 py-2 text-xs border rounded-xl focus:outline-none"
              >
                <option value="">-- Choose Item for Return --</option>
                {orders.find((o: any) => o.id === selectedReturnOrder)?.items.map((it: any) => (
                  <option key={it.product.id} value={it.product.name}>{it.product.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-mono tracking-wider uppercase text-gray-400 mb-1">3. Describe Refund Reason</label>
            <textarea
              required
              rows={3}
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              placeholder="e.g., The saree has a minor colour variation..."
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-1 focus:ring-pink-400 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-gradient-to-r from-pink-500 to-pink-400 text-gray-950 font-display font-medium text-xs uppercase tracking-wider rounded-xl transition active:scale-95 flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4 text-gray-950" />
            <span>Submit Secure Refund Ticket</span>
          </button>
        </form>
      )}
    </motion.div>
  );
}
