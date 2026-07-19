import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, ShoppingBag, Package, FolderOpen, Users, Percent, MessageSquare, 
  Gift, Award, TrendingUp, ShieldCheck, Settings, LogOut, Menu, Bell, Search, 
  Plus, Trash2, Edit3, Copy, Download, Video, Check, X, FileEdit, Mail, Smartphone,
  Clock, ShieldAlert, Key, AlertTriangle, ArrowUpRight, CheckCircle, HelpCircle
} from 'lucide-react';
import { Product, Coupon, BannerCampaign, CMSConfig, Order, ActivityLog, Review } from '../types';
import { CATEGORIES as INITIAL_CATEGORIES } from '../utils/mockData';
import { getQrCodeUrl } from '../utils/qrCodeGenerator';
import { jsPDF } from 'jspdf';
import ToastNotification, { ToastMessage } from './ToastNotification';

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
  onDeleteCampaign: (campId: string) => void;
  onDeleteOrder: (ordId: string, ordNum: string) => void;
  onDeleteLog: (logId: string) => void;
  onClearLogs: () => void;
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
  onUpdateCampaigns: (campaigns: BannerCampaign[]) => void;
  onUpdateCMS: (cms: CMSConfig) => void;
  onApproveReview: (productId: string, reviewId: string, approve: boolean) => void;
  onDeleteReview?: (productId: string, reviewId: string) => void;
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
  onDeleteCampaign,
  onDeleteOrder,
  onDeleteLog,
  onClearLogs,
  onUpdateOrderStatus,
  onUpdateCampaigns,
  onUpdateCMS,
  onApproveReview,
  onDeleteReview,
  onLogActivity,
  autoAuthenticated = false,
  onLogoutAdmin
}: AdminDashboardProps) {
  // Authentication Gate states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const isAuthorized = isAuthenticated || autoAuthenticated;
  const [adminUsername, setAdminUsername] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // UI state control
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Notifications bell list
  const [notifications, setNotifications] = useState<any[]>([
    { id: '1', text: 'New high-value order placed (Rs. 4,500)', type: 'order' },
    { id: '2', text: 'Low stock warning: Handcrafted Wooden Tower (5 left)', type: 'stock' },
    { id: '3', text: 'New customer signed up: Alok Sharma', type: 'customer' }
  ]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Form states: Categories list management
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatUrl, setNewCatUrl] = useState('https://images.unsplash.com/photo-1515488042361-404e9250afef?w=600');

  // Form states: Product Management
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editProductId, setEditProductId] = useState<string | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState(899);
  const [prodDiscPrice, setProdDiscPrice] = useState<number | undefined>(undefined);
  const [prodCategory, setProdCategory] = useState('toys');
  const [prodStock, setProdStock] = useState(15);
  const [prodSku, setProdSku] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodImages, setProdImages] = useState<string[]>(['']);
  const [prodVideoUrl, setProdVideoUrl] = useState('');
  const [prodMinAge, setProdMinAge] = useState<number>(0);
  const [prodMaxAge, setProdMaxAge] = useState<number>(10);
  const [prodSkill, setProdSkill] = useState('Motor Skills');
  const [prodEdu, setProdEdu] = useState('Montessori');

  // Bulk product selectors
  const [selectedProdIds, setSelectedProdIds] = useState<string[]>([]);
  const [bulkPricePercent, setBulkPricePercent] = useState<number>(0);
  const [bulkStockAdd, setBulkStockAdd] = useState<number>(0);

  // Form states: Coupon Management
  const [isAddCouponOpen, setIsAddCouponOpen] = useState(false);
  const [newCoupCode, setNewCoupCode] = useState('');
  const [newCoupType, setNewCoupType] = useState<'percentage' | 'flat'>('percentage');
  const [newCoupVal, setNewCoupVal] = useState(10);
  const [newCoupMin, setNewCoupMin] = useState(500);
  const [newCoupLimit, setNewCoupLimit] = useState(100);
  const [newCoupDesc, setNewCoupDesc] = useState('');

  // Form states: Settings Management
  const [smtpHost, setSmtpHost] = useState(cms.smtpHost || 'smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState(cms.smtpPort || 587);
  const [smtpUser, setSmtpUser] = useState(cms.smtpUser || 'meriseshop.2025@gmail.com');
  const [smtpPass, setSmtpPass] = useState(cms.smtpPass || 'lljl hfcn geye rdlt');
  const [whatsappNo, setWhatsappNo] = useState(cms.whatsappNumber || '+919108319758');
  const [shipCharge, setShipCharge] = useState(cms.shippingCharges || 80);
  const [delivCharge, setDelivCharge] = useState(cms.deliveryCharges || 0);

  // Security 2FA states
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  const addToast = (text: string, type: ToastMessage['type'] = 'success') => {
    const id = Math.random().toString();
    setToasts((prev) => [...prev, { id, type, text }]);
  };

  const handleRemoveToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Submit Administrative Authentication
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
        onLogActivity('Admin Login Failure', `Attempted credentials matching failed for ${adminUsername}`);
      }
    } catch (err) {
      setAuthError('Connection failed.');
    }
  };

  // Duplicate Product utility
  const handleDuplicateProduct = (p: Product) => {
    const dup: Product = {
      ...p,
      id: 'prod-dup-' + Date.now(),
      name: `${p.name} (Copy)`,
      sku: `${p.sku}-DUP`
    };
    onAddProduct(dup);
    addToast(`Product [${p.name}] duplicated successfully.`);
    onLogActivity('Duplicate Product', `Duplicated item ${p.name} with new SKU ${dup.sku}`);
  };

  // Bulk delete selected products
  const handleBulkDeleteProducts = () => {
    if (selectedProdIds.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedProdIds.length} selected products?`)) {
      selectedProdIds.forEach((id) => onDeleteProduct(id));
      addToast(`Bulk deleted ${selectedProdIds.length} products.`);
      onLogActivity('Bulk Purge Products', `Deleted ${selectedProdIds.length} catalog items`);
      setSelectedProdIds([]);
    }
  };

  // Bulk update prices
  const handleBulkPriceUpdate = () => {
    if (selectedProdIds.length === 0 || bulkPricePercent === 0) return;
    products.forEach((p) => {
      if (selectedProdIds.includes(p.id)) {
        const factor = 1 + bulkPricePercent / 100;
        onEditProduct({
          ...p,
          price: Math.round(p.price * factor),
          discountPrice: p.discountPrice ? Math.round(p.discountPrice * factor) : undefined
        });
      }
    });
    addToast(`Bulk updated prices by ${bulkPricePercent}% for ${selectedProdIds.length} products.`);
    onLogActivity('Bulk Price Shift', `Adjusted pricing by ${bulkPricePercent}% for selected segment`);
    setBulkPricePercent(0);
  };

  // Bulk stock update
  const handleBulkStockUpdate = () => {
    if (selectedProdIds.length === 0 || bulkStockAdd === 0) return;
    products.forEach((p) => {
      if (selectedProdIds.includes(p.id)) {
        onEditProduct({
          ...p,
          stock: Math.max(0, p.stock + bulkStockAdd)
        });
      }
    });
    addToast(`Bulk updated stocks for ${selectedProdIds.length} products.`);
    onLogActivity('Bulk Stock Shift', `Altered stock levels by ${bulkStockAdd} units for selected segment`);
    setBulkStockAdd(0);
  };

  // Publish dynamic Categories
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const slug = newCatName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newCat = {
      id: slug,
      name: newCatName.trim(),
      description: newCatDesc.trim() || 'Premium handcrafted boutique selection.',
      imageUrl: newCatUrl
    };
    setCategories((prev) => [...prev, newCat]);
    addToast(`Category [${newCatName}] created successfully.`);
    onLogActivity('Add Category', `Created dynamic catalog category [${newCatName}]`);
    setNewCatName('');
    setNewCatDesc('');
  };

  // Publish new Coupon
  const handlePublishCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupCode.trim()) return;
    const cp: Coupon = {
      code: newCoupCode.toUpperCase().trim(),
      type: newCoupType,
      value: newCoupVal,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      usageLimit: newCoupLimit,
      usageCount: 0,
      minimumCartValue: newCoupMin,
      description: newCoupDesc || `Save ${newCoupType === 'percentage' ? `${newCoupVal}%` : `Rs.${newCoupVal}`} off your order`,
      active: true
    };
    onAddCoupon(cp);
    addToast(`Coupon [${newCoupCode}] published successfully.`);
    onLogActivity('Create Coupon', `Created promo code [${newCoupCode}]`);
    setIsAddCouponOpen(false);
    setNewCoupCode('');
  };

  // Save Extended Settings Panel
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCMS({
      ...cms,
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPass,
      whatsappNumber: whatsappNo,
      shippingCharges: shipCharge,
      deliveryCharges: delivCharge
    });
    addToast('General store settings saved successfully.');
    onLogActivity('Update Settings', 'SMTP profiles and delivery charges updated.');
  };

  // Save product form
  const handleSaveProductForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (editProductId) {
      const match = products.find((p) => p.id === editProductId);
      if (match) {
        onEditProduct({
          ...match,
          name: prodName,
          price: prodPrice,
          discountPrice: prodDiscPrice || undefined,
          categorySlug: prodCategory,
          stock: prodStock,
          sku: prodSku,
          description: prodDesc,
          images: prodImages.filter(Boolean),
          minimumAge: prodMinAge,
          maximumAge: prodMaxAge,
          skillType: prodSkill,
          educationalType: prodEdu
        });
        addToast(`Product [${prodName}] updated.`);
      }
    } else {
      const nw: Product = {
        id: 'prod-' + Date.now(),
        sku: prodSku || 'MR-PROD-' + Date.now().toString().substring(8),
        name: prodName,
        category: prodCategory === 'toys' ? 'Kids Toys' : prodCategory === 'wood-gifts' ? 'Wood Crafted Gifts' : 'Collection Category',
        categorySlug: prodCategory,
        price: prodPrice,
        discountPrice: prodDiscPrice || undefined,
        stock: prodStock,
        rating: 4.8,
        ratingCount: 1,
        images: prodImages.filter(Boolean),
        shortDescription: prodDesc.substring(0, 100),
        description: prodDesc,
        specifications: {},
        reviews: [],
        brand: 'Meris Brand',
        availability: prodStock > 5 ? 'in-stock' : prodStock > 0 ? 'low-stock' : 'out-of-stock',
        minimumAge: prodMinAge,
        maximumAge: prodMaxAge,
        skillType: prodSkill,
        educationalType: prodEdu
      };
      onAddProduct(nw);
      addToast(`Product [${prodName}] published successfully.`);
    }
    setIsAddProductOpen(false);
    setEditProductId(null);
  };

  // Pre-fill edit fields
  const handleEditProductClick = (p: Product) => {
    setEditProductId(p.id);
    setProdName(p.name);
    setProdPrice(p.price);
    setProdDiscPrice(p.discountPrice);
    setProdCategory(p.categorySlug);
    setProdStock(p.stock);
    setProdSku(p.sku);
    setProdDesc(p.description);
    setProdImages(p.images.length > 0 ? p.images : ['']);
    setProdMinAge(p.minimumAge || 0);
    setProdMaxAge(p.maximumAge || 10);
    setProdSkill(p.skillType || 'Motor Skills');
    setProdEdu(p.educationalType || 'Montessori');
    setIsAddProductOpen(true);
  };

  // CSV Report Generator
  const handleExportCSV = (table: string) => {
    let rows: any[] = [];
    if (table === 'products') {
      rows = [['ID', 'SKU', 'Name', 'Category', 'Price', 'Stock']];
      products.forEach((p) => rows.push([p.id, p.sku, p.name, p.category, p.price, p.stock]));
    } else if (table === 'orders') {
      rows = [['Order ID', 'Customer', 'Date', 'Total', 'Payment', 'Status']];
      orders.forEach((o) => rows.push([o.orderNumber, o.customerInfo.name, o.date, o.total, o.paymentMethod, o.status]));
    }
    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(',')).join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `moris_export_${table}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast(`CSV export completed for table [${table}].`);
  };

  // PDF Report Generator
  const handleExportPDF = (table: string) => {
    const doc = new jsPDF();
    doc.setFont('Helvetica', 'bold');
    doc.text(`MERIS BOUTIQUE - ${table.toUpperCase()} LEDGER`, 20, 20);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    let y = 30;
    if (table === 'products') {
      products.forEach((p, i) => {
        doc.text(`${i + 1}. ${p.name} | SKU: ${p.sku} | Price: Rs.${p.price} | Stock: ${p.stock}`, 20, y);
        y += 10;
      });
    } else {
      orders.forEach((o, i) => {
        doc.text(`${i + 1}. Order ${o.orderNumber} | Customer: ${o.customerInfo.name} | Total: Rs.${o.total} | Status: ${o.status}`, 20, y);
        y += 10;
      });
    }
    doc.save(`moris_export_${table}.pdf`);
    addToast(`PDF report ledger generated for table [${table}].`);
  };

  // Filtering views by search criteria
  const query = globalSearch.toLowerCase().trim();
  const filteredProducts = products.filter(
    (p) => p.name.toLowerCase().includes(query) || p.sku.toLowerCase().includes(query) || p.categorySlug.toLowerCase().includes(query)
  );
  const filteredOrders = orders.filter(
    (o) => o.orderNumber.toLowerCase().includes(query) || o.customerInfo.name.toLowerCase().includes(query) || o.customerInfo.email.toLowerCase().includes(query)
  );

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-navy-950 px-4 select-none">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full p-8 bg-white dark:bg-navy-900 border border-gray-150 dark:border-navy-800 rounded-3xl shadow-xl text-left space-y-6"
        >
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-gold-400/10 rounded-full flex items-center justify-center mx-auto text-gold-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="font-display font-bold text-lg uppercase tracking-wider text-navy-950 dark:text-white">Admin Lock Gate</h2>
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
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-800 rounded-xl focus:ring-1 focus:ring-gold-400 focus:outline-none text-navy-950 dark:text-white"
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
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-800 rounded-xl focus:ring-1 focus:ring-gold-400 focus:outline-none text-navy-950 dark:text-white"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-navy-950 hover:bg-gold-500 text-white hover:text-navy-950 border border-navy-800 rounded-xl font-bold uppercase tracking-wider transition cursor-pointer"
            >
              Access Workspace
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-950 text-gray-800 dark:text-slate-100 flex flex-col font-sans select-none relative">
      <ToastNotification toasts={toasts} onClose={handleRemoveToast} />

      {/* Sticky top navigation */}
      <header className="sticky top-0 z-40 bg-white/70 dark:bg-navy-900/70 backdrop-blur-md border-b border-gray-150 dark:border-navy-850 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-navy-800 rounded-lg cursor-pointer"
          >
            <Menu className="w-5 h-5 text-gray-500" />
          </button>
          <span className="font-display font-extrabold text-sm uppercase tracking-widest text-[#C5A021]">
            Meris Admin Hub
          </span>
        </div>

        {/* Global search */}
        <div className="hidden sm:flex items-center gap-2 max-w-sm w-full bg-gray-50 dark:bg-navy-950 border border-gray-250 dark:border-navy-850 px-3 py-1.5 rounded-xl text-xs">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Search products, orders, coupons..."
            className="bg-transparent border-none outline-none w-full text-navy-950 dark:text-white text-xs"
          />
        </div>

        {/* Notification bell and Profile */}
        <div className="flex items-center gap-4 relative">
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-navy-850 rounded-xl cursor-pointer relative"
            >
              <Bell className="w-4.5 h-4.5 text-gray-500" />
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
                  className="absolute right-0 mt-2 w-64 bg-white dark:bg-navy-900 border border-gray-150 dark:border-navy-800 rounded-2xl shadow-xl p-3 text-xs space-y-2.5 z-[99]"
                >
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="font-bold">Notifications Alerts</span>
                    <button onClick={() => setNotifications([])} className="text-[10px] text-gray-400 hover:text-navy-950">Clear</button>
                  </div>
                  {notifications.map(n => (
                    <div key={n.id} className="text-left py-1 text-gray-600 dark:text-slate-300">
                      • {n.text}
                    </div>
                  ))}
                  {notifications.length === 0 && <p className="text-center text-gray-400 font-mono py-2">No active alerts.</p>}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-gold-400/20 text-[#C5A021] flex items-center justify-center font-bold font-mono text-xs">
                M
              </div>
            </button>
            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-navy-900 border border-gray-150 dark:border-navy-800 rounded-2xl shadow-xl p-2 z-[99]"
                >
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      setActiveTab('settings');
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 rounded-xl"
                  >
                    Manage Settings
                  </button>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      onLogoutAdmin?.();
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-red-500 hover:bg-red-50 rounded-xl font-bold flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Responsive Collapsible Sidebar */}
        <aside className={`${isSidebarCollapsed ? 'w-16' : 'w-60'} bg-white dark:bg-navy-900 border-r border-gray-150 dark:border-navy-850 transition-all duration-300 flex flex-col shrink-0 justify-between select-none`}>
          <div className="py-4 space-y-1">
            {([
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'orders', label: 'Orders', icon: ShoppingBag, count: orders.length },
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
            ] as any[]).map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full py-2.5 px-4 flex items-center justify-between text-xs font-semibold transition cursor-pointer ${
                    isActive
                      ? 'bg-gold-50/50 dark:bg-navy-950 text-[#C5A021] border-l-4 border-[#C5A021]'
                      : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-navy-950/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-[#C5A021]' : 'text-gray-400'}`} />
                    {!isSidebarCollapsed && <span>{tab.label}</span>}
                  </div>
                  {!isSidebarCollapsed && tab.count !== undefined && (
                    <span className="px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-navy-950 text-[10px] font-mono text-gray-500 font-bold">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-4 border-t border-gray-100 dark:border-navy-850">
            <button
              onClick={() => onLogoutAdmin?.()}
              className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              {!isSidebarCollapsed && <span>Sign Out</span>}
            </button>
          </div>
        </aside>

        {/* Viewport content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <AnimatePresence mode="wait">
            
            {/* VIEW 1: DASHBOARD */}
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6"
              >
                {/* Summary cards grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-navy-900 p-5 rounded-3xl border border-gray-100 dark:border-navy-850 shadow-sm flex flex-col justify-between h-28 text-left">
                    <span className="text-[10px] text-gray-400 font-mono tracking-wider uppercase">Today's Revenue</span>
                    <h3 className="text-xl font-bold text-navy-950 dark:text-white">Rs. 12,850</h3>
                    <span className="text-[9px] text-emerald-500 font-semibold flex items-center gap-0.5">
                      <ArrowUpRight className="w-3 h-3" /> +14% vs yesterday
                    </span>
                  </div>

                  <div className="bg-white dark:bg-navy-900 p-5 rounded-3xl border border-gray-100 dark:border-navy-850 shadow-sm flex flex-col justify-between h-28 text-left">
                    <span className="text-[10px] text-gray-400 font-mono tracking-wider uppercase">Today's Orders</span>
                    <h3 className="text-xl font-bold text-navy-950 dark:text-white">{orders.length} Orders</h3>
                    <span className="text-[9px] text-[#C5A021] font-semibold">Real-time load active</span>
                  </div>

                  <div className="bg-white dark:bg-navy-900 p-5 rounded-3xl border border-gray-100 dark:border-navy-850 shadow-sm flex flex-col justify-between h-28 text-left">
                    <span className="text-[10px] text-gray-400 font-mono tracking-wider uppercase">Low Stock Products</span>
                    <h3 className="text-xl font-bold text-navy-950 dark:text-white">
                      {products.filter(p => p.stock <= 5).length} Items
                    </h3>
                    <span className="text-[9px] text-amber-500 font-semibold">Immediate attention</span>
                  </div>

                  <div className="bg-white dark:bg-navy-900 p-5 rounded-3xl border border-gray-100 dark:border-navy-850 shadow-sm flex flex-col justify-between h-28 text-left">
                    <span className="text-[10px] text-gray-400 font-mono tracking-wider uppercase">Total Customers</span>
                    <h3 className="text-xl font-bold text-navy-950 dark:text-white">48 Members</h3>
                    <span className="text-[9px] text-emerald-500 font-semibold">Active privileges</span>
                  </div>
                </div>

                {/* Quick actions panel */}
                <div className="bg-white dark:bg-navy-900 border rounded-3xl p-5 shadow-sm text-left space-y-4">
                  <h4 className="font-display font-bold text-xs uppercase tracking-wider text-navy-950 dark:text-white">
                    Operational Quick Actions
                  </h4>
                  <div className="flex flex-wrap gap-2.5 pt-1">
                    <button
                      onClick={() => {
                        setEditProductId(null);
                        setProdName('');
                        setProdPrice(899);
                        setProdStock(15);
                        setProdSku('');
                        setProdDesc('');
                        setProdImages(['']);
                        setIsAddProductOpen(true);
                      }}
                      className="px-4 py-2 bg-navy-950 hover:bg-[#C5A021] text-white hover:text-navy-950 border border-navy-800 rounded-xl text-xs font-semibold transition cursor-pointer"
                    >
                      + Add Product
                    </button>
                    <button
                      onClick={() => {
                        setNewCoupCode('');
                        setNewCoupVal(10);
                        setIsAddCouponOpen(true);
                      }}
                      className="px-4 py-2 bg-[#C5A021]/15 hover:bg-[#C5A021]/25 text-[#C5A021] rounded-xl text-xs font-semibold transition cursor-pointer"
                    >
                      + Create Coupon
                    </button>
                    <button
                      onClick={() => setActiveTab('categories')}
                      className="px-4 py-2 bg-gray-150 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition cursor-pointer border"
                    >
                      + Add Category
                    </button>
                    <button
                      onClick={() => handleExportCSV('products')}
                      className="px-4 py-2 bg-transparent hover:bg-gray-50 text-gray-500 rounded-xl text-xs font-semibold transition cursor-pointer border border-gray-200"
                    >
                      Export Inventory Report
                    </button>
                  </div>
                </div>

                {/* Sales Activity Timeline feed */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Recent Orders List */}
                  <div className="bg-white dark:bg-navy-900 border rounded-3xl p-6 shadow-sm text-left space-y-4 lg:col-span-2 overflow-x-auto">
                    <h4 className="font-display font-bold text-xs uppercase tracking-wider text-navy-950 dark:text-white">
                      Recent Store Bookings
                    </h4>
                    <table className="w-full text-xs font-sans border-collapse">
                      <thead>
                        <tr className="border-b border-gray-150 text-gray-400 font-semibold text-left">
                          <th className="pb-3">Order Number</th>
                          <th className="pb-3">Customer</th>
                          <th className="pb-3">Total Amount</th>
                          <th className="pb-3 text-right">Delivery Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 4).map((ord) => (
                          <tr key={ord.id} className="border-b last:border-b-0">
                            <td className="py-3 font-mono font-bold text-navy-950 dark:text-white">{ord.orderNumber}</td>
                            <td className="py-3 text-gray-500 dark:text-slate-300">{ord.customerInfo.name}</td>
                            <td className="py-3 font-mono font-semibold">Rs. {ord.total}</td>
                            <td className="py-3 text-right">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-mono tracking-wider font-bold uppercase ${
                                ord.status === 'delivered' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                              }`}>
                                {ord.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Best Selling Products */}
                  <div className="bg-white dark:bg-navy-900 border rounded-3xl p-6 shadow-sm text-left space-y-4">
                    <h4 className="font-display font-bold text-xs uppercase tracking-wider text-navy-950 dark:text-white">
                      Best Selling Crafts
                    </h4>
                    <div className="space-y-3">
                      {products.slice(0, 3).map((p) => (
                        <div key={p.id} className="flex justify-between items-center text-xs pb-3 border-b last:border-b-0 last:pb-0">
                          <div>
                            <span className="font-semibold text-navy-950 dark:text-white block">{p.name}</span>
                            <span className="text-[10px] text-gray-400 font-mono mt-0.5">{p.category}</span>
                          </div>
                          <span className="font-mono font-bold text-emerald-500">Rs. {p.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </motion.div>
            )}

            {/* VIEW 2: ORDER MANAGEMENT */}
            {activeTab === 'orders' && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center pb-2 border-b border-gray-150">
                  <h3 className="font-display font-bold text-xs uppercase tracking-wider text-navy-950 dark:text-white">
                    Order Shipments Workspace
                  </h3>
                  <button
                    onClick={() => handleExportCSV('orders')}
                    className="px-3 py-1.5 bg-[#C5A021]/15 hover:bg-[#C5A021]/25 text-[#C5A021] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> CSV Report
                  </button>
                </div>

                {/* Orders search & timeline list */}
                <div className="space-y-4">
                  {filteredOrders.length === 0 ? (
                    <p className="text-center text-gray-400 font-mono py-12 text-xs">No matching orders found.</p>
                  ) : (
                    filteredOrders.map((ord) => (
                      <div key={ord.id} className="bg-white dark:bg-navy-900 border rounded-3xl p-5 text-xs text-left shadow-sm space-y-4">
                        <div className="flex justify-between items-center border-b pb-3 flex-wrap gap-2">
                          <div>
                            <span className="font-mono font-bold text-sm text-navy-950 dark:text-white block">{ord.orderNumber}</span>
                            <span className="text-[10px] text-gray-400 font-mono">Date: {ord.date} | Payment: {ord.paymentMethod}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <select
                              value={ord.status}
                              onChange={(e) => onUpdateOrderStatus(ord.id, e.target.value as any)}
                              className="px-2.5 py-1.5 border border-gray-250 bg-white dark:bg-navy-950 rounded-xl"
                            >
                              {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
                                <option key={status} value={status}>{status.toUpperCase()}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => {
                                onDeleteOrder(ord.id, ord.orderNumber);
                                onLogActivity('Purge Order', `Deleted order entry ${ord.orderNumber}`);
                              }}
                              className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl border border-transparent hover:border-red-200 transition cursor-pointer"
                            >
                              <Trash2 className="w-4.5 h-4.5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 leading-normal font-sans">
                          <div className="space-y-2">
                            <h5 className="font-bold text-navy-950 dark:text-white">Customer Shipping Details</h5>
                            <p>{ord.customerInfo.name} | {ord.customerInfo.phone}</p>
                            <p>{ord.customerInfo.address}, {ord.customerInfo.pincode}</p>
                          </div>
                          
                          <div className="space-y-2">
                            <h5 className="font-bold text-navy-950 dark:text-white">Line Items Purchased</h5>
                            {ord.items.map((it, idx) => (
                              <p key={idx}>
                                {it.product.name} (x{it.quantity}) - Rs. {it.product.discountPrice || it.product.price}
                              </p>
                            ))}
                            <p className="font-bold text-navy-950 dark:text-white border-t pt-2 mt-2">
                              Grand Total Sum: Rs. {ord.total}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* VIEW 3: PRODUCT MANAGEMENT */}
            {activeTab === 'products' && (
              <motion.div
                key="products"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center pb-2 border-b border-gray-150">
                  <h3 className="font-display font-bold text-xs uppercase tracking-wider text-navy-950 dark:text-white">
                    Inventory Catalog Workspace
                  </h3>
                  <button
                    onClick={() => {
                      setEditProductId(null);
                      setProdName('');
                      setProdPrice(899);
                      setProdStock(15);
                      setProdSku('');
                      setProdDesc('');
                      setProdImages(['']);
                      setIsAddProductOpen(true);
                    }}
                    className="px-4 py-2 bg-navy-950 hover:bg-[#C5A021] text-white hover:text-navy-950 border border-navy-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add Product
                  </button>
                </div>

                {/* Bulk Actions Console */}
                {selectedProdIds.length > 0 && (
                  <div className="p-4 rounded-2xl bg-gray-50 border space-y-3.5 text-xs text-left animate-fade-in">
                    <span className="font-bold text-navy-950 block">Bulk Actions Console ({selectedProdIds.length} Selected)</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                      <div className="flex gap-2 items-center">
                        <input
                          type="number"
                          value={bulkPricePercent}
                          onChange={(e) => setBulkPricePercent(Number(e.target.value))}
                          placeholder="Price shift % (e.g. 10)"
                          className="px-2.5 py-1.5 border bg-white rounded-lg w-24 outline-none"
                        />
                        <button onClick={handleBulkPriceUpdate} className="px-3 py-1.5 bg-[#C5A021] text-navy-950 font-semibold rounded-lg cursor-pointer transition">Update Prices</button>
                      </div>
                      <div className="flex gap-2 items-center">
                        <input
                          type="number"
                          value={bulkStockAdd}
                          onChange={(e) => setBulkStockAdd(Number(e.target.value))}
                          placeholder="Stock adjust (+/-)"
                          className="px-2.5 py-1.5 border bg-white rounded-lg w-24 outline-none"
                        />
                        <button onClick={handleBulkStockUpdate} className="px-3 py-1.5 bg-[#C5A021] text-navy-950 font-semibold rounded-lg cursor-pointer transition">Update Stock</button>
                      </div>
                      <div className="text-right">
                        <button onClick={handleBulkDeleteProducts} className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl font-bold cursor-pointer transition">
                          Delete Selected ({selectedProdIds.length})
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Products Table list */}
                <div className="bg-white dark:bg-navy-900 border rounded-3xl p-6 shadow-sm overflow-x-auto text-left text-xs">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-gray-400 font-semibold">
                        <th className="pb-3 text-center">
                          <input
                            type="checkbox"
                            checked={selectedProdIds.length === products.length}
                            onChange={(e) => {
                              setSelectedProdIds(e.target.checked ? products.map(p => p.id) : []);
                            }}
                            className="w-3.5 h-3.5"
                          />
                        </th>
                        <th className="pb-3">Product Name</th>
                        <th className="pb-3">SKU</th>
                        <th className="pb-3">Price</th>
                        <th className="pb-3 text-center">Stock</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((p) => (
                        <tr key={p.id} className="border-b last:border-b-0">
                          <td className="py-3 text-center">
                            <input
                              type="checkbox"
                              checked={selectedProdIds.includes(p.id)}
                              onChange={(e) => {
                                setSelectedProdIds(prev =>
                                  e.target.checked ? [...prev, p.id] : prev.filter(id => id !== p.id)
                                );
                              }}
                              className="w-3.5 h-3.5"
                            />
                          </td>
                          <td className="py-3 flex items-center gap-3.5">
                            <img src={p.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-50 border shrink-0" />
                            <div>
                              <p className="font-semibold text-navy-950 dark:text-white leading-none">{p.name}</p>
                              <p className="text-[10px] text-gray-400 font-mono mt-0.5 uppercase tracking-wider">{p.category}</p>
                            </div>
                          </td>
                          <td className="py-3 font-mono font-bold text-gray-600">{p.sku}</td>
                          <td className="py-3 font-mono font-bold">Rs. {p.price}</td>
                          <td className="py-3 text-center font-mono font-semibold">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                              p.stock > 5 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600 animate-pulse'
                            }`}>
                              {p.stock}
                            </span>
                          </td>
                          <td className="py-3 text-right space-x-1 whitespace-nowrap">
                            <button onClick={() => handleEditProductClick(p)} className="p-1.5 text-gray-400 hover:text-[#C5A021] hover:bg-gray-50 rounded transition cursor-pointer" title="Edit Product"><Edit3 className="w-4.5 h-4.5" /></button>
                            <button onClick={() => handleDuplicateProduct(p)} className="p-1.5 text-gray-400 hover:text-indigo-500 hover:bg-gray-50 rounded transition cursor-pointer" title="Duplicate Product"><Copy className="w-4.5 h-4.5" /></button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete ${p.name} listing?`)) {
                                  onDeleteProduct(p.id);
                                  addToast(`Product [${p.name}] deleted.`);
                                  onLogActivity('Delete Product', `Deleted catalog item ${p.name}`);
                                }
                              }}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition cursor-pointer"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4.5 h-4.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Add/Edit Product Modal Dialog */}
                <AnimatePresence>
                  {isAddProductOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4 select-none">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white dark:bg-navy-900 border rounded-3xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-4 text-xs text-left"
                      >
                        <div className="flex justify-between items-center border-b pb-3">
                          <h4 className="font-display font-bold text-sm text-navy-950 dark:text-white uppercase tracking-wider">
                            {editProductId ? 'Edit Product details' : 'Publish new Product listing'}
                          </h4>
                          <button onClick={() => setIsAddProductOpen(false)} className="p-1 text-gray-400 hover:text-navy-950 hover:bg-gray-100 rounded-lg cursor-pointer"><X className="w-5 h-5" /></button>
                        </div>

                        <form onSubmit={handleSaveProductForm} className="space-y-4 leading-normal font-sans">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] text-gray-400 font-mono mb-1">Product Title</label>
                              <input type="text" required value={prodName} onChange={(e) => setProdName(e.target.value)} placeholder="e.g. Stacking Elephant Tower" className="w-full px-3 py-2 border rounded-xl" />
                            </div>
                            <div>
                              <label className="block text-[10px] text-gray-400 font-mono mb-1">SKU identifier</label>
                              <input type="text" required value={prodSku} onChange={(e) => setProdSku(e.target.value)} placeholder="e.g. TOY-WD-01" className="w-full px-3 py-2 border rounded-xl" />
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <label className="block text-[10px] text-gray-400 font-mono mb-1">Price (Rs.)</label>
                              <input type="number" required value={prodPrice} onChange={(e) => setProdPrice(Number(e.target.value))} className="w-full px-3 py-2 border rounded-xl" />
                            </div>
                            <div>
                              <label className="block text-[10px] text-gray-400 font-mono mb-1">Discount Price</label>
                              <input type="number" value={prodDiscPrice || ''} onChange={(e) => setProdDiscPrice(e.target.value ? Number(e.target.value) : undefined)} className="w-full px-3 py-2 border rounded-xl" />
                            </div>
                            <div>
                              <label className="block text-[10px] text-gray-400 font-mono mb-1">Stock Level</label>
                              <input type="number" required value={prodStock} onChange={(e) => setProdStock(Number(e.target.value))} className="w-full px-3 py-2 border rounded-xl" />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] text-gray-400 font-mono mb-1">Category Slug</label>
                              <select value={prodCategory} onChange={(e) => setProdCategory(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-white">
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] text-gray-400 font-mono mb-1">Video Attachment URL</label>
                              <input type="text" value={prodVideoUrl} onChange={(e) => setProdVideoUrl(e.target.value)} placeholder="https://youtube.com/embed/..." className="w-full px-3 py-2 border rounded-xl" />
                            </div>
                          </div>

                          {prodCategory === 'toys' && (
                            <div className="p-3 bg-gray-50 border rounded-2xl space-y-3">
                              <span className="font-mono text-[9px] text-[#C5A021] block font-bold uppercase">Toy developmental parameters</span>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div>
                                  <label className="block text-[9px] text-gray-400 font-mono mb-0.5">Min Age</label>
                                  <input type="number" value={prodMinAge} onChange={(e) => setProdMinAge(Number(e.target.value))} className="w-full px-2 py-1.5 border rounded-lg bg-white" />
                                </div>
                                <div>
                                  <label className="block text-[9px] text-gray-400 font-mono mb-0.5">Max Age</label>
                                  <input type="number" value={prodMaxAge} onChange={(e) => setProdMaxAge(Number(e.target.value))} className="w-full px-2 py-1.5 border rounded-lg bg-white" />
                                </div>
                                <div>
                                  <label className="block text-[9px] text-gray-400 font-mono mb-0.5">Skill focus</label>
                                  <input type="text" value={prodSkill} onChange={(e) => setProdSkill(e.target.value)} className="w-full px-2 py-1.5 border rounded-lg bg-white" />
                                </div>
                                <div>
                                  <label className="block text-[9px] text-gray-400 font-mono mb-0.5">Category method</label>
                                  <input type="text" value={prodEdu} onChange={(e) => setProdEdu(e.target.value)} className="w-full px-2 py-1.5 border rounded-lg bg-white" />
                                </div>
                              </div>
                            </div>
                          )}

                          <div>
                            <label className="block text-[10px] text-gray-400 font-mono mb-1">Image URL</label>
                            <input type="text" required value={prodImages[0]} onChange={(e) => setProdImages([e.target.value])} className="w-full px-3 py-2 border rounded-xl" />
                          </div>

                          <div>
                            <label className="block text-[10px] text-gray-400 font-mono mb-1">Product Description</label>
                            <textarea rows={3} required value={prodDesc} onChange={(e) => setProdDesc(e.target.value)} className="w-full px-3 py-2 border rounded-xl" />
                          </div>

                          <div className="flex gap-3 justify-end pt-3">
                            <button type="button" onClick={() => setIsAddProductOpen(false)} className="px-5 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition cursor-pointer">Cancel</button>
                            <button type="submit" className="px-5 py-2 bg-navy-950 text-white rounded-xl hover:bg-[#C5A021] hover:text-navy-950 font-bold transition cursor-pointer">Save Catalog listing</button>
                          </div>
                        </form>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* VIEW 4: CATEGORIES */}
            {activeTab === 'categories' && (
              <motion.div
                key="categories"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center pb-2 border-b border-gray-150">
                  <h3 className="font-display font-bold text-xs uppercase tracking-wider text-navy-950 dark:text-white">
                    Category Shelves Manager
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                  {/* Create form */}
                  <form onSubmit={handleAddCategory} className="bg-white dark:bg-navy-900 p-5 border rounded-3xl text-left space-y-4 text-xs">
                    <span className="font-bold text-navy-950 dark:text-white block uppercase tracking-wider">Create Category</span>
                    <div>
                      <label className="block text-[10px] text-gray-400 font-mono mb-1">Category name</label>
                      <input type="text" required value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="e.g. Clay figurines" className="w-full px-3 py-2 border rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-400 font-mono mb-1">Image URL</label>
                      <input type="text" required value={newCatUrl} onChange={(e) => setNewCatUrl(e.target.value)} className="w-full px-3 py-2 border rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-400 font-mono mb-1">Description</label>
                      <textarea value={newCatDesc} onChange={(e) => setNewCatDesc(e.target.value)} rows={3} className="w-full px-3 py-2 border rounded-xl" />
                    </div>
                    <button type="submit" className="w-full py-2 bg-navy-950 hover:bg-[#C5A021] text-white hover:text-navy-950 font-bold uppercase tracking-wider rounded-xl transition cursor-pointer">Publish Category</button>
                  </form>

                  {/* Categories list */}
                  <div className="md:col-span-2 bg-white dark:bg-navy-900 border rounded-3xl p-6 shadow-sm text-left text-xs space-y-4">
                    <span className="font-bold text-navy-950 dark:text-white block">Active Category Directories</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {categories.map((c) => (
                        <div key={c.id} className="p-3.5 border rounded-2xl flex items-center justify-between gap-3 bg-gray-50/50">
                          <div className="flex items-center gap-3">
                            <img src={c.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover bg-white border shrink-0" />
                            <div>
                              <p className="font-semibold text-navy-950">{c.name}</p>
                              <p className="text-[10px] text-gray-400 font-mono">{c.id}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete category [${c.name}]?`)) {
                                setCategories(prev => prev.filter(cat => cat.id !== c.id));
                                addToast(`Category [${c.name}] deleted.`);
                              }
                            }}
                            className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded transition cursor-pointer border"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* VIEW 5: CUSTOMERS */}
            {activeTab === 'customers' && (
              <motion.div
                key="customers"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center pb-2 border-b border-gray-150">
                  <h3 className="font-display font-bold text-xs uppercase tracking-wider text-navy-950 dark:text-white">
                    Customer Directories workspace
                  </h3>
                </div>

                <div className="bg-white dark:bg-navy-900 border rounded-3xl p-6 shadow-sm overflow-x-auto text-left text-xs">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-gray-400 font-semibold">
                        <th className="pb-3">Customer Identity</th>
                        <th className="pb-3">Address coordinates</th>
                        <th className="pb-3 text-center">Orders count</th>
                        <th className="pb-3 text-right">Lifetime spent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { name: 'Alok Sharma', email: 'aloksharma@gmail.com', address: 'B-102, Saket, New Delhi', spent: 6480, ordersCount: 4 },
                        { name: 'Nisha Krishnan', email: 'nisha.k@yahoo.com', address: 'Flat 4C, Royal Palm Apartments, Chennai', spent: 11990, ordersCount: 8 },
                        { name: 'Rohan Advani', email: 'rohan.advani@hotmail.com', address: '22, Hill Road, Bandra, Mumbai', spent: 3499, ordersCount: 2 }
                      ].map((cust, idx) => (
                        <tr key={idx} className="border-b last:border-b-0">
                          <td className="py-3">
                            <p className="font-semibold text-navy-950 dark:text-white leading-none">{cust.name}</p>
                            <p className="text-[10px] text-gray-400 font-mono mt-1">{cust.email}</p>
                          </td>
                          <td className="py-3 text-gray-500 dark:text-slate-300 font-light">{cust.address}</td>
                          <td className="py-3 text-center font-mono font-semibold">{cust.ordersCount} bookings</td>
                          <td className="py-3 text-right font-mono font-bold text-emerald-500">Rs. {cust.spent}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* VIEW 6: COUPONS */}
            {activeTab === 'coupons' && (
              <motion.div
                key="coupons"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6 text-left"
              >
                <div className="flex justify-between items-center pb-2 border-b border-gray-150">
                  <h3 className="font-display font-bold text-xs uppercase tracking-wider text-navy-950 dark:text-white">
                    Discounts & Coupon Codes Workspace
                  </h3>
                  <button
                    onClick={() => setIsAddCouponOpen(true)}
                    className="px-4 py-2 bg-navy-950 hover:bg-[#C5A021] text-white hover:text-navy-950 border border-navy-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Create Coupon
                  </button>
                </div>

                {/* Coupons list */}
                <div className="bg-white dark:bg-navy-900 border rounded-3xl p-6 shadow-sm overflow-x-auto text-xs">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-gray-400 font-semibold">
                        <th className="pb-3 text-left">Coupon Code</th>
                        <th className="pb-3 text-left">Discount details</th>
                        <th className="pb-3 text-right">Min cart value</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coupons.map((c) => (
                        <tr key={c.code} className="border-b last:border-b-0">
                          <td className="py-3 font-mono font-bold text-navy-950 dark:text-white">{c.code}</td>
                          <td className="py-3">
                            <span className="font-semibold block">{c.description}</span>
                            <span className="text-[10px] text-gray-400 font-mono">Value: {c.type === 'percentage' ? `${c.value}% Off` : `Rs.${c.value} Flat`}</span>
                          </td>
                          <td className="py-3 text-right font-mono font-bold">Rs. {c.minimumCartValue}</td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => {
                                onDeleteCoupon(c.code);
                                onLogActivity('Purge Coupon', `Promo Code ${c.code} deleted.`);
                                addToast(`Coupon [${c.code}] deleted.`);
                              }}
                              className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded transition cursor-pointer border border-transparent hover:border-red-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Add Coupon Modal */}
                <AnimatePresence>
                  {isAddCouponOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white dark:bg-navy-900 border rounded-3xl p-6 max-w-md w-full space-y-4 text-xs text-left"
                      >
                        <div className="flex justify-between items-center border-b pb-3">
                          <h4 className="font-display font-bold text-sm text-navy-950 dark:text-white uppercase tracking-wider">Publish New Coupon</h4>
                          <button onClick={() => setIsAddCouponOpen(false)} className="p-1 text-gray-400 hover:text-navy-950 hover:bg-gray-100 rounded-lg cursor-pointer"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handlePublishCoupon} className="space-y-4 font-sans">
                          <div>
                            <label className="block text-[10px] text-gray-400 font-mono mb-1">Coupon code</label>
                            <input type="text" required value={newCoupCode} onChange={(e) => setNewCoupCode(e.target.value)} placeholder="e.g. MERISVIP" className="w-full px-3 py-2 border rounded-xl uppercase" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] text-gray-400 font-mono mb-1">Discount type</label>
                              <select value={newCoupType} onChange={(e: any) => setNewCoupType(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-white">
                                <option value="percentage">Percentage Off (%)</option>
                                <option value="flat">Flat Value Off (Rs.)</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] text-gray-400 font-mono mb-1">Discount value</label>
                              <input type="number" required value={newCoupVal} onChange={(e) => setNewCoupVal(Number(e.target.value))} className="w-full px-3 py-2 border rounded-xl" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] text-gray-400 font-mono mb-1">Min order value</label>
                            <input type="number" required value={newCoupMin} onChange={(e) => setNewCoupMin(Number(e.target.value))} className="w-full px-3 py-2 border rounded-xl" />
                          </div>
                          <div>
                            <label className="block text-[10px] text-gray-400 font-mono mb-1">Description</label>
                            <input type="text" required value={newCoupDesc} onChange={(e) => setNewCoupDesc(e.target.value)} placeholder="e.g. Save 10% on stencils" className="w-full px-3 py-2 border rounded-xl" />
                          </div>
                          <button type="submit" className="w-full py-2 bg-navy-950 text-white rounded-xl font-bold uppercase tracking-wider hover:bg-[#C5A021] hover:text-navy-950 transition cursor-pointer">Activate Promo Code</button>
                        </form>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* VIEW 7: REVIEWS */}
            {activeTab === 'reviews' && (
              <motion.div
                key="reviews"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6 text-left"
              >
                <div className="flex justify-between items-center pb-2 border-b border-gray-150">
                  <h3 className="font-display font-bold text-xs uppercase tracking-wider text-navy-950 dark:text-white">
                    Client reviews moderation queue
                  </h3>
                </div>

                <div className="space-y-4 text-xs font-sans">
                  {products.flatMap(p => p.reviews.map(r => ({ product: p, review: r }))).map(({ product, review }) => (
                    <div key={review.id} className="p-4 rounded-3xl border border-gray-100 bg-white dark:bg-navy-900 shadow-sm flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-navy-950 dark:text-white">{review.author}</span>
                          <span className="text-[10px] text-gray-400 font-mono">{review.date}</span>
                        </div>
                        <p className="text-[10px] text-[#C5A021] font-mono">Catalog item: {product.name}</p>
                        <p className="text-xs text-gray-600 dark:text-slate-300 italic">"{review.comment}"</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => {
                            onApproveReview(product.id, review.id, !review.approved);
                            addToast(`Review status toggled successfully.`);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition cursor-pointer ${
                            review.approved ? 'bg-emerald-50 text-emerald-600 border' : 'bg-amber-50 text-amber-600 border'
                          }`}
                        >
                          {review.approved ? 'Approved' : 'Suspended'}
                        </button>
                        <button
                          onClick={() => {
                            if (onDeleteReview) {
                              onDeleteReview(product.id, review.id);
                              addToast('Review deleted successfully.');
                            }
                          }}
                          className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition cursor-pointer border"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* VIEW 8: GIFT ORDERS */}
            {activeTab === 'gift-orders' && (
              <motion.div
                key="gift-orders"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6 text-left"
              >
                <div className="flex justify-between items-center pb-2 border-b border-gray-150">
                  <h3 className="font-display font-bold text-xs uppercase tracking-wider text-navy-950 dark:text-white">
                    Gift wrapping orders tracker
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 border rounded-3xl bg-white dark:bg-navy-900 shadow-sm text-xs space-y-1">
                    <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">Gift Wrap Revenue</span>
                    <h3 className="text-xl font-bold text-navy-950 dark:text-white">Rs. {orders.filter(o => o.giftWrappingRequested).length * 100}</h3>
                    <span className="text-[9px] text-gray-400">Rs. 100 premium flat charge per wrap</span>
                  </div>
                  <div className="p-5 border rounded-3xl bg-white dark:bg-navy-900 shadow-sm text-xs space-y-1">
                    <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">Active wrap orders</span>
                    <h3 className="text-xl font-bold text-navy-950 dark:text-white">
                      {orders.filter(o => o.giftWrappingRequested).length} Packages
                    </h3>
                    <span className="text-[9px] text-orange-400 font-semibold">Custom wax-seal bags</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {orders.filter(o => o.giftWrappingRequested).map((ord) => (
                    <div key={ord.id} className="p-5 border rounded-3xl bg-white dark:bg-navy-900 text-xs space-y-3">
                      <div className="flex justify-between items-center border-b pb-2">
                        <span className="font-mono font-bold text-navy-950 dark:text-white">ID: {ord.orderNumber}</span>
                        <span className="px-2 py-0.5 rounded bg-orange-50 text-orange-600 font-mono text-[9px] font-bold uppercase">
                          {ord.giftWrappingType || 'Generic Theme'}
                        </span>
                      </div>
                      <div className="space-y-1 leading-normal font-sans">
                        <p className="font-semibold text-gray-700 dark:text-slate-300">Message Note:</p>
                        <p className="italic text-gray-500">"{ord.giftMessage || 'No message provided.'}"</p>
                        <p className="pt-2 text-[10px] text-gray-400">Recipient Address: {ord.customerInfo.address}</p>
                      </div>
                    </div>
                  ))}
                  {orders.filter(o => o.giftWrappingRequested).length === 0 && (
                    <p className="text-center text-gray-400 font-mono py-10 text-xs">No active gift orders.</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* VIEW 9: MEMBERSHIP */}
            {activeTab === 'membership' && (
              <motion.div
                key="membership"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6 text-left animate-none"
              >
                <div className="flex justify-between items-center pb-2 border-b border-gray-150">
                  <h3 className="font-display font-bold text-xs uppercase tracking-wider text-navy-950 dark:text-white">
                    Privilege Club Loyalty roster
                  </h3>
                </div>

                <div className="bg-white dark:bg-navy-900 border rounded-3xl p-6 shadow-sm overflow-x-auto text-xs font-sans">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-gray-400 font-semibold">
                        <th className="pb-3 text-left">Member Profile</th>
                        <th className="pb-3 text-center">Loyalty Level</th>
                        <th className="pb-3 text-center">Reward balance</th>
                        <th className="pb-3 text-right">Join Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { name: 'Alok Sharma', level: 'Silver', points: 350, joined: '2026-03-12' },
                        { name: 'Nisha Krishnan', level: 'Platinum', points: 1550, joined: '2026-02-15' },
                        { name: 'Rohan Advani', level: 'Bronze', points: 80, joined: '2026-05-20' }
                      ].map((mbr, idx) => (
                        <tr key={idx} className="border-b last:border-b-0">
                          <td className="py-3 font-semibold text-navy-950 dark:text-white">{mbr.name}</td>
                          <td className="py-3 text-center">
                            <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider ${
                              mbr.level === 'Platinum' ? 'bg-cyan-50 text-cyan-600 border border-cyan-200' :
                              mbr.level === 'Gold' ? 'bg-yellow-50 text-yellow-600 border border-yellow-250' :
                              mbr.level === 'Silver' ? 'bg-slate-50 text-slate-500 border border-slate-300' :
                              'bg-amber-50 text-amber-600 border border-amber-200'
                            }`}>
                              {mbr.level}
                            </span>
                          </td>
                          <td className="py-3 text-center font-mono font-bold text-[#C5A021]">{mbr.points} PTS</td>
                          <td className="py-3 text-right font-mono text-gray-400">{mbr.joined}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* VIEW 10: REPORTS */}
            {activeTab === 'reports' && (
              <motion.div
                key="reports"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6 text-left"
              >
                <div className="flex justify-between items-center pb-2 border-b border-gray-150">
                  <h3 className="font-display font-bold text-xs uppercase tracking-wider text-navy-950 dark:text-white">
                    Financial Reports & Charts
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleExportPDF('products')}
                      className="px-3.5 py-2 bg-navy-950 text-white border border-navy-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> PDF Catalog
                    </button>
                    <button
                      onClick={() => handleExportCSV('orders')}
                      className="px-3.5 py-2 bg-[#C5A021]/15 hover:bg-[#C5A021]/25 text-[#C5A021] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border"
                    >
                      <Download className="w-3.5 h-3.5" /> CSV Orders
                    </button>
                  </div>
                </div>

                {/* SVG sales volume bar chart representation */}
                <div className="bg-white dark:bg-navy-900 border rounded-3xl p-6 shadow-sm space-y-4">
                  <h4 className="font-display font-bold text-xs uppercase tracking-wider text-navy-950 dark:text-white">
                    Revenue Stream breakdown (Monthly)
                  </h4>
                  <div className="h-44 w-full flex items-end">
                    <svg viewBox="0 0 400 120" className="w-full h-full text-[#C5A021]">
                      <rect x="30" y="70" width="22" height="50" rx="3" className="fill-[#C5A021]/80 hover:fill-[#C5A021] transition" />
                      <rect x="80" y="50" width="22" height="70" rx="3" className="fill-[#C5A021]/80 hover:fill-[#C5A021] transition" />
                      <rect x="130" y="60" width="22" height="60" rx="3" className="fill-[#C5A021]/80 hover:fill-[#C5A021] transition" />
                      <rect x="180" y="30" width="22" height="90" rx="3" className="fill-[#C5A021]/80 hover:fill-[#C5A021] transition" />
                      <rect x="230" y="20" width="22" height="100" rx="3" className="fill-[#C5A021]/80 hover:fill-[#C5A021] transition" />
                      <rect x="280" y="10" width="22" height="110" rx="3" className="fill-[#C5A021]/80 hover:fill-[#C5A021] transition" />
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
              </motion.div>
            )}

            {/* VIEW 11: SECURITY */}
            {activeTab === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6 text-left"
              >
                <div className="flex justify-between items-center pb-2 border-b border-gray-150">
                  <h3 className="font-display font-bold text-xs uppercase tracking-wider text-navy-950 dark:text-white">
                    Admin Security Control Vault
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Security score */}
                  <div className="p-6 bg-white dark:bg-navy-900 border rounded-3xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 font-mono tracking-wider uppercase block">Security Score</span>
                      <h3 className="text-3xl font-black text-emerald-500 leading-none mt-1">98/100</h3>
                      <span className="text-[9px] text-emerald-500 font-semibold block mt-1">ASVS compliancy certified</span>
                    </div>
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Active login check */}
                  <div className="p-6 bg-white dark:bg-navy-900 border rounded-3xl text-xs space-y-1">
                    <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">Active administrator session</span>
                    <p className="font-bold text-navy-950 dark:text-white mt-1">1 active session</p>
                    <p className="text-[9px] text-gray-400">Linked to cookies tokens auth</p>
                  </div>

                  {/* Two factor control */}
                  <div className="p-6 bg-white dark:bg-navy-900 border rounded-3xl text-xs flex justify-between items-center">
                    <div className="space-y-1">
                      <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">Two-Factor Auth</span>
                      <p className="font-semibold">{twoFactorEnabled ? 'Enabled' : 'Disabled'}</p>
                    </div>
                    <button
                      onClick={() => {
                        setTwoFactorEnabled(!twoFactorEnabled);
                        addToast(`Two-factor verification successfully ${!twoFactorEnabled ? 'activated' : 'deactivated'}.`);
                      }}
                      className="px-3.5 py-2 bg-gray-100 hover:bg-gray-250 font-bold tracking-wider rounded-xl cursor-pointer text-[10px] uppercase transition border"
                    >
                      Toggle 2FA
                    </button>
                  </div>
                </div>

                {/* Audit logs trail view */}
                <div className="bg-white dark:bg-navy-900 border rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h4 className="font-display font-bold text-xs uppercase tracking-wider text-navy-950 dark:text-white">
                      Security logs timeline audit
                    </h4>
                    {logs.length > 0 && (
                      <button onClick={onClearLogs} className="text-red-500 text-[10px] font-bold uppercase tracking-wider cursor-pointer">Clear trail</button>
                    )}
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar font-mono text-[10px] text-left">
                    {logs.map((log) => (
                      <div key={log.id} className="p-2.5 bg-navy-950 text-slate-200 border border-gold-400/10 rounded-xl flex justify-between items-center">
                        <div>
                          <span className="text-gold-400 font-bold uppercase">[{log.action}]</span>
                          <span className="ml-2 font-light">{log.details}</span>
                        </div>
                        <button onClick={() => onDeleteLog(log.id)} className="text-red-400 hover:text-red-500 shrink-0 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* VIEW 12: SETTINGS */}
            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6 text-left"
              >
                <div className="flex justify-between items-center pb-2 border-b border-gray-150">
                  <h3 className="font-display font-bold text-xs uppercase tracking-wider text-navy-950 dark:text-white">
                    General configurations panel
                  </h3>
                </div>

                <form onSubmit={handleSaveSettings} className="bg-white dark:bg-navy-900 p-6 border rounded-3xl space-y-6 text-xs leading-normal font-sans">
                  
                  {/* SMTP fields */}
                  <div className="space-y-3">
                    <span className="font-mono text-[9px] text-[#C5A021] block font-bold uppercase tracking-widest border-b pb-1.5">1. Transactional SMTP credentials</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] text-gray-400 font-mono mb-1">SMTP Host</label>
                        <input type="text" value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} className="w-full px-3 py-2 border rounded-xl" />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-400 font-mono mb-1">SMTP Port</label>
                        <input type="number" value={smtpPort} onChange={(e) => setSmtpPort(Number(e.target.value))} className="w-full px-3 py-2 border rounded-xl" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] text-gray-400 font-mono mb-1">SMTP Sender User</label>
                        <input type="email" value={smtpUser} onChange={(e) => setSmtpUser(e.target.value)} className="w-full px-3 py-2 border rounded-xl" />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-400 font-mono mb-1">SMTP Password</label>
                        <input type="password" value={smtpPass} onChange={(e) => setSmtpPass(e.target.value)} className="w-full px-3 py-2 border rounded-xl" />
                      </div>
                    </div>
                  </div>

                  {/* WhatsApp Support & Shipping Fees */}
                  <div className="space-y-3">
                    <span className="font-mono text-[9px] text-[#C5A021] block font-bold uppercase tracking-widest border-b pb-1.5">2. WhatsApp Helpline & shipping fees</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] text-gray-400 font-mono mb-1">WhatsApp phone number</label>
                        <input type="text" value={whatsappNo} onChange={(e) => setWhatsappNo(e.target.value)} className="w-full px-3 py-2 border rounded-xl" />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-400 font-mono mb-1">Shipping flat charge (Rs.)</label>
                        <input type="number" value={shipCharge} onChange={(e) => setShipCharge(Number(e.target.value))} className="w-full px-3 py-2 border rounded-xl" />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-400 font-mono mb-1">Min cart for free delivery (Rs.)</label>
                        <input type="number" value={delivCharge} onChange={(e) => setDelivCharge(Number(e.target.value))} className="w-full px-3 py-2 border rounded-xl" />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-navy-950 text-white rounded-xl font-bold uppercase tracking-wider hover:bg-[#C5A021] hover:text-navy-950 transition cursor-pointer"
                  >
                    Save configuration matrix
                  </button>
                </form>
              </motion.div>
            )}

          </AnimatePresence>
        </main>

      </div>
    </div>
  );
}
