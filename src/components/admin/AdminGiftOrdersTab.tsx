import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Search, Gift, Trash2, Edit, ChevronDown, CheckCircle, Package } from 'lucide-react';
import { Order } from '../../types';

interface AdminGiftOrdersTabProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
  onDeleteOrder: (ordId: string, ordNum: string) => void;
  onLogActivity: (action: string, details: string) => void;
  addToast: (text: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

const getThemeColor = (theme: string) => {
  switch (theme?.toLowerCase()) {
    case 'birthday': return 'bg-sky-100 text-sky-800 border-sky-300';
    case 'anniversary': return 'bg-rose-100 text-rose-800 border-rose-300';
    case 'wedding': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'baby shower': return 'bg-green-100 text-green-800 border-green-300';
    case 'christmas': return 'bg-red-100 text-red-800 border-red-300';
    case 'diwali': return 'bg-amber-100 text-amber-800 border-amber-300';
    default: return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

const getThemeChartColor = (theme: string) => {
  switch (theme?.toLowerCase()) {
    case 'birthday': return 'bg-sky-500';
    case 'anniversary': return 'bg-rose-500';
    case 'wedding': return 'bg-yellow-500';
    case 'baby shower': return 'bg-green-500';
    case 'christmas': return 'bg-red-500';
    case 'diwali': return 'bg-amber-500';
    default: return 'bg-gray-500';
  }
};

const AdminGiftOrdersTab: React.FC<AdminGiftOrdersTabProps> = ({
  orders,
  onUpdateOrderStatus,
  onDeleteOrder,
  onLogActivity,
  addToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter only gift wrapped orders
  const giftOrders = useMemo(() => orders.filter(o => o.giftWrappingRequested), [orders]);

  // Search filter
  const filteredOrders = useMemo(() => {
    if (!searchTerm) return giftOrders;
    const lower = searchTerm.toLowerCase();
    return giftOrders.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(lower) ||
        o.customerInfo.name.toLowerCase().includes(lower) ||
        o.giftSenderName?.toLowerCase().includes(lower)
    );
  }, [giftOrders, searchTerm]);

  // Stats
  const stats = useMemo(() => {
    const totalCount = giftOrders.length;
    const revenue = totalCount * 100;
    const activeCount = giftOrders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length;
    
    let totalValue = 0;
    const themeCounts: Record<string, number> = {
      'Birthday': 0,
      'Anniversary': 0,
      'Wedding': 0,
      'Baby Shower': 0,
      'Christmas': 0,
      'Diwali': 0,
      'Generic': 0
    };

    giftOrders.forEach(o => {
      totalValue += o.total;
      const theme = o.giftWrappingType || 'Generic';
      if (themeCounts[theme] !== undefined) {
        themeCounts[theme]++;
      } else {
        themeCounts['Generic']++;
      }
    });

    const avgValue = totalCount > 0 ? totalValue / totalCount : 0;
    
    let mostPopular = 'Birthday';
    let maxCount = 0;
    Object.entries(themeCounts).forEach(([theme, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostPopular = theme;
      }
    });

    return { totalCount, revenue, activeCount, mostPopular, avgValue, themeCounts };
  }, [giftOrders]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <Gift className="text-[#C5A021]" size={28} />
          Gift Wrapping Orders Tracker
          <span className="bg-[#C5A021] text-black text-sm px-3 py-1 rounded-full font-bold">
            {stats.totalCount}
          </span>
        </h2>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search order or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1e2738] border border-[#2d3a4f] rounded-full px-11 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:border-[#C5A021] focus:ring-1 focus:ring-[#C5A021] transition-colors"
          />
          <Search className="absolute left-4 top-3 text-gray-400" size={18} />
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1e2738] rounded-3xl p-5 border border-[#2d3a4f]">
          <p className="text-sm text-gray-400 mb-1">Gift Wrap Revenue</p>
          <p className="text-2xl font-bold text-emerald-400">Rs. {stats.revenue}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#1e2738] rounded-3xl p-5 border border-[#2d3a4f]">
          <p className="text-sm text-gray-400 mb-1">Active Gift Packages</p>
          <p className="text-2xl font-bold text-orange-400">{stats.activeCount}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[#1e2738] rounded-3xl p-5 border border-[#2d3a4f]">
          <p className="text-sm text-gray-400 mb-1">Most Popular Theme</p>
          <p className="text-2xl font-bold text-white">{stats.mostPopular}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-[#1e2738] rounded-3xl p-5 border border-[#2d3a4f]">
          <p className="text-sm text-gray-400 mb-1">Avg Gift Value</p>
          <p className="text-2xl font-bold text-[#C5A021]">Rs. {stats.avgValue.toFixed(2)}</p>
        </motion.div>
      </div>

      {/* Theme Breakdown */}
      {stats.totalCount > 0 && (
        <div className="bg-[#1e2738] rounded-3xl p-6 border border-[#2d3a4f]">
          <h3 className="text-lg font-semibold text-white mb-4">Theme Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(stats.themeCounts).map(([theme, count]) => {
              const width = stats.totalCount > 0 ? Math.max((count / stats.totalCount) * 100, 2) : 0;
              if (count === 0) return null;
              return (
                <div key={theme} className="flex items-center gap-4">
                  <div className="w-24 text-sm text-gray-300 truncate">{theme}</div>
                  <div className="flex-1 h-3 bg-[#111827] rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${width}%` }} 
                      className={`h-full rounded-full ${getThemeChartColor(theme)}`}
                    />
                  </div>
                  <div className="w-8 text-right text-sm text-gray-400 font-mono">{count}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 bg-[#1e2738] rounded-3xl border border-[#2d3a4f]">
            <Gift size={48} className="mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No gift orders yet</h3>
            <p className="text-gray-400 max-w-sm mx-auto">
              Customers can add gift wrapping at checkout. Gift orders will appear here.
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const theme = order.giftWrappingType || 'Generic';
            const themeColor = getThemeColor(theme);
            
            return (
              <motion.div 
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#1e2738] rounded-3xl p-6 border border-[#2d3a4f] flex flex-col md:flex-row gap-6 hover:border-[#3a4b66] transition-colors"
              >
                <div className="flex-1 space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono font-bold text-lg text-white">#{order.orderNumber}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${themeColor}`}>
                      {theme} Theme
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-800 text-gray-300 border border-gray-700">
                      {order.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-1">Gift Sender</h4>
                      <p className="text-white font-medium">From: {order.giftSenderName || order.customerInfo.name}</p>
                    </div>
                    <div>
                      <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-1">Recipient</h4>
                      <p className="text-white font-medium">{order.customerInfo.name}</p>
                      <p className="text-sm text-gray-400 truncate">{order.customerInfo.address}</p>
                    </div>
                  </div>

                  {order.giftMessage && (
                    <div className={`p-4 rounded-2xl border-2 border-dashed ${themeColor} bg-opacity-10 italic text-white`}>
                      "{order.giftMessage}"
                    </div>
                  )}

                  <div>
                    <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Items Included</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      {order.items.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <Package size={14} className="text-[#C5A021]" />
                          {item.quantity}x {item.product.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex flex-col justify-between md:items-end gap-4 md:w-48 border-t md:border-t-0 md:border-l border-[#2d3a4f] pt-4 md:pt-0 md:pl-6">
                  <div className="text-left md:text-right">
                    <p className="text-sm text-gray-400">Total Value</p>
                    <p className="text-2xl font-bold text-[#C5A021]">Rs. {order.total}</p>
                  </div>

                  <div className="flex flex-col gap-2 w-full">
                    <select
                      value={order.status}
                      onChange={(e) => {
                        onUpdateOrderStatus(order.id, e.target.value as Order['status']);
                        onLogActivity('UPDATE_GIFT_STATUS', `Updated gift order ${order.orderNumber} status to ${e.target.value}`);
                        addToast(`Status updated for ${order.orderNumber}`, 'success');
                      }}
                      className="w-full bg-[#111827] border border-[#2d3a4f] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#C5A021]"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    
                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete gift order ${order.orderNumber}?`)) {
                          onDeleteOrder(order.id, order.orderNumber);
                          onLogActivity('DELETE_GIFT_ORDER', `Deleted gift order ${order.orderNumber}`);
                        }
                      }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-900/20 text-red-400 rounded-xl hover:bg-red-900/40 transition-colors text-sm font-medium border border-red-900/50"
                    >
                      <Trash2 size={16} />
                      Delete Order
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdminGiftOrdersTab;
