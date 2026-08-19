import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Download, FileText, FileSpreadsheet, TrendingUp, DollarSign, 
  ShoppingCart, AlertCircle, Calendar, BarChart3, Tag
} from 'lucide-react';
import { Product, Order, Coupon } from '../../types';
import jsPDF from 'jspdf';

export interface AdminReportsTabProps {
  products: Product[];
  orders: Order[];
  coupons: Coupon[];
  addToast: (text: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

type DateRange = '7' | '30' | '90' | 'all';

const AdminReportsTab: React.FC<AdminReportsTabProps> = ({ products, orders, coupons, addToast }) => {
  const [dateRange, setDateRange] = useState<DateRange>('all');

  // Filter orders by date range
  const filteredOrders = useMemo(() => {
    if (dateRange === 'all') return orders;
    
    const now = new Date().getTime();
    const days = parseInt(dateRange, 10);
    const msPerDay = 24 * 60 * 60 * 1000;
    
    return orders.filter(order => {
      const orderTime = new Date(order.date || new Date()).getTime();
      return now - orderTime <= days * msPerDay;
    });
  }, [orders, dateRange]);

  // KPI Calculations
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.total || 0), 0);
  const totalOrdersCount = filteredOrders.length;
  const averageOrderValue = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;
  const pendingPaymentsCount = filteredOrders.filter(o => o.paymentStatus === 'pending').length;

  // Chart Data Preparation (Sales Over Time)
  const salesData = useMemo(() => {
    const daysCount = dateRange === '7' ? 7 : dateRange === '30' ? 30 : dateRange === '90' ? 90 : 30; // default 30 for 'all'
    const data: { dateStr: string; revenue: number }[] = [];
    const now = new Date();
    
    const orderMap = new Map<string, number>();
    filteredOrders.forEach(o => {
      const d = new Date(o.date || new Date());
      const dateStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
      orderMap.set(dateStr, (orderMap.get(dateStr) || 0) + (o.total || 0));
    });

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
      data.push({
        dateStr,
        revenue: orderMap.get(dateStr) || 0
      });
    }

    return data;
  }, [filteredOrders, dateRange]);

  const maxRevenue = Math.max(...salesData.map(d => d.revenue), 1);

  // Category Breakdown
  const categoryData = useMemo(() => {
    const counts = new Map<string, number>();
    let totalItems = 0;
    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        const cat = item.product?.category || 'Uncategorized';
        counts.set(cat, (counts.get(cat) || 0) + item.quantity);
        totalItems += item.quantity;
      });
    });

    const sorted = Array.from(counts.entries())
      .map(([name, count]) => ({ name, count, percentage: totalItems > 0 ? (count / totalItems) * 100 : 0 }))
      .sort((a, b) => b.count - a.count);
    
    return { data: sorted, total: totalItems };
  }, [filteredOrders, products]);

  // Order Status Distribution
  const orderStatusCounts = useMemo(() => {
    const counts = {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };
    
    filteredOrders.forEach(o => {
      const status = (o.status || 'pending').toLowerCase();
      if (status in counts) {
        counts[status as keyof typeof counts]++;
      }
    });
    
    return counts;
  }, [filteredOrders]);

  // Top Products Leaderboard
  const topProducts = useMemo(() => {
    const productStats = new Map<string, { name: string; units: number; revenue: number }>();
    
    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        if (!item.product) return;
        const name = item.product.name;
        const itemPrice = item.product.discountPrice || item.product.price;
        const current = productStats.get(item.product.id) || { name, units: 0, revenue: 0 };
        
        productStats.set(item.product.id, {
          name,
          units: current.units + item.quantity,
          revenue: current.revenue + (itemPrice * item.quantity)
        });
      });
    });
    
    return Array.from(productStats.values())
      .sort((a, b) => b.units - a.units)
      .slice(0, 5);
  }, [filteredOrders, products]);

  // Export functions
  const exportOrdersCSV = () => {
    const headers = ['Order ID', 'Date', 'Customer', 'Items', 'Total Amount', 'Status', 'Payment Status'];
    const rows = orders.map(o => {
      const itemsStr = o.items.map(i => `${i.quantity}x ${i.product?.name || i.product?.id}`).join('; ');
      return [
        o.id,
        new Date(o.date || new Date()).toLocaleDateString(),
        o.customerInfo?.name || o.accountName || 'Unknown',
        itemsStr,
        o.total,
        o.status,
        o.paymentStatus
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
    });
    
    const csv = [headers.join(','), ...rows].join('\n');
    downloadFile(csv, 'radha-orders.csv', 'text/csv');
    addToast('Orders CSV exported', 'success');
  };

  const exportProductsCSV = () => {
    const headers = ['Product ID', 'Name', 'Category', 'Price', 'Stock', 'Status'];
    const rows = products.map(p => {
      return [
        p.id,
        p.name,
        p.category,
        p.price,
        p.stock,
        p.availability !== 'out-of-stock' ? 'Active' : 'Inactive'
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
    });
    
    const csv = [headers.join(','), ...rows].join('\n');
    downloadFile(csv, 'radha-products.csv', 'text/csv');
    addToast('Products CSV exported', 'success');
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Radha Fashions Performance Report', 14, 22);
    
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 32);
    doc.text(`Selected Period: ${dateRange === 'all' ? 'All Time' : `Last ${dateRange} Days`}`, 14, 40);
    
    doc.setFontSize(16);
    doc.text('Key Metrics', 14, 55);
    
    doc.setFontSize(12);
    doc.text(`Total Revenue: Rs. ${totalRevenue.toLocaleString()}`, 14, 65);
    doc.text(`Total Orders: ${totalOrdersCount}`, 14, 72);
    doc.text(`Average Order Value: Rs. ${averageOrderValue.toFixed(2)}`, 14, 79);
    doc.text(`Pending Payments: ${pendingPaymentsCount}`, 14, 86);
    
    doc.setFontSize(16);
    doc.text('Order Status Distribution', 14, 105);
    
    doc.setFontSize(12);
    let y = 115;
    Object.entries(orderStatusCounts).forEach(([status, count]) => {
      doc.text(`${status.toUpperCase()}: ${count}`, 14, y);
      y += 7;
    });
    
    doc.save('radha-report.pdf');
    addToast('PDF Report exported', 'success');
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 p-6 bg-white dark:bg-gray-900 min-h-screen text-gray-800 dark:text-gray-200">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-pink-200/50 dark:border-pink-900/30 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#D4648A] flex items-center gap-2">
            <BarChart3 className="w-7 h-7" />
            Store Performance Analytics Reports
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track revenue, orders, and product performance over time.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={exportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-red-900/30 text-red-400 border border-red-800/50 rounded-lg hover:bg-red-900/50 transition-colors text-sm font-medium"
          >
            <FileText className="w-4 h-4" />
            PDF Catalog
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={exportOrdersCSV}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-900/30 text-emerald-400 border border-emerald-800/50 rounded-lg hover:bg-emerald-900/50 transition-colors text-sm font-medium"
          >
            <FileSpreadsheet className="w-4 h-4" />
            CSV Orders
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={exportProductsCSV}
            className="flex items-center gap-2 px-4 py-2 bg-blue-900/30 text-blue-400 border border-blue-800/50 rounded-lg hover:bg-blue-900/50 transition-colors text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            CSV Products
          </motion.button>
        </div>
      </div>

      {/* Date Filter */}
      <div className="flex flex-wrap items-center gap-2 bg-gray-50/50 dark:bg-gray-800/50 p-2 rounded-xl border border-pink-200/50 dark:border-pink-900/30 inline-flex">
        <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400 ml-2 mr-1" />
        {[
          { label: 'Last 7 Days', value: '7' },
          { label: 'Last 30 Days', value: '30' },
          { label: 'Last 90 Days', value: '90' },
          { label: 'All Time', value: 'all' },
        ].map((range) => (
          <button
            key={range.value}
            onClick={() => setDateRange(range.value as DateRange)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              dateRange === range.value 
                ? 'bg-[#D4648A] text-gray-900 shadow-lg shadow-[#D4648A]/20' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-700/50'
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50/80 dark:bg-gray-800/80 p-6 rounded-2xl border border-pink-200/50 dark:border-pink-900/30 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <DollarSign className="w-16 h-16 text-emerald-500" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Total Revenue</p>
          <h3 className="text-3xl font-bold text-emerald-400">Rs. {totalRevenue.toLocaleString()}</h3>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-50/80 dark:bg-gray-800/80 p-6 rounded-2xl border border-pink-200/50 dark:border-pink-900/30 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ShoppingCart className="w-16 h-16 text-blue-500" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Total Orders</p>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{totalOrdersCount}</h3>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-50/80 dark:bg-gray-800/80 p-6 rounded-2xl border border-pink-200/50 dark:border-pink-900/30 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="w-16 h-16 text-[#D4648A]" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Average Order Value</p>
          <h3 className="text-3xl font-bold text-[#D4648A]">Rs. {averageOrderValue.toFixed(2)}</h3>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-50/80 dark:bg-gray-800/80 p-6 rounded-2xl border border-pink-200/50 dark:border-pink-900/30 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <AlertCircle className="w-16 h-16 text-amber-500" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Pending Payments</p>
          <div className="flex items-center gap-3">
            <h3 className="text-3xl font-bold text-amber-400">{pendingPaymentsCount}</h3>
            {pendingPaymentsCount > 0 && (
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
            )}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Sales Over Time Chart */}
        <div className="xl:col-span-2 bg-gray-50/80 dark:bg-gray-800/80 p-6 rounded-2xl border border-pink-200/50 dark:border-pink-900/30">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#D4648A]" />
            Sales Over Time
          </h3>
          
          <div className="h-64 flex items-end gap-2 w-full">
            {salesData.length > 0 && maxRevenue > 0 ? (
              salesData.map((d, i) => {
                const heightPercent = (d.revenue / maxRevenue) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col justify-end items-center group relative h-full">
                    <div 
                      className="w-full bg-gradient-to-t from-[#D4648A]/80 to-[#f5d564] rounded-t-sm transition-all duration-300 group-hover:opacity-80 cursor-pointer"
                      style={{ height: `${Math.max(heightPercent, 2)}%` }}
                      title={`${d.dateStr}: Rs. ${d.revenue}`}
                    ></div>
                    <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 bg-white dark:bg-gray-900 text-xs px-2 py-1 rounded border border-pink-200/50 dark:border-pink-900/30 whitespace-nowrap z-10 pointer-events-none transition-opacity">
                      {d.dateStr}: Rs. {d.revenue}
                    </div>
                    {(salesData.length <= 15 || i % Math.ceil(salesData.length / 10) === 0) && (
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-2 truncate w-full text-center">
                        {d.dateStr}
                      </span>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500 italic">
                No revenue data in selected period
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-gray-50/80 dark:bg-gray-800/80 p-6 rounded-2xl border border-pink-200/50 dark:border-pink-900/30">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Category Breakdown</h3>
          
          <div className="space-y-4">
            {categoryData.data.length > 0 ? (
              categoryData.data.map((cat, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">{cat.name}</span>
                    <span className="text-[#D4648A] font-medium">{cat.count} units ({cat.percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.percentage}%` }}
                      transition={{ duration: 1, delay: idx * 0.1 }}
                      className="h-full bg-gradient-to-r from-[#8a7017] to-[#D4648A]"
                    ></motion.div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 dark:text-gray-500 italic py-8">
                No category data
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Status Distribution */}
      <div className="bg-gray-50/80 dark:bg-gray-800/80 p-6 rounded-2xl border border-pink-200/50 dark:border-pink-900/30">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Order Status Distribution</h3>
        <div className="flex flex-wrap gap-4">
          {[
            { label: 'Pending', count: orderStatusCounts.pending, color: 'bg-gray-600/20 border-gray-500/50', text: 'text-gray-700 dark:text-gray-300' },
            { label: 'Processing', count: orderStatusCounts.processing, color: 'bg-blue-600/20 border-blue-500/50', text: 'text-blue-400' },
            { label: 'Shipped', count: orderStatusCounts.shipped, color: 'bg-purple-600/20 border-purple-500/50', text: 'text-purple-400' },
            { label: 'Delivered', count: orderStatusCounts.delivered, color: 'bg-emerald-600/20 border-emerald-500/50', text: 'text-emerald-400' },
            { label: 'Cancelled', count: orderStatusCounts.cancelled, color: 'bg-red-600/20 border-red-500/50', text: 'text-red-400' },
          ].map((stat, i) => (
            <div key={i} className={`flex-1 min-w-[140px] p-4 rounded-xl border ${stat.color} flex flex-col items-center justify-center gap-2`}>
              <span className={`text-3xl font-bold ${stat.text}`}>{stat.count}</span>
              <span className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products Leaderboard */}
        <div className="bg-gray-50/80 dark:bg-gray-800/80 p-6 rounded-2xl border border-pink-200/50 dark:border-pink-900/30">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Top Products
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 dark:text-gray-500 text-sm border-b border-pink-200/50 dark:border-pink-900/30">
                  <th className="pb-3 font-medium px-2">Rank</th>
                  <th className="pb-3 font-medium px-2">Product</th>
                  <th className="pb-3 font-medium px-2 text-right">Units Sold</th>
                  <th className="pb-3 font-medium px-2 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-200/50 dark:divide-pink-900/30">
                {topProducts.length > 0 ? (
                  topProducts.map((p, i) => (
                    <tr key={i} className="hover:bg-gray-700/20 transition-colors">
                      <td className="py-4 px-2">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                          i === 0 ? 'bg-amber-500 text-white' : 
                          i === 1 ? 'bg-gray-300 text-gray-800' : 
                          i === 2 ? 'bg-orange-700 text-white' : 
                          'bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}>
                          {i + 1}
                        </span>
                      </td>
                      <td className="py-4 px-2 font-medium text-gray-800 dark:text-gray-200">{p.name}</td>
                      <td className="py-4 px-2 text-right text-gray-700 dark:text-gray-300">{p.units}</td>
                      <td className="py-4 px-2 text-right text-[#D4648A] font-medium">Rs. {p.revenue.toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-400 dark:text-gray-500 italic">No sales data</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Coupon Performance */}
        <div className="bg-gray-50/80 dark:bg-gray-800/80 p-6 rounded-2xl border border-pink-200/50 dark:border-pink-900/30">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
            <Tag className="w-5 h-5 text-purple-400" />
            Coupon Performance
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 dark:text-gray-500 text-sm border-b border-pink-200/50 dark:border-pink-900/30">
                  <th className="pb-3 font-medium px-2">Code</th>
                  <th className="pb-3 font-medium px-2">Discount</th>
                  <th className="pb-3 font-medium px-2">Usage</th>
                  <th className="pb-3 font-medium px-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-200/50 dark:divide-pink-900/30">
                {coupons.length > 0 ? (
                  coupons.map((c, i) => {
                    const isExpired = new Date(c.expiryDate) < new Date();
                    const usagePercent = c.usageLimit ? (c.usageCount / c.usageLimit) * 100 : 0;
                    
                    return (
                      <tr key={c.code || i} className="hover:bg-gray-700/20 transition-colors">
                        <td className="py-4 px-2">
                          <span className="font-mono bg-white dark:bg-gray-900 px-2 py-1 rounded text-gray-700 dark:text-gray-300 border border-pink-200/50 dark:border-pink-900/30 text-sm">
                            {c.code}
                          </span>
                        </td>
                        <td className="py-4 px-2 text-gray-700 dark:text-gray-300">
                          {c.type === 'percentage' ? `${c.value}%` : `Rs. ${c.value}`}
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex flex-col gap-1 w-24">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {c.usageCount} {c.usageLimit ? `/ ${c.usageLimit}` : 'uses'}
                            </span>
                            {c.usageLimit && (
                              <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${usagePercent >= 100 ? 'bg-red-500' : 'bg-emerald-500'}`} 
                                  style={{ width: `${Math.min(usagePercent, 100)}%` }}
                                ></div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            !c.active ? 'bg-gray-500/20 text-gray-500 dark:text-gray-400' :
                            isExpired ? 'bg-red-500/20 text-red-400' :
                            (c.usageLimit && c.usageCount >= c.usageLimit) ? 'bg-orange-500/20 text-orange-400' :
                            'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            {!c.active ? 'Inactive' : isExpired ? 'Expired' : (c.usageLimit && c.usageCount >= c.usageLimit) ? 'Exhausted' : 'Active'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-400 dark:text-gray-500 italic">No coupons found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReportsTab;
