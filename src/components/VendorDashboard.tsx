import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Sparkles, Plus, CheckCircle, Ban, Tag, Percent, DollarSign, Package, Mail, Users, FileText, Smartphone } from 'lucide-react';
import { Vendor, Product, Order, BulkOrderInquiry } from '../types';

interface VendorDashboardProps {
  vendors: Vendor[];
  products: Product[];
  orders: Order[];
  bulkInquiries: BulkOrderInquiry[];
  onApproveVendor: (vendorId: string) => void;
  onUpdateCommission: (vendorId: string, rate: number) => void;
  onUpdateVendorStatus: (vendorId: string, status: 'active' | 'suspended') => void;
  onResolveInquiry: (inquiryId: string) => void;
}

export default function VendorDashboard({
  vendors,
  products,
  orders,
  bulkInquiries,
  onApproveVendor,
  onUpdateCommission,
  onUpdateVendorStatus,
  onResolveInquiry
}: VendorDashboardProps) {
  const [activeTab, setActiveTab] = useState<'vendors' | 'inquiries' | 'rates'>('vendors');
  const [selectedVendorForDashboard, setSelectedVendorForDashboard] = useState<Vendor | null>(vendors[0] || null);
  const [editingCommissionId, setEditingCommissionId] = useState<string | null>(null);
  const [commissionInputValue, setCommissionInputValue] = useState(15);

  const handleSaveCommission = (vId: string) => {
    onUpdateCommission(vId, commissionInputValue);
    setEditingCommissionId(null);
  };

  return (
    <div className="space-y-6 text-gray-800 dark:text-gray-100 font-sans text-left">
      {/* Premium Hero block */}
      <div className="p-6 rounded-3xl bg-gray-950 text-white border border-gray-900 space-y-2 select-none relative overflow-hidden">
        <div className="absolute right-0 bottom-0 translate-y-8 translate-x-8 opacity-10">
          <Shield className="w-48 h-48 text-pink-400" />
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded bg-amber-500/10 text-pink-400 border border-pink-500/20 text-[9px] font-mono tracking-widest font-black uppercase">
            Marketplace Engine v1.0
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-mono text-gray-400">Multi-Vendor Foundation Ready</span>
        </div>
        <h3 className="font-display font-black text-xl uppercase tracking-wider text-white">
          Consolidated Vendor Hub
        </h3>
        <p className="text-xs text-gray-400 max-w-xl leading-relaxed">
          Manage third-party suppliers, configure service fees, verify inventory pools, and act on corporate bulk return inquiries securely.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 dark:border-gray-900 pb-px gap-2">
        <button
          onClick={() => setActiveTab('vendors')}
          className={`py-2 px-4 font-display font-bold text-xs uppercase tracking-wider border-b-2 transition ${
            activeTab === 'vendors'
              ? 'border-pink-500 text-gray-950 dark:text-pink-400'
              : 'border-transparent text-gray-400 hover:text-gray-900'
          }`}
        >
          Active Suppliers ({vendors.length})
        </button>
        <button
          onClick={() => setActiveTab('inquiries')}
          className={`py-2 px-4 font-display font-bold text-xs uppercase tracking-wider border-b-2 transition ${
            activeTab === 'inquiries'
              ? 'border-pink-500 text-gray-950 dark:text-pink-400'
              : 'border-transparent text-gray-400 hover:text-gray-900'
          }`}
        >
          Bulk Sourcing Tickets ({bulkInquiries.length})
        </button>
        <button
          onClick={() => setActiveTab('rates')}
          className={`py-2 px-4 font-display font-bold text-xs uppercase tracking-wider border-b-2 transition ${
            activeTab === 'rates'
              ? 'border-pink-500 text-gray-950 dark:text-pink-400'
              : 'border-transparent text-gray-400 hover:text-gray-900'
          }`}
        >
          Commission Matrix
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'vendors' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Vendor List Column */}
            <div className="lg:col-span-1 space-y-3">
              <span className="text-[10px] font-mono uppercase text-gray-400 tracking-wider font-bold">Registered Suppliers</span>
              <div className="space-y-2">
                {vendors.map((vendor) => (
                  <button
                    key={vendor.id}
                    onClick={() => setSelectedVendorForDashboard(vendor)}
                    className={`w-full p-4 rounded-2xl border text-left transition ${
                      selectedVendorForDashboard?.id === vendor.id
                        ? 'bg-pink-50/50 dark:bg-gray-900/60 border-pink-400 dark:border-pink-800'
                        : 'bg-white dark:bg-gray-950 border-gray-100 hover:border-gray-300 dark:border-gray-900'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="font-display font-bold text-xs text-gray-950 dark:text-white uppercase tracking-wider line-clamp-1">{vendor.storeName}</h4>
                        <p className="text-[10px] text-gray-400 mt-0.5">{vendor.name}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-mono tracking-wider font-bold uppercase ${
                        vendor.status === 'active'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600'
                          : vendor.status === 'suspended'
                          ? 'bg-red-50 dark:bg-red-950/40 text-red-600'
                          : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600'
                      }`}>
                        {vendor.status}
                      </span>
                    </div>

                    <div className="flex justify-between items-center mt-3 text-[10px] font-mono text-gray-500">
                      <span>Rate: {vendor.commissionRate}%</span>
                      <span className="font-bold text-gray-900 dark:text-pink-400">Rs.{vendor.revenue.toLocaleString()} sales</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Vendor Dynamic Detail Sandbox Panel */}
            <div className="lg:col-span-2">
              {selectedVendorForDashboard ? (
                <div className="p-6 rounded-3xl border border-gray-100 dark:border-gray-900 bg-white dark:bg-gray-950 space-y-6">
                  {/* Title Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 dark:border-gray-900/50 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-display font-black text-sm uppercase tracking-wider text-gray-950 dark:text-white">
                          {selectedVendorForDashboard.storeName}
                        </h4>
                        {!selectedVendorForDashboard.approved && (
                          <span className="px-2 py-0.5 bg-amber-500/10 text-pink-500 rounded text-[8px] font-mono font-bold tracking-widest uppercase">
                            Awaiting Approval
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-light">
                        {selectedVendorForDashboard.description}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      {!selectedVendorForDashboard.approved ? (
                        <button
                          onClick={() => onApproveVendor(selectedVendorForDashboard.id)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-display font-bold text-[10px] uppercase tracking-wider rounded-lg transition shadow-sm flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Approve Supplier</span>
                        </button>
                      ) : (
                        <>
                          {selectedVendorForDashboard.status === 'active' ? (
                            <button
                              onClick={() => onUpdateVendorStatus(selectedVendorForDashboard.id, 'suspended')}
                              className="px-3.5 py-1.5 bg-red-500/10 text-red-600 hover:bg-red-500/20 border border-red-500/20 font-display font-bold text-[10px] uppercase tracking-wider rounded-lg transition flex items-center gap-1 cursor-pointer"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>Suspend Supplier</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => onUpdateVendorStatus(selectedVendorForDashboard.id, 'active')}
                              className="px-3.5 py-1.5 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border border-emerald-500/20 font-display font-bold text-[10px] uppercase tracking-wider rounded-lg transition flex items-center gap-1 cursor-pointer"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Activate Supplier</span>
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Info stats grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 border text-left">
                      <span className="text-[9px] font-mono text-gray-450 dark:text-gray-505 uppercase block">Sales Total</span>
                      <span className="text-base font-bold font-mono text-gray-800 dark:text-white">Rs.{selectedVendorForDashboard.revenue}</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 border text-left">
                      <span className="text-[9px] font-mono text-gray-450 dark:text-gray-505 uppercase block">Commission Due</span>
                      <span className="text-base font-bold font-mono text-pink-500">Rs.{Math.round(selectedVendorForDashboard.revenue * (selectedVendorForDashboard.commissionRate / 100))}</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 border text-left">
                      <span className="text-[9px] font-mono text-gray-450 dark:text-gray-505 uppercase block">Registered Owner</span>
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-white truncate block">{selectedVendorForDashboard.name}</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 border text-left">
                      <span className="text-[9px] font-mono text-gray-450 dark:text-gray-505 uppercase block">Associated Items</span>
                      <span className="text-base font-bold font-mono text-gray-800 dark:text-white">
                        {products.filter(p => p.vendorId === selectedVendorForDashboard.id || (p.brand.toLowerCase().includes('kids') && selectedVendorForDashboard.id === 'vendor-1')).length}
                      </span>
                    </div>
                  </div>

                  {/* Vendor Inventory Ownership List */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-mono uppercase text-gray-400 tracking-wider font-bold block">Assigned Atelier Items & Inventory Pools</span>
                    <div className="divide-y divide-gray-100 dark:divide-gray-900">
                      {products
                        .filter(p => p.vendorId === selectedVendorForDashboard.id || (p.brand.toLowerCase().includes('kids') && selectedVendorForDashboard.id === 'vendor-1'))
                        .map(p => (
                          <div key={p.id} className="py-3 flex justify-between items-center text-xs">
                            <div className="flex items-center gap-3">
                              <img src={p.images[0]} alt={p.name} className="w-8 h-8 rounded object-cover" />
                              <div>
                                <span className="font-bold text-gray-800 dark:text-white line-clamp-1">{p.name}</span>
                                <span className="text-[10px] text-gray-400 font-mono uppercase">{p.sku}</span>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                                p.stock === 0 ? 'bg-red-100 text-red-600' : p.stock < 10 ? 'bg-amber-100 text-amber-600' : 'bg-gray-150 text-gray-600 dark:text-gray-400'
                              }`}>
                                {p.stock} units
                              </span>
                              <span className="text-[10px] font-mono text-gray-400 block mt-0.5">Rs.{p.price}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Contact metadata */}
                  <div className="p-4 rounded-2xl bg-gray-50/50 dark:bg-gray-900/50 text-xs font-mono grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-pink-500" />
                      <span>{selectedVendorForDashboard.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-pink-500" />
                      <span>{selectedVendorForDashboard.phone}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full border border-dashed border-gray-200 rounded-3xl flex items-center justify-center p-8 text-gray-400">
                  Select a registered supplier to inspect their configurations.
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'inquiries' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            <span className="text-[10px] font-mono uppercase text-gray-400 tracking-wider font-bold">Pending Corporate and event Inquiries</span>
            <div className="space-y-3">
              {bulkInquiries.length === 0 ? (
                <div className="p-12 text-center rounded-3xl border border-dashed text-gray-450">
                  No pending bulk return gift inquiries registered yet.
                </div>
              ) : (
                bulkInquiries.map((inq) => (
                  <div
                    key={inq.id}
                    className="p-5 bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-900 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-pink-400 text-[9px] font-mono font-bold uppercase">
                          {inq.eventType} Event
                        </span>
                        <span className="text-gray-300 font-mono">|</span>
                        <span className="text-[10px] text-gray-400 font-mono">{inq.date}</span>
                      </div>

                      <h4 className="font-display font-bold text-xs uppercase text-gray-800 dark:text-white">
                        {inq.quantity}x {inq.productName}
                      </h4>

                      <p className="text-[11px] text-gray-400 leading-relaxed font-sans mt-1">
                        Contact: <span className="text-gray-800 dark:text-white font-medium">{inq.name}</span> ({inq.phone} | {inq.email}) 
                        {inq.companyName && ` at ${inq.companyName}`}
                      </p>

                      {inq.notes && (
                        <p className="text-[10px] text-gray-400 italic bg-gray-50 dark:bg-gray-900 p-2.5 rounded-lg border-l-2 border-pink-400">
                          &ldquo;{inq.notes}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      {inq.status === 'pending' ? (
                        <button
                          onClick={() => onResolveInquiry(inq.id)}
                          className="px-4 py-2 bg-gray-950 dark:bg-pink-400 hover:bg-pink-500 text-white dark:text-gray-900 font-display font-medium text-[10px] uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Approve Tier & Email Quote</span>
                        </button>
                      ) : (
                        <span className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-lg text-[10px] font-mono font-bold uppercase flex items-center gap-1 justify-end">
                          Check Reviewed & Resolved
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'rates' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-6 rounded-3xl bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900 space-y-4"
          >
            <h4 className="font-display font-black text-sm uppercase tracking-wider text-gray-950 dark:text-white">
              Global Platform Commission Rules
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Adjust commission multipliers applied on third-party sales. The platform retains these percentages automatically during client checkout. Adjusted payouts are reflected inside vendor revenue sheets immediately.
            </p>

            <div className="divide-y divide-gray-100 dark:divide-gray-900 border-t border-gray-100 dark:border-gray-900 pt-2">
              {vendors.map((vendor) => (
                <div key={vendor.id} className="py-4 flex justify-between items-center">
                  <div>
                    <h5 className="text-xs font-bold text-gray-800 dark:text-white uppercase tracking-wider">{vendor.storeName}</h5>
                    <p className="text-[10px] text-gray-400">Owner: {vendor.name} - Commission ID: {vendor.id}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    {editingCommissionId === vendor.id ? (
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <input
                            type="number"
                            min={0}
                            max={50}
                            value={commissionInputValue}
                            onChange={(e) => setCommissionInputValue(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                            className="w-20 pl-3 pr-8 py-1 rounded border text-xs font-mono font-bold"
                          />
                          <span className="absolute right-3 top-1 text-xs font-mono text-gray-400 font-semibold">%</span>
                        </div>
                        <button
                          onClick={() => handleSaveCommission(vendor.id)}
                          className="px-2.5 py-1 bg-emerald-600 text-white rounded text-[10px] font-bold uppercase"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-sm font-bold font-mono text-pink-500">{vendor.commissionRate}%</span>
                          <span className="text-[9px] text-gray-400 block">Current Rate</span>
                        </div>
                        <button
                          onClick={() => {
                            setEditingCommissionId(vendor.id);
                            setCommissionInputValue(vendor.commissionRate);
                          }}
                          className="px-2.5 py-1 border border-gray-200 dark:border-gray-800 hover:border-pink-300 rounded text-[10px] font-bold text-gray-500 dark:text-pink-400 uppercase transition"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


