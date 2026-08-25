import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Eye, ShoppingBag, CreditCard, Sparkles, MapPin, Monitor, Smartphone, Compass, Clock } from 'lucide-react';

interface LiveSession {
  ip: string;
  type: 'guest' | 'admin' | 'user';
  name?: string;
  activePage: string;
  cartTotal: number;
  durationSeconds: number;
}

interface LiveAlert {
  id: string;
  type: 'visitor' | 'login' | 'cart' | 'payment' | 'order' | 'low-stock';
  message: string;
  timestamp: string;
}

export default function AdminLiveMonitor() {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [alerts, setAlerts] = useState<LiveAlert[]>([]);
  const [historyTraffic, setHistoryTraffic] = useState<number[]>([12, 14, 18, 15, 22, 24, 28, 26, 31, 35]);
  const [liveRevenue, setLiveRevenue] = useState(14850);
  const [stats, setStats] = useState({
    activeVisitors: 35,
    todayVisitors: 1240,
    todayOrders: 28,
    avgSessionMinutes: 8.5,
    abandonedCount: 14,
    newUsers: 18,
    returningUsers: 42
  });

  // Pull live metrics every 5 seconds
  useEffect(() => {
    const fetchLiveStats = async () => {
      try {
        const res = await fetch('/api/admin/live-activity');
        if (res.ok) {
          const data = await res.json();
          if (data.sessions) setSessions(data.sessions);
          if (data.alerts) setAlerts(data.alerts);
          if (data.stats) setStats(data.stats);
          if (data.liveRevenue) setLiveRevenue(data.liveRevenue);
          setHistoryTraffic((prev) => [...prev.slice(1), data.stats.activeVisitors || 35]);
        } else {
          console.warn('Live monitor backend offline. Waiting for reconnection...');
        }
      } catch (err) {
        console.warn('Live monitor fetch error:', err);
      }
    };

    fetchLiveStats();
    const interval = setInterval(fetchLiveStats, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 text-left font-sans select-none">
      
      {/* Dynamic Summary Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Card 1: Active Visitors */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Live Visitors</span>
            <h3 className="font-display font-black text-2xl text-gray-900 dark:text-white leading-none">
              {stats.activeVisitors}
            </h3>
            <span className="text-[9px] text-emerald-500 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
              Active Now
            </span>
          </div>
          <div className="w-11 h-11 bg-indigo-50 dark:bg-gray-950 text-indigo-500 rounded-2xl flex items-center justify-center">
            <Users className="w-5.5 h-5.5" />
          </div>
        </div>

        {/* Card 2: Today's Orders */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Today's Orders</span>
            <h3 className="font-display font-black text-2xl text-gray-900 dark:text-white leading-none">
              {stats.todayOrders}
            </h3>
            <span className="text-[9px] text-[#D4648A] font-semibold">
              +12% vs Yesterday
            </span>
          </div>
          <div className="w-11 h-11 bg-pink-50 dark:bg-gray-950 text-[#D4648A] rounded-2xl flex items-center justify-center">
            <ShoppingBag className="w-5.5 h-5.5" />
          </div>
        </div>

        {/* Card 3: Today's Revenue */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Live Revenue</span>
            <h3 className="font-display font-black text-xl text-gray-900 dark:text-white leading-none">
              Rs. {liveRevenue}
            </h3>
            <span className="text-[9px] text-emerald-500 font-semibold">
              Real-time update
            </span>
          </div>
          <div className="w-11 h-11 bg-emerald-50 dark:bg-gray-950 text-emerald-500 rounded-2xl flex items-center justify-center">
            <CreditCard className="w-5.5 h-5.5" />
          </div>
        </div>

        {/* Card 4: Average Session */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Avg Session</span>
            <h3 className="font-display font-black text-2xl text-gray-900 dark:text-white leading-none">
              {stats.avgSessionMinutes}m
            </h3>
            <span className="text-[9px] text-gray-400">
              Session duration
            </span>
          </div>
          <div className="w-11 h-11 bg-sky-50 dark:bg-gray-950 text-sky-500 rounded-2xl flex items-center justify-center">
            <Clock className="w-5.5 h-5.5" />
          </div>
        </div>

      </div>

      {/* Traffic Trend Chart & Category Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Interactive SVG Traffic Line Chart */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm lg:col-span-2 space-y-4">
          <h4 className="font-display font-bold text-xs uppercase tracking-wider text-gray-900 dark:text-gray-50 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#D4648A]" /> Live Traffic Monitor Trend
          </h4>
          
          <div className="h-48 w-full flex items-end">
            <svg viewBox="0 0 400 120" className="w-full h-full text-[#D4648A]">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D4648A" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#D4648A" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="0" y1="30" x2="400" y2="30" stroke="#f1f5f9" strokeWidth="0.5" className="dark:stroke-gray-800" />
              <line x1="0" y1="60" x2="400" y2="60" stroke="#f1f5f9" strokeWidth="0.5" className="dark:stroke-gray-800" />
              <line x1="0" y1="90" x2="400" y2="90" stroke="#f1f5f9" strokeWidth="0.5" className="dark:stroke-gray-800" />
              
              {/* Area path */}
              <path
                d={`M 0 120 
                    ${historyTraffic.map((val, idx) => `L ${idx * 40} ${120 - val * 2.5}`).join(' ')} 
                    L 360 120 Z`}
                fill="url(#chartGrad)"
              />
              {/* Line path */}
              <path
                d={historyTraffic.map((val, idx) => `${idx === 0 ? 'M' : 'L'} ${idx * 40} ${120 - val * 2.5}`).join(' ')}
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              />
              {/* Dot indicators */}
              {historyTraffic.map((val, idx) => (
                <circle
                  key={idx}
                  cx={idx * 40}
                  cy={120 - val * 2.5}
                  r="3.5"
                  className="fill-white dark:fill-gray-900 stroke-[#D4648A] stroke-2"
                />
              ))}
            </svg>
          </div>
        </div>

        {/* Categories Heatmap */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h4 className="font-display font-bold text-xs uppercase tracking-wider text-gray-900 dark:text-gray-50">
            Active Category Heatmap
          </h4>
          <div className="space-y-3 pt-2 text-xs">
            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold">
                <span>Sarees & Lehengas</span>
                <span>45%</span>
              </div>
              <div className="w-full bg-gray-150 dark:bg-gray-950 h-2 rounded-full overflow-hidden">
                <div className="bg-pink-500 h-full rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold">
                <span>Kurtis & Salwar Suits</span>
                <span>28%</span>
              </div>
              <div className="w-full bg-gray-150 dark:bg-gray-950 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-600 h-full rounded-full" style={{ width: '28%' }}></div>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold">
                <span>Handbags & Clutches</span>
                <span>15%</span>
              </div>
              <div className="w-full bg-gray-150 dark:bg-gray-950 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: '15%' }}></div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Online Users List & Live Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Session List Table */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm lg:col-span-2 space-y-4 overflow-x-auto">
          <h4 className="font-display font-bold text-xs uppercase tracking-wider text-gray-900 dark:text-gray-50">
            Active Sessions Listing
          </h4>
          <table className="w-full text-xs font-sans text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-50 dark:border-gray-800 text-gray-400 font-semibold">
                <th className="pb-3">User IP / Identity</th>
                <th className="pb-3">Active Page</th>
                <th className="pb-3 text-right">Cart total</th>
                <th className="pb-3 text-right">Duration</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s, index) => (
                <tr key={index} className="border-b border-gray-50 dark:border-gray-800/40 last:border-b-0">
                  <td className="py-3 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${s.type === 'guest' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white leading-none">
                        {s.name || s.ip}
                      </p>
                      <p className="text-[9px] text-gray-400 font-mono mt-0.5 uppercase tracking-wide">{s.type}</p>
                    </div>
                  </td>
                  <td className="py-3 text-gray-500 dark:text-gray-500">
                    <span className="font-mono bg-gray-50 dark:bg-gray-950 px-2 py-1 rounded border border-gray-200/40 dark:border-gray-800/40">{s.activePage}</span>
                  </td>
                  <td className="py-3 text-right font-mono font-semibold">Rs. {s.cartTotal}</td>
                  <td className="py-3 text-right text-gray-400 font-mono">{s.durationSeconds}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Live Alerts Feed */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h4 className="font-display font-bold text-xs uppercase tracking-wider text-gray-900 dark:text-gray-50">
            Live Stream Feed
          </h4>
          <div className="space-y-3 max-h-64 overflow-y-auto no-scrollbar">
            <AnimatePresence>
              {alerts.map((a) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-3 bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-200/40 dark:border-gray-800/40 text-[11px] leading-normal flex items-start gap-2.5 text-left"
                >
                  <div className="w-6 h-6 rounded-lg bg-[#D4648A]/15 text-[#D4648A] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Compass className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-0.5 flex-1">
                    <p className="text-gray-700 dark:text-gray-200">{a.message}</p>
                    <span className="text-[9px] text-gray-400 font-mono block">{a.timestamp}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

      </div>

    </div>
  );
}
