import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Download, 
  FileText, 
  Search, 
  Eye, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Package
} from 'lucide-react';
import jsPDF from 'jspdf';
import { Order } from '../../types';

interface AdminOrdersTabProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
  onUpdatePaymentStatus?: (orderId: string, status: Order['paymentStatus'], reason?: string) => void;
  onDeleteOrder: (ordId: string, ordNum: string) => void;
  onLogActivity: (action: string, details: string) => void;
  addToast: (text: string, type?: 'success'|'error'|'warning'|'info') => void;
}

// Helper formatting functions
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

const AdminOrdersTab: React.FC<AdminOrdersTabProps> = ({
  orders,
  onUpdateOrderStatus,
  onUpdatePaymentStatus,
  onDeleteOrder,
  onLogActivity,
  addToast
}) => {
  // State
  const [activeTab, setActiveTab] = useState<'all' | 'pending_upi'>('all');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [rejectingUpiOrderId, setRejectingUpiOrderId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());

  // Derived Data
  const pendingUpiOrders = useMemo(() => 
    orders.filter(o => o.paymentMethod === 'upi' && o.paymentStatus === 'pending'),
  [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = 
        order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        order.customerInfo.name.toLowerCase().includes(search.toLowerCase()) ||
        order.customerInfo.email.toLowerCase().includes(search.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const matchesPayment = paymentFilter === 'all' || order.paymentStatus === paymentFilter;

      return matchesSearch && matchesStatus && matchesPayment;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [orders, search, statusFilter, paymentFilter]);

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredOrders, currentPage]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const stats = {
    total: orders.length,
    pendingUpi: pendingUpiOrders.length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  // Handlers
  const handleExportCSV = () => {
    try {
      const headers = ['Order Number', 'Date', 'Customer', 'Email', 'Total', 'Payment Status', 'Order Status'];
      const csvData = filteredOrders.map(o => [
        o.orderNumber,
        new Date(o.date).toLocaleDateString(),
        o.customerInfo.name,
        o.customerInfo.email,
        o.total.toString(),
        o.paymentStatus,
        o.status
      ]);
      
      const csvContent = [headers, ...csvData].map(e => e.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `orders_export_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      onLogActivity('Export Orders', `Exported ${filteredOrders.length} orders to CSV`);
      addToast('Orders exported successfully', 'success');
    } catch (err) {
      addToast('Failed to export orders', 'error');
    }
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      doc.text('Orders Export', 14, 15);
      
      let y = 30;
      filteredOrders.forEach((order, index) => {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.setFontSize(10);
        doc.text(`${order.orderNumber} | ${order.customerInfo.name} | Rs. ${order.total} | ${order.status}`, 14, y);
        y += 10;
      });
      
      doc.save(`orders_export_${new Date().toISOString().split('T')[0]}.pdf`);
      onLogActivity('Export Orders PDF', `Exported ${filteredOrders.length} orders to PDF`);
      addToast('PDF generated successfully', 'success');
    } catch (err) {
      addToast('Failed to generate PDF', 'error');
    }
  };

  const handleDelete = (id: string, num: string) => {
    if (window.confirm(`Are you sure you want to delete order ${num}? This cannot be undone.`)) {
      onDeleteOrder(id, num);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedOrderIds(new Set(paginatedOrders.map(o => o.id)));
    } else {
      setSelectedOrderIds(new Set());
    }
  };

  const handleSelectOrder = (id: string) => {
    const newSet = new Set(selectedOrderIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedOrderIds(newSet);
  };

  const handleApproveUpi = (orderId: string) => {
    if (onUpdatePaymentStatus) {
      onUpdatePaymentStatus(orderId, 'paid');
    }
    onUpdateOrderStatus(orderId, 'processing');
    addToast('UPI Payment Approved', 'success');
  };

  const handleRejectUpi = (orderId: string) => {
    if (!rejectReason.trim()) {
      addToast('Please provide a reason for rejection', 'error');
      return;
    }
    if (onUpdatePaymentStatus) {
      onUpdatePaymentStatus(orderId, 'rejected', rejectReason);
    }
    setRejectingUpiOrderId(null);
    setRejectReason('');
    addToast('UPI Payment Rejected', 'warning');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'delivered': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200 animate-pulse';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'unpaid': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Order Shipments Workspace</h2>
        <div className="flex gap-3">
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 transition-colors"
          >
            <Download size={18} />
            Export CSV
          </button>
          <button 
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors"
          >
            <FileText size={18} />
            Export PDF
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: stats.total, color: 'border-blue-500' },
          { label: 'Pending UPI', value: stats.pendingUpi, color: 'border-amber-500' },
          { label: 'Delivered', value: stats.delivered, color: 'border-emerald-500' },
          { label: 'Cancelled', value: stats.cancelled, color: 'border-red-500' },
        ].map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i} 
            className={`bg-white p-6 rounded-3xl shadow-sm border-b-4 ${stat.color}`}
          >
            <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
            <p className="text-3xl font-bold text-slate-800 mt-2">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Sub-tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => { setActiveTab('all'); setCurrentPage(1); }}
          className={`pb-4 text-sm font-medium transition-colors relative ${
            activeTab === 'all' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          All Shipments ({orders.length})
          {activeTab === 'all' && (
            <motion.div layoutId="orderTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
          )}
        </button>
        <button
          onClick={() => { setActiveTab('pending_upi'); setCurrentPage(1); }}
          className={`pb-4 text-sm font-medium transition-colors relative ${
            activeTab === 'pending_upi' ? 'text-amber-600' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Pending UPI Verification ({pendingUpiOrders.length})
          {activeTab === 'pending_upi' && (
            <motion.div layoutId="orderTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-600" />
          )}
        </button>
      </div>

      {activeTab === 'all' ? (
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          {/* Filters */}
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 bg-slate-50/50">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search orders, customers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div className="flex gap-4">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="all">All Payments</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-gray-50 dark:bg-navy-900/95 backdrop-blur z-10">
                <tr className="border-b border-gray-100 dark:border-navy-800 text-left text-xs tracking-wider uppercase text-gray-500 dark:text-gray-400">
                  <th className="p-4 font-medium w-12">
                    <input 
                      type="checkbox" 
                      checked={selectedOrderIds.size === paginatedOrders.length && paginatedOrders.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="p-4 font-medium">Order #</th>
                  <th className="p-4 font-medium">Customer</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Total</th>
                  <th className="p-4 font-medium">Payment</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {paginatedOrders.map(order => (
                    <motion.tr 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key={order.id} 
                      className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="p-4">
                        <input 
                          type="checkbox" 
                          checked={selectedOrderIds.has(order.id)}
                          onChange={() => handleSelectOrder(order.id)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="p-4 font-medium text-slate-800">{order.orderNumber}</td>
                      <td className="p-4">
                        <p className="text-slate-800">{order.customerInfo.name}</p>
                        <p className="text-xs text-slate-500">{order.customerInfo.email}</p>
                      </td>
                      <td className="p-4 text-slate-600 text-sm">{formatDate(order.date)}</td>
                      <td className="p-4 font-medium text-slate-800">{formatCurrency(order.total)}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getPaymentStatusColor(order.paymentStatus)}`}>
                          {order.paymentStatus.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4">
                        <select
                          value={order.status}
                          onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as Order['status'])}
                          className={`text-sm rounded-lg px-2 py-1 outline-none border focus:ring-2 focus:ring-blue-500/20 transition-all ${getStatusColor(order.status)}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => { setSelectedOrder(order); setIsModalOpen(true); }}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(order.id, order.orderNumber)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Order"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                
                {paginatedOrders.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-slate-500">
                      <Package className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                      <p className="text-lg font-medium text-slate-700">No orders found</p>
                      <p className="text-sm">Try adjusting your filters or search query.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-white">
              <p className="text-sm text-slate-500">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of {filteredOrders.length} entries
              </p>
              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={18} />
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-9 h-9 rounded-lg border text-sm font-medium transition-colors ${
                      currentPage === i + 1 
                        ? 'bg-slate-800 text-white border-slate-800' 
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {pendingUpiOrders.map(order => (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={order.id}
                className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-slate-800">{order.orderNumber}</h3>
                    <p className="text-sm text-slate-500">{formatDate(order.date)}</p>
                  </div>
                  <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium border border-amber-200 animate-pulse">
                    PENDING UPI
                  </span>
                </div>
                
                <div className="space-y-3 mb-6 bg-slate-50 p-4 rounded-2xl">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Customer</span>
                    <span className="font-medium text-slate-800">{order.customerInfo.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Amount</span>
                    <span className="font-medium text-slate-800">{formatCurrency(order.total)}</span>
                  </div>
                  {order.upiScreenshot && (
                    <div className="mt-4">
                      <p className="text-sm text-slate-500 mb-2">Screenshot attached</p>
                      <a href={order.upiScreenshot} target="_blank" rel="noreferrer" className="block relative group rounded-xl overflow-hidden border border-slate-200">
                        <img src={order.upiScreenshot} alt="UPI Screenshot" className="w-full h-32 object-cover" />
                        <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Eye className="text-white" />
                        </div>
                      </a>
                    </div>
                  )}
                </div>

                {rejectingUpiOrderId === order.id ? (
                  <div className="space-y-3">
                    <textarea 
                      placeholder="Reason for rejection..."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleRejectUpi(order.id)}
                        className="flex-1 bg-red-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-red-700 transition-colors"
                      >
                        Confirm Reject
                      </button>
                      <button 
                        onClick={() => setRejectingUpiOrderId(null)}
                        className="flex-1 bg-slate-100 text-slate-700 py-2 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleApproveUpi(order.id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors"
                    >
                      <CheckCircle size={16} /> Approve
                    </button>
                    <button 
                      onClick={() => setRejectingUpiOrderId(order.id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-white border border-red-200 text-red-600 py-2.5 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors"
                    >
                      <XCircle size={16} /> Reject
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {pendingUpiOrders.length === 0 && (
            <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-200 border-dashed">
              <CheckCircle className="mx-auto h-16 w-16 text-emerald-400 mb-4" />
              <h3 className="text-xl font-bold text-slate-800">All Caught Up!</h3>
              <p className="text-slate-500 mt-2">There are no pending UPI verifications right now.</p>
            </div>
          )}
        </div>
      )}

      {/* Order Detail Modal */}
      <AnimatePresence>
        {isModalOpen && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-800 text-white">
                <div>
                  <h3 className="text-xl font-bold">Order Details</h3>
                  <p className="text-slate-300 text-sm">{selectedOrder.orderNumber}</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-slate-700 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Customer Info */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">1</span>
                      Customer Details
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-slate-500 w-20 inline-block">Name:</span> <span className="font-medium text-slate-800">{selectedOrder.customerInfo.name}</span></p>
                      <p><span className="text-slate-500 w-20 inline-block">Email:</span> <span className="font-medium text-slate-800">{selectedOrder.customerInfo.email}</span></p>
                      <p><span className="text-slate-500 w-20 inline-block">Phone:</span> <span className="font-medium text-slate-800">{selectedOrder.customerInfo.phone}</span></p>
                      <div className="pt-2 mt-2 border-t border-slate-100">
                        <p className="text-slate-500 mb-1">Shipping Address:</p>
                        <p className="text-slate-800">
                          {selectedOrder.customerInfo.address}<br/>
                          PIN Code: {selectedOrder.customerInfo.pincode}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Info */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">2</span>
                      Order Status
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Date Placed:</span>
                        <span className="font-medium text-slate-800">{formatDate(selectedOrder.date)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Order Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedOrder.status)}`}>
                          {selectedOrder.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Payment Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}>
                          {selectedOrder.paymentStatus.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Payment Method:</span>
                        <span className="font-medium text-slate-800 uppercase">{selectedOrder.paymentMethod}</span>
                      </div>
                      {selectedOrder.upiTxnId && (
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">UPI Ref / Txn ID:</span>
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-xs select-all">{selectedOrder.upiTxnId}</span>
                        </div>
                      )}
                      {selectedOrder.upiSenderName && (
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Payment App / Sender:</span>
                          <span className="font-medium text-slate-800">{selectedOrder.upiSenderName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-6">
                  <div className="p-4 bg-slate-800 border-b border-slate-100">
                    <h4 className="font-bold text-white">Order Items</h4>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {selectedOrder.items.map((item, idx) => {
                      const itemPrice = item.product.discountPrice || item.product.price;
                      return (
                        <div key={idx} className="p-4 flex gap-4 items-center">
                          <img src={item.product.images[0]} alt={item.product.name} className="w-16 h-16 object-cover rounded-xl border border-slate-200" />
                          <div className="flex-1">
                            <h5 className="font-medium text-slate-800">{item.product.name}</h5>
                            <p className="text-sm text-slate-500">Qty: {item.quantity} × {formatCurrency(itemPrice)}</p>
                          </div>
                          <div className="text-right font-medium text-slate-800">
                            {formatCurrency(itemPrice * item.quantity)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-2 text-sm">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal</span>
                      <span>{formatCurrency(selectedOrder.subtotal)}</span>
                    </div>
                    {selectedOrder.tax > 0 && (
                      <div className="flex justify-between text-slate-600">
                        <span>Tax</span>
                        <span>{formatCurrency(selectedOrder.tax)}</span>
                      </div>
                    )}
                    {selectedOrder.shippingCost > 0 && (
                      <div className="flex justify-between text-slate-600">
                        <span>Shipping</span>
                        <span>{formatCurrency(selectedOrder.shippingCost)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold text-slate-800 pt-2 mt-2 border-t border-slate-200">
                      <span>Total</span>
                      <span>{formatCurrency(selectedOrder.total)}</span>
                    </div>
                  </div>
                </div>

                {/* UPI Screenshot if available */}
                {selectedOrder.upiScreenshot && (
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <h4 className="font-bold text-slate-800 mb-4">UPI Payment Screenshot</h4>
                    <a href={selectedOrder.upiScreenshot} target="_blank" rel="noreferrer" className="block max-w-sm rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                      <img src={selectedOrder.upiScreenshot} alt="UPI Payment" className="w-full h-auto" />
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminOrdersTab;
