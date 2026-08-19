import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  CheckCircle, XCircle, Clock, ExternalLink, 
  ShieldCheck, AlertCircle, Search
} from 'lucide-react';
import { Order } from '../../types';

export interface AdminPaymentsTabProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
  onUpdatePaymentStatus?: (orderId: string, status: Order['paymentStatus'], reason?: string) => void;
  onLogActivity: (action: string, details: string) => void;
  addToast: (text: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export default function AdminPaymentsTab({
  orders,
  onUpdateOrderStatus,
  onUpdatePaymentStatus,
  onLogActivity,
  addToast
}: AdminPaymentsTabProps) {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [rejectionReason, setRejectionReason] = useState<Record<string, string>>({});
  const [showRejectInput, setShowRejectInput] = useState<Record<string, boolean>>({});

  const upiOrders = orders.filter(o => o.paymentMethod?.toLowerCase().includes('upi'));
  
  const pendingOrders = upiOrders.filter(o => o.paymentStatus === 'pending');
  
  const approvedOrders = upiOrders.filter(o => o.paymentStatus === 'paid');
  const todaysApproved = approvedOrders.filter(o => {
    const d = new Date(o.date || new Date());
    const today = new Date();
    return d.getDate() === today.getDate() && 
           d.getMonth() === today.getMonth() && 
           d.getFullYear() === today.getFullYear();
  });

  const rejectedOrders = upiOrders.filter(o => o.paymentStatus === 'rejected');
  const thisMonthRejected = rejectedOrders.filter(o => {
    const d = new Date(o.date || new Date());
    const today = new Date();
    return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  });

  const handleApprove = (order: Order) => {
    if (onUpdatePaymentStatus) {
      onUpdatePaymentStatus(order.id, 'paid');
    }
    onUpdateOrderStatus(order.id, 'processing');
    addToast(`Payment approved for order #${order.id.substring(0,6)}`, 'success');
    onLogActivity('PAYMENT_APPROVED', `Admin approved UPI payment for order ${order.id}`);
  };

  const handleRejectClick = (orderId: string) => {
    setShowRejectInput(prev => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const confirmReject = (order: Order) => {
    const reason = rejectionReason[order.id] || 'Payment verification failed';
    if (onUpdatePaymentStatus) {
      onUpdatePaymentStatus(order.id, 'rejected', reason);
    }
    onUpdateOrderStatus(order.id, 'cancelled');
    addToast(`Payment rejected for order #${order.id.substring(0,6)}`, 'error');
    onLogActivity('PAYMENT_REJECTED', `Admin rejected UPI payment for order ${order.id}. Reason: ${reason}`);
    setShowRejectInput(prev => ({ ...prev, [order.id]: false }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between shadow-lg text-white">
        <div className="flex items-center">
          <ShieldCheck className="w-10 h-10 text-[#D4648A] mr-4" />
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">UPI Payment Verification Center</h1>
            <p className="text-gray-300">Review and verify manual UPI payment submissions.</p>
          </div>
        </div>
      </div>

      {/* Instruction Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 flex items-start text-blue-800 dark:text-blue-300">
        <AlertCircle className="w-5 h-5 mr-3 shrink-0 mt-0.5" />
        <p className="text-sm">
          <strong>To verify payment:</strong> Check if the UPI screenshot matches the order total and sender name in your bank records. 
          If verified, click <strong>Approve</strong>. Orders will automatically move to 'Processing' status.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-3xl p-5 shadow-sm relative overflow-hidden">
          {pendingOrders.length > 0 && (
            <div className="absolute top-0 right-0 w-3 h-3 m-4 rounded-full bg-amber-500 animate-ping"></div>
          )}
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-mono text-gray-500 dark:text-gray-400 mb-1">PENDING VERIFICATION</p>
              <h3 className="text-3xl font-bold text-amber-500">{pendingOrders.length}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-3xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-mono text-gray-500 dark:text-gray-400 mb-1">APPROVED TODAY</p>
              <h3 className="text-3xl font-bold text-emerald-500">{todaysApproved.length}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-3xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-mono text-gray-500 dark:text-gray-400 mb-1">REJECTED THIS MONTH</p>
              <h3 className="text-3xl font-bold text-red-500">{thisMonthRejected.length}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400">
              <XCircle className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-2 flex flex-wrap gap-2 border border-gray-100 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-1 min-w-[120px] py-3 px-4 rounded-2xl text-sm font-bold transition-all flex justify-center items-center ${
            activeTab === 'pending'
              ? 'bg-amber-500 text-white shadow-md'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
        >
          <Clock className="w-4 h-4 mr-2" /> Pending ({pendingOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('approved')}
          className={`flex-1 min-w-[120px] py-3 px-4 rounded-2xl text-sm font-bold transition-all flex justify-center items-center ${
            activeTab === 'approved'
              ? 'bg-emerald-500 text-white shadow-md'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
        >
          <CheckCircle className="w-4 h-4 mr-2" /> Approved ({approvedOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('rejected')}
          className={`flex-1 min-w-[120px] py-3 px-4 rounded-2xl text-sm font-bold transition-all flex justify-center items-center ${
            activeTab === 'rejected'
              ? 'bg-red-500 text-white shadow-md'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
        >
          <XCircle className="w-4 h-4 mr-2" /> Rejected ({rejectedOrders.length})
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-3xl p-6 shadow-sm min-h-[400px]">
        {/* PENDING TAB */}
        {activeTab === 'pending' && (
          <div className="space-y-6">
            {pendingOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400">
                <ShieldCheck className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">All caught up!</h3>
                <p>There are no pending UPI payments to verify.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {pendingOrders.map(order => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={order.id} 
                    className="border-2 border-amber-200 dark:border-amber-500/20 bg-amber-50/30 dark:bg-amber-500/5 rounded-3xl p-6 flex flex-col"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <span className="inline-block px-3 py-1 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold rounded-full mb-2 uppercase tracking-wide">Needs Verification</span>
                        <h3 className="text-2xl font-mono font-bold text-gray-900 dark:text-white">#{order.id.substring(0, 8).toUpperCase()}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(order.date || new Date()).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Expected Amount</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">Rs. {order.total}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs font-mono text-gray-500 dark:text-gray-400 mb-1">CUSTOMER INFO</p>
                          <p className="font-medium text-gray-900 dark:text-white">{order.customerInfo?.name || 'N/A'}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{order.customerInfo?.email || 'N/A'}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{order.customerInfo?.phone || 'N/A'}</p>
                        </div>
                        
                        <div className="bg-white dark:bg-gray-950 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                          <p className="text-xs font-mono text-gray-500 dark:text-gray-400 mb-1">SUBMITTED UPI TXN ID</p>
                          <p className="font-mono font-bold text-gray-900 dark:text-[#D4648A]">
                            {order.upiTxnId || 'Not provided'}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-mono text-gray-500 dark:text-gray-400 mb-1">SENDER NAME (IF PROVIDED)</p>
                          <p className="font-medium text-gray-900 dark:text-white">{order.upiSenderName || 'Not provided'}</p>
                        </div>
                      </div>

                      <div className="flex flex-col items-center sm:items-end justify-start">
                        <p className="text-xs font-mono text-gray-500 dark:text-gray-400 mb-2 w-full text-center sm:text-right">PAYMENT SCREENSHOT</p>
                        {order.upiScreenshot ? (
                          <a 
                            href={order.upiScreenshot} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="relative group rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 block w-full max-w-[200px]"
                          >
                            <img 
                              src={order.upiScreenshot} 
                              alt="Payment Screenshot" 
                              className="w-full h-auto object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <ExternalLink className="w-6 h-6 text-white" />
                            </div>
                          </a>
                        ) : (
                          <div className="w-full max-w-[200px] aspect-video bg-gray-100 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center p-4 text-center">
                            <AlertCircle className="w-6 h-6 text-gray-400 mb-2" />
                            <p className="text-xs text-gray-500 dark:text-gray-400">No payment screenshot uploaded</p>
                          </div>
                        )}
                        
                        {order.upiNotes && (
                          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30 w-full text-sm">
                            <span className="font-bold text-blue-800 dark:text-blue-300">Customer Note:</span> {order.upiNotes}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-amber-100 dark:border-amber-500/20">
                      {!showRejectInput[order.id] ? (
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleApprove(order)}
                            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-bold flex justify-center items-center transition-colors shadow-sm"
                          >
                            <CheckCircle className="w-5 h-5 mr-2" /> Approve Payment
                          </button>
                          <button
                            onClick={() => handleRejectClick(order.id)}
                            className="px-6 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 py-3 rounded-xl font-bold transition-colors border border-red-200 dark:border-red-500/30"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <div className="bg-red-50 dark:bg-red-500/10 p-4 rounded-2xl border border-red-200 dark:border-red-500/20">
                          <label className="block text-sm font-medium text-red-800 dark:text-red-400 mb-2">
                            Reason for Rejection (Visible to customer)
                          </label>
                          <textarea
                            value={rejectionReason[order.id] || ''}
                            onChange={(e) => setRejectionReason({ ...rejectionReason, [order.id]: e.target.value })}
                            placeholder="e.g., Transaction ID not found, screenshot unclear, amount mismatch..."
                            className="w-full bg-white dark:bg-gray-950 border border-red-200 dark:border-red-500/30 rounded-xl p-3 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 dark:text-white"
                            rows={2}
                          />
                          <div className="flex gap-3">
                            <button
                              onClick={() => confirmReject(order)}
                              className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl font-bold flex justify-center items-center transition-colors"
                            >
                              <XCircle className="w-4 h-4 mr-2" /> Confirm Rejection
                            </button>
                            <button
                              onClick={() => handleRejectClick(order.id)}
                              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-xl font-medium transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* APPROVED TAB */}
        {activeTab === 'approved' && (
          <div className="overflow-x-auto">
            {approvedOrders.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No approved payments found.</div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="text-gray-500 dark:text-gray-400 font-mono text-xs border-b border-gray-100 dark:border-gray-700">
                  <tr>
                    <th className="pb-3 font-medium">DATE</th>
                    <th className="pb-3 font-medium">ORDER#</th>
                    <th className="pb-3 font-medium">CUSTOMER</th>
                    <th className="pb-3 font-medium">AMOUNT</th>
                    <th className="pb-3 font-medium">TXN ID</th>
                    <th className="pb-3 font-medium">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {approvedOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-4 text-gray-500 dark:text-gray-400 text-xs">
                        {new Date(order.date || new Date()).toLocaleDateString()}
                      </td>
                      <td className="py-4 font-mono font-medium text-gray-900 dark:text-white">
                        {order.orderNumber || order.id.substring(0, 8).toUpperCase()}
                      </td>
                      <td className="py-4 text-gray-600 dark:text-gray-300">
                        {order.customerInfo?.name || 'N/A'}
                      </td>
                      <td className="py-4 font-bold text-gray-900 dark:text-white">
                        Rs. {order.total}
                      </td>
                      <td className="py-4 font-mono text-xs text-gray-600 dark:text-gray-400">
                        {order.upiTxnId || '-'}
                      </td>
                      <td className="py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
                          <CheckCircle className="w-3 h-3 mr-1" /> Approved
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* REJECTED TAB */}
        {activeTab === 'rejected' && (
          <div className="overflow-x-auto">
            {rejectedOrders.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No rejected payments found.</div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="text-gray-500 dark:text-gray-400 font-mono text-xs border-b border-gray-100 dark:border-gray-700">
                  <tr>
                    <th className="pb-3 font-medium">DATE</th>
                    <th className="pb-3 font-medium">ORDER#</th>
                    <th className="pb-3 font-medium">AMOUNT</th>
                    <th className="pb-3 font-medium">TXN ID</th>
                    <th className="pb-3 font-medium">REJECTION REASON</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {rejectedOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-4 text-gray-500 dark:text-gray-400 text-xs">
                        {new Date(order.date || new Date()).toLocaleDateString()}
                      </td>
                      <td className="py-4 font-mono font-medium text-gray-900 dark:text-white">
                        {order.orderNumber || order.id.substring(0, 8).toUpperCase()}
                      </td>
                      <td className="py-4 font-bold text-gray-900 dark:text-white">
                        Rs. {order.total}
                      </td>
                      <td className="py-4 font-mono text-xs text-gray-600 dark:text-gray-400">
                        {order.upiTxnId || '-'}
                      </td>
                      <td className="py-4">
                        <span className="text-red-600 dark:text-red-400 text-xs font-medium">
                          {order.upiRejectionReason || 'Verification failed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
