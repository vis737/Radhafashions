import React, { useState, useEffect } from 'react';
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
      logs.push({ time: 'Today, 11:30 AM', title: 'Quality Check Cleared', description: 'Items verified and packed.', status: 'success' });
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
        <h3 className="font-display font-medium text-sm text-gray-900 uppercase tracking-widest pb-1 border-b border-gray-100">Order Verification & Tracking</h3>
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
            className="w-full bg-transparent pl-9 pr-3 py-2 text-xs focus:outline-none font-mono uppercase tracking-wider text-gray-950 font-bold"
          />
        </div>
        <button type="submit" className="px-4 py-2 bg-gradient-to-tr from-pink-500 to-pink-400 hover:from-pink-600 text-gray-950 font-display font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer active:scale-95 shadow-sm">
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
                    ? 'bg-pink-50 border-pink-400 text-gold-700 font-bold shadow-sm'
                    : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-500'
                }`}
              >
                <Package className="w-3.5 h-3.5 text-pink-400" />
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
                  <span className="px-1.5 py-0.5 text-[8px] font-mono font-bold tracking-wider rounded bg-pink-500/10 text-pink-600 border border-pink-500/20">
                    LOCAL CACHE
                  </span>
                )}
              </div>
              <h4 className="font-mono text-xs font-bold text-gray-950 uppercase">{searchedOrder.orderNumber}</h4>
              <span className="text-[10px] text-gray-400 block mt-0.5">Purchased on {searchedOrder.date}</span>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
              <div className="text-left sm:text-right font-sans shrink-0">
                <span className="text-[10px] font-mono text-gray-400 block">BILLING AMOUNT</span>
                <h4 className="text-xs font-bold text-gray-950">Rs.{searchedOrder.total}</h4>
                <span className="text-[10px] font-mono text-gray-400 mt-0.5 block">
                  Method: {searchedOrder.paymentMethod}
                </span>
              </div>
              <button
                onClick={() => generateInvoicePDF(searchedOrder)}
                className="w-full sm:w-auto px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 hover:text-gray-950 font-display font-bold text-[10px] uppercase tracking-wider rounded-xl transition cursor-pointer active:scale-95 shadow-sm flex items-center justify-center gap-1.5 shrink-0"
              >
                <Download className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                <span>Download Invoice</span>
              </button>
            </div>
          </div>

          <div className="p-5 bg-gray-950 text-white rounded-2xl md:p-6 space-y-4 shadow-md select-none border border-gray-900">
            <div className="flex justify-between items-center text-[10px] font-mono tracking-widest text-pink-400 uppercase font-semibold">
              <span className="flex items-center gap-1.5">
                Live Status Pulse
                {isTrackingLoading && (
                  <span className="animate-spin text-pink-400 text-[10px]">...</span>
                )}
              </span>
              <span className="px-2 py-0.5 rounded bg-gray-900 border border-gray-800 text-white">
                {searchedOrder.status === 'cancelled' ? 'CANCELLED' : searchedOrder.status.toUpperCase()}
              </span>
            </div>

            <div className="relative">
              <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-gray-900/80 rounded-full -translate-y-1/2" />
              
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
                    : 'bg-gradient-to-r from-pink-500 via-pink-400 to-emerald-500'
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
                      <div className="absolute -bottom-1 -right-1 bg-emerald-400 text-gray-950 rounded-full w-3.5 h-3.5 flex items-center justify-center border border-gray-950 text-[8px] font-black shadow-sm">
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
                  
                  let nodeStyle = 'bg-gray-900 border-gray-800 text-gray-400';
                  if (isCancelled) nodeStyle = 'bg-red-950/20 border-red-900/40 text-red-900';
                  else if (isCompleted) nodeStyle = 'bg-emerald-950 border-emerald-400 text-emerald-400';
                  else if (isActive) nodeStyle = 'bg-pink-950 border-pink-400 text-pink-400 ring-4 ring-pink-950/40';

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
                          <div className="absolute -bottom-1 -right-1 bg-emerald-400 text-gray-950 rounded-full w-3.5 h-3.5 flex items-center justify-center border border-gray-950 text-[8px] font-black shadow-sm">Check</div>
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
                  
                  let nodeStyle = 'bg-gray-900 border-gray-800 text-gray-400';
                  if (isCancelled) nodeStyle = 'bg-red-950/20 border-red-900/40 text-red-900';
                  else if (isCompleted) nodeStyle = 'bg-emerald-950 border-emerald-400 text-emerald-400';
                  else if (isActive) nodeStyle = 'bg-pink-950 border-pink-400 text-pink-400 ring-4 ring-pink-950/40';

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
                          <div className="absolute -bottom-1 -right-1 bg-emerald-400 text-gray-950 rounded-full w-3.5 h-3.5 flex items-center justify-center border border-gray-950 text-[8px] font-black shadow-sm">Check</div>
                        )}
                      </motion.div>
                    </div>
                  );
                })()}

                {(() => {
                  const isCompleted = searchedOrder.status === 'delivered';
                  const isCancelled = searchedOrder.status === 'cancelled';
                  const isReached = isCompleted;
                  
                  let nodeStyle = 'bg-gray-900 border-gray-800 text-gray-400';
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
                          <div className="absolute -bottom-1 -right-1 bg-emerald-400 text-gray-950 rounded-full w-3.5 h-3.5 flex items-center justify-center border border-gray-950 text-[8px] font-black shadow-sm">Check</div>
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
                (searchedOrder.status as string) === 'pending' || (searchedOrder.status as string) === 'processing' ? 'text-pink-400 font-bold' :
                (searchedOrder.status as string) !== 'pending' ? 'text-emerald-400 font-bold' : 'text-gray-400'
              }>
                2. Processing
              </span>
              <span className={
                (searchedOrder.status as string) === 'cancelled' ? 'text-red-900/60' :
                (searchedOrder.status as string) === 'shipped' ? 'text-pink-400 font-bold' :
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
                <div className="p-5 sm:p-6 bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2 text-left">
                    <span className="text-[9px] font-mono font-bold tracking-widest text-pink-600 uppercase block">Courier Dispatch Partner</span>
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1 bg-gray-950 text-white font-display font-black text-xs rounded-lg uppercase tracking-wide">
                        {courier.partner}
                      </div>
                      <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">Official Cargo Consignment</span>
                    </div>
                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      <span className="text-xs font-mono text-gray-900 font-bold">AWB Tracking Code:</span>
                      <span className="font-mono text-xs font-black text-pink-600 bg-white border px-2 py-0.5 rounded shadow-2xs select-all">
                        {courier.awb}
                      </span>
                      <button
                        onClick={() => handleCopyAWB(courier.awb)}
                        className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-gray-950 rounded-lg transition active:scale-95"
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
                                    ? 'bg-pink-500 border-pink-400 text-white ring-4 ring-pink-100'
                                    : 'bg-gray-950 border-gray-800 text-white ring-4 ring-gray-100'
                                : 'bg-white border-gray-200 text-gray-400'
                            }`}>
                              {isSuccess ? <Check className="w-3 h-3 font-bold" /> : isActive ? <Truck className="w-3 h-3 animate-pulse" /> : isPending ? <Clock className="w-3 h-3 animate-spin" /> : <Package className="w-3 h-3" />}
                            </div>
                          </div>
                          
                          <div className="font-sans space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-mono font-semibold text-gray-400">{log.time}</span>
                              {isLatest && (
                                <span className="text-[8px] font-mono font-bold bg-gray-950 text-pink-400 px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                                  LATEST PULSE
                                </span>
                              )}
                            </div>
                            <h6 className={`text-xs font-bold ${isLatest ? 'text-gray-950' : 'text-gray-500'}`}>
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
                <p>This transaction sequence is aborted. Check email details or request inquiry via admin@radhafashions.com.</p>
              </div>
            </div>
          )}

          <div className="border-t border-gray-100 pt-4 space-y-2">
            <p className="text-[10px] font-mono tracking-wider text-gray-400 uppercase">Items In This Package</p>
            <div className="space-y-1.5 font-sans">
              {searchedOrder.items.map((it: any) => (
                <div key={it.product.id} className="flex justify-between items-center text-xs bg-gray-50 p-2.5 rounded-lg">
                  <span className="font-semibold text-gray-900">{it.product.name} (x{it.quantity})</span>
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
