import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Clipboard, Truck, Eye, AlertTriangle, X, Tag, Check, Download, Gift } from 'lucide-react';
import { generateInvoicePDF } from '../../lib/invoiceGenerator';
import toast from 'react-hot-toast';
import { formatSelectedVariation, getCartItemKey } from '../../types';

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
      <h3 className="font-display font-medium text-sm text-gray-900 uppercase tracking-widest pb-1 border-b border-gray-100">Your Orders Ledger</h3>
      
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
                    <span className="font-semibold text-gray-950 font-mono">ID: {ord.orderNumber}</span>
                    <button
                      onClick={() => {
                        setTrackingInput(ord.orderNumber);
                        setSearchedOrder(ord);
                        setTrackingError('');
                        setSubTab('tracking');
                      }}
                      className="px-2 py-0.5 bg-pink-50 hover:bg-pink-100 text-gold-700 hover:text-pink-800 transition rounded-md text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Truck className="w-3 h-3" />
                      <span>Track Live</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedDetailsOrder(ord);
                      }}
                      className="px-2 py-0.5 bg-gray-50 hover:bg-gray-100 text-gray-700 hover:text-gray-800 transition rounded-md text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3 h-3 text-gray-500" />
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
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${ord.status === 'delivered' ? 'bg-emerald-50 text-emerald-600' : ord.status === 'processing' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                    {ord.status}
                  </span>
                  <span className="font-mono font-bold text-gray-950 text-xs">Total: Rs.{ord.total}</span>
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
                    <button type="submit" className="px-4 py-2 bg-gray-950 hover:bg-[#D4648A] text-white hover:text-gray-950 rounded-xl font-bold uppercase transition cursor-pointer text-xs">
                      Resubmit Payment Details
                    </button>
                  </form>
                </div>
              )}

              <div className="p-3 bg-gray-50 border rounded-xl flex items-center justify-between text-xs gap-3">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-pink-400 shrink-0" />
                  <span className="text-gray-600 font-light">Status tracking:</span>
                </div>
                <div className="flex-1 max-w-xs grid grid-cols-4 text-center text-[9px] font-semibold text-gray-400 gap-1 select-none">
                  <span className={ord.status !== 'cancelled' ? 'text-pink-500' : ''}>Polishing</span>
                  <span className={ord.status === 'processing' || ord.status === 'shipped' || ord.status === 'delivered' ? 'text-pink-500' : ''}>Routed</span>
                  <span className={ord.status === 'shipped' || ord.status === 'delivered' ? 'text-pink-500' : ''}>Shipped</span>
                  <span className={ord.status === 'delivered' ? 'text-emerald-500 font-bold animate-pulse' : ''}>Delivered</span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                {ord.items.map((it: any) => (
                  <div key={getCartItemKey(it)} className="flex justify-between items-center bg-gray-50/50 p-2 rounded-lg">
                    <span className="font-semibold text-gray-700">{it.product.name} {formatSelectedVariation(it)} (x{it.quantity})</span>
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
          className="fixed inset-0 bg-gray-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto"
        >
          <motion.div
            initial={{ scale: 0.95, y: 15 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-white rounded-3xl max-w-2xl w-full border border-gray-100 shadow-2xl overflow-hidden relative text-left"
          >
            <div className="bg-gradient-to-r from-pink-600 to-pink-500 p-6 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono tracking-widest text-pink-400 uppercase font-bold font-semibold">Past Purchase Details</span>
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
                <div className="flex justify-between items-center text-[10px] font-mono tracking-wider text-pink-600 uppercase font-bold border-b border-gray-100 pb-2">
                  <span>Individual Logistics Status</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold font-sans ${selectedDetailsOrder.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' : selectedDetailsOrder.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-pink-100 text-pink-800'}`}>
                    {selectedDetailsOrder.status}
                  </span>
                </div>

                <div className="relative pt-4 pb-2">
                  <div className="absolute top-[37px] left-4 right-4 h-1 bg-gray-200 -translate-y-1/2 z-0 hidden sm:block"></div>
                  
                  {selectedDetailsOrder.status !== 'cancelled' && (
                    <div 
                      className="absolute top-[37px] left-4 h-1 bg-pink-400 -translate-y-1/2 z-0 origin-left transition-all duration-500 hidden sm:block"
                      style={{
                        width: selectedDetailsOrder.status === 'pending' ? '12.5%' :
                               selectedDetailsOrder.status === 'processing' ? '37.5%' :
                               selectedDetailsOrder.status === 'shipped' ? '62.5%' : '100%'
                      }}
                    ></div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative z-10">
                    {[
                      { key: 'pending', title: '1. Placed', desc: 'Secure order recorded', icon: Clipboard, color: 'text-pink-500' },
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
                            isActive ? 'bg-pink-50 border-pink-300 text-pink-500 ring-2 ring-pink-200' :
                            'bg-gray-100 border-gray-200 text-gray-400'
                          }`}>
                            {isCancelled ? <AlertTriangle className="w-4 h-4" /> : <StepIcon className="w-4 h-4" />}
                          </div>
                          <div className="text-left sm:text-center">
                            <h5 className={`text-[10px] font-mono tracking-wider uppercase font-bold ${
                              isCancelled ? 'text-red-500' :
                              isActive ? 'text-pink-600 font-extrabold' :
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
                <h4 className="font-display font-medium text-xs text-gray-900 uppercase tracking-widest pb-1 border-b">
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
                          onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=120&auto=format&fit=crop&q=60'; }}
                          className="w-10 h-10 object-cover rounded-lg border border-gray-100 shrink-0 bg-gray-50 dark:bg-gray-950"
                        />
                        <div>
                          <p className="font-semibold text-gray-950">{it.product.name}</p>
                          <span className="text-[10px] text-gray-400 font-mono">
                            Rs.{it.product.discountPrice || it.product.price} x {it.quantity}
                          </span>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-gray-950">
                        Rs.{(it.product.discountPrice || it.product.price) * it.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans text-gray-950">
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
                      <Truck className="w-3.5 h-3.5 text-pink-500" />
                      <span>Method: {selectedDetailsOrder.shippingMethod === 'express' ? 'BlueDart Express Air' : 'Standard Delivery'}</span>
                    </p>
                    <p className="font-mono text-[10px] text-gray-500 mt-1">Payment: {selectedDetailsOrder.paymentMethod} ({selectedDetailsOrder.paymentStatus.toUpperCase()})</p>
                  </div>

                  {selectedDetailsOrder.giftWrappingRequested && (
                    <div className="mt-3 p-2.5 bg-pink-50 border border-pink-200 rounded-xl text-[11px]">
                      <p className="font-bold text-pink-800 flex items-center gap-1 mb-1">
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

              <div className="bg-gray-50 border rounded-2xl p-4 md:p-5 space-y-2.5 text-xs text-gray-950">
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

                <div className="flex justify-between items-center border-t pt-3 font-display font-bold text-sm text-gray-900">
                  <span>Total Net Amount Paid</span>
                  <span className="font-mono text-pink-600">Rs.{selectedDetailsOrder.total}</span>
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
                className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 font-display font-bold text-[10px] uppercase tracking-wider rounded-xl transition cursor-pointer active:scale-95 shadow-sm flex items-center justify-center gap-1.5"
              >
                <Truck className="w-4 h-4 text-pink-500" />
                <span>Interactive Live Track</span>
              </button>

              <button
                onClick={() => generateInvoicePDF(selectedDetailsOrder)}
                className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-tr from-pink-500 to-pink-400 hover:from-pink-600 text-gray-950 font-display font-bold text-[10px] uppercase tracking-wider rounded-xl transition cursor-pointer active:scale-95 shadow-sm flex items-center justify-center gap-1.5"
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
