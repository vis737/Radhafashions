import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, ShoppingBag, Package, FolderOpen, Users, Percent, MessageSquare,
  Gift, Award, TrendingUp, ShieldCheck, Settings, LogOut, Menu, Bell, Search,
  CreditCard
} from 'lucide-react';
import { Product, Coupon, BannerCampaign, CMSConfig, Order, ActivityLog, Review } from '../types';
import { jsPDF } from 'jspdf';
import ToastNotification, { ToastMessage } from './ToastNotification';
import { useIsMobile } from '../hooks/useIsMobile';

// Tab component imports (split architecture)
import AdminDashboardTab from './admin/AdminDashboardTab';
import AdminOrdersTab from './admin/AdminOrdersTab';
import AdminProductsTab from './admin/AdminProductsTab';
import AdminCategoriesTab from './admin/AdminCategoriesTab';
import AdminCustomersTab from './admin/AdminCustomersTab';
import AdminCouponsTab from './admin/AdminCouponsTab';
import AdminReviewsTab from './admin/AdminReviewsTab';
import AdminGiftOrdersTab from './admin/AdminGiftOrdersTab';
import AdminMembershipTab from './admin/AdminMembershipTab';
import AdminReportsTab from './admin/AdminReportsTab';
import AdminSecurityTab from './admin/AdminSecurityTab';
import AdminSettingsTab from './admin/AdminSettingsTab';
import AdminPaymentsTab from './admin/AdminPaymentsTab';

interface AdminDashboardProps {
  products: Product[];
  coupons: Coupon[];
  campaigns: BannerCampaign[];
  cms: CMSConfig;
  orders: Order[];
  logs: ActivityLog[];
  onAddProduct: (product: Product) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onAddCoupon: (coupon: Coupon) => void;
  onDeleteCoupon: (code: string) => void;
  onBulkDeleteCoupons?: (codes: string[]) => void;
  onDeleteAllCoupons?: () => void;
  onDeleteCampaign?: (campId: string) => void;
  onDeleteOrder: (ordId: string, ordNum: string) => void;
  onDeleteLog: (logId: string) => void;
  onClearLogs: () => void;
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
  onUpdatePaymentStatus?: (orderId: string, status: Order['paymentStatus'], reason?: string) => void;
  onUpdateCampaigns?: (campaigns: BannerCampaign[]) => void;
  onUpdateCMS: (cms: CMSConfig) => void;
  onApproveReview: (productId: string, reviewId: string, approve: boolean) => void;
  onDeleteReview?: (productId: string, reviewId: string) => void;
  onAddReview?: (productId: string, review: Omit<Review, 'id'>) => void;
  onEditReview?: (productId: string, reviewId: string, updated: Partial<Review>) => void;
  categories?: Array<{id: string; name: string; description: string; imageUrl: string; enabled?: boolean}>;
  onUpdateCategories?: (categories: Array<{id: string; name: string; description: string; imageUrl: string; enabled?: boolean}>) => void;
  onLogActivity: (action: string, details: string) => void;
  autoAuthenticated?: boolean;
  onLogoutAdmin?: () => void;
}

export default function AdminDashboard({
  products,
  coupons,
  campaigns,
  cms,
  orders,
  logs,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onAddCoupon,
  onDeleteCoupon,
  onBulkDeleteCoupons,
  onDeleteAllCoupons,
  onDeleteOrder,
  onDeleteLog,
  onClearLogs,
  onUpdateOrderStatus,
  onUpdatePaymentStatus,
  onUpdateCMS,
  onApproveReview,
  onDeleteReview,
  onAddReview,
  onEditReview,
  categories: propCategories,
  onUpdateCategories,
  onLogActivity,
  autoAuthenticated = false,
  onLogoutAdmin
}: AdminDashboardProps) {
  const categories = propCategories || [];
  const isMobile = useIsMobile();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [moreDrawerOpen, setMoreDrawerOpen] = useState(false);

  // Authentication Gate
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const isAuthorized = isAuthenticated || autoAuthenticated;
  const [adminUsername, setAdminUsername] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // UI state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Notifications
  const [notifications, setNotifications] = useState<any[]>([
    { id: '1', text: 'New high-value order placed (Rs. 4,500)', type: 'order' },
    { id: '2', text: 'Low stock warning: Silk Saree Collection (5 left)', type: 'stock' },
    { id: '3', text: 'New customer signed up: Alok Sharma', type: 'customer' }
  ]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Categories now managed via props from App.tsx (persisted to server)

  const addToast = (text: string, type: ToastMessage['type'] = 'success') => {
    const id = Math.random().toString();
    setToasts((prev) => [...prev, { id, type, text }]);
  };

  const handleRemoveToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // CSV/PDF export utilities shared across tabs
  const handleExportCSV = (table: string) => {
    let rows: any[] = [];
    if (table === 'products') {
      rows = [['ID', 'SKU', 'Name', 'Category', 'Price', 'Stock']];
      products.forEach((p) => rows.push([p.id, p.sku, p.name, p.category, p.price, p.stock]));
    } else if (table === 'orders') {
      rows = [['Order ID', 'Customer', 'Date', 'Total', 'Payment', 'Status']];
      orders.forEach((o) => rows.push([o.orderNumber, o.customerInfo.name, o.date, o.total, o.paymentMethod, o.status]));
    }
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `radha_export_${table}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast(`CSV export completed for [${table}].`);
  };

  const handleExportPDF = (table: string) => {
    const doc = new jsPDF();
    doc.setFont('Helvetica', 'bold');
    doc.text(`Radha Fashions BOUTIQUE - ${table.toUpperCase()} LEDGER`, 20, 20);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    let y = 30;
    if (table === 'products') {
      products.forEach((p, i) => {
        doc.text(`${i + 1}. ${p.name} | SKU: ${p.sku} | Price: Rs.${p.price} | Stock: ${p.stock}`, 20, y);
        y += 10;
        if (y > 270) { doc.addPage(); y = 20; }
      });
    } else {
      orders.forEach((o, i) => {
        doc.text(`${i + 1}. Order ${o.orderNumber} | Customer: ${o.customerInfo.name} | Total: Rs.${o.total} | Status: ${o.status}`, 20, y);
        y += 10;
        if (y > 270) { doc.addPage(); y = 20; }
      });
    }
    doc.save(`radha_export_${table}.pdf`);
    addToast(`PDF report generated for [${table}].`);
  };

  // Admin login
  const handleAdminAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: adminUsername, password: adminPassword })
      });
      if (res.ok) {
        setIsAuthenticated(true);
        addToast('Admin authentication successful.', 'success');
        onLogActivity('Admin Login Success', `Administrative console unlocked by ${adminUsername}`);
      } else {
        const err = await res.json();
        setAuthError(err.error || 'Failed to authenticate');
        addToast('Invalid administrative password', 'error');
        onLogActivity('Admin Login Failure', `Attempted credential matching failed for ${adminUsername}`);
      }
    } catch {
      setAuthError('Connection failed. Is the server running?');
    }
  };

  // Sidebar tab list (with new 'payments' tab)
  const sidebarTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, count: orders.length },
    { id: 'payments', label: 'Payments', icon: CreditCard, count: orders.filter(o => o.paymentStatus === 'pending').length || undefined },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: FolderOpen },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'coupons', label: 'Coupons', icon: Percent },
    { id: 'reviews', label: 'Reviews', icon: MessageSquare },
    { id: 'gift-orders', label: 'Gift Orders', icon: Gift },
    { id: 'membership', label: 'Membership', icon: Award },
    { id: 'reports', label: 'Reports', icon: TrendingUp },
    { id: 'security', label: 'Security', icon: ShieldCheck },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const bottomNavTabs = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, count: orders.length },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'payments', label: 'Payments', icon: CreditCard, count: orders.filter(o => o.paymentStatus === 'pending').length || undefined },
    { id: 'more', label: 'More', icon: Menu },
  ];
  const currentTabLabel = sidebarTabs.find(t => t.id === activeTab)?.label || 'Admin';

  // Product handlers (kept in shell for callback compatibility)
  const handleAddProductOpen = () => setActiveTab('products');
  const handleCreateCouponOpen = () => setActiveTab('coupons');

  // Auth gate screen
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50 dark:bg-gray-950 px-4 select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full p-8 bg-white dark:bg-gray-900 border border-gray-150 dark:border-pink-900/30 rounded-3xl shadow-xl text-left space-y-6"
        >
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-pink-400/10 rounded-full flex items-center justify-center mx-auto text-pink-500">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="font-display font-bold text-lg uppercase tracking-wider text-pink-900 dark:text-white">Admin Lock Gate</h2>
            <p className="text-xs text-gray-400">Unlock administrative workspace credentials.</p>
          </div>
          <form onSubmit={handleAdminAuthSubmit} className="space-y-4 text-xs">
            {authError && <p className="p-3 rounded-xl bg-red-50 text-red-600 font-mono text-[10px]">{authError}</p>}
            <div>
              <label className="block text-[10px] text-gray-400 font-mono uppercase tracking-wider mb-1">Administrative Profile ID</label>
              <input
                type="text"
                required
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-950 border border-pink-200 dark:border-pink-900/30 rounded-xl focus:ring-1 focus:ring-pink-500 focus:outline-none text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 font-mono uppercase tracking-wider mb-1">Decryption Password</label>
              <input
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-950 border border-pink-200 dark:border-pink-900/30 rounded-xl focus:ring-1 focus:ring-pink-500 focus:outline-none text-gray-900 dark:text-white"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-pink-600 hover:bg-pink-700 text-white hover:text-white border border-pink-700 rounded-xl font-bold uppercase tracking-wider transition cursor-pointer"
            >
              Access Workspace
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-100 flex flex-col font-sans select-none relative">
      <ToastNotification toasts={toasts} onClose={handleRemoveToast} />

      {/* Sticky top navigation */}
      <header className="sticky top-0 z-40 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border-b border-gray-150 dark:border-pink-900/20 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer"
          >
            <Menu className="w-5 h-5 text-gray-500" />
          </button>
          {isMobile && (<button onClick={() => setMobileSearchOpen(true)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl cursor-pointer"><Search className="w-5 h-5 text-gray-500" /></button>)}
          <span className="font-display font-extrabold text-sm uppercase tracking-widest text-pink-600 dark:text-pink-400">
{isMobile ? currentTabLabel : 'Radha Fashions Admin Hub'}
          </span>
        </div>

        {/* Global search bar */}
        <div className="hidden sm:flex items-center gap-2 max-w-sm w-full bg-gray-50 dark:bg-gray-950 border border-pink-200 dark:border-pink-900/20 px-3 py-1.5 rounded-xl text-xs">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Search products, orders, coupons..."
            className="bg-transparent border-none outline-none w-full text-gray-900 dark:text-white text-xs"
          />
        </div>

        {/* Notification bell and profile */}
        <div className="flex items-center gap-4 relative">
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl cursor-pointer relative"
            >
              <Bell className="w-4 h-4 text-gray-500" />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
            <AnimatePresence>
              {isNotifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-900 border border-pink-100 dark:border-pink-900/30 rounded-2xl shadow-xl p-3 text-xs space-y-2.5 z-[99]"
                >
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="font-bold text-gray-900 dark:text-white">System Alerts</span>
                    <button onClick={() => setNotifications([])} className="text-[10px] text-gray-400 hover:text-gray-900 cursor-pointer">
                      Clear all
                    </button>
                  </div>
                  {notifications.map(n => (
                    <div key={n.id} className="text-left py-1 text-gray-600 dark:text-gray-400 flex items-start gap-1.5">
                      <span className="text-pink-500 mt-0.5">•</span>
                      <span>{n.text}</span>
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <p className="text-center text-gray-400 font-mono py-2">No active alerts.</p>
                  )}
                  {/* Quick nav to pending UPI */}
                  {orders.filter(o => o.paymentStatus === 'pending').length > 0 && (
                    <button
                      onClick={() => { setActiveTab('payments'); setIsNotifOpen(false); }}
                      className="w-full mt-1 py-1.5 bg-amber-50 text-amber-700 rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer hover:bg-amber-100 transition"
                    >
                      {orders.filter(o => o.paymentStatus === 'pending').length} Pending UPI Verifications →
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-pink-500/20 text-pink-600 dark:text-pink-400 flex items-center justify-center font-bold font-mono text-xs">
                M
              </div>
            </button>
            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 border border-pink-100 dark:border-pink-900/30 rounded-2xl shadow-xl p-2 z-[99]"
                >
                  <button
                    onClick={() => { setIsProfileOpen(false); setActiveTab('settings'); }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-950 rounded-xl text-gray-900 dark:text-white"
                  >
                    Manage Settings
                  </button>
                  <button
                    onClick={() => { setIsProfileOpen(false); setActiveTab('security'); }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-950 rounded-xl text-gray-900 dark:text-white"
                  >
                    Security Center
                  </button>
                  <button
                    onClick={() => { setIsProfileOpen(false); onLogoutAdmin?.(); }}
                    className="w-full text-left px-3 py-2 text-xs text-red-500 hover:bg-red-50 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Main layout area */}
      <div className="flex-1 flex overflow-hidden" style={{paddingBottom: isMobile ? "64px" : "0"}}>

        {/* Collapsible Sidebar - desktop only */}
        {!isMobile && (
        <aside className={`${isSidebarCollapsed ? 'w-16' : 'w-60'} bg-white dark:bg-gray-900 border-r border-pink-100 dark:border-pink-900/20 transition-all duration-300 flex flex-col shrink-0 justify-between select-none`}>
          <div className="py-4 space-y-0.5 overflow-y-auto">
            {sidebarTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full py-2.5 px-4 flex items-center justify-between text-xs font-semibold transition cursor-pointer ${
                    isActive
                      ? 'bg-pink-500/10 dark:bg-gray-950 text-pink-600 dark:text-pink-400 border-l-4 border-pink-500'
                      : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-950/60 border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-pink-600 dark:text-pink-400' : 'text-gray-400'}`} />
                    {!isSidebarCollapsed && <span>{tab.label}</span>}
                  </div>
                  {!isSidebarCollapsed && tab.count !== undefined && tab.count > 0 && (
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold ${
                      tab.id === 'payments' ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 dark:bg-gray-950 text-gray-500'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-4 border-t border-gray-100 dark:border-pink-900/20">
            <button
              onClick={() => onLogoutAdmin?.()}
              className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              {!isSidebarCollapsed && <span>Sign Out</span>}
            </button>
          </div>
        </aside>
        )}

        {/* Main viewport */}
        <main className={"flex-1 overflow-y-auto " + (isMobile ? "p-3" : "p-6 md:p-8")}>
          <AnimatePresence mode="wait">

            {activeTab === 'dashboard' && (
              <AdminDashboardTab
                key="dashboard"
                products={products}
                orders={orders}
                coupons={coupons}
                logs={logs}
                onNavigate={setActiveTab}
                onAddProduct={() => setActiveTab('products')}
                onCreateCoupon={() => setActiveTab('coupons')}
              />
            )}

            {activeTab === 'orders' && (
              <AdminOrdersTab
                key="orders"
                orders={orders}
                onUpdateOrderStatus={onUpdateOrderStatus}
                onUpdatePaymentStatus={onUpdatePaymentStatus}
                onDeleteOrder={onDeleteOrder}
                onLogActivity={onLogActivity}
                addToast={addToast}
              />
            )}

            {activeTab === 'payments' && (
              <AdminPaymentsTab
                key="payments"
                orders={orders}
                onUpdateOrderStatus={onUpdateOrderStatus}
                onUpdatePaymentStatus={onUpdatePaymentStatus}
                onLogActivity={onLogActivity}
                addToast={addToast}
              />
            )}

            {activeTab === 'products' && (
              <AdminProductsTab
                key="products"
                products={products}
                categories={categories}
                onAddProduct={onAddProduct}
                onEditProduct={onEditProduct}
                onDeleteProduct={onDeleteProduct}
                onLogActivity={onLogActivity}
                addToast={addToast}
              />
            )}

            {activeTab === 'categories' && (
              <AdminCategoriesTab
                key="categories"
                initialCategories={categories}
                products={products}
                onLogActivity={onLogActivity}
                addToast={addToast}
                onUpdateCategories={onUpdateCategories}
              />
            )}

            {activeTab === 'customers' && (
              <AdminCustomersTab
                key="customers"
                orders={orders}
                onLogActivity={onLogActivity}
                addToast={addToast}
              />
            )}

            {activeTab === 'coupons' && (
              <AdminCouponsTab
                key="coupons"
                coupons={coupons}
                onAddCoupon={onAddCoupon}
                onDeleteCoupon={onDeleteCoupon}
                onBulkDeleteCoupons={onBulkDeleteCoupons}
                onDeleteAllCoupons={onDeleteAllCoupons}
                onLogActivity={onLogActivity}
                addToast={addToast}
              />
            )}

            {activeTab === 'reviews' && (
              <AdminReviewsTab
                key="reviews"
                products={products}
                onApproveReview={onApproveReview}
                onDeleteReview={onDeleteReview}
                onAddReview={onAddReview}
                onEditReview={onEditReview}
                onLogActivity={onLogActivity}
                addToast={addToast}
              />
            )}

            {activeTab === 'gift-orders' && (
              <AdminGiftOrdersTab
                key="gift-orders"
                orders={orders}
                onUpdateOrderStatus={onUpdateOrderStatus}
                onDeleteOrder={onDeleteOrder}
                onLogActivity={onLogActivity}
                addToast={addToast}
              />
            )}

            {activeTab === 'membership' && (
              <AdminMembershipTab
                key="membership"
                orders={orders}
                onLogActivity={onLogActivity}
                addToast={addToast}
              />
            )}

            {activeTab === 'reports' && (
              <AdminReportsTab
                key="reports"
                products={products}
                orders={orders}
                coupons={coupons}
                addToast={addToast}
              />
            )}

            {activeTab === 'security' && (
              <AdminSecurityTab
                key="security"
                logs={logs}
                onDeleteLog={onDeleteLog}
                onClearLogs={onClearLogs}
                onLogActivity={onLogActivity}
                addToast={addToast}
              />
            )}

            {activeTab === 'settings' && (
              <AdminSettingsTab
                key="settings"
                cms={cms}
                onUpdateCMS={onUpdateCMS}
                onLogActivity={onLogActivity}
                addToast={addToast}
              />
            )}

          </AnimatePresence>
        </main>

      </div>

      {/* Mobile Bottom Navigation Bar */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-pink-100 dark:border-pink-900/20 px-1 py-1 flex items-center justify-around shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
          {bottomNavTabs.map((tab) => {
            const Icon = tab.icon;
            const isMore = tab.id === "more";
            const isActive = !isMore && activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => isMore ? setMoreDrawerOpen(true) : setActiveTab(tab.id)} className={"flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition cursor-pointer min-w-[56px] " + (isActive ? "text-pink-600 dark:text-pink-400" : "text-gray-400")}>
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {tab.count !== undefined && tab.count > 0 && (<span className="absolute -top-1 -right-2 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">{tab.count > 9 ? "9+" : tab.count}</span>)}
                </div>
                <span className="text-[10px] font-semibold">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      )}

      {/* Mobile More Drawer */}
      <AnimatePresence>
        {isMobile && moreDrawerOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-[60]" onClick={() => setMoreDrawerOpen(false)} />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="fixed bottom-0 left-0 right-0 z-[61] bg-white dark:bg-gray-900 rounded-t-3xl max-h-[75vh] overflow-y-auto shadow-xl">
              <div className="sticky top-0 bg-white dark:bg-gray-900 px-4 pt-4 pb-3 border-b border-gray-100 dark:border-pink-900/20">
                <div className="w-10 h-1 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-3" />
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">More Sections</h3>
              </div>
              <div className="p-3 grid grid-cols-3 gap-2">
                {sidebarTabs.filter(t => !bottomNavTabs.some(b => b.id === t.id)).map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button key={tab.id} onClick={() => { setActiveTab(tab.id); setMoreDrawerOpen(false); }} className="flex flex-col items-center gap-1.5 p-3 rounded-2xl transition cursor-pointer bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                      <Icon className="w-5 h-5" />
                      <span className="text-[10px] font-semibold text-center leading-tight">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
              <div className="p-3 border-t border-gray-100 dark:border-pink-900/20">
                <button onClick={() => { onLogoutAdmin?.(); setMoreDrawerOpen(false); }} className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Search Overlay */}
      <AnimatePresence>
        {isMobile && mobileSearchOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-[60]" onClick={() => setMobileSearchOpen(false)} />
            <motion.div initial={{ y: "-100%" }} animate={{ y: 0 }} exit={{ y: "-100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="fixed top-0 left-0 right-0 z-[61] bg-white dark:bg-gray-900 p-4 shadow-xl">
              <div className="flex items-center gap-2">
                <button onClick={() => setMobileSearchOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl cursor-pointer"><span className="text-gray-500 text-lg">X</span></button>
                <div className="flex-1 flex items-center gap-2 bg-gray-50 dark:bg-gray-950 border border-pink-200 dark:border-pink-900/20 px-3 py-2 rounded-xl">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input type="text" autoFocus value={globalSearch} onChange={(e) => setGlobalSearch(e.target.value)} placeholder="Search products, orders, coupons..." className="bg-transparent border-none outline-none w-full text-gray-900 dark:text-white text-sm" />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
