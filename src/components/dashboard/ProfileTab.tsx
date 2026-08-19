import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { MapPin } from 'lucide-react';
import MembershipDashboard from '../MembershipDashboard';

interface ProfileTabProps {
  currentUser: any;
  orders: any[];
  setSubTab: (tab: any) => void;
  isEditingAddress: boolean;
  setIsEditingAddress: React.Dispatch<React.SetStateAction<boolean>>;
  shippingName: string;
  setShippingName: React.Dispatch<React.SetStateAction<string>>;
  shippingPhone: string;
  setShippingPhone: React.Dispatch<React.SetStateAction<string>>;
  shippingAddress: string;
  setShippingAddress: React.Dispatch<React.SetStateAction<string>>;
  shippingCity: string;
  setShippingCity: React.Dispatch<React.SetStateAction<string>>;
  shippingPincode: string;
  setShippingPincode: React.Dispatch<React.SetStateAction<string>>;
  shippingCarrier: string;
  setShippingCarrier: React.Dispatch<React.SetStateAction<string>>;
}

export default function ProfileTab({
  currentUser,
  orders,
  setSubTab,
  isEditingAddress,
  setIsEditingAddress,
  shippingName,
  setShippingName,
  shippingPhone,
  setShippingPhone,
  shippingAddress,
  setShippingAddress,
  shippingCity,
  setShippingCity,
  shippingPincode,
  setShippingPincode,
  shippingCarrier,
  setShippingCarrier,
}: ProfileTabProps) {
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
      className="space-y-8 animate-fade-in text-gray-950 text-left"
    >
      <div className="p-6 bg-gradient-to-r from-gray-950 to-gray-900 border border-pink-400/20 rounded-3xl relative overflow-hidden text-white shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4648A]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-[9px] font-mono text-pink-400 uppercase tracking-widest block mb-1">Customer Workspace</span>
            <h2 className="font-display font-bold text-lg uppercase tracking-wide text-white">Welcome back, {currentUser.name}!</h2>
            <p className="text-[11px] text-gray-300 font-light mt-0.5">Manage your address logs, check loyalty coordinates, and view purchases.</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-2xl text-center">
              <span className="text-[9px] font-mono text-pink-300 block">TOTAL ORDERS</span>
              <span className="text-sm font-bold font-mono text-white mt-0.5 block">{orders.length}</span>
            </div>
            <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-2xl text-center">
              <span className="text-[9px] font-mono text-pink-300 block">REWARD POINTS</span>
              <span className="text-sm font-bold font-mono text-white mt-0.5 block">{mockMembership.loyaltyPoints}</span>
            </div>
          </div>
        </div>
      </div>

      <MembershipDashboard membership={mockMembership} />

      <div className="pt-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-display font-bold text-xs text-gray-900 dark:text-gray-50 uppercase tracking-wider pb-2 border-b border-gray-150 dark:border-gray-800">Quick Workspace Access</h3>
          <div className="grid grid-cols-2 gap-3 text-[11px] font-semibold">
            <button onClick={() => setSubTab('orders')} className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-950 hover:bg-pink-50/50 dark:hover:bg-gray-800 border text-[#D4648A] text-center transition cursor-pointer">
              View Invoices
            </button>
            <button onClick={() => setSubTab('tracking')} className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-950 hover:bg-pink-50/50 dark:hover:bg-gray-800 border text-[#D4648A] text-center transition cursor-pointer">
              Track Shipments
            </button>
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-800">
          <h3 className="font-display font-bold text-xs text-gray-900 dark:text-gray-50 uppercase tracking-wider">Saved Shipping Address</h3>
          <button
            onClick={() => setIsEditingAddress(!isEditingAddress)}
            className="text-[10px] font-bold text-[#D4648A] hover:underline cursor-pointer uppercase tracking-wider font-mono"
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
              className="px-4 py-2 bg-gray-950 hover:bg-[#D4648A] text-white hover:text-gray-950 font-bold rounded-lg uppercase tracking-wide cursor-pointer transition text-[10px] text-center"
            >
              Save Coordinates
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-gray-50 border mt-4 text-xs font-light leading-relaxed max-w-md">
            <p className="font-semibold text-gray-900">{shippingName || currentUser?.name}</p>
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
