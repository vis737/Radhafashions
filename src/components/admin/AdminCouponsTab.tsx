import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Ticket,
  Plus,
  Trash2,
  Copy,
  AlertCircle,
  X,
  Calendar,
  CheckCircle2,
  XCircle,
  Activity,
  Search,
  Filter,
  CheckSquare,
  Square,
  AlertTriangle
} from 'lucide-react';
import { Coupon } from '../../types';

export interface AdminCouponsTabProps {
  coupons: Coupon[];
  onAddCoupon: (coupon: Coupon) => void;
  onDeleteCoupon: (code: string) => void;
  onLogActivity: (action: string, details: string) => void;
  addToast: (text: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  onBulkDeleteCoupons?: (codes: string[]) => void;
  onDeleteAllCoupons?: () => void;
}

export default function AdminCouponsTab({
  coupons,
  onAddCoupon,
  onDeleteCoupon,
  onLogActivity,
  addToast,
  onBulkDeleteCoupons,
  onDeleteAllCoupons
}: AdminCouponsTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCoupon, setNewCoupon] = useState<Partial<Coupon>>({
    code: '',
    type: 'percentage',
    value: 0,
    minimumCartValue: 0,
    usageLimit: 0,
    usageCount: 0,
    description: '',
    active: true,
    expiryDate: ''
  });
  const [codeError, setCodeError] = useState('');

  // Selection & Filtering
  const [selectedCoupons, setSelectedCoupons] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'expired'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'percentage' | 'flat'>('all');

  // Delete All Modal
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [deleteAllConfirmText, setDeleteAllConfirmText] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const totalCoupons = coupons.length;
  const activeCoupons = coupons.filter((c) => c.active && c.expiryDate >= today).length;
  const expiredCoupons = coupons.filter((c) => c.expiryDate < today).length;
  const totalRedemptions = coupons.reduce((sum, c) => sum + (c.usageCount || 0), 0);

  const validateCode = (code: string, isEditing: boolean = false) => {
    if (!code) return 'Code is required';
    if (code.length < 4 || code.length > 20) return 'Code must be 4-20 characters';
    if (!/^[a-zA-Z0-9-]+$/.test(code)) return 'Code must be alphanumeric and dashes only';
    
    // Check if code exists, but if we are editing/duplicating it might be different.
    // For this context we're just creating new coupons, so we check if it already exists exactly.
    if (coupons.some((c) => c.code.toLowerCase() === code.toLowerCase())) return 'Code already exists';
    return '';
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setNewCoupon({ ...newCoupon, code: val });
    if (val) {
      setCodeError(validateCode(val));
    } else {
      setCodeError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateCode(newCoupon.code || '');
    if (error) {
      setCodeError(error);
      return;
    }
    if (!newCoupon.expiryDate) {
      addToast('Expiry date is required', 'error');
      return;
    }

    const couponToAdd: Coupon = {
      code: newCoupon.code!,
      type: newCoupon.type as 'percentage' | 'flat',
      value: Number(newCoupon.value) || 0,
      expiryDate: newCoupon.expiryDate,
      usageLimit: Number(newCoupon.usageLimit) || 0,
      usageCount: 0,
      minimumCartValue: Number(newCoupon.minimumCartValue) || 0,
      description: newCoupon.description || '',
      active: newCoupon.active ?? true
    };

    onAddCoupon(couponToAdd);
    onLogActivity('Created Coupon', `Created coupon ${couponToAdd.code}`);
    addToast('Coupon created successfully', 'success');
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setNewCoupon({
      code: '',
      type: 'percentage',
      value: 0,
      minimumCartValue: 0,
      usageLimit: 0,
      usageCount: 0,
      description: '',
      active: true,
      expiryDate: ''
    });
    setCodeError('');
  };

  const handleDuplicate = (coupon: Coupon) => {
    const newCode = `${coupon.code}-COPY`.toUpperCase();
    setNewCoupon({
      ...coupon,
      code: newCode,
      usageCount: 0
    });
    setCodeError(validateCode(newCode));
    setIsModalOpen(true);
  };

  const handleDelete = (code: string) => {
    if (window.confirm(`Are you sure you want to delete coupon ${code}?`)) {
      onDeleteCoupon(code);
      onLogActivity('Deleted Coupon', `Deleted coupon ${code}`);
      addToast('Coupon deleted', 'info');
      setSelectedCoupons(prev => prev.filter(c => c !== code));
    }
  };

  const handleBulkDelete = () => {
    if (selectedCoupons.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedCoupons.length} selected coupons?`)) {
      if (onBulkDeleteCoupons) {
        onBulkDeleteCoupons(selectedCoupons);
      } else {
        selectedCoupons.forEach(code => onDeleteCoupon(code));
      }
      onLogActivity('Bulk Deleted Coupons', `Deleted ${selectedCoupons.length} coupons`);
      addToast(`Deleted ${selectedCoupons.length} coupons`, 'info');
      setSelectedCoupons([]);
    }
  };

  const handleDeleteExpired = () => {
    const expiredList = coupons.filter(c => c.expiryDate < today).map(c => c.code);
    if (expiredList.length === 0) {
      addToast('No expired coupons found', 'info');
      return;
    }
    if (window.confirm(`Are you sure you want to delete ${expiredList.length} expired coupons?`)) {
      if (onBulkDeleteCoupons) {
        onBulkDeleteCoupons(expiredList);
      } else {
        expiredList.forEach(code => onDeleteCoupon(code));
      }
      onLogActivity('Deleted Expired Coupons', `Deleted ${expiredList.length} expired coupons`);
      addToast(`Deleted ${expiredList.length} expired coupons`, 'info');
      setSelectedCoupons(prev => prev.filter(c => !expiredList.includes(c)));
    }
  };

  const handleDeleteAllConfirm = () => {
    if (deleteAllConfirmText === 'DELETE') {
      if (onDeleteAllCoupons) {
        onDeleteAllCoupons();
      } else if (onBulkDeleteCoupons) {
        onBulkDeleteCoupons(coupons.map(c => c.code));
      } else {
        coupons.forEach(c => onDeleteCoupon(c.code));
      }
      onLogActivity('Deleted All Coupons', 'Deleted all coupons in the system');
      addToast('All coupons have been deleted', 'success');
      setIsDeleteAllModalOpen(false);
      setDeleteAllConfirmText('');
      setSelectedCoupons([]);
    }
  };

  const toggleSelection = (code: string) => {
    setSelectedCoupons(prev => 
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const toggleSelectAll = () => {
    if (selectedCoupons.length === filteredCoupons.length) {
      setSelectedCoupons([]);
    } else {
      setSelectedCoupons(filteredCoupons.map(c => c.code));
    }
  };

  const filteredCoupons = useMemo(() => {
    return coupons.filter(coupon => {
      // Status
      const isExpired = coupon.expiryDate < today;
      if (statusFilter === 'active' && (!coupon.active || isExpired)) return false;
      if (statusFilter === 'inactive' && (coupon.active || isExpired)) return false;
      if (statusFilter === 'expired' && !isExpired) return false;

      // Type
      if (typeFilter !== 'all' && coupon.type !== typeFilter) return false;

      // Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!coupon.code.toLowerCase().includes(query) && !coupon.description?.toLowerCase().includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [coupons, statusFilter, typeFilter, searchQuery, today]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Discounts & Coupon Codes Workspace</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage store discounts, promotions, and track usage</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsDeleteAllModalOpen(true)}
            className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 px-4 py-2.5 rounded-3xl transition-colors font-medium shadow-sm"
          >
            <AlertTriangle size={18} />
            DELETE ALL
          </button>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-gray-900 hover:bg-pink-500 text-white px-5 py-2.5 rounded-3xl transition-colors font-medium shadow-sm hover:shadow-md"
          >
            <Plus size={20} />
            Create Coupon
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Ticket size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Coupons</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{totalCoupons}</h3>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{activeCoupons}</h3>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400">
              <AlertCircle size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Expired</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{expiredCoupons}</h3>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-pink-50 dark:bg-pink-900/20 flex items-center justify-center text-pink-600 dark:text-pink-400">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Redemptions</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{totalRedemptions}</h3>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Bulk Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {selectedCoupons.length > 0 ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-2xl">
                {selectedCoupons.length} selected
              </span>
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-900/20 dark:hover:bg-red-900/40 px-3 py-1.5 rounded-2xl transition-colors"
              >
                <Trash2 size={16} />
                Delete Selected
              </button>
            </div>
          ) : (
            <button
              onClick={handleDeleteExpired}
              className="flex items-center gap-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 dark:text-gray-300 dark:bg-gray-700/50 dark:hover:bg-gray-700 px-4 py-2 rounded-2xl transition-colors"
            >
              <Trash2 size={16} />
              Delete Expired
            </button>
          )}
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-center">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search coupons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-2xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-500/20 focus:border-gray-500 dark:focus:border-pink-500 outline-none text-sm transition-all"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none group">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full sm:w-auto pl-9 pr-8 py-2 rounded-2xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 text-sm focus:ring-2 focus:ring-gray-500/20 outline-none appearance-none cursor-pointer transition-all"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="expired">Expired</option>
              </select>
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="flex-1 sm:flex-none px-4 py-2 rounded-2xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 text-sm focus:ring-2 focus:ring-gray-500/20 outline-none cursor-pointer transition-all"
            >
              <option value="all">All Types</option>
              <option value="percentage">Percentage</option>
              <option value="flat">Flat Amount</option>
            </select>
          </div>
        </div>

      </div>

      {/* Coupons List */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {filteredCoupons.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <div className="w-24 h-24 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-300 dark:text-gray-500 mb-6">
              <Ticket size={48} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No coupons found</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
              {coupons.length === 0 
                ? "You haven't created any discount codes yet. Create your first coupon to start offering promotions."
                : "No coupons match your current filters. Try adjusting your search or filters to see more results."}
            </p>
            {coupons.length === 0 && (
              <button
                onClick={() => { resetForm(); setIsModalOpen(true); }}
                className="mt-8 flex items-center gap-2 text-white font-medium bg-gray-900 hover:bg-pink-500 px-6 py-3 rounded-full transition-colors shadow-sm"
              >
                <Plus size={18} />
                Create your first coupon
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-700/30 border-b border-gray-100 dark:border-gray-700">
                  <th className="p-4 w-12">
                    <button onClick={toggleSelectAll} className="text-gray-400 hover:text-gray-600 dark:hover:text-pink-400 transition-colors">
                      {selectedCoupons.length > 0 && selectedCoupons.length === filteredCoupons.length ? (
                        <CheckSquare size={20} className="text-gray-600 dark:text-pink-400" />
                      ) : (
                        <Square size={20} />
                      )}
                    </button>
                  </th>
                  <th className="p-4 font-semibold text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">Code</th>
                  <th className="p-4 font-semibold text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">Offer</th>
                  <th className="p-4 font-semibold text-sm text-gray-600 dark:text-gray-300 hidden lg:table-cell">Description</th>
                  <th className="p-4 font-semibold text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">Min. Cart</th>
                  <th className="p-4 font-semibold text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">Expiry</th>
                  <th className="p-4 font-semibold text-sm text-gray-600 dark:text-gray-300">Usage</th>
                  <th className="p-4 font-semibold text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">Status</th>
                  <th className="p-4 font-semibold text-sm text-gray-600 dark:text-gray-300 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredCoupons.map((coupon) => {
                  const isExpired = coupon.expiryDate < today;
                  const usagePercentage = coupon.usageLimit > 0 ? Math.min((coupon.usageCount / coupon.usageLimit) * 100, 100) : 0;
                  const isSelected = selectedCoupons.includes(coupon.code);

                  return (
                    <tr 
                      key={coupon.code} 
                      className={`transition-colors ${isSelected ? 'bg-gray-50/50 dark:bg-gray-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
                    >
                      <td className="p-4">
                        <button onClick={() => toggleSelection(coupon.code)} className="text-gray-400 hover:text-gray-600 dark:hover:text-pink-400 transition-colors">
                          {isSelected ? (
                            <CheckSquare size={20} className="text-gray-600 dark:text-pink-400" />
                          ) : (
                            <Square size={20} />
                          )}
                        </button>
                      </td>
                      <td className="p-4">
                        <span className="font-mono font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-lg text-sm">{coupon.code}</span>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-100 dark:border-blue-800/50">
                          {coupon.type === 'percentage' ? `${coupon.value}% Off` : `Rs.${coupon.value} Flat`}
                        </span>
                      </td>
                      <td className="p-4 hidden lg:table-cell text-sm text-gray-500 dark:text-gray-400 max-w-[200px] truncate" title={coupon.description}>
                        {coupon.description || '-'}
                      </td>
                      <td className="p-4 text-sm font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">
                        {coupon.minimumCartValue > 0 ? `Rs. ${coupon.minimumCartValue}` : 'None'}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <div className={`flex items-center gap-2 text-sm font-medium ${isExpired ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-300'}`}>
                          <Calendar size={14} className={isExpired ? 'text-red-500' : 'text-gray-400'} />
                          {new Date(coupon.expiryDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-4 min-w-[150px]">
                        {coupon.usageLimit > 0 ? (
                          <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between text-xs font-medium text-gray-500 dark:text-gray-400">
                              <span>{coupon.usageCount} used</span>
                              <span>{coupon.usageLimit} max</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all ${usagePercentage >= 100 ? 'bg-red-500' : 'bg-emerald-500'}`}
                                style={{ width: `${usagePercentage}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{coupon.usageCount} used (∞)</span>
                        )}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        {coupon.active && !isExpired ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Active
                          </span>
                        ) : isExpired ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-100 dark:border-red-800/50">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            Expired
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleDuplicate(coupon)}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-pink-400 hover:bg-gray-50 dark:hover:bg-gray-900/30 rounded-xl transition-all"
                            title="Duplicate"
                          >
                            <Copy size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(coupon.code)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete All Modal */}
      <AnimatePresence>
        {isDeleteAllModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
              onClick={() => setIsDeleteAllModalOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col p-8 text-center"
            >
              <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={40} />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Delete All Coupons?
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                This action is extremely dangerous. It will permanently delete every single coupon in the system. This cannot be undone.
              </p>
              
              <div className="space-y-4 text-left">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 text-center">
                  Type <span className="text-red-500 font-mono font-bold bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  value={deleteAllConfirmText}
                  onChange={(e) => setDeleteAllConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full px-4 py-3 text-center rounded-2xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all font-mono font-bold"
                />
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => {
                    setIsDeleteAllModalOpen(false);
                    setDeleteAllConfirmText('');
                  }}
                  className="flex-1 px-5 py-3 rounded-2xl text-gray-700 dark:text-gray-300 font-bold bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAllConfirm}
                  disabled={deleteAllConfirmText !== 'DELETE'}
                  className="flex-1 px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/30"
                >
                  Delete All
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Ticket className="text-pink-500" />
                  {newCoupon.code && newCoupon.code.endsWith('-COPY') ? 'Duplicate Coupon' : 'Create New Coupon'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <form id="coupon-form" onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Code */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Coupon Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newCoupon.code}
                        onChange={handleCodeChange}
                        placeholder="e.g. SUMMER2024"
                        className={`w-full px-4 py-3 rounded-2xl border ${codeError ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-gray-600 focus:border-gray-500 dark:focus:border-pink-500 focus:ring-2 focus:ring-gray-500/20'} bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none transition-all font-mono uppercase`}
                        maxLength={30}
                        required
                      />
                      {codeError && <p className="text-xs font-medium text-red-500 flex items-center gap-1"><XCircle size={12}/>{codeError}</p>}
                      <p className="text-xs text-gray-500">Alphanumeric characters and dashes only.</p>
                    </div>

                    {/* Expiry Date */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Expiry Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={newCoupon.expiryDate}
                        onChange={(e) => setNewCoupon({ ...newCoupon, expiryDate: e.target.value })}
                        min={today}
                        className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:border-gray-500 dark:focus:border-pink-500 focus:ring-2 focus:ring-gray-500/20 outline-none transition-all"
                        required
                      />
                    </div>

                    {/* Discount Type */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Discount Type
                      </label>
                      <select
                        value={newCoupon.type}
                        onChange={(e) => setNewCoupon({ ...newCoupon, type: e.target.value as 'percentage' | 'flat' })}
                        className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:border-gray-500 dark:focus:border-pink-500 focus:ring-2 focus:ring-gray-500/20 outline-none transition-all cursor-pointer"
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="flat">Flat Amount (Rs.)</option>
                      </select>
                    </div>

                    {/* Discount Value */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Discount Value <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">
                          {newCoupon.type === 'percentage' ? '%' : 'Rs.'}
                        </span>
                        <input
                          type="number"
                          value={newCoupon.value || ''}
                          onChange={(e) => setNewCoupon({ ...newCoupon, value: parseFloat(e.target.value) })}
                          min="0"
                          step={newCoupon.type === 'percentage' ? "1" : "0.01"}
                          max={newCoupon.type === 'percentage' ? "100" : undefined}
                          className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:border-gray-500 dark:focus:border-pink-500 focus:ring-2 focus:ring-gray-500/20 outline-none transition-all"
                          required
                        />
                      </div>
                    </div>

                    {/* Minimum Cart Value */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Minimum Cart Value
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">Rs.</span>
                        <input
                          type="number"
                          value={newCoupon.minimumCartValue || ''}
                          onChange={(e) => setNewCoupon({ ...newCoupon, minimumCartValue: parseFloat(e.target.value) })}
                          min="0"
                          placeholder="0 for no minimum"
                          className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:border-gray-500 dark:focus:border-pink-500 focus:ring-2 focus:ring-gray-500/20 outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Usage Limit */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Usage Limit
                      </label>
                      <input
                        type="number"
                        value={newCoupon.usageLimit || ''}
                        onChange={(e) => setNewCoupon({ ...newCoupon, usageLimit: parseInt(e.target.value, 10) })}
                        min="0"
                        placeholder="0 for unlimited"
                        className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:border-gray-500 dark:focus:border-pink-500 focus:ring-2 focus:ring-gray-500/20 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Description
                    </label>
                    <input
                      type="text"
                      value={newCoupon.description || ''}
                      onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                      placeholder="Internal note or customer-facing description..."
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:border-gray-500 dark:focus:border-pink-500 focus:ring-2 focus:ring-gray-500/20 outline-none transition-all"
                    />
                  </div>

                  {/* Active Toggle */}
                  <div className="flex items-center justify-between p-5 border border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-700/30">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Active Status</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Enable or disable this coupon immediately</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNewCoupon({ ...newCoupon, active: !newCoupon.active })}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${newCoupon.active ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-sm transition-transform ${newCoupon.active ? 'translate-x-7' : 'translate-x-1'}`}
                      />
                    </button>
                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/80 flex justify-end gap-3 sticky bottom-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 rounded-2xl text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="coupon-form"
                  disabled={!!codeError || !newCoupon.code || !newCoupon.expiryDate}
                  className="px-6 py-2.5 rounded-2xl bg-gray-900 hover:bg-pink-500 text-white font-medium shadow-sm hover:shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {newCoupon.code && newCoupon.code.endsWith('-COPY') ? 'Duplicate Coupon' : 'Create Coupon'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
