import React, { useState } from 'react';
import { motion } from 'motion/react';
import { DollarSign, Percent, TrendingUp, Calendar, AlertTriangle, ArrowUpRight, ArrowDownRight, Award, Trash, Download } from 'lucide-react';
import { Product } from '../types';

interface AdminBusinessAnalyticsProps {
  products: Product[];
}

export default function AdminBusinessAnalytics({ products }: AdminBusinessAnalyticsProps) {
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');

  // Static reports stats
  const metrics = {
    revenue: timeframe === 'daily' ? 12850 : timeframe === 'weekly' ? 98400 : timeframe === 'monthly' ? 412900 : 4950000,
    orders: timeframe === 'daily' ? 14 : timeframe === 'weekly' ? 88 : timeframe === 'monthly' ? 368 : 4410,
    aov: timeframe === 'daily' ? 917 : timeframe === 'weekly' ? 1118 : timeframe === 'monthly' ? 1122 : 1122,
    conversionRate: 3.42,
    refundRate: 1.15,
    cancelRate: 0.85,
    grossProfit: timeframe === 'monthly' ? 185800 : 2227000,
    netProfit: timeframe === 'monthly' ? 152000 : 1824000,
    newCustomers: 65,
    returningCustomers: 35
  };

  const topProducts = products.slice(0, 3);
  const worstProducts = products.filter(p => p.stock > 15).slice(0, 2);

  // CSV Export utility
  const exportCsvReport = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Revenue in INR', metrics.revenue],
      ['Total Orders placed', metrics.orders],
      ['Average Order Value (AOV)', metrics.aov],
      ['Conversion rate %', metrics.conversionRate],
      ['Refund rate %', metrics.refundRate],
      ['Gross Profit', metrics.grossProfit],
      ['Net Profit', metrics.netProfit]
    ];
    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `moris_business_report_${timeframe}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-left font-sans select-none">
      
      {/* Header and Selectors */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-50 dark:border-navy-800 pb-4">
        <div>
          <h3 className="font-display font-bold text-xs uppercase tracking-wider text-navy-900 dark:text-navy-50">
            Business & Financial Analytics
          </h3>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 font-sans mt-0.5">
            Evaluate conversion efficiency, revenue streams, and margins.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Timeframe selector */}
          <div className="flex bg-gray-50 dark:bg-navy-950 p-1 rounded-xl border border-gray-200/50">
            {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-wider transition cursor-pointer ${
                  timeframe === t
                    ? 'bg-white dark:bg-navy-800 text-gold-500 shadow-sm border border-gray-200'
                    : 'text-gray-400 hover:text-navy-900 dark:hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            onClick={exportCsvReport}
            className="px-3.5 py-2 bg-navy-950 hover:bg-gold-500 text-white hover:text-navy-950 border border-navy-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
        </div>
      </div>

      {/* Financial metrics summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Card 1: Revenue */}
        <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider block">Total Revenue</span>
          <h3 className="font-display font-black text-2xl text-navy-900 dark:text-white leading-none">
            Rs. {metrics.revenue}
          </h3>
          <span className="text-[9.5px] text-emerald-500 font-semibold flex items-center gap-0.5">
            <ArrowUpRight className="w-3.5 h-3.5" /> +14.8% YoY
          </span>
        </div>

        {/* Card 2: Conversion Rate */}
        <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider block">Conversion Rate</span>
          <h3 className="font-display font-black text-2xl text-navy-900 dark:text-white leading-none">
            {metrics.conversionRate}%
          </h3>
          <span className="text-[9.5px] text-emerald-500 font-semibold flex items-center gap-0.5">
            <ArrowUpRight className="w-3.5 h-3.5" /> +0.4% MoM
          </span>
        </div>

        {/* Card 3: Gross Profit */}
        <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider block">Gross Profit</span>
          <h3 className="font-display font-black text-2xl text-navy-900 dark:text-white leading-none">
            Rs. {metrics.grossProfit}
          </h3>
          <span className="text-[9.5px] text-emerald-500 font-semibold flex items-center gap-0.5">
            <ArrowUpRight className="w-3.5 h-3.5" /> 45% Margin
          </span>
        </div>

        {/* Card 4: Net Profit */}
        <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider block">Net Profit</span>
          <h3 className="font-display font-black text-2xl text-navy-900 dark:text-white leading-none">
            Rs. {metrics.netProfit}
          </h3>
          <span className="text-[9.5px] text-emerald-500 font-semibold flex items-center gap-0.5">
            <ArrowUpRight className="w-3.5 h-3.5" /> 36.8% Net Margin
          </span>
        </div>

      </div>

      {/* SVG Bar Chart & Customer Acquisition stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Monthly Revenue Bar Chart */}
        <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-6 shadow-sm lg:col-span-2 space-y-4">
          <h4 className="font-display font-bold text-xs uppercase tracking-wider text-navy-900 dark:text-navy-50 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#C5A021]" /> Revenue Growth Chart (Monthly)
          </h4>
          
          <div className="h-44 w-full flex items-end">
            <svg viewBox="0 0 400 120" className="w-full h-full text-indigo-500">
              <rect x="20" y="80" width="22" height="40" rx="3" className="fill-[#C5A021]/80 hover:fill-[#C5A021] transition duration-300" />
              <rect x="60" y="70" width="22" height="50" rx="3" className="fill-[#C5A021]/80 hover:fill-[#C5A021] transition" />
              <rect x="100" y="50" width="22" height="70" rx="3" className="fill-[#C5A021]/80 hover:fill-[#C5A021] transition" />
              <rect x="140" y="60" width="22" height="60" rx="3" className="fill-[#C5A021]/80 hover:fill-[#C5A021] transition" />
              <rect x="180" y="40" width="22" height="80" rx="3" className="fill-[#C5A021]/80 hover:fill-[#C5A021] transition" />
              <rect x="220" y="30" width="22" height="90" rx="3" className="fill-[#C5A021]/80 hover:fill-[#C5A021] transition" />
              <rect x="260" y="25" width="22" height="95" rx="3" className="fill-[#C5A021]/80 hover:fill-[#C5A021] transition" />
              <rect x="300" y="15" width="22" height="105" rx="3" className="fill-[#C5A021]/80 hover:fill-[#C5A021] transition" />
              <rect x="340" y="10" width="22" height="110" rx="3" className="fill-[#C5A021]/80 hover:fill-[#C5A021] transition" />
            </svg>
          </div>
          
          <div className="flex justify-between text-[9px] font-mono text-gray-400 uppercase tracking-widest pt-2">
            <span>Jan</span>
            <span>Mar</span>
            <span>May</span>
            <span>Jul</span>
            <span>Sep</span>
            <span>Nov</span>
          </div>
        </div>

        {/* Customer Acquisition demographics */}
        <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-6 shadow-sm space-y-4 text-xs">
          <h4 className="font-display font-bold text-xs uppercase tracking-wider text-navy-900 dark:text-navy-50">
            Customer Demographics
          </h4>
          <div className="space-y-4 pt-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">New Customers</span>
              <span className="font-bold text-navy-950 dark:text-white">{metrics.newCustomers}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Returning Customers</span>
              <span className="font-bold text-navy-950 dark:text-white">{metrics.returningCustomers}%</span>
            </div>
            
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Refund Rate</span>
                <span className="font-bold text-red-500">{metrics.refundRate}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Cancellation Rate</span>
                <span className="font-bold text-gray-500">{metrics.cancelRate}%</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Top vs Worst products list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Top Performing */}
        <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-6 shadow-sm space-y-3">
          <h4 className="font-display font-bold text-xs uppercase tracking-wider text-navy-900 dark:text-navy-50 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-emerald-500" /> Best Performing Crafts
          </h4>
          <div className="space-y-2.5">
            {topProducts.map((p, idx) => (
              <div key={p.id} className="flex items-center justify-between text-xs border-b border-gray-50 dark:border-navy-800 pb-2 last:border-0 last:pb-0">
                <div className="flex items-center gap-2 text-left">
                  <span className="w-5 h-5 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-[10px]">
                    #{idx + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-navy-900 dark:text-white leading-none">{p.name}</p>
                    <p className="text-[9px] text-gray-400 font-mono mt-0.5">{p.category}</p>
                  </div>
                </div>
                <span className="font-mono font-bold text-emerald-500">+{p.rating} Stars</span>
              </div>
            ))}
          </div>
        </div>

        {/* Worst Performing / Overstock alerts */}
        <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-6 shadow-sm space-y-3">
          <h4 className="font-display font-bold text-xs uppercase tracking-wider text-navy-900 dark:text-navy-50 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-500" /> Overstock / Worst Performing
          </h4>
          <div className="space-y-2.5">
            {worstProducts.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-xs border-b border-gray-50 dark:border-navy-800 pb-2 last:border-0 last:pb-0">
                <div className="text-left">
                  <p className="font-semibold text-navy-900 dark:text-white leading-none">{p.name}</p>
                  <p className="text-[9px] text-gray-400 font-mono mt-0.5">Stock level: {p.stock} units</p>
                </div>
                <span className="font-mono text-amber-500 font-semibold">Low velocity</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
