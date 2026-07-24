import os
import re

base_dir = "g:/PROJECTS/moris/src/components"
dashboard_dir = os.path.join(base_dir, "dashboard")
os.makedirs(dashboard_dir, exist_ok=True)

# We will extract the tab contents and build the new files.
# But it's easier to write the content of the new files completely, and just replace the whole AccountPanel.tsx.

account_panel_path = os.path.join(base_dir, "AccountPanel.tsx")
with open(account_panel_path, "r", encoding="utf-8") as f:
    account_panel_content = f.read()

# Create ProfileTab.tsx
profile_tab = """import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MapPin } from 'lucide-react';
import MembershipDashboard from '../MembershipDashboard';

interface ProfileTabProps {
  currentUser: any;
  orders: any[];
  setSubTab: (tab: string) => void;
}

export default function ProfileTab({ currentUser, orders, setSubTab }: ProfileTabProps) {
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [shippingName, setShippingName] = useState(currentUser?.name || '');
  const [shippingPhone, setShippingPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingPincode, setShippingPincode] = useState('');
  const [shippingCarrier, setShippingCarrier] = useState('Standard');

  const firstOrderDate = orders.length > 0 ? orders[orders.length - 1].date : new Date().toISOString().split('T')[0];
  const mockMembership: any = {
    level: orders.length >= 5 ? 'Platinum' : orders.length >= 3 ? 'Gold' : orders.length >= 1 ? 'Silver' : 'Bronze',
    loyaltyPoints: orders.length * 150 + (orders.length > 0 ? 50 : 0),
    lifetimeSavings: orders.length * 120,
    joinDate: firstOrderDate,
    expiryDate: null,
    history: orders.length > 0 ? [
      { date: firstOrderDate, action: 'Welcome Bonus Points Approved', points: 50 },
      ...orders.map(o => ({
        date: o.date,
        action: `Purchase Points #${o.orderNumber}`,
        points: 150
      }))
    ] : []
  };

  return (
    <motion.div
      key="profile"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className="space-y-8 animate-fade-in text-navy-950 text-left"
    >
      <div className="p-6 bg-gradient-to-r from-navy-950 to-navy-900 border border-gold-400/20 rounded-3xl relative overflow-hidden text-white shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#C5A021]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-[9px] font-mono text-gold-400 uppercase tracking-widest block mb-1">Customer Workspace</span>
            <h2 className="font-display font-bold text-lg uppercase tracking-wide text-white">Welcome back, {currentUser.name}!</h2>
            <p className="text-[11px] text-gray-300 font-light mt-0.5">Manage your address logs, check loyalty coordinates, and view purchases.</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-2xl text-center">
              <span className="text-[9px] font-mono text-gold-300 block">TOTAL ORDERS</span>
              <span className="text-sm font-bold font-mono text-white mt-0.5 block">{orders.length}</span>
            </div>
            <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-2xl text-center">
              <span className="text-[9px] font-mono text-gold-300 block">REWARD POINTS</span>
              <span className="text-sm font-bold font-mono text-white mt-0.5 block">{mockMembership.loyaltyPoints}</span>
            </div>
          </div>
        </div>
      </div>

      <MembershipDashboard membership={mockMembership} />

      <div className="pt-4">
        <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-display font-bold text-xs text-navy-900 dark:text-navy-50 uppercase tracking-wider pb-2 border-b border-gray-150 dark:border-navy-850">Quick Workspace Access</h3>
          <div className="grid grid-cols-2 gap-3 text-[11px] font-semibold">
            <button onClick={() => setSubTab('orders')} className="p-3 rounded-2xl bg-gray-50 dark:bg-navy-950 hover:bg-gold-50/50 dark:hover:bg-navy-850 border text-[#C5A021] text-center transition cursor-pointer">
              View Invoices
            </button>
            <button onClick={() => setSubTab('tracking')} className="p-3 rounded-2xl bg-gray-50 dark:bg-navy-950 hover:bg-gold-50/50 dark:hover:bg-navy-850 border text-[#C5A021] text-center transition cursor-pointer">
              Track Shipments
            </button>
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-navy-850">
          <h3 className="font-display font-bold text-xs text-navy-900 dark:text-navy-50 uppercase tracking-wider">Saved Shipping Address</h3>
          <button
            onClick={() => setIsEditingAddress(!isEditingAddress)}
            className="text-[10px] font-bold text-[#C5A021] hover:underline cursor-pointer uppercase tracking-wider font-mono"
          >
            {isEditingAddress ? 'Cancel' : 'Edit Coordinates'}
          </button>
        </div>

        {isEditingAddress ? (
          <div className="p-4 rounded-xl bg-gray-50 border mt-4 text-xs space-y-3 font-sans max-w-md">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] text-gray-450 uppercase tracking-wider font-mono">Receiver Name</label>
                <input
                  type="text"
                  value={shippingName}
                  onChange={(e) => setShippingName(e.target.value)}
                  className="w-full px-2 py-1.5 border rounded-lg bg-white"
                />
              </div>
              <div>
                <label className="block text-[9px] text-gray-450 uppercase tracking-wider font-mono">Phone Number</label>
                <input
                  type="text"
                  value={shippingPhone}
                  onChange={(e) => setShippingPhone(e.target.value)}
                  className="w-full px-2 py-1.5 border rounded-lg bg-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-[9px] text-gray-450 uppercase tracking-wider font-mono">Street Address</label>
              <input
                type="text"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                className="w-full px-2 py-1.5 border rounded-lg bg-white"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] text-gray-450 uppercase tracking-wider font-mono">City / State</label>
                <input
                  type="text"
                  value={shippingCity}
                  onChange={(e) => setShippingCity(e.target.value)}
                  className="w-full px-2 py-1.5 border rounded-lg bg-white"
                />
              </div>
              <div>
                <label className="block text-[9px] text-gray-450 uppercase tracking-wider font-mono">Pincode</label>
                <input
                  type="text"
                  value={shippingPincode}
                  onChange={(e) => setShippingPincode(e.target.value)}
                  className="w-full px-2 py-1.5 border rounded-lg bg-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-[9px] text-gray-450 uppercase tracking-wider font-mono">Preferred Delivery Carrier</label>
              <select
                value={shippingCarrier}
                onChange={(e) => setShippingCarrier(e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-200 rounded-lg bg-white focus:outline-none"
              >
                <option value="BlueDart Express">BlueDart Express</option>
                <option value="Delhivery Logistics">Delhivery Logistics</option>
                <option value="India Post (Registered)">India Post (Registered)</option>
                <option value="DHL Worldwide Express">DHL Worldwide Express</option>
              </select>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsEditingAddress(false);
                import('react-hot-toast').then(t => t.default.success("Shipping address updated successfully in your session database!"));
              }}
              className="px-4 py-2 bg-navy-950 hover:bg-[#C5A021] text-white hover:text-navy-950 font-bold rounded-lg uppercase tracking-wide cursor-pointer transition text-[10px] text-center"
            >
              Save Coordinates
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-gray-50 border mt-4 text-xs font-light leading-relaxed max-w-md">
            <p className="font-semibold text-navy-900">{shippingName || currentUser?.name}</p>
            <p className="mt-1">{shippingAddress || 'No address provided yet.'}</p>
            <p>{shippingCity} {shippingPincode}</p>
            <p className="text-[10px] mt-1">Contact: {shippingPhone}</p>
            <p className="text-[10px] font-mono text-gray-400 mt-2">Preferred air deliveries via {shippingCarrier}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
"""

with open(os.path.join(dashboard_dir, "ProfileTab.tsx"), "w", encoding="utf-8") as f:
    f.write(profile_tab)

orders_tab = """import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clipboard, Truck, Eye, AlertTriangle, X, Tag, Check, Download, Gift } from 'lucide-react';
import { generateInvoicePDF } from '../../lib/invoiceGenerator';
import toast from 'react-hot-toast';

export default function OrdersTab({ orders, setTrackingInput, setSearchedOrder, setTrackingError, setSubTab, onResubmitUpiDetails }: any) {
  const [selectedDetailsOrder, setSelectedDetailsOrder] = useState<any>(null);

  return (
    <>
    <motion.div
      key="orders"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className="space-y-6 text-left"
    >
      <h3 className="font-display font-medium text-sm text-navy-900 uppercase tracking-widest pb-1 border-b border-gray-100">Your Orders Ledger</h3>
      
      {orders.length === 0 ? (
        <div className="text-center py-10 space-y-2">
          <Clipboard className="w-8 h-8 text-gray-300 mx-auto" />
          <p className="text-xs text-gray-500">You have no recorded purchases yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((ord: any) => (
            <div key={ord.id} className="p-4 rounded-2xl border border-gray-100 bg-white shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-3 gap-2 text-xs">
                <div className="text-left font-sans">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-navy-950 font-mono">ID: {ord.orderNumber}</span>
                    <button
                      onClick={() => {
                        setTrackingInput(ord.orderNumber);
                        setSearchedOrder(ord);
                        setTrackingError('');
                        setSubTab('tracking');
                      }}
                      className="px-2 py-0.5 bg-gold-50 hover:bg-gold-100 text-gold-700 hover:text-gold-800 transition rounded-md text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Truck className="w-3 h-3" />
                      <span>Track Live</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedDetailsOrder(ord);
                      }}
                      className="px-2 py-0.5 bg-navy-50 hover:bg-navy-100 text-navy-700 hover:text-navy-800 transition rounded-md text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3 h-3 text-navy-500" />
                      <span>Order Details</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5">Purchased on {ord.date}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  {ord.paymentMethod === 'UPI QR Payment' && (
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide border ${
                      ord.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-255' :
                      ord.paymentStatus === 'rejected' ? 'bg-red-50 text-red-600 border-red-255 animate-pulse' :
                      'bg-amber-50 text-amber-600 border-amber-255'
                    }`}>
                      {ord.paymentStatus === 'paid' ? 'Payment Approved' :
                       ord.paymentStatus === 'rejected' ? 'Payment Rejected' :
                       'Payment Pending Verification'}
                    </span>
                  )}
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${ord.status === 'delivered' ? 'bg-emerald-50 text-emerald-600' : ord.status === 'processing' ? 'bg-blue-50 text-blue-600' : 'bg-gold-50 text-gold-600'}`}>
                    {ord.status}
                  </span>
                  <span className="font-mono font-bold text-navy-950 text-xs">Total: Rs.{ord.total}</span>
                </div>
              </div>

              {ord.paymentMethod === 'UPI QR Payment' && ord.paymentStatus === 'rejected' && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-left space-y-2 font-sans">
                  <p className="text-red-800 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> UPI Payment Verification Failed
                  </p>
                  <p className="text-red-700">Reason: {ord.upiRejectionReason || 'No reason specified by administration.'}</p>
                  
                  <form 
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const form = e.currentTarget;
                      const txnInput = form.elements.namedItem('txnId') as HTMLInputElement;
                      const fileInput = form.elements.namedItem('screenshot') as HTMLInputElement;
                      const urlInput = form.elements.namedItem('screenshotUrl') as HTMLInputElement;
                      const proofType = (form.elements.namedItem('proofType') as HTMLSelectElement).value;
                      const txnId = txnInput.value.trim();
                      
                      if (!txnId) {
                        toast.error("Please enter your UPI transaction ID.");
                        return;
                      }

                      let screenshotUrl = ord.upiScreenshot || '';
                      if (proofType === 'url') {
                        screenshotUrl = urlInput.value.trim() || screenshotUrl;
                      } else if (fileInput.files?.[0]) {
                        const file = fileInput.files[0];
                        if (file.size > 5 * 1024 * 1024) {
                          toast.error("Maximum screenshot size is 5 MB.");
                          return;
                        }
                        const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
                        if (!allowed.includes(file.type)) {
                          toast.error("Only JPG, JPEG, PNG, and WEBP formats are allowed.");
                          return;
                        }
                        
                        const reader = new FileReader();
                        screenshotUrl = await new Promise((resolve) => {
                          reader.onloadend = () => resolve(reader.result as string);
                          reader.readAsDataURL(file);
                        });
                      }

                      if (onResubmitUpiDetails) {
                        onResubmitUpiDetails(ord.id, txnId, screenshotUrl);
                        toast.success("UPI details resubmitted successfully. Pending administrative validation.");
                      }
                    }}
                    className="space-y-3.5 pt-2"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-gray-500 font-mono mb-0.5">New Transaction ID / Ref No.</label>
                        <input type="text" name="txnId" required defaultValue={ord.upiTxnId} className="w-full px-3 py-1.5 border border-gray-200 rounded-lg bg-white" />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="block text-[10px] text-gray-500 font-mono">New Screenshot Proof</label>
                          <select name="proofType" defaultValue="upload" className="text-[9px] border rounded bg-white focus:outline-none" onChange={(e) => {
                            const type = e.target.value;
                            const formEl = e.target.closest('form');
                            const upDiv = formEl?.querySelector('.proof-upload-div');
                            const urlDiv = formEl?.querySelector('.proof-url-div');
                            if (type === 'upload') {
                              upDiv?.classList.remove('hidden');
                              urlDiv?.classList.add('hidden');
                            } else {
                              upDiv?.classList.add('hidden');
                              urlDiv?.classList.remove('hidden');
                            }
                          }}>
                            <option value="upload">Upload File</option>
                            <option value="url">Paste Web URL</option>
                          </select>
                        </div>
                        <div className="proof-upload-div">
                          <input type="file" name="screenshot" accept="image/jpeg,image/jpg,image/png,image/webp" className="w-full text-[10px]" />
                        </div>
                        <div className="proof-url-div hidden">
                          <input type="url" name="screenshotUrl" placeholder="Paste image web URL here" className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-[10px] bg-white focus:outline-none" />
                        </div>
                      </div>
                    </div>
                    <button type="submit" className="px-4 py-2 bg-navy-950 hover:bg-[#C5A021] text-white hover:text-navy-950 rounded-xl font-bold uppercase transition cursor-pointer text-xs">
                      Resubmit Payment Details
                    </button>
                  </form>
                </div>
              )}

              <div className="p-3 bg-gray-50 border rounded-xl flex items-center justify-between text-xs gap-3">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-gold-400 shrink-0" />
                  <span className="text-gray-600 font-light">Status tracking:</span>
                </div>
                <div className="flex-1 max-w-xs grid grid-cols-4 text-center text-[9px] font-semibold text-gray-400 gap-1 select-none">
                  <span className={ord.status !== 'cancelled' ? 'text-gold-500' : ''}>Polishing</span>
                  <span className={ord.status === 'processing' || ord.status === 'shipped' || ord.status === 'delivered' ? 'text-gold-500' : ''}>Routed</span>
                  <span className={ord.status === 'shipped' || ord.status === 'delivered' ? 'text-gold-500' : ''}>Shipped</span>
                  <span className={ord.status === 'delivered' ? 'text-emerald-500 font-bold animate-pulse' : ''}>Delivered</span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                {ord.items.map((it: any) => (
                  <div key={it.product.id} className="flex justify-between items-center bg-gray-50/50 p-2 rounded-lg">
                    <span className="font-semibold text-gray-700">{it.product.name} (x{it.quantity})</span>
                    <span className="text-gray-400 font-mono">Rs.{(it.product.discountPrice || it.product.price) * it.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>

    <AnimatePresence>
      {selectedDetailsOrder && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-navy-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto"
        >
          <motion.div
            initial={{ scale: 0.95, y: 15 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-white rounded-3xl max-w-2xl w-full border border-gray-100 shadow-2xl overflow-hidden relative text-left"
          >
            <div className="bg-gradient-to-r from-navy-950 to-slate-900 p-6 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono tracking-widest text-gold-400 uppercase font-bold font-semibold">Past Purchase Details</span>
                  <span className="px-1.5 py-0.5 text-[8px] font-mono rounded bg-white/10 text-white border border-white/20">
                    ID: {selectedDetailsOrder.orderNumber}
                  </span>
                </div>
                <h4 className="font-display font-medium text-base text-white tracking-wide mt-1">
                  Order Registered on {selectedDetailsOrder.date}
                </h4>
              </div>
              <button
                onClick={() => setSelectedDetailsOrder(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 md:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="bg-gray-50 border rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center text-[10px] font-mono tracking-wider text-gold-600 uppercase font-bold border-b border-gray-100 pb-2">
                  <span>Individual Logistics Status</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold font-sans ${selectedDetailsOrder.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' : selectedDetailsOrder.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-gold-100 text-gold-800'}`}>
                    {selectedDetailsOrder.status}
                  </span>
                </div>

                <div className="relative pt-4 pb-2">
                  <div className="absolute top-[37px] left-4 right-4 h-1 bg-gray-200 -translate-y-1/2 z-0 hidden sm:block"></div>
                  
                  {selectedDetailsOrder.status !== 'cancelled' && (
                    <div 
                      className="absolute top-[37px] left-4 h-1 bg-gold-400 -translate-y-1/2 z-0 origin-left transition-all duration-500 hidden sm:block"
                      style={{
                        width: selectedDetailsOrder.status === 'pending' ? '12.5%' :
                               selectedDetailsOrder.status === 'processing' ? '37.5%' :
                               selectedDetailsOrder.status === 'shipped' ? '62.5%' : '100%'
                      }}
                    ></div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative z-10">
                    {[
                      { key: 'pending', title: '1. Placed', desc: 'Secure order recorded', icon: Clipboard, color: 'text-gold-500' },
                      { key: 'processing', title: '2. Polished', desc: 'Crafted & QA checked', icon: Clock, color: 'text-blue-500' },
                      { key: 'shipped', title: '3. Dispatched', desc: 'BlueDart air transit', icon: Truck, color: 'text-indigo-500' },
                      { key: 'delivered', title: '4. Arrived', desc: 'Successfully delivered', icon: Check, color: 'text-emerald-500' }
                    ].map((step, idx) => {
                      const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];
                      const currentIdx = statusOrder.indexOf(selectedDetailsOrder.status);
                      const stepIdx = statusOrder.indexOf(step.key);
                      
                      const isCompleted = selectedDetailsOrder.status !== 'cancelled' && stepIdx <= currentIdx;
                      const isActive = selectedDetailsOrder.status !== 'cancelled' && stepIdx === currentIdx;
                      const isCancelled = selectedDetailsOrder.status === 'cancelled';
                      
                      const StepIcon = step.icon as any;

                      return (
                        <div key={step.key} className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition duration-300 border ${
                            isCancelled ? 'bg-red-50 border-red-200 text-red-400' :
                            isCompleted ? 'bg-emerald-50 border-emerald-200 text-emerald-500' :
                            isActive ? 'bg-gold-50 border-gold-300 text-gold-500 ring-2 ring-gold-200' :
                            'bg-gray-100 border-gray-200 text-gray-400'
                          }`}>
                            {isCancelled ? <AlertTriangle className="w-4 h-4" /> : <StepIcon className="w-4 h-4" />}
                          </div>
                          <div className="text-left sm:text-center">
                            <h5 className={`text-[10px] font-mono tracking-wider uppercase font-bold ${
                              isCancelled ? 'text-red-500' :
                              isActive ? 'text-gold-600 font-extrabold' :
                              isCompleted ? 'text-emerald-600' : 'text-gray-400'
                            }`}>{step.title}</h5>
                            <p className="text-[9px] text-gray-400 leading-none mt-0.5">{isCancelled ? 'Order Cancelled' : step.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-display font-medium text-xs text-navy-900 uppercase tracking-widest pb-1 border-b">
                  Item-Level Package Breakdown
                </h4>
                <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto pr-1">
                  {selectedDetailsOrder.items.map((it: any) => (
                    <div key={it.product.id} className="py-3 flex justify-between items-center text-xs gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={it.product.images?.[0] || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=120&auto=format&fit=crop&q=60'}
                          alt={it.product.name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 object-cover rounded-lg border border-gray-100 shrink-0 bg-slate-50"
                        />
                        <div>
                          <p className="font-semibold text-navy-950">{it.product.name}</p>
                          <span className="text-[10px] text-gray-400 font-mono">
                            Rs.{it.product.discountPrice || it.product.price} x {it.quantity}
                          </span>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-navy-950">
                        Rs.{(it.product.discountPrice || it.product.price) * it.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans text-navy-950">
                <div className="p-4 bg-gray-50 border rounded-2xl">
                  <h5 className="font-mono text-[9px] tracking-wider uppercase text-gray-400 mb-2 font-bold">Shipping Destination</h5>
                  <p className="font-bold">{selectedDetailsOrder.customerInfo.name}</p>
                  <p className="mt-1 font-light text-gray-600 leading-relaxed">{selectedDetailsOrder.customerInfo.address}</p>
                  <p className="font-light text-gray-600">{selectedDetailsOrder.customerInfo.pincode}</p>
                  <p className="text-[10px] font-mono text-gray-400 mt-2">Phone {selectedDetailsOrder.customerInfo.phone}</p>
                </div>

                <div className="p-4 bg-gray-50 border rounded-2xl flex flex-col justify-between">
                  <div>
                    <h5 className="font-mono text-[9px] tracking-wider uppercase text-gray-400 mb-2 font-bold">Delivery Parameters</h5>
                    <p className="font-medium flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-gold-500" />
                      <span>Method: {selectedDetailsOrder.shippingMethod === 'express' ? 'BlueDart Express Air' : 'Standard Delivery'}</span>
                    </p>
                    <p className="font-mono text-[10px] text-gray-500 mt-1">Payment: {selectedDetailsOrder.paymentMethod} ({selectedDetailsOrder.paymentStatus.toUpperCase()})</p>
                  </div>

                  {selectedDetailsOrder.giftWrappingRequested && (
                    <div className="mt-3 p-2.5 bg-gold-50 border border-gold-200 rounded-xl text-[11px]">
                      <p className="font-bold text-gold-800 flex items-center gap-1 mb-1">
                        <Gift className="w-3 h-3" />
                        <span>Premium {selectedDetailsOrder.giftWrappingType?.toUpperCase() || 'CLASSIC'} Wrap Gift</span>
                      </p>
                      {selectedDetailsOrder.giftMessage && (
                        <p className="italic text-gray-600">"{selectedDetailsOrder.giftMessage}"</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 border rounded-2xl p-4 md:p-5 space-y-2.5 text-xs text-navy-950">
                <h5 className="font-mono text-[9px] tracking-wider uppercase text-gray-400 mb-3 font-bold border-b pb-1.5">Invoice Financial Ledger</h5>
                
                <div className="flex justify-between items-center text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-mono">Rs.{selectedDetailsOrder.subtotal}</span>
                </div>

                {selectedDetailsOrder.discount > 0 && (
                  <div className="flex justify-between items-center text-emerald-600">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      <span>Discount {selectedDetailsOrder.couponCode ? `(${selectedDetailsOrder.couponCode})` : ''}</span>
                    </span>
                    <span className="font-mono font-semibold">-Rs.{selectedDetailsOrder.discount}</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-gray-600">
                  <span>Shipping Handling Cost</span>
                  <span className="font-mono">Rs.{selectedDetailsOrder.shippingCost}</span>
                </div>

                <div className="flex justify-between items-center text-gray-600">
                  <span>GST (Goods & Services Tax)</span>
                  <span className="font-mono">Rs.{selectedDetailsOrder.tax}</span>
                </div>

                <div className="flex justify-between items-center border-t pt-3 font-display font-bold text-sm text-navy-900">
                  <span>Total Net Amount Paid</span>
                  <span className="font-mono text-gold-600">Rs.{selectedDetailsOrder.total}</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                onClick={() => {
                  setTrackingInput(selectedDetailsOrder.orderNumber);
                  setSearchedOrder(selectedDetailsOrder);
                  setTrackingError('');
                  setSelectedDetailsOrder(null);
                  setSubTab('tracking');
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 text-slate-800 font-display font-bold text-[10px] uppercase tracking-wider rounded-xl transition cursor-pointer active:scale-95 shadow-sm flex items-center justify-center gap-1.5"
              >
                <Truck className="w-4 h-4 text-gold-500" />
                <span>Interactive Live Track</span>
              </button>

              <button
                onClick={() => generateInvoicePDF(selectedDetailsOrder)}
                className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-tr from-gold-500 to-gold-400 hover:from-gold-600 text-navy-950 font-display font-bold text-[10px] uppercase tracking-wider rounded-xl transition cursor-pointer active:scale-95 shadow-sm flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Download Digital Invoice PDF</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
"""

with open(os.path.join(dashboard_dir, "OrdersTab.tsx"), "w", encoding="utf-8") as f:
    f.write(orders_tab)

tracking_tab = """import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, AlertCircle, Package, Download, Truck, Clipboard, Clock, Check } from 'lucide-react';
import { generateInvoicePDF } from '../../lib/invoiceGenerator';
import toast from 'react-hot-toast';

export default function TrackingTab({
  orders,
  trackingInput,
  setTrackingInput,
  searchedOrder,
  setSearchedOrder,
  trackingError,
  setTrackingError,
  isLiveConnection,
  setIsLiveConnection,
  isTrackingLoading,
  setIsTrackingLoading
}: any) {
  const [copiedAWB, setCopiedAWB] = useState(false);

  const handleTrackOrderSearch = async (e?: React.FormEvent, customNo?: string) => {
    if (e) e.preventDefault();
    const query = (customNo || trackingInput).trim().toUpperCase();
    if (!query) {
      setTrackingError('Please enter a valid order number.');
      setSearchedOrder(null);
      setIsLiveConnection(false);
      return;
    }

    setIsTrackingLoading(true);
    setTrackingError('');

    try {
      const res = await fetch(`/api/orders/${query}`);
      if (res.ok) {
        const backendOrder = await res.json();
        setSearchedOrder(backendOrder);
        setIsLiveConnection(true);
        if (customNo) setTrackingInput(customNo);
      } else {
        const localFound = orders.find(
          (o: any) => o.orderNumber.toUpperCase() === query || o.id.toUpperCase() === query
        );
        if (localFound) {
          setSearchedOrder(localFound);
          setIsLiveConnection(true);
          if (customNo) setTrackingInput(customNo);
        } else {
          setSearchedOrder(null);
          setIsLiveConnection(false);
          setTrackingError(`No active order found with order number "${query}".`);
        }
      }
    } catch (err) {
      console.error('Error tracking order from database:', err);
      const localFound = orders.find(
        (o: any) => o.orderNumber.toUpperCase() === query || o.id.toUpperCase() === query
      );
      if (localFound) {
        setSearchedOrder(localFound);
        setIsLiveConnection(false);
        if (customNo) setTrackingInput(customNo);
      } else {
        setSearchedOrder(null);
        setIsLiveConnection(false);
        setTrackingError('Unable to connect to the tracking server.');
      }
    } finally {
      setIsTrackingLoading(false);
    }
  };

  useEffect(() => {
    if (!searchedOrder) return;
    if (searchedOrder.status === 'delivered' || searchedOrder.status === 'cancelled') return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${searchedOrder.orderNumber}`);
        if (res.ok) {
          const updatedOrder = await res.json();
          setSearchedOrder(updatedOrder);
          setIsLiveConnection(true);
        }
      } catch (err) {
        console.error('Error polling order tracking updates:', err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [searchedOrder?.orderNumber, searchedOrder?.status, setSearchedOrder, setIsLiveConnection]);

  const getCourierDetails = (order: any) => {
    const numericId = order.id.replace(/[^0-9]/g, '') || '8294029';
    const shortNum = (parseInt(numericId, 10) % 900000) + 100000;
    const isExpress = order.shippingMethod === 'express';
    if (isExpress) {
      return {
        partner: 'BlueDart Express',
        awb: `BD-${shortNum}`,
        portalUrl: 'https://www.bluedart.com/',
        color: 'bg-amber-50 text-amber-800 border-amber-200',
        brandColor: '#FFCC00',
      };
    } else {
      return {
        partner: 'Delhivery Prime',
        awb: `DLV-${shortNum}`,
        portalUrl: 'https://www.delhivery.com/',
        color: 'bg-sky-50 text-sky-800 border-sky-200',
        brandColor: '#000000',
      };
    }
  };

  const getCourierLogs = (order: any, courier: string) => {
    const logs = [];
    if (order.status === 'pending') {
      logs.push({ time: 'Just now', title: 'Awaiting Handoff Prep', description: `Merchant packing team is preparing items.`, status: 'pending' });
    } else if (order.status === 'processing') {
      logs.push({ time: 'Today, 11:30 AM', title: 'Artisan Quality Check Cleared', description: 'Handcrafted items verified.', status: 'success' });
      logs.push({ time: 'Yesterday', title: 'Shipment Created', description: `Label queued.`, status: 'success' });
    } else if (order.status === 'shipped') {
      logs.push({ time: 'Today, 10:20 AM', title: 'In Transit', description: `Departed hub.`, status: 'active' });
      logs.push({ time: 'Yesterday', title: `Collected by ${courier}`, description: `Sorted and checked.`, status: 'success' });
    } else if (order.status === 'delivered') {
      logs.push({ time: 'Today, 03:40 PM', title: 'Delivered', description: 'Successfully handed over.', status: 'success' });
      logs.push({ time: 'Today, 09:15 AM', title: 'Out for Delivery', description: `Contactless handoff active.`, status: 'success' });
      logs.push({ time: 'Yesterday, 11:30 AM', title: 'Arrived at Destination', description: 'Received at facility.', status: 'success' });
      logs.push({ time: '2 Days Ago', title: `Departed Hub`, description: `Left regional center.`, status: 'success' });
    } else if (order.status === 'cancelled') {
      logs.push({ time: 'Recently', title: 'Delivery Aborted', description: 'Transaction aborted.', status: 'cancelled' });
    }
    return logs;
  };

  const handleCopyAWB = (awb: string) => {
    navigator.clipboard.writeText(awb);
    setCopiedAWB(true);
    toast.success("AWB Copied!");
    setTimeout(() => setCopiedAWB(false), 2000);
  };

  return (
    <motion.div
      key="tracking"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className="space-y-6 text-left"
    >
      <div>
        <h3 className="font-display font-medium text-sm text-navy-900 uppercase tracking-widest pb-1 border-b border-gray-100">Order Verification & Tracking</h3>
        <p className="text-xs text-gray-400 mt-2">
          Enter the order code or select from your active order list below to check the real-time package milestones.
        </p>
      </div>

      <form onSubmit={(e) => handleTrackOrderSearch(e)} className="flex gap-2 max-w-md bg-gray-50 p-1.5 rounded-2xl border">
        <div className="relative flex-1 flex items-center">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 shrink-0" />
          <input
            type="text"
            value={trackingInput}
            onChange={(e) => setTrackingInput(e.target.value)}
            placeholder="e.g. MR-123456-789"
            className="w-full bg-transparent pl-9 pr-3 py-2 text-xs focus:outline-none font-mono uppercase tracking-wider text-navy-950 font-bold"
          />
        </div>
        <button type="submit" className="px-4 py-2 bg-gradient-to-tr from-gold-500 to-gold-400 hover:from-gold-600 text-navy-950 font-display font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer active:scale-95 shadow-sm">
          Track Status
        </button>
      </form>

      {trackingError && (
        <div className="p-4 bg-red-50 text-red-800 text-xs border border-red-100 rounded-xl flex items-center gap-2 max-w-md">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p>{trackingError}</p>
        </div>
      )}

      {orders.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-mono tracking-wider text-gray-400 uppercase">Your Active Order Codes</p>
          <div className="flex flex-wrap gap-2">
            {orders.map((o: any) => (
              <button
                key={o.id}
                onClick={() => handleTrackOrderSearch(undefined, o.orderNumber)}
                className={`px-3 py-1.5 rounded-xl border text-[10px] font-mono font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  searchedOrder?.id === o.id
                    ? 'bg-gold-50 border-gold-400 text-gold-700 font-bold shadow-sm'
                    : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-500'
                }`}
              >
                <Package className="w-3.5 h-3.5 text-gold-400" />
                <span>{o.orderNumber}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {searchedOrder ? (
        <div className="p-6 rounded-2xl border border-gray-100 bg-white shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50/50 p-4 rounded-xl gap-4 border border-dashed">
            <div className="text-left font-sans">
              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                <span className="text-[10px] font-mono text-gray-400 uppercase">CURRENT ORDER</span>
                {isLiveConnection ? (
                  <span className="px-1.5 py-0.5 text-[8px] font-mono font-bold tracking-wider rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-1 animate-pulse">
                    <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                    LIVE REMOTE DB
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 text-[8px] font-mono font-bold tracking-wider rounded bg-yellow-500/10 text-yellow-600 border border-yellow-500/20">
                    LOCAL CACHE
                  </span>
                )}
              </div>
              <h4 className="font-mono text-xs font-bold text-navy-950 uppercase">{searchedOrder.orderNumber}</h4>
              <span className="text-[10px] text-gray-400 block mt-0.5">Purchased on {searchedOrder.date}</span>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
              <div className="text-left sm:text-right font-sans shrink-0">
                <span className="text-[10px] font-mono text-gray-400 block">BILLING AMOUNT</span>
                <h4 className="text-xs font-bold text-navy-950">Rs.{searchedOrder.total}</h4>
                <span className="text-[10px] font-mono text-gray-400 mt-0.5 block">
                  Method: {searchedOrder.paymentMethod}
                </span>
              </div>
              <button
                onClick={() => generateInvoicePDF(searchedOrder)}
                className="w-full sm:w-auto px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 text-slate-800 hover:text-navy-950 font-display font-bold text-[10px] uppercase tracking-wider rounded-xl transition cursor-pointer active:scale-95 shadow-sm flex items-center justify-center gap-1.5 shrink-0"
              >
                <Download className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                <span>Download Invoice</span>
              </button>
            </div>
          </div>

          <div className="p-5 bg-navy-950 text-white rounded-2xl md:p-6 space-y-4 shadow-md select-none border border-navy-900">
            <div className="flex justify-between items-center text-[10px] font-mono tracking-widest text-gold-400 uppercase font-semibold">
              <span className="flex items-center gap-1.5">
                Live Status Pulse
                {isTrackingLoading && (
                  <span className="animate-spin text-gold-400 text-[10px]">...</span>
                )}
              </span>
              <span className="px-2 py-0.5 rounded bg-navy-900 border border-navy-800 text-white">
                {searchedOrder.status === 'cancelled' ? 'CANCELLED' : searchedOrder.status.toUpperCase()}
              </span>
            </div>

            <div className="relative">
              <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-navy-900/80 rounded-full -translate-y-1/2" />
              
              <motion.div
                initial={{ width: '0%' }}
                animate={{
                  width: 
                    searchedOrder.status === 'cancelled' ? '100%' :
                    searchedOrder.status === 'pending' ? '15%' :
                    searchedOrder.status === 'processing' ? '45%' :
                    searchedOrder.status === 'shipped' ? '75%' :
                    searchedOrder.status === 'delivered' ? '100%' : '0%'
                }}
                transition={{ type: 'tween', duration: 1.6, ease: 'easeOut', delay: 0.2 }}
                className={`absolute top-1/2 left-0 h-1.5 rounded-full -translate-y-1/2 transition-colors duration-300 ${
                  searchedOrder.status === 'cancelled' 
                    ? 'bg-red-500' 
                    : 'bg-gradient-to-r from-gold-500 via-gold-400 to-emerald-500'
                }`}
              />

              <div className="relative flex justify-between items-center z-10">
                <div className="flex flex-col items-center">
                  <motion.div 
                    className="relative"
                    animate={searchedOrder.status !== 'cancelled' ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                  >
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border text-xs font-bold transition-all duration-300 ${
                      searchedOrder.status === 'cancelled'
                        ? 'bg-red-950 border-red-500 text-red-400'
                        : 'bg-emerald-950 border-emerald-400 text-emerald-400 ring-4 ring-emerald-950/40'
                    }`}>
                      {searchedOrder.status === 'cancelled' ? <AlertCircle className="w-4 h-4" /> : <Clipboard className="w-4 h-4" />}
                    </div>
                    {searchedOrder.status !== 'cancelled' && (
                      <div className="absolute -bottom-1 -right-1 bg-emerald-400 text-navy-950 rounded-full w-3.5 h-3.5 flex items-center justify-center border border-navy-950 text-[8px] font-black shadow-sm">
                        Check
                      </div>
                    )}
                  </motion.div>
                </div>

                {(() => {
                  const isCompleted = searchedOrder.status !== 'pending' && searchedOrder.status !== 'cancelled';
                  const isActive = searchedOrder.status === 'pending' || searchedOrder.status === 'processing';
                  const isCancelled = searchedOrder.status === 'cancelled';
                  const isReached = isCompleted || searchedOrder.status === 'processing';
                  
                  let nodeStyle = 'bg-navy-900 border-navy-800 text-navy-400';
                  if (isCancelled) nodeStyle = 'bg-red-950/20 border-red-900/40 text-red-900';
                  else if (isCompleted) nodeStyle = 'bg-emerald-950 border-emerald-400 text-emerald-400';
                  else if (isActive) nodeStyle = 'bg-gold-950 border-gold-400 text-gold-400 ring-4 ring-gold-950/40';

                  return (
                    <div className="flex flex-col items-center">
                      <motion.div 
                        className="relative"
                        animate={isReached && !isCancelled ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                      >
                        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border text-xs font-bold transition-all duration-300 ${nodeStyle}`}>
                          <Clock className={`w-4 h-4 ${isActive ? 'animate-spin' : ''}`} />
                        </div>
                        {isCompleted && !isCancelled && (
                          <div className="absolute -bottom-1 -right-1 bg-emerald-400 text-navy-950 rounded-full w-3.5 h-3.5 flex items-center justify-center border border-navy-950 text-[8px] font-black shadow-sm">Check</div>
                        )}
                      </motion.div>
                    </div>
                  );
                })()}

                {(() => {
                  const isCompleted = searchedOrder.status === 'delivered';
                  const isActive = searchedOrder.status === 'shipped';
                  const isCancelled = searchedOrder.status === 'cancelled';
                  const isReached = isCompleted || isActive;
                  
                  let nodeStyle = 'bg-navy-900 border-navy-800 text-navy-400';
                  if (isCancelled) nodeStyle = 'bg-red-950/20 border-red-900/40 text-red-900';
                  else if (isCompleted) nodeStyle = 'bg-emerald-950 border-emerald-400 text-emerald-400';
                  else if (isActive) nodeStyle = 'bg-gold-950 border-gold-400 text-gold-400 ring-4 ring-gold-950/40';

                  return (
                    <div className="flex flex-col items-center">
                      <motion.div 
                        className="relative"
                        animate={isReached && !isCancelled ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                      >
                        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border text-xs font-bold transition-all duration-300 ${nodeStyle}`}>
                          <Truck className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />
                        </div>
                        {isCompleted && !isCancelled && (
                          <div className="absolute -bottom-1 -right-1 bg-emerald-400 text-navy-950 rounded-full w-3.5 h-3.5 flex items-center justify-center border border-navy-950 text-[8px] font-black shadow-sm">Check</div>
                        )}
                      </motion.div>
                    </div>
                  );
                })()}

                {(() => {
                  const isCompleted = searchedOrder.status === 'delivered';
                  const isCancelled = searchedOrder.status === 'cancelled';
                  const isReached = isCompleted;
                  
                  let nodeStyle = 'bg-navy-900 border-navy-800 text-navy-400';
                  if (isCancelled) nodeStyle = 'bg-red-950/20 border-red-900/40 text-red-900';
                  else if (isCompleted) nodeStyle = 'bg-emerald-950 border-emerald-400 text-emerald-400 ring-4 ring-emerald-950/40';

                  return (
                    <div className="flex flex-col items-center">
                      <motion.div 
                        className="relative"
                        animate={isReached && !isCancelled ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                      >
                        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border text-xs font-bold transition-all duration-300 ${nodeStyle}`}>
                          <Package className="w-4 h-4" />
                        </div>
                        {isCompleted && !isCancelled && (
                          <div className="absolute -bottom-1 -right-1 bg-emerald-400 text-navy-950 rounded-full w-3.5 h-3.5 flex items-center justify-center border border-navy-950 text-[8px] font-black shadow-sm">Check</div>
                        )}
                      </motion.div>
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="grid grid-cols-4 text-center text-[10px] font-sans font-medium text-gray-400 select-none pt-1">
              <span className={(searchedOrder.status as string) === 'cancelled' ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                {(searchedOrder.status as string) === 'cancelled' ? 'Aborted' : '1. Placed'}
              </span>
              <span className={
                (searchedOrder.status as string) === 'cancelled' ? 'text-red-900/60' :
                (searchedOrder.status as string) === 'pending' || (searchedOrder.status as string) === 'processing' ? 'text-gold-400 font-bold' :
                (searchedOrder.status as string) !== 'pending' ? 'text-emerald-400 font-bold' : 'text-gray-400'
              }>
                2. Processing
              </span>
              <span className={
                (searchedOrder.status as string) === 'cancelled' ? 'text-red-900/60' :
                (searchedOrder.status as string) === 'shipped' ? 'text-gold-400 font-bold' :
                (searchedOrder.status as string) === 'delivered' ? 'text-emerald-400 font-bold' : 'text-gray-400'
              }>
                3. Dispatched
              </span>
              <span className={
                (searchedOrder.status as string) === 'cancelled' ? 'text-red-900/60' :
                (searchedOrder.status as string) === 'delivered' ? 'text-emerald-400 font-bold' : 'text-gray-400'
              }>
                4. Delivered
              </span>
            </div>
          </div>

          {(() => {
            const courier = getCourierDetails(searchedOrder);
            const transitLogs = getCourierLogs(searchedOrder, courier.partner);
            
            return (
              <div className="space-y-6">
                <div className="p-5 sm:p-6 bg-slate-50 rounded-2xl border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2 text-left">
                    <span className="text-[9px] font-mono font-bold tracking-widest text-gold-600 uppercase block">Courier Dispatch Partner</span>
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1 bg-navy-950 text-white font-display font-black text-xs rounded-lg uppercase tracking-wide">
                        {courier.partner}
                      </div>
                      <span className="text-xs text-slate-500 font-medium">Official Cargo Consignment</span>
                    </div>
                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      <span className="text-xs font-mono text-navy-900 font-bold">AWB Tracking Code:</span>
                      <span className="font-mono text-xs font-black text-gold-600 bg-white border px-2 py-0.5 rounded shadow-2xs select-all">
                        {courier.awb}
                      </span>
                      <button
                        onClick={() => handleCopyAWB(courier.awb)}
                        className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-navy-950 rounded-lg transition active:scale-95"
                      >
                        <Clipboard className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pl-6 pr-4 relative">
                  <div className="absolute left-[31px] sm:left-[39px] top-4 bottom-8 w-px bg-gray-200 border-l border-dashed border-gray-300"></div>
                  <div className="space-y-8">
                    {transitLogs.map((log, idx) => {
                      const isLatest = idx === 0 && searchedOrder.status !== 'cancelled';
                      const isSuccess = log.status === 'success';
                      const isActive = log.status === 'active';
                      const isPending = log.status === 'pending';
                      
                      return (
                        <div key={idx} className="relative text-left">
                          <div className="absolute -left-[35px] sm:-left-[43px] top-0.5 z-10">
                            <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border flex items-center justify-center transition shadow-2xs ${
                              isLatest
                                ? isSuccess
                                  ? 'bg-emerald-500 border-emerald-400 text-white ring-4 ring-emerald-100'
                                  : isActive
                                    ? 'bg-gold-500 border-gold-400 text-white ring-4 ring-gold-100'
                                    : 'bg-navy-950 border-navy-800 text-white ring-4 ring-navy-100'
                                : 'bg-white border-gray-200 text-gray-400'
                            }`}>
                              {isSuccess ? <Check className="w-3 h-3 font-bold" /> : isActive ? <Truck className="w-3 h-3 animate-pulse" /> : isPending ? <Clock className="w-3 h-3 animate-spin" /> : <Package className="w-3 h-3" />}
                            </div>
                          </div>
                          
                          <div className="font-sans space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-mono font-semibold text-gray-400">{log.time}</span>
                              {isLatest && (
                                <span className="text-[8px] font-mono font-bold bg-navy-950 text-gold-400 px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                                  LATEST PULSE
                                </span>
                              )}
                            </div>
                            <h6 className={`text-xs font-bold ${isLatest ? 'text-navy-950' : 'text-gray-500'}`}>
                              {log.title}
                            </h6>
                            <p className="text-xs text-gray-500 font-light leading-relaxed max-w-xl font-sans">
                              {log.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}

          {searchedOrder.status === 'cancelled' && (
            <div className="p-4 bg-red-50 text-red-800 text-xs border border-red-100 rounded-xl flex items-center gap-2 font-sans">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <div>
                <p className="font-bold">Purchase Cancelled</p>
                <p>This transaction sequence is aborted. Check email details or request inquiry via support@meris.com.</p>
              </div>
            </div>
          )}

          <div className="border-t border-gray-100 pt-4 space-y-2">
            <p className="text-[10px] font-mono tracking-wider text-gray-400 uppercase">Items In This Package</p>
            <div className="space-y-1.5 font-sans">
              {searchedOrder.items.map((it: any) => (
                <div key={it.product.id} className="flex justify-between items-center text-xs bg-gray-50 p-2.5 rounded-lg">
                  <span className="font-semibold text-navy-900">{it.product.name} (x{it.quantity})</span>
                  <span className="font-mono text-gray-500">Rs.{(it.product.discountPrice || it.product.price) * it.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-dashed rounded-2xl p-8 text-center text-gray-400 text-xs bg-gray-50/20 max-w-lg space-y-2 font-sans">
          <Package className="w-8 h-8 text-gray-300 mx-auto" />
          <p className="font-medium text-gray-600">Pending Tracker Lookup</p>
          <p className="text-gray-400">Please choose one of your active order buttons above, or type in a code manually to show real-time progress.</p>
        </div>
      )}
    </motion.div>
  );
}
"""

with open(os.path.join(dashboard_dir, "TrackingTab.tsx"), "w", encoding="utf-8") as f:
    f.write(tracking_tab)

wishlist_tab = """import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Heart, Download, ShoppingCart } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { getQrCodeUrl } from '../../utils/qrCodeGenerator';
import toast from 'react-hot-toast';

export default function WishlistTab({ wishlistProducts, onSelectProduct, onMoveToCart, onRemoveFromWishlist }: any) {
  const [wishlistPrivacy, setWishlistPrivacy] = useState<'Public' | 'Private' | 'Friends'>('Public');
  const [copiedLink, setCopiedLink] = useState(false);

  const wishlistProductIds = wishlistProducts.map((p: any) => p.id).join(',');
  const shareUrl = `${window.location.origin}/?wishlist=${encodeURIComponent(wishlistProductIds)}`;
  const shareText = `Check out my handcrafted wishlist on Meris E-Shop! 🌟 ${shareUrl}`;

  const downloadWishlistPdf = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('M E R I S', 20, 20);
    doc.setFontSize(10);
    doc.setTextColor(202, 138, 4);
    doc.text('MY HANDCRAFTED WISHLIST COLLECTION', 20, 25);
    doc.setDrawColor(226, 232, 240);
    doc.line(20, 28, 190, 28);

    let currentY = 38;
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);

    wishlistProducts.forEach((p: any, index: number) => {
      if (currentY > 260) {
        doc.addPage();
        currentY = 20;
      }
      doc.setFont('Helvetica', 'bold');
      doc.text(`${index + 1}. ${p.name}`, 20, currentY);
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`Category: ${p.category} | Price: Rs. ${p.discountPrice || p.price}`, 20, currentY + 5);
      doc.text(p.shortDescription || '', 20, currentY + 10);
      currentY += 20;
    });

    doc.save('meris_my_wishlist.pdf');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    toast.success("Link copied!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <motion.div
      key="wishlist"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className="space-y-6 text-left"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-gray-100">
        <h3 className="font-display font-medium text-sm text-navy-900 uppercase tracking-widest">Saved Wishlist Items</h3>
        {wishlistProducts.length > 0 && (
          <button
            onClick={downloadWishlistPdf}
            className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border cursor-pointer animate-fade-in"
          >
            <Download className="w-3.5 h-3.5" /> Download PDF
          </button>
        )}
      </div>

      {wishlistProducts.length === 0 ? (
        <div className="text-center py-10 space-y-2">
          <Heart className="w-8 h-8 text-gray-300 mx-auto" />
          <p className="text-xs text-gray-500">Your wishlist is currently clear.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-4 rounded-3xl bg-gray-50 dark:bg-navy-950 border border-gray-150 dark:border-navy-800 text-xs font-sans space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <span className="font-bold text-navy-950 dark:text-white block">Share My Collection</span>
                <span className="text-[10px] text-gray-400">Share your handpicked crafts with friends or public visitors.</span>
              </div>
              <div className="flex bg-white dark:bg-navy-900 p-0.5 rounded-lg border border-gray-250 dark:border-navy-800 text-[10px]">
                {['Public', 'Friends', 'Private'].map(priv => (
                  <button
                    key={priv}
                    onClick={() => setWishlistPrivacy(priv as any)}
                    className={`px-2.5 py-1 rounded-md font-bold uppercase transition cursor-pointer ${
                      wishlistPrivacy === priv ? 'bg-navy-950 dark:bg-navy-850 text-white' : 'text-gray-400'
                    }`}
                  >
                    {priv}
                  </button>
                ))}
              </div>
            </div>

            {wishlistPrivacy !== 'Private' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div className="flex items-center gap-3 bg-white dark:bg-navy-900 p-3 rounded-2xl border border-gray-200 dark:border-navy-800">
                  <img
                    src={getQrCodeUrl(shareUrl)}
                    alt="Wishlist QR Code"
                    className="w-16 h-16 rounded border bg-white shrink-0"
                  />
                  <div className="space-y-0.5 text-left">
                    <span className="font-semibold text-[10px] text-navy-950 dark:text-white block">Scan to Share</span>
                    <span className="text-[9px] text-gray-400 leading-normal block">Scan QR Code with any camera to instantly load this wishlist.</span>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer" className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold text-[10px] transition">WhatsApp</a>
                    <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer" className="px-3 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-semibold text-[10px] transition">Twitter (X)</a>
                    <a href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer" className="px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-semibold text-[10px] transition">Telegram</a>
                    <button onClick={handleCopyLink} className="px-3 py-2 bg-gray-200 dark:bg-navy-800 hover:bg-gray-300 text-gray-700 dark:text-slate-300 rounded-xl font-semibold text-[10px] transition cursor-pointer">
                      {copiedLink ? 'Copied!' : 'Copy Link'}
                    </button>
                  </div>
                  <span className="font-mono text-[9px] text-gray-400 dark:text-gray-500 truncate block bg-white dark:bg-navy-900 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-navy-800">
                    {shareUrl}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {wishlistProducts.map((prod: any) => (
              <div key={prod.id} className="p-3.5 rounded-2xl border border-gray-100 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm flex items-center gap-3 justify-between">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectProduct(prod.id)}>
                  <img src={prod.images[0]} alt="" referrerPolicy="no-referrer" className="w-14 h-14 rounded-xl object-cover bg-gray-50 shrink-0" />
                  <div className="text-left font-sans space-y-0.5">
                    <h5 className="text-xs font-semibold text-navy-900 dark:text-navy-50 line-clamp-1">{prod.name}</h5>
                    <span className="text-[10px] text-gray-400 font-mono block">{prod.category}</span>
                    <span className="text-xs font-bold text-navy-900 dark:text-navy-50 block mt-0.5">Rs.{prod.discountPrice || prod.price}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 shrink-0 select-none">
                  <button
                    onClick={() => onMoveToCart(prod)}
                    className="p-2 border border-gold-300 bg-gold-400 hover:bg-gold-500 rounded-lg text-navy-950 hover:text-navy-950 flex items-center justify-center gap-1 text-[11px] font-bold cursor-pointer transition active:scale-95"
                  >
                    <ShoppingCart className="w-3 h-3" />
                    <span>Add Bag</span>
                  </button>
                  <button
                    onClick={() => {
                      onRemoveFromWishlist(prod.id);
                      toast.success("Removed from wishlist");
                    }}
                    className="text-gray-400 hover:text-red-500 text-[10px] font-mono cursor-pointer underline text-center"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
"""

with open(os.path.join(dashboard_dir, "WishlistTab.tsx"), "w", encoding="utf-8") as f:
    f.write(wishlist_tab)

wallet_tab = """import React from 'react';
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
"""

with open(os.path.join(dashboard_dir, "WalletTab.tsx"), "w", encoding="utf-8") as f:
    f.write(wallet_tab)

security_tab = """import React from 'react';
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
      <h3 className="font-display font-medium text-sm text-navy-900 uppercase tracking-widest pb-1 border-b border-gray-100">Security Settings</h3>
      <div className="text-center py-10 space-y-2">
        <ShieldCheck className="w-8 h-8 text-gray-300 mx-auto" />
        <p className="text-xs text-gray-500">Security and Activity Logs will appear here.</p>
      </div>
    </motion.div>
  );
}
"""

with open(os.path.join(dashboard_dir, "SecurityTab.tsx"), "w", encoding="utf-8") as f:
    f.write(security_tab)

support_tab = """import React, { useState } from 'react';
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
      <h3 className="font-display font-medium text-sm text-navy-900 uppercase tracking-widest pb-1 border-b border-gray-100">Support & Returns</h3>
      
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
              placeholder="e.g., The wooden stacking dowel contains slight wood knot blemish..."
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-1 focus:ring-gold-400 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-gradient-to-r from-gold-500 to-gold-400 text-navy-950 font-display font-medium text-xs uppercase tracking-wider rounded-xl transition active:scale-95 flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4 text-navy-950" />
            <span>Submit Secure Refund Ticket</span>
          </button>
        </form>
      )}
    </motion.div>
  );
}
"""

with open(os.path.join(dashboard_dir, "SupportTab.tsx"), "w", encoding="utf-8") as f:
    f.write(support_tab)
