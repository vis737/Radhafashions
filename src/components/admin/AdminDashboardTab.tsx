import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp, ShoppingBag, Clock, AlertTriangle,
  Package, Percent, Gift, BarChart, ChevronRight,
  Plus, Search, FileText, Settings, CreditCard, CheckCircle
} from 'lucide-react';
import { Product, Order, Coupon, ActivityLog } from '../../types';

export interface AdminDashboardTabProps {
  products: Product[];
  orders: Order[];
  coupons: Coupon[];
  logs: ActivityLog[];
  onNavigate: (tab: string) => void;
  onAddProduct: () => void;
  onCreateCoupon: () => void;
}

export default function AdminDashboardTab({
  products,
  orders,
  coupons,
  logs,
  onNavigate,
  onAddProduct,
  onCreateCoupon,
}: AdminDashboardTabProps) {
  const [currentDate, setCurrentDate] = useState(new Date().toLocaleString());

  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date().toLocaleString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  
  const today = new Date();
  const todaysOrders = orders.filter(o => {
    const d = new Date(o.date || new Date());
    return d.getDate() === today.getDate() && 
           d.getMonth() === today.getMonth() && 
           d.getFullYear() === today.getFullYear();
  });

  const pendingUpiOrders = orders.filter(
    o => o.paymentStatus === 'pending' && o.paymentMethod?.toLowerCase().includes('upi')
  );

  const lowStockProducts = products.filter(p => (p.stock || 0) <= 5);
  const outOfStockCount = products.filter(p => (p.stock || 0) === 0).length;
  
  const activeCoupons = coupons.filter(c => c.active);
  const giftOrders = orders.filter(o => o.giftWrappingRequested);
  
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
    .slice(0, 6);
    
  const salesTimeline = [...orders]
    .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
    .slice(0, 7);
    
  const recentLogs = [...logs]
    .sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime())
    .slice(0, 5);
    
  const stockAlerts = [...products]
    .filter(p => (p.stock || 0) <= 10)
    .sort((a, b) => (a.stock || 0) - (b.stock || 0));

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-pink-600 to-pink-500 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between shadow-lg text-white"
      >
        <div>
          <h1 className="text-3xl font-bold text-[#D4648A] mb-2">Welcome to Radha Fashions Admin Hub</h1>
          <p className="text-gray-300">Here's what's happening with your store today.</p>
        </div>
        <div className="mt-4 md:mt-0 text-right bg-gray-800/50 p-4 rounded-2xl border border-gray-700">
          <p className="text-sm text-gray-400 font-medium">Current Date & Time</p>
          <p className="text-lg font-mono text-[#D4648A]">{currentDate}</p>
        </div>
      </motion.div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Row 1 */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-3xl p-5 shadow-sm"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-mono text-gray-500 dark:text-gray-400 mb-1">TOTAL REVENUE</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Rs. {totalRevenue.toLocaleString()}</h3>
              <p className="text-xs text-emerald-500 mt-2 flex items-center"><TrendingUp className="w-3 h-3 mr-1" /> +12% from last month</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-3xl p-5 shadow-sm"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-mono text-gray-500 dark:text-gray-400 mb-1">TODAY'S ORDERS</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{todaysOrders.length}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">orders placed today</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-500/20 flex items-center justify-center text-gray-600 dark:text-gray-400">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-3xl p-5 shadow-sm relative overflow-hidden"
        >
          {pendingUpiOrders.length > 0 && (
            <div className="absolute top-0 right-0 w-3 h-3 m-4 rounded-full bg-amber-500 animate-ping"></div>
          )}
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-mono text-gray-500 dark:text-gray-400 mb-1">PENDING UPI</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{pendingUpiOrders.length}</h3>
              <p className="text-xs text-amber-500 mt-2">requires verification</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-3xl p-5 shadow-sm"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-mono text-gray-500 dark:text-gray-400 mb-1">LOW STOCK ITEMS</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{lowStockProducts.length}</h3>
              <p className="text-xs text-red-500 mt-2">products &lt;= 5 in stock</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </motion.div>

        {/* Row 2 */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-3xl p-5 shadow-sm"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-mono text-gray-500 dark:text-gray-400 mb-1">TOTAL PRODUCTS</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{products.length}</h3>
              <p className="text-xs text-blue-500 mt-2">in catalog</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Package className="w-6 h-6" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-3xl p-5 shadow-sm"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-mono text-gray-500 dark:text-gray-400 mb-1">ACTIVE COUPONS</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{activeCoupons.length}</h3>
              <p className="text-xs text-[#D4648A] mt-2">currently running</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#D4648A]/10 flex items-center justify-center text-[#D4648A]">
              <Percent className="w-6 h-6" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-3xl p-5 shadow-sm"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-mono text-gray-500 dark:text-gray-400 mb-1">GIFT ORDERS</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{giftOrders.length}</h3>
              <p className="text-xs text-orange-500 mt-2">needs special wrapping</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
              <Gift className="w-6 h-6" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-3xl p-5 shadow-sm"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-mono text-gray-500 dark:text-gray-400 mb-1">AVG ORDER VALUE</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Rs. {avgOrderValue.toFixed(0)}</h3>
              <p className="text-xs text-purple-500 mt-2">per transaction</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <BarChart className="w-6 h-6" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-3xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={onAddProduct}
            className="flex items-center px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4 mr-2 text-[#D4648A]" /> Add Product
          </button>
          <button 
            onClick={onCreateCoupon}
            className="flex items-center px-4 py-2 bg-[#D4648A] hover:bg-[#b08d1d] text-white rounded-xl text-sm font-medium transition-colors"
          >
            <Percent className="w-4 h-4 mr-2" /> Create Coupon
          </button>
          <button 
            onClick={() => onNavigate('payments')}
            className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl text-sm font-medium transition-colors border border-transparent dark:border-gray-600 relative"
          >
            <CreditCard className="w-4 h-4 mr-2 text-amber-500" /> Verify Payments
            {pendingUpiOrders.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
            )}
          </button>
          <button 
            onClick={() => onNavigate('reports')}
            className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl text-sm font-medium transition-colors border border-transparent dark:border-gray-600"
          >
            <FileText className="w-4 h-4 mr-2" /> View Reports
          </button>
          <button 
            onClick={() => onNavigate('orders')}
            className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl text-sm font-medium transition-colors border border-transparent dark:border-gray-600"
          >
            <ShoppingBag className="w-4 h-4 mr-2" /> Go to Orders
          </button>
          <button 
            onClick={() => onNavigate('settings')}
            className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl text-sm font-medium transition-colors border border-transparent dark:border-gray-600"
          >
            <Settings className="w-4 h-4 mr-2" /> Settings
          </button>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Recent Orders */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-3xl p-6 shadow-sm overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Orders</h2>
            <button 
              onClick={() => onNavigate('orders')}
              className="text-sm font-medium text-[#D4648A] hover:text-[#b08d1d] flex items-center"
            >
              View all <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm">
              <thead className="text-gray-500 dark:text-gray-400 font-mono text-xs border-b border-gray-100 dark:border-gray-700">
                <tr>
                  <th className="pb-3 font-medium">ORDER#</th>
                  <th className="pb-3 font-medium">CUSTOMER</th>
                  <th className="pb-3 font-medium">TOTAL</th>
                  <th className="pb-3 font-medium">PAYMENT</th>
                  <th className="pb-3 font-medium">STATUS</th>
                  <th className="pb-3 font-medium">DATE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {recentOrders.map((order) => (
                  <tr 
                    key={order.id} 
                    onClick={() => onNavigate('orders')}
                    className="group cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="py-4 font-mono font-medium text-gray-900 dark:text-white group-hover:text-[#D4648A]">
                      #{order.id.substring(0, 6).toUpperCase()}
                    </td>
                    <td className="py-4 text-gray-600 dark:text-gray-300">
                      {order.customerInfo?.name || 'Guest User'}
                    </td>
                    <td className="py-4 font-medium text-gray-900 dark:text-white">
                      Rs. {order.total}
                    </td>
                    <td className="py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                        order.paymentStatus === 'paid' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                          : order.paymentStatus === 'pending'
                            ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                            : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                        order.status === 'delivered' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                          : order.status === 'processing' || order.status === 'shipped'
                            ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20'
                            : 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 text-gray-500 dark:text-gray-400 text-xs">
                      {new Date(order.date || new Date()).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500 dark:text-gray-400">
                      No recent orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Stock Alerts */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-3xl p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-amber-500" /> Stock Alerts
            </h2>
          </div>

          {outOfStockCount > 0 && (
            <div className="mb-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl p-4 flex items-start">
              <div className="p-2 bg-red-100 dark:bg-red-500/20 rounded-full text-red-600 dark:text-red-400 mr-3 shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-red-800 dark:text-red-400">Out of Stock: {outOfStockCount} items</h4>
                <p className="text-xs text-red-600 dark:text-red-300 mt-1">Please restock these items immediately to avoid lost sales.</p>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {stockAlerts.map(product => (
              <div key={product.id} className="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors border border-gray-100 dark:border-gray-700/50">
                <div className="flex-1 min-w-0 pr-4">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={product.name}>
                    {product.name}
                  </p>
                  <p className={`text-xs font-mono mt-1 ${(product.stock || 0) <= 5 ? 'text-red-500 font-bold' : 'text-amber-500'}`}>
                    STOCK: {product.stock || 0}
                  </p>
                </div>
                <button 
                  onClick={() => onNavigate('products')}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-xs font-medium rounded-lg text-gray-700 dark:text-gray-300 transition-colors shrink-0"
                >
                  Manage
                </button>
              </div>
            ))}
            {stockAlerts.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400 flex flex-col items-center">
                <CheckCircle className="w-8 h-8 text-emerald-500 mb-2" />
                <p>All stock levels look good!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sales Timeline & Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Timeline */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-3xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Sales Timeline</h2>
          <div className="relative border-l-2 border-gray-100 dark:border-gray-700 ml-4 space-y-6">
            {salesTimeline.map((order, idx) => {
              const statusColor = 
                order.status === 'delivered' ? 'bg-emerald-500' :
                order.status === 'cancelled' ? 'bg-red-500' :
                order.status === 'processing' ? 'bg-blue-500' :
                'bg-amber-500';
              
              return (
                <div key={order.id} className="relative pl-6">
                  <div className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-4 border-white dark:border-gray-900 ${statusColor}`}></div>
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center">
                        Order #{order.id.substring(0,6).toUpperCase()}
                        <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">
                          by {order.customerInfo?.name || 'Guest'}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">
                        {new Date(order.date || new Date()).toLocaleString()}
                      </p>
                    </div>
                    <div className="mt-2 sm:mt-0 text-left sm:text-right">
                      <p className="text-sm font-bold text-[#D4648A]">Rs. {order.total}</p>
                      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mt-0.5">{order.status}</p>
                    </div>
                  </div>
                </div>
              );
            })}
            {salesTimeline.length === 0 && (
              <p className="pl-6 text-sm text-gray-500">No sales recorded yet.</p>
            )}
          </div>
        </div>

        {/* Activity Logs */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-200 dark:border-pink-900/20 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
              <Search className="w-5 h-5 mr-2 text-[#D4648A]" /> System Logs
            </h2>
            <button 
              onClick={() => onNavigate('security')}
              className="text-xs font-mono text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              [VIEW ALL LOGS]
            </button>
          </div>
          
          <div className="flex-1 space-y-3 font-mono text-xs">
            {recentLogs.map((log, idx) => (
              <div key={log.id || idx} className="p-3 bg-gray-900/50 rounded-xl border border-gray-800 text-gray-700 dark:text-gray-300">
                <div className="flex justify-between mb-2 opacity-60">
                  <span>[{new Date(log.timestamp).toLocaleString()}]</span>
                  <span>{log.user || 'SYSTEM'}</span>
                </div>
                <div className="flex items-start">
                  <span className={`mr-2 shrink-0 ${
                    log.riskLevel === 'high' ? 'text-red-400' :
                    log.riskLevel === 'medium' ? 'text-amber-400' :
                    'text-emerald-400'
                  }`}>&gt;</span>
                  <p>
                    <span className="font-bold text-gray-900 dark:text-white">{log.action}:</span> {log.details}
                  </p>
                </div>
              </div>
            ))}
            {recentLogs.length === 0 && (
              <div className="p-4 text-center text-gray-400 dark:text-gray-500 italic">
                System idle... No recent logs.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
