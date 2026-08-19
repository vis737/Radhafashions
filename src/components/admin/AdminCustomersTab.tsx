import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Mail, Eye, X, Users, Star, Award, TrendingUp, Calendar, ShoppingBag, Phone, MapPin, Filter, ArrowDownUp } from 'lucide-react';
import { Order } from '../../types';

interface AdminCustomersTabProps {
  orders: Order[];
  onLogActivity: (action: string, details: string) => void;
  addToast: (text: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

interface Customer {
  id: string;
  clerkId?: string | null;
  name: string;
  email: string;
  phone: string;
  address: string;
  imageUrl?: string;
  authProvider?: string;
  createdAt?: string | null;
  lastSignInAt?: string | null;
  ordersCount: number;
  totalSpent: number;
  lastOrderDate: string | null;
  tier: 'Platinum' | 'Gold' | 'Silver' | 'Bronze';
  customerOrders: Order[];
}

const SEED_CUSTOMERS = [
  { name: 'Alok Sharma', email: 'aloksharma@gmail.com', phone: '+91 98765 43210', address: 'B-102, Saket, New Delhi' },
  { name: 'Nisha Krishnan', email: 'nisha.k@yahoo.com', phone: '+91 98123 45678', address: 'Flat 4C, Royal Palm Apartments, Chennai' },
  { name: 'Rohan Advani', email: 'rohan.advani@hotmail.com', phone: '+91 97654 32109', address: '22, Hill Road, Bandra, Mumbai' }
];

export default function AdminCustomersTab({ orders, onLogActivity, addToast }: AdminCustomersTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('All');
  const [sortOption, setSortOption] = useState<string>('Spent desc');
  
  const [dbCustomers, setDbCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  React.useEffect(() => {
    fetch('/api/customers')
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data)) setDbCustomers(data);
      })
      .catch(() => {});
  }, []);

  // Compute customers portfolio
  const customers = useMemo(() => {
    const customerMap = new Map<string, Customer>();

    // 1. Load Supabase / Clerk synced customers first
    dbCustomers.forEach(dbc => {
      const emailKey = (dbc.email || '').toLowerCase();
      if (!emailKey) return;
      customerMap.set(emailKey, {
        id: dbc.id || emailKey,
        clerkId: dbc.clerkId || dbc.clerk_id || null,
        name: dbc.name || emailKey.split('@')[0],
        email: emailKey,
        phone: dbc.phone || 'N/A',
        address: 'Registered User Account',
        imageUrl: dbc.imageUrl || dbc.image_url || '',
        authProvider: dbc.authProvider || dbc.auth_provider || 'clerk',
        createdAt: dbc.createdAt || dbc.created_at || null,
        lastSignInAt: dbc.lastSignInAt || dbc.last_sign_in_at || null,
        ordersCount: dbc.ordersCount || 0,
        totalSpent: dbc.totalSpent || 0,
        lastOrderDate: dbc.lastOrderDate || null,
        tier: dbc.tier || 'Bronze',
        customerOrders: []
      });
    });

    // 2. Initialize with seed customers if not already present
    SEED_CUSTOMERS.forEach(seed => {
      const emailKey = seed.email.toLowerCase();
      if (!customerMap.has(emailKey)) {
        customerMap.set(emailKey, {
          id: seed.email,
          ...seed,
          ordersCount: 0,
          totalSpent: 0,
          lastOrderDate: null,
          tier: 'Bronze',
          customerOrders: []
        });
      }
    });

    // 3. Merge with placed orders
    orders.forEach(order => {
      const email = (order.accountEmail || order.customerInfo?.email || (order as any).email || '').toLowerCase();
      if (!email) return;

      const name = order.customerInfo?.name || (order as any).customerName || 'Unknown Customer';
      const phone = order.customerInfo?.phone || (order as any).phone || 'N/A';
      const address = (order as any).shippingAddress ? `${(order as any).shippingAddress.addressLine1 || ''} ${(order as any).shippingAddress.city || ''}` : (order.customerInfo?.address || 'N/A');
      
      const total = typeof order.total === 'number' ? order.total : 0;
      const dateStr = order.date || new Date().toISOString();

      if (!customerMap.has(email)) {
        customerMap.set(email, {
          id: email,
          name,
          email,
          phone,
          address,
          ordersCount: 0,
          totalSpent: 0,
          lastOrderDate: dateStr,
          tier: 'Bronze',
          customerOrders: []
        });
      }

      const cust = customerMap.get(email)!;
      // Only count order if not already in customerOrders
      if (!cust.customerOrders.some(o => o.orderNumber === order.orderNumber || o.id === order.id)) {
        cust.customerOrders.push(order);
        cust.ordersCount = Math.max(cust.ordersCount, cust.customerOrders.length);
        cust.totalSpent = cust.customerOrders.reduce((sum, o) => sum + (o.total || 0), 0);
      }
      
      if (!cust.lastOrderDate || new Date(dateStr) > new Date(cust.lastOrderDate)) {
        cust.lastOrderDate = dateStr;
      }
    });

    // Determine tiers
    return Array.from(customerMap.values()).map(cust => {
      if (cust.ordersCount >= 8 || cust.totalSpent >= 10000) cust.tier = 'Platinum';
      else if (cust.ordersCount >= 4 || cust.totalSpent >= 4000) cust.tier = 'Gold';
      else if (cust.ordersCount >= 1) cust.tier = 'Silver';
      else cust.tier = 'Bronze';
      
      // Sort their orders newest first
      cust.customerOrders.sort((a, b) => {
        const dateA = new Date((a as any).date || 0).getTime();
        const dateB = new Date((b as any).date || 0).getTime();
        return dateB - dateA;
      });

      return cust;
    });
  }, [orders, dbCustomers]);

  // Statistics
  const totalCustomers = customers.length;
  const vipCount = customers.filter(c => c.tier === 'Platinum' || c.tier === 'Gold').length;
  const activeCount = customers.filter(c => c.tier !== 'Bronze').length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const avgLTV = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

  // Filter and sort
  const filteredCustomers = useMemo(() => {
    let result = customers;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.email.toLowerCase().includes(q) || 
        c.phone.includes(q)
      );
    }

    if (tierFilter !== 'All') {
      result = result.filter(c => c.tier === tierFilter);
    }

    result.sort((a, b) => {
      if (sortOption === 'Spent desc') return b.totalSpent - a.totalSpent;
      if (sortOption === 'Orders desc') return b.ordersCount - a.ordersCount;
      if (sortOption === 'Name asc') return a.name.localeCompare(b.name);
      return 0;
    });

    return result;
  }, [customers, searchTerm, tierFilter, sortOption]);

  const handleViewOrders = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
    onLogActivity('View Customer Orders', `Viewed order history for ${customer.email}`);
  };

  const getTierClasses = (tier: string) => {
    switch (tier) {
      case 'Platinum': return 'bg-purple-100 text-purple-800';
      case 'Gold': return 'bg-amber-100 text-amber-700 border border-amber-300';
      case 'Silver': return 'bg-gray-100 text-gray-700';
      case 'Bronze': return 'bg-orange-50 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };
  
  const getStatusBadgeClasses = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('delivered') || s.includes('completed')) return 'bg-green-100 text-green-700';
    if (s.includes('processing') || s.includes('shipped')) return 'bg-blue-100 text-blue-700';
    if (s.includes('cancelled') || s.includes('failed')) return 'bg-red-100 text-red-700';
    return 'bg-amber-100 text-amber-700';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0B1B3D] flex items-center gap-3">
            Customer Portfolios CRM Workspace
            <span className="bg-[#D4648A] text-white text-xs px-2.5 py-1 rounded-full font-medium">
              {totalCustomers}
            </span>
          </h2>
          <p className="text-sm text-gray-500 mt-1">Manage customer relationships and track lifecycle value.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Customers</p>
            <p className="text-2xl font-bold text-[#0B1B3D]">{totalCustomers}</p>
          </div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">VIP (Plat+Gold)</p>
            <p className="text-2xl font-bold text-[#0B1B3D]">{vipCount}</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Active (Silver+)</p>
            <p className="text-2xl font-bold text-[#0B1B3D]">{activeCount}</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#D4648A]/10 flex items-center justify-center text-[#D4648A] shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Avg LTV</p>
            <p className="text-2xl font-bold text-[#0B1B3D]">₹{avgLTV.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
          </div>
        </motion.div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#0B1B3D]/20 outline-none text-sm transition-all"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="pl-9 pr-8 py-2.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#0B1B3D]/20 outline-none text-sm appearance-none cursor-pointer"
            >
              <option value="All">All Tiers</option>
              <option value="Platinum">Platinum</option>
              <option value="Gold">Gold</option>
              <option value="Silver">Silver</option>
              <option value="Bronze">Bronze</option>
            </select>
          </div>
          
          <div className="relative">
            <ArrowDownUp className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="pl-9 pr-8 py-2.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#0B1B3D]/20 outline-none text-sm appearance-none cursor-pointer"
            >
              <option value="Spent desc">Sort: Spent (High to Low)</option>
              <option value="Orders desc">Sort: Orders (High to Low)</option>
              <option value="Name asc">Sort: Name (A to Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customer Grid */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-gray-100 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Users className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Customers Found</h3>
          <p className="text-gray-500 max-w-sm">
            We couldn't find any customers matching your search and filter criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredCustomers.map((customer) => (
              <motion.div
                key={customer.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden"
              >
                {/* Decorative blob */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#0B1B3D]/5 to-[#D4648A]/5 rounded-bl-full -z-0" />
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {customer.imageUrl ? (
                        <img
                          src={customer.imageUrl}
                          alt={customer.name}
                          className="w-10 h-10 rounded-full object-cover border border-[#D4648A]/30 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-[#D4648A]/10 text-[#D4648A] rounded-full flex items-center justify-center font-bold text-lg shrink-0">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-[#0B1B3D] leading-tight truncate max-w-[140px] sm:max-w-[180px]">
                          {customer.name}
                        </h4>
                        <p className="text-xs text-gray-500 font-mono mt-0.5 truncate max-w-[140px] sm:max-w-[180px]">
                          {customer.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium ${getTierClasses(customer.tier)}`}>
                        {customer.tier}
                      </span>
                      {customer.authProvider && (
                        <span className={`text-[9px] px-2 py-0.5 rounded-md font-mono uppercase font-bold tracking-wider ${
                          customer.authProvider.toLowerCase().includes('google')
                            ? 'bg-blue-50 text-blue-600 border border-blue-200'
                            : customer.authProvider.toLowerCase().includes('apple')
                              ? 'bg-white dark:bg-gray-900 text-white'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {customer.authProvider.toLowerCase().includes('google') ? 'Google ID' : customer.authProvider.toLowerCase().includes('apple') ? 'Apple ID' : 'Clerk Auth'}
                        </span>
                      )}
                    </div>
                  </div>
                  {customer.clerkId && (
                    <div className="mb-3 px-2.5 py-1 bg-gray-50 dark:bg-gray-950 rounded-lg text-[10px] text-gray-400 dark:text-gray-500 font-mono flex items-center gap-1 border border-gray-200/60 dark:border-gray-800/60">
                      <span className="font-bold text-gray-700">Clerk ID:</span>
                      <span className="truncate">{customer.clerkId}</span>
                    </div>
                  )}

                  <div className="space-y-1.5 mb-5">
                    <div className="flex items-start gap-2 text-[10px] text-gray-500">
                      <Phone className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span className="truncate">{customer.phone}</span>
                    </div>
                    <div className="flex items-start gap-2 text-[10px] text-gray-500">
                      <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span className="line-clamp-2 leading-snug">{customer.address}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4 bg-gray-50 rounded-2xl p-3">
                    <div>
                      <p className="text-[10px] text-gray-500 font-medium uppercase mb-0.5 flex items-center gap-1">
                        <ShoppingBag className="w-3 h-3" /> Orders
                      </p>
                      <p className="text-lg font-bold text-[#0B1B3D]">{customer.ordersCount}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-medium uppercase mb-0.5 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> Spent
                      </p>
                      <p className="text-lg font-bold text-[#D4648A]">
                        ₹{customer.totalSpent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                  </div>

                  {customer.lastOrderDate && (
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mb-5">
                      <Calendar className="w-3 h-3" />
                      <span>Last order: {new Date(customer.lastOrderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleViewOrders(customer)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-[#0B1B3D] hover:bg-[#162a5c] text-white rounded-xl text-sm font-medium transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View Orders
                    </button>
                    <a
                      href={`mailto:${customer.email}`}
                      className="flex items-center justify-center w-9 h-9 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors shrink-0"
                      title="Send Email"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* View Orders Modal */}
      <AnimatePresence>
        {isModalOpen && selectedCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-[#0B1B3D]/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#0B1B3D] text-white rounded-full flex items-center justify-center font-bold text-xl">
                    {selectedCustomer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#0B1B3D]">{selectedCustomer.name}'s Orders</h3>
                    <p className="text-sm text-gray-500">{selectedCustomer.email} • {selectedCustomer.tier} Member</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto custom-scrollbar">
                {selectedCustomer.customerOrders.length === 0 ? (
                  <div className="text-center py-10">
                    <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No orders found for this customer.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-100 text-xs uppercase text-gray-500 tracking-wider">
                          <th className="pb-3 font-medium">Date</th>
                          <th className="pb-3 font-medium">Order #</th>
                          <th className="pb-3 font-medium">Items</th>
                          <th className="pb-3 font-medium">Total</th>
                          <th className="pb-3 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 text-sm">
                        {selectedCustomer.customerOrders.map((order, idx) => {
                          const date = (order as any).createdAt || (order as any).date;
                          const orderId = order.id || `ORD-${Math.floor(Math.random()*10000)}`;
                          const itemsCount = order.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || order.items?.length || 0;
                          const total = typeof order.total === 'number' ? order.total : ((order as any).totalAmount || 0);
                          const status = order.status || 'Completed';

                          return (
                            <tr key={orderId + idx} className="hover:bg-gray-50/50 transition-colors">
                              <td className="py-4 whitespace-nowrap text-gray-600">
                                {date ? new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                              </td>
                              <td className="py-4 whitespace-nowrap font-mono text-[#0B1B3D] font-medium">
                                {orderId.length > 10 ? `${orderId.substring(0, 8)}...` : orderId}
                              </td>
                              <td className="py-4 whitespace-nowrap text-gray-600">
                                {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
                              </td>
                              <td className="py-4 whitespace-nowrap font-medium text-[#D4648A]">
                                ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="py-4 whitespace-nowrap">
                                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusBadgeClasses(status)}`}>
                                  {status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
