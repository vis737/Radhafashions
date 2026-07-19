import React, { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, BarChart3, Package, Layers, Settings, Users, Percent, Sparkles, Plus, Trash2, Edit3, ClipboardCheck, MessageSquareCode, ShieldCheck, Key, HelpCircle, Check, X, FileEdit, Upload, ImageIcon, Store } from 'lucide-react';
import { Product, Coupon, BannerCampaign, CMSConfig, Order, ActivityLog, Review, Vendor } from '../types';
import { CATEGORIES } from '../utils/mockData';
import VendorDashboard from './VendorDashboard';
import AdminLiveMonitor from './AdminLiveMonitor';
import AdminBusinessAnalytics from './AdminBusinessAnalytics';
import AdminSecurityCenter from './AdminSecurityCenter';

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
  onLogActivity,
  autoAuthenticated = false,
  onLogoutAdmin
}: AdminDashboardProps) {
  // Authentication Gate states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const isAuthorized = isAuthenticated || autoAuthenticated;
  const [role, setRole] = useState<'owner' | 'developer'>('owner');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorSent, setTwoFactorSent] = useState(false);
  const [authError, setAuthError] = useState('');

  // Active workspace subsection router
  const [activeTab, setActiveTab] = useState<'analytics' | 'products' | 'orders' | 'coupons' | 'vendors' | 'campaigns' | 'moderation' | 'cms' | 'settings' | 'logs'>('analytics');

  // Form states: New Product
  const [editProductId, setEditProductId] = useState<string | null>(null);
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState(499);
  const [newProductCategory, setNewProductCategory] = useState('Kids Toys');
  const [newProductSku, setNewProductSku] = useState('MR-PROD-NEW');
  const [newProductStock, setNewProductStock] = useState(15);
  const [newProductDesc, setNewProductDesc] = useState('');
  const [newProductUrl, setNewProductUrl] = useState('https://images.unsplash.com/photo-1515488042361-404e9250afef?w=600&auto=format&fit=crop');
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states: New Coupon
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState<'percentage' | 'flat'>('percentage');
  const [newCouponValue, setNewCouponValue] = useState(10);
  const [newCouponMin, setNewCouponMin] = useState(500);
  const [newCouponLimit, setNewCouponLimit] = useState(100);
  const [newCouponDesc, setNewCouponDesc] = useState('');

  // Form states: CMS texts
  const [cmsHeadline, setCmsHeadline] = useState(cms.headline);
  const [cmsSubheadline, setCmsSubheadline] = useState(cms.subheadline);
  const [cmsAbout, setCmsAbout] = useState(cms.aboutText);

  // Form states: Admin credentials
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [settingsMessage, setSettingsMessage] = useState('');
  const [settingsError, setSettingsError] = useState('');

  // Extract unique clients/customers
  const clientsList = React.useMemo(() => {
    const map = new Map<string, { name: string; email: string; phone: string; address: string; totalSpent: number; ordersCount: number }>();
    orders.forEach(o => {
      const emailKey = (o.customerInfo?.email || '').toLowerCase().trim();
      if (!emailKey) return;
      
      const existing = map.get(emailKey);
      if (existing) {
        existing.totalSpent += o.total;
        existing.ordersCount += 1;
      } else {
        map.set(emailKey, {
          name: o.customerInfo?.name || 'Guest',
          email: o.customerInfo?.email || '',
          phone: o.customerInfo?.phone || '',
          address: o.customerInfo?.address || '',
          totalSpent: o.total,
          ordersCount: 1
        });
      }
    });
    return Array.from(map.values());
  }, [orders]);

  // --- CSV Export Helper ---
  const handleExportCSV = (type: 'products' | 'orders' | 'logs' | 'clients') => {
    let headers: string[] = [];
    let rows: string[][] = [];
    let filename = `meris_${type}_report_${new Date().toISOString().slice(0,10)}.csv`;

    if (type === 'products') {
      headers = ['ID', 'SKU', 'Name', 'Category', 'Price (INR)', 'Stock', 'Rating'];
      rows = products.map(p => [
        p.id,
        p.sku,
        `"${p.name.replace(/"/g, '""')}"`,
        p.category,
        p.price.toString(),
        p.stock.toString(),
        p.rating.toString()
      ]);
    } else if (type === 'orders') {
      headers = ['Order Number', 'Date', 'Customer Name', 'Customer Email', 'Customer Phone', 'Total (INR)', 'Status', 'Gateway'];
      rows = orders.map(o => [
        o.orderNumber,
        o.date.slice(0, 10),
        `"${(o.customerInfo?.name || '').replace(/"/g, '""')}"`,
        o.customerInfo?.email || '',
        o.customerInfo?.phone || '',
        o.total.toString(),
        o.status,
        o.paymentMethod || 'Razorpay'
      ]);
    } else if (type === 'logs') {
      headers = ['Timestamp', 'Action', 'Details', 'Operator'];
      rows = logs.map(l => [
        l.timestamp,
        `"${l.action.replace(/"/g, '""')}"`,
        `"${l.details.replace(/"/g, '""')}"`,
        l.user || 'Admin'
      ]);
    } else if (type === 'clients') {
      headers = ['Name', 'Email Address', 'Phone Number', 'Orders Count', 'Total Spent (INR)', 'Address'];
      rows = clientsList.map(c => [
        `"${c.name.replace(/"/g, '""')}"`,
        c.email,
        c.phone,
        c.ordersCount.toString(),
        c.totalSpent.toString(),
        `"${c.address.replace(/"/g, '""')}"`
      ]);
    }

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onLogActivity('Export CSV Data', `Exported ${type} archives to ${filename}`);
  };

  // --- PDF Export Helper ---
  const handleExportPDF = (type: 'products' | 'orders' | 'logs' | 'clients') => {
    const doc = new jsPDF();
    
    // Brand header
    doc.setFillColor(15, 23, 42); // Navy-900
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('MERIS E-SHOP', 15, 20);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(197, 160, 33); // Gold-400
    doc.text(`${type.toUpperCase()} ADMINISTRATIVE REPORT`, 15, 30);
    
    doc.setTextColor(255, 255, 255);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 140, 25);
    
    // Content layout
    doc.setTextColor(15, 23, 42); // Reset to navy
    doc.setFontSize(11);
    
    let y = 55;

    if (type === 'products') {
      // Headers
      doc.setFont('helvetica', 'bold');
      doc.text('SKU', 15, y);
      doc.text('Product Name', 45, y);
      doc.text('Category', 120, y);
      doc.text('Price (INR)', 165, y);
      doc.text('Stock', 185, y);
      
      doc.setDrawColor(229, 231, 235); // Gray-200
      doc.line(15, y + 3, 195, y + 3);
      y += 10;
      
      doc.setFont('helvetica', 'normal');
      products.forEach(p => {
        if (y > 275) { doc.addPage(); y = 20; }
        doc.text(p.sku.slice(0, 10), 15, y);
        // Truncate name to avoid overflow
        const shortName = p.name.length > 32 ? p.name.slice(0, 30) + '..' : p.name;
        doc.text(shortName, 45, y);
        doc.text(p.category.slice(0, 18), 120, y);
        doc.text(`Rs. ${p.price}`, 165, y);
        doc.text(p.stock.toString(), 185, y);
        y += 8;
      });
    } else if (type === 'orders') {
      // Headers
      doc.setFont('helvetica', 'bold');
      doc.text('Order#', 15, y);
      doc.text('Customer Name', 50, y);
      doc.text('Date', 115, y);
      doc.text('Total (INR)', 140, y);
      doc.text('Status', 170, y);
      
      doc.setDrawColor(229, 231, 235);
      doc.line(15, y + 3, 195, y + 3);
      y += 10;
      
      doc.setFont('helvetica', 'normal');
      orders.forEach(o => {
        if (y > 275) { doc.addPage(); y = 20; }
        doc.text(o.orderNumber, 15, y);
        const custName = o.customerInfo?.name || 'Guest';
        const shortName = custName.length > 25 ? custName.slice(0, 23) + '..' : custName;
        doc.text(shortName, 50, y);
        doc.text(o.date.slice(0, 10), 115, y);
        doc.text(`Rs. ${o.total}`, 140, y);
        doc.text(o.status.toUpperCase(), 170, y);
        y += 8;
      });
    } else if (type === 'logs') {
      // Headers
      doc.setFont('helvetica', 'bold');
      doc.text('Timestamp', 15, y);
      doc.text('Action', 55, y);
      doc.text('Details', 95, y);
      
      doc.setDrawColor(229, 231, 235);
      doc.line(15, y + 3, 195, y + 3);
      y += 10;
      
      doc.setFont('helvetica', 'normal');
      logs.forEach(l => {
        if (y > 275) { doc.addPage(); y = 20; }
        doc.text(new Date(l.timestamp).toLocaleString().slice(0, 16), 15, y);
        doc.text(l.action.slice(0, 16), 55, y);
        const detailsStr = l.details.length > 50 ? l.details.slice(0, 48) + '..' : l.details;
        doc.text(detailsStr, 95, y);
        y += 8;
      });
    } else if (type === 'clients') {
      // Headers
      doc.setFont('helvetica', 'bold');
      doc.text('Client Name', 15, y);
      doc.text('Email Address', 55, y);
      doc.text('Phone', 115, y);
      doc.text('Orders', 145, y);
      doc.text('Spent (INR)', 165, y);
      
      doc.setDrawColor(229, 231, 235);
      doc.line(15, y + 3, 195, y + 3);
      y += 10;
      
      doc.setFont('helvetica', 'normal');
      clientsList.forEach(c => {
        if (y > 275) { doc.addPage(); y = 20; }
        const shortName = c.name.length > 20 ? c.name.slice(0, 18) + '..' : c.name;
        doc.text(shortName, 15, y);
        doc.text(c.email.slice(0, 26), 55, y);
        doc.text(c.phone, 115, y);
        doc.text(c.ordersCount.toString(), 145, y);
        doc.text(`Rs. ${c.totalSpent}`, 165, y);
        y += 8;
      });
    }

    doc.save(`meris_${type}_report_${new Date().toISOString().slice(0,10)}.pdf`);
    onLogActivity('Export PDF Report', `Exported ${type} archives to PDF file`);
  };

  const handleUpdateAdminCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsMessage('');
    setSettingsError('');
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newAdminUsername, password: newAdminPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSettingsMessage('Administrative credentials updated successfully!');
        setNewAdminUsername('');
        setNewAdminPassword('');
        onLogActivity('Change Admin Credentials', 'Admin user and password changed via secure settings panel.');
      } else {
        setSettingsError(data.error || 'Failed to update credentials.');
      }
    } catch (err) {
      setSettingsError('Connection error: Failed to update administrative credentials.');
    }
  };

  // Handle local image file browse & upload
  const handleImageFilePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show instant local preview while uploading
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch('/api/upload-image', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setNewProductUrl(data.url);
      setImagePreview(data.url);
    } catch (err) {
      console.error('Image upload error:', err);
      // Keep local preview on error so admin can see the file
    } finally {
      setIsUploading(false);
      // Reset file input so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // 2-FA handler passcode sender
  const handleRequestTwoFactor = () => {
    setTwoFactorSent(true);
    setAuthError('');
    // Log target passcode
    console.log(`[Admin Workyard] Security validation bypass key is matching: 254321`);
  };

  const handleVerifyTwoFactor = (e: React.FormEvent) => {
    e.preventDefault();
    if (twoFactorCode === '254321' || twoFactorCode === '123456') {
      setIsAuthenticated(true);
      onLogActivity('Admin Login Successful', `Authorized as ${role === 'owner' ? 'Website Owner' : 'Website Developer'}`);
    } else {
      setAuthError('Incorrect authentication passcode sequence.');
    }
  };

  // Add or Edit catalog product
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim() || !newProductSku.trim()) return;

    if (editProductId) {
      const orig = products.find(p => p.id === editProductId);
      if (orig) {
        onEditProduct({
          ...orig,
          name: newProductName,
          price: Number(newProductPrice),
          category: newProductCategory,
          sku: newProductSku,
          stock: Number(newProductStock),
          shortDescription: newProductDesc,
          images: [newProductUrl, ...orig.images.slice(1)],
          availability: Number(newProductStock) === 0 ? 'out-of-stock' : Number(newProductStock) <= 5 ? 'low-stock' : 'in-stock'
        });
        onLogActivity('Modified Product Details', `SKU: ${newProductSku} edited by ${role}`);
      }
      setEditProductId(null);
    } else {
      const addedId = 'prod-' + Date.now();
      const addedProduct: Product = {
        id: addedId,
        sku: newProductSku,
        name: newProductName,
        category: newProductCategory,
        categorySlug: CATEGORIES.find(c => c.name === newProductCategory)?.id || 'toys',
        price: Number(newProductPrice),
        stock: Number(newProductStock),
        rating: 4.5,
        ratingCount: 1,
        images: [newProductUrl],
        shortDescription: newProductDesc,
        description: 'Premium curated catalog addition added securely via administrative dashboards.',
        specifications: { 'Origin': 'Crafted in Meris Studios' },
        reviews: [],
        brand: 'Meris Collection',
        availability: Number(newProductStock) === 0 ? 'out-of-stock' : Number(newProductStock) <= 5 ? 'low-stock' : 'in-stock'
      };
      onAddProduct(addedProduct);
      onLogActivity('Created New Product Catalog', `SKU: ${newProductSku} published by ${role}`);
    }

    // Reset fields
    setNewProductName('');
    setNewProductPrice(499);
    setNewProductSku('MR-PROD-NEW');
    setNewProductStock(15);
    setNewProductDesc('');
    setNewProductUrl('https://images.unsplash.com/photo-1515488042361-404e9250afef?w=600&auto=format&fit=crop');
    setImagePreview('');
  };

  const handleTriggerEditState = (product: Product) => {
    setEditProductId(product.id);
    setNewProductName(product.name);
    setNewProductPrice(product.price);
    setNewProductCategory(product.category);
    setNewProductSku(product.sku);
    setNewProductStock(product.stock);
    setNewProductDesc(product.shortDescription);
    setNewProductUrl(product.images[0]);
    setImagePreview(product.images[0]);
  };

  // Add coupon
  const handlePublishCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim() || !newCouponDesc.trim()) return;

    const added: Coupon = {
      code: newCouponCode.substring(0, 12).toUpperCase().replace(/[^A-Z0-9]/g, ''),
      type: newCouponType,
      value: Number(newCouponValue),
      expiryDate: '2026-12-31',
      usageLimit: Number(newCouponLimit),
      usageCount: 0,
      minimumCartValue: Number(newCouponMin),
      description: newCouponDesc,
      active: true
    };

    onAddCoupon(added);
    onLogActivity('Created Discount Coupon', `Promo Code [${added.code}] generated by ${role}`);
    
    // Reset inputs
    setNewCouponCode('');
    setNewCouponValue(10);
    setNewCouponMin(500);
    setNewCouponDesc('');
  };

  // Trigger CMS updates
  const handlePublishCMS = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCMS({
      ...cms,
      headline: cmsHeadline,
      subheadline: cmsSubheadline,
      aboutText: cmsAbout
    });
    onLogActivity('Updated CMS Homepage copy', `Homepage headings edited by ${role}`);
  };

  // Sales aggregates
  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((acc, o) => acc + o.total, 0);

  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;

  // --- Render 2-FA Auth Gate screen ---
  if (!isAuthorized) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 font-sans text-left">
        <div className="bg-navy-900 border border-gold-400/20 text-white rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Shimmer light */}
          <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_50%_0%,rgba(212,175,55,0.10),transparent_65%)] blur-2xl" />
          
          <div className="text-center space-y-1.5 relative z-10 pb-4 border-b border-white/5">
            <div className="w-12 h-12 bg-gradient-to-tr from-gold-600 to-gold-400 rounded-2xl flex items-center justify-center mx-auto shadow-md">
              <Key className="text-navy-950 w-5 h-5" />
            </div>
            <h2 className="font-display font-medium text-sm text-gold-300 uppercase tracking-widest pt-2">Merchant Control Center</h2>
            <p className="text-[10px] text-navy-200">Role-Based Access Control and 2-FA authorization bypass portal</p>
          </div>

          <div className="space-y-4 pt-4 relative z-10 text-xs">
            {/* Role selection toggle */}
            <div>
              <span className="block text-[10px] font-mono tracking-wider text-gray-400 uppercase mb-1">Select Access Profile</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setRole('owner')}
                  className={`flex-1 py-2 text-center text-[10px] font-bold uppercase rounded-xl transition cursor-pointer border ${role === 'owner' ? 'bg-gold-400 border-gold-400 text-navy-950 font-black' : 'border-white/10 text-gray-400 hover:bg-white/5'}`}
                >
                  Website Owner
                </button>
                <button
                  onClick={() => setRole('developer')}
                  className={`flex-1 py-2 text-center text-[10px] font-bold uppercase rounded-xl transition cursor-pointer border ${role === 'developer' ? 'bg-gold-400 border-gold-400 text-navy-950 font-black' : 'border-white/10 text-gray-400 hover:bg-white/5'}`}
                >
                  Website Developer
                </button>
              </div>
            </div>

            {/* Simulated 2FA passkey buttons */}
            {!twoFactorSent ? (
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleRequestTwoFactor}
                  className="w-full py-2.5 bg-gradient-to-tr from-gold-500 to-gold-400 text-navy-950 font-display font-semibold text-xs tracking-widest uppercase rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-gold-500/15 cursor-pointer"
                >
                  Request Two-Factor Code
                </button>
                <p className="text-[9px] text-center text-navy-300 leading-relaxed font-mono">
                  Pressing this triggers mock dual SMS notification.
                </p>
              </div>
            ) : (
              <form onSubmit={handleVerifyTwoFactor} className="space-y-3 pt-2">
                <div className="p-3.5 bg-gold-400/10 border border-gold-400/20 text-[11px] text-gold-300 rounded-xl leading-relaxed">
                  Mobile <span className="font-bold">Passkey dispatched!</span> Key-in security passkey <span className="font-mono font-bold underline">254321</span> or <span className="font-mono font-bold underline">123456</span> to gain immediate session keys.
                </div>
                
                <div>
                  <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">Input 2-FA PIN</label>
                  <input
                    type="text"
                    required
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value)}
                    placeholder="e.g. 254321"
                    className="w-full px-3 py-2 bg-navy-800 border border-white/10 text-center text-xs tracking-widest focus:outline-none focus:border-gold-400 rounded-xl"
                  />
                </div>

                {authError && <p className="text-[10px] text-red-400 text-center font-semibold font-mono">{authError}</p>}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-tr from-gold-500 to-gold-400 text-navy-950 font-display font-semibold text-xs tracking-widest uppercase rounded-xl transition cursor-pointer text-center flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4 text-navy-950" />
                  <span>Verify Passcode & Enter Workspace</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- Render full operational workspace ---
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      
      {/* Upper header banner display */}
      <div className="bg-navy-900 border border-gold-400/10 rounded-3xl p-6 mb-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-gold-400" />
            <h1 className="font-display font-medium text-sm tracking-widest text-gold-300 uppercase">Merchant Workyard Studio</h1>
          </div>
          <p className="text-xs text-navy-200">
            Authenticated via Role: <span className="font-bold underline text-white capitalize">{role}</span> Ledger Portal
          </p>
        </div>

        <button
          onClick={() => {
            setIsAuthenticated(false);
            setTwoFactorSent(false);
            setTwoFactorCode('');
            onLogActivity('Admin Logout', `Closed control session for role: ${role}`);
            if (onLogoutAdmin) {
              onLogoutAdmin();
            }
          }}
          className="px-4 py-2 border border-white/10 hover:border-red-400 text-gray-400 hover:text-red-400 rounded-xl text-xs font-mono transition cursor-pointer"
        >
          Exit Control Session
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side workspace navigation menu */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-1.5 text-left">
          <p className="text-[10px] font-mono tracking-wider text-gray-400 uppercase pb-2 mb-2 border-b border-gray-50">Studio Panels</p>
          
          {([
            { id: 'analytics', label: 'Sales Intelligence', icon: BarChart3 },
            { id: 'products', label: 'Catalog Products', icon: Package, count: products.length },
            { id: 'orders', label: 'Client Orders', icon: Layers, count: orders.length },
            { id: 'coupons', label: 'Campaign Coupons', icon: Percent, count: coupons.length },
            { id: 'vendors', label: 'Vendor Management', icon: Store, count: 3 },
            { id: 'live-monitoring', label: 'Live Monitoring', icon: Users },
            { id: 'business-analytics', label: 'Business Analytics', icon: BarChart3 },
            { id: 'security-center', label: 'Security Center', icon: ShieldCheck },
            { id: 'cms', label: 'CMS Layout Editor', icon: FileEdit },
            { id: 'moderation', label: 'Reviews Moderation', icon: MessageSquareCode },
            { id: 'settings', label: 'Security & Settings', icon: Settings },
            { id: 'logs', label: 'Security Activity Logs', icon: ShieldAlert, count: logs.length }
          ] as any[]).map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer ${activeTab === tab.id ? 'bg-gold-50 text-gold-600 border-l-4 border-gold-400 font-bold' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <span className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-gold-400 shrink-0" />
                  {tab.label}
                </span>
                {tab.count !== undefined && (
                  <span className="px-2 py-0.5 rounded-lg bg-gray-100 text-[10px] text-gray-600 font-bold font-mono">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Columns content views router */}
        <div className="lg:col-span-9 bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm text-left">
          <AnimatePresence mode="wait">
            
            {/* Sales Intelligence Graphs and Cards */}
            {activeTab === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6 text-left"
              >
                <h3 className="font-display font-medium text-sm text-navy-900 uppercase tracking-widest pb-1 border-b border-gray-100">Live Sales Analytics</h3>
                
                {/* Metrics top grid banner */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gradient-to-br from-gold-50 to-transparent border border-gold-100 rounded-2xl">
                    <span className="text-[10px] text-gold-600 font-mono tracking-wider uppercase font-semibold">Net Meris Sales Revenue</span>
                    <h4 className="text-xl sm:text-2xl font-bold font-mono text-navy-950 mt-1">Rs.{totalRevenue}</h4>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-transparent border border-blue-100 rounded-2xl">
                    <span className="text-[10px] text-blue-600 font-mono tracking-wider uppercase font-semibold">Total Orders Placed</span>
                    <h4 className="text-xl sm:text-2xl font-bold font-mono text-navy-950 mt-1">{orders.length} orders</h4>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-amber-50 to-transparent border border-amber-100 rounded-2xl">
                    <span className="text-[10px] text-amber-600 font-mono tracking-wider uppercase font-semibold">Pending Fulfillment</span>
                    <h4 className="text-xl sm:text-2xl font-bold font-mono text-navy-950 mt-1">{pendingOrdersCount} boxes</h4>
                  </div>
                </div>

                {/* Highly beautiful custom SVG bar charts for months */}
                <div className="p-5 rounded-2xl border border-gray-100">
                  <h4 className="font-display font-semibold text-xs text-navy-900 uppercase tracking-wider mb-4">Monthly Invoicing Ledger (2026)</h4>
                  <div className="h-44 w-full flex items-end justify-between pt-6 border-b border-gray-100 pb-2 relative">
                    {/* Graph grid lines */}
                    <div className="absolute left-0 right-0 top-1/4 select-none border-t border-dashed border-gray-100 text-[9px] text-gray-300 font-mono">15k</div>
                    <div className="absolute left-0 right-0 top-1/2 select-none border-t border-dashed border-gray-100 text-[9px] text-gray-300 font-mono">10k</div>
                    <div className="absolute left-0 right-0 top-3/4 select-none border-t border-dashed border-gray-100 text-[9px] text-gray-300 font-mono">5k</div>

                    {/* Columns */}
                    <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                      <div className="w-6 bg-gold-400 hover:bg-gold-500 rounded-t-lg cursor-pointer transition-all h-[40%]" title="Jan: Rs.8,000" />
                      <span className="text-[10px] font-mono text-gray-400">Jan</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                      <div className="w-6 bg-gold-400 hover:bg-gold-500 rounded-t-lg cursor-pointer transition-all h-[55%]" title="Feb: Rs.11,000" />
                      <span className="text-[10px] font-mono text-gray-400">Feb</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                      <div className="w-6 bg-gold-400 hover:bg-gold-500 rounded-t-lg cursor-pointer transition-all h-[48%]" title="Mar: Rs.9,600" />
                      <span className="text-[10px] font-mono text-gray-400">Mar</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                      <div className="w-6 bg-gold-400 hover:bg-gold-500 rounded-t-lg cursor-pointer transition-all h-[75%]" title="Apr: Rs.15,000" />
                      <span className="text-[10px] font-mono text-gray-400">Apr</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                      <div className="w-6 bg-gold-400 hover:bg-gold-500 rounded-t-lg cursor-pointer transition-all h-[85%]" title="May: Rs.17,000" />
                      <span className="text-[10px] font-mono text-gray-400">May</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                      <div className="w-6 bg-gradient-to-t from-gold-500 to-gold-400 hover:from-gold-600 rounded-t-lg cursor-pointer transition-all h-[95%]" title="Jun: Rs.19,250" />
                      <span className="text-[10px] font-mono text-navy-900 font-bold">Jun</span>
                    </div>
                  </div>
                </div>
                {/* Export Utilities Panel */}
                <div className="p-5 rounded-2xl border border-gray-100 space-y-4">
                  <h4 className="font-display font-semibold text-xs text-navy-900 uppercase tracking-wider">System Reports & Export Utilities</h4>
                  <p className="text-[11px] text-gray-500 font-sans">Select any core database partition below to instantly compile and download its structured archive in CSV sheet format or a formatted PDF administrative ledger.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                    <div className="p-4 border rounded-xl flex flex-col justify-between gap-3 hover:bg-slate-50 transition">
                      <div>
                        <h5 className="text-[11px] font-bold text-slate-800 font-mono">Product Inventory</h5>
                        <p className="text-[10px] text-gray-400 font-sans mt-0.5">{products.length} catalog items</p>
                      </div>
                      <div className="flex gap-2 text-[10px] font-semibold font-mono uppercase tracking-wide">
                        <button onClick={() => handleExportCSV('products')} className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-center cursor-pointer transition">CSV</button>
                        <button onClick={() => handleExportPDF('products')} className="flex-1 py-1.5 px-2 bg-[#C5A021]/15 hover:bg-[#C5A021]/25 text-[#C5A021] rounded-lg text-center cursor-pointer transition">PDF</button>
                      </div>
                    </div>

                    <div className="p-4 border rounded-xl flex flex-col justify-between gap-3 hover:bg-slate-50 transition">
                      <div>
                        <h5 className="text-[11px] font-bold text-slate-800 font-mono">Customer Booking Logs</h5>
                        <p className="text-[10px] text-gray-400 font-sans mt-0.5">{orders.length} transactions</p>
                      </div>
                      <div className="flex gap-2 text-[10px] font-semibold font-mono uppercase tracking-wide">
                        <button onClick={() => handleExportCSV('orders')} className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-center cursor-pointer transition">CSV</button>
                        <button onClick={() => handleExportPDF('orders')} className="flex-1 py-1.5 px-2 bg-[#C5A021]/15 hover:bg-[#C5A021]/25 text-[#C5A021] rounded-lg text-center cursor-pointer transition">PDF</button>
                      </div>
                    </div>

                    <div className="p-4 border rounded-xl flex flex-col justify-between gap-3 hover:bg-slate-50 transition">
                      <div>
                        <h5 className="text-[11px] font-bold text-slate-800 font-mono">Activity Audit Trail</h5>
                        <p className="text-[10px] text-gray-400 font-sans mt-0.5">{logs.length} audit entries</p>
                      </div>
                      <div className="flex gap-2 text-[10px] font-semibold font-mono uppercase tracking-wide">
                        <button onClick={() => handleExportCSV('logs')} className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-center cursor-pointer transition">CSV</button>
                        <button onClick={() => handleExportPDF('logs')} className="flex-1 py-1.5 px-2 bg-[#C5A021]/15 hover:bg-[#C5A021]/25 text-[#C5A021] rounded-lg text-center cursor-pointer transition">PDF</button>
                      </div>
                    </div>

                    <div className="p-4 border rounded-xl flex flex-col justify-between gap-3 hover:bg-slate-50 transition">
                      <div>
                        <h5 className="text-[11px] font-bold text-slate-800 font-mono">Client Directory</h5>
                        <p className="text-[10px] text-gray-400 font-sans mt-0.5">{clientsList.length} unique clients</p>
                      </div>
                      <div className="flex gap-2 text-[10px] font-semibold font-mono uppercase tracking-wide">
                        <button onClick={() => handleExportCSV('clients')} className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-center cursor-pointer transition">CSV</button>
                        <button onClick={() => handleExportPDF('clients')} className="flex-1 py-1.5 px-2 bg-[#C5A021]/15 hover:bg-[#C5A021]/25 text-[#C5A021] rounded-lg text-center cursor-pointer transition">PDF</button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'live-monitoring' && (
              <motion.div
                key="live-monitoring"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
              >
                <AdminLiveMonitor />
              </motion.div>
            )}

            {activeTab === 'business-analytics' && (
              <motion.div
                key="business-analytics"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
              >
                <AdminBusinessAnalytics products={products} />
              </motion.div>
            )}

            {activeTab === 'security-center' && (
              <motion.div
                key="security-center"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
              >
                <AdminSecurityCenter />
              </motion.div>
            )}

            {/* Product catalog management */}
            {activeTab === 'products' && (
              <motion.div
                key="products"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6 text-left"
              >
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <h3 className="font-display font-medium text-sm text-navy-900 uppercase tracking-widest">Products Management</h3>
                  <span className="text-[10px] font-mono text-gray-400 font-bold">MUTABLE DATABASE</span>
                </div>

                {/* Edit Form */}
                <form onSubmit={handleSaveProduct} className="p-4 rounded-2xl bg-gray-50 border space-y-3.5 text-xs">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-navy-900 font-display tracking-wide uppercase pb-2 border-b border-gray-200">
                    <Plus className="w-4 h-4 text-gold-400" />
                    <span>{editProductId ? 'Edit catalog Product' : 'Add New Category Product'}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-gray-400 font-mono mb-1">Product Title</label>
                      <input
                        type="text"
                        required
                        value={newProductName}
                        onChange={(e) => setNewProductName(e.target.value)}
                        placeholder="e.g. Traditional Hand-carved Rocking Horse"
                        className="w-full px-3 py-2 bg-white border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gold-400 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-400 font-mono mb-1">Category Category</label>
                      <select
                        value={newProductCategory}
                        onChange={(e) => setNewProductCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 focus:outline-none rounded-xl"
                      >
                        {CATEGORIES.map(c => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] text-gray-400 font-mono mb-1">Price (INR Rs.)</label>
                      <input
                        type="number"
                        required
                        value={newProductPrice}
                        onChange={(e) => setNewProductPrice(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gold-400 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-400 font-mono mb-1">SKU identifier</label>
                      <input
                        type="text"
                        required
                        value={newProductSku}
                        onChange={(e) => setNewProductSku(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gold-400 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-400 font-mono mb-1">Stock count</label>
                      <input
                        type="number"
                        required
                        value={newProductStock}
                        onChange={(e) => setNewProductStock(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gold-400 rounded-xl"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-[10px] text-gray-400 font-mono mb-1">Image URL</label>
                      {/* Image URL input + Browse button + preview */}
                      <div className="flex flex-col gap-2">
                        {/* Preview thumbnail */}
                        {(imagePreview || newProductUrl) && (
                          <div className="relative w-full h-24 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                            {isUploading && (
                              <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                                <div className="w-5 h-5 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
                              </div>
                            )}
                            <img
                              src={imagePreview || newProductUrl}
                              alt="Product preview"
                              className="w-full h-full object-cover"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                          </div>
                        )}

                        {/* URL text field */}
                        <input
                          type="text"
                          required
                          value={newProductUrl}
                          onChange={(e) => { setNewProductUrl(e.target.value); setImagePreview(''); }}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full px-3 py-2 bg-white border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gold-400 rounded-xl text-[10px] font-mono"
                        />

                        {/* Hidden file input */}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageFilePick}
                        />

                        {/* Browse button */}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 border-2 border-dashed border-gold-300 hover:border-gold-500 hover:bg-gold-50 text-gold-600 rounded-xl text-[10px] font-semibold font-mono uppercase tracking-wide transition cursor-pointer disabled:opacity-50"
                        >
                          {isUploading ? (
                            <><div className="w-3 h-3 border border-gold-500 border-t-transparent rounded-full animate-spin" /> Uploading...</>
                          ) : (
                            <><Upload className="w-3 h-3" /> Browse Local Image</>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-gray-400 font-mono mb-1">Short Narrative description</label>
                    <textarea
                      required
                      value={newProductDesc}
                      onChange={(e) => setNewProductDesc(e.target.value)}
                      placeholder="e.g. Masterpiece wood crafted rocker with chemical-free herbal oils."
                      rows={2}
                      className="w-full px-3 py-2 bg-white border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gold-400 rounded-xl"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-gradient-to-r from-gold-500 to-gold-400 text-navy-950 font-display font-medium text-xs tracking-wider uppercase rounded-xl transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4 text-navy-950" />
                      <span>{editProductId ? 'Publish Changes' : 'Publish Product'}</span>
                    </button>
                    {editProductId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditProductId(null);
                          setNewProductName('');
                          setNewProductSku('MR-PROD-NEW');
                          setNewProductStock(15);
                          setNewProductDesc('');
                        }}
                        className="px-4 py-2 border rounded-xl hover:bg-gray-200 text-gray-600 font-mono uppercase text-[10px]"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>

                {/* table lists */}
                <div className="overflow-x-auto rounded-2xl border mt-4">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="px-4 py-3 text-left font-display text-navy-900 uppercase tracking-wider w-14">Image</th>
                        <th className="px-4 py-3 text-left font-display text-navy-900 uppercase tracking-wider">Product</th>
                        <th className="px-4 py-3 text-left font-display text-navy-900 uppercase tracking-wider">Category</th>
                        <th className="px-4 py-3 text-right font-display text-navy-900 uppercase tracking-wider">Price</th>
                        <th className="px-4 py-3 text-center font-display text-navy-900 uppercase tracking-wider">Stock</th>
                        <th className="px-4 py-3 text-center font-display text-navy-900 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => (
                        <tr key={p.id} className="border-b last:border-none hover:bg-gray-50/60 transition-colors">
                          <td className="px-3 py-2.5">
                            <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 shrink-0">
                              {p.images?.[0] ? (
                                <img
                                  src={p.images[0]}
                                  alt={p.name}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                    (e.target as HTMLImageElement).parentElement!.classList.add('flex','items-center','justify-center');
                                    (e.target as HTMLImageElement).parentElement!.innerHTML = '<span class="text-gray-300 text-lg">Image</span>';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300 text-lg">Image</div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-semibold text-navy-900 block">{p.name}</span>
                            <span className="text-[10px] text-gray-400 font-mono">{p.sku}</span>
                          </td>
                          <td className="px-4 py-3 text-gray-500 font-medium">{p.category}</td>
                          <td className="px-4 py-3 text-right font-bold text-navy-900 font-mono">Rs.{p.price}</td>
                          <td className="px-4 py-3 text-center font-semibold text-gray-700 font-mono">{p.stock}</td>
                          <td className="px-4 py-3 text-center flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleTriggerEditState(p)}
                              className="p-1.5 border border-gray-100 hover:border-gold-300 rounded hover:bg-gold-50 text-gold-500 transition cursor-pointer"
                              title="Edit product"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                onDeleteProduct(p.id);
                                onLogActivity('Deleted product Catalog', `SKU: ${p.sku} purged by ${role}`);
                              }}
                              className="p-1.5 border border-gray-100 hover:border-red-300 rounded hover:bg-red-50 text-red-500 transition cursor-pointer"
                              title="Purge product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* Client orders fulfiled */}
            {activeTab === 'orders' && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6 text-left"
              >
                <h3 className="font-display font-medium text-sm text-navy-900 uppercase tracking-widest pb-1 border-b border-gray-100">Clients Ledger Orders</h3>
                
                {orders.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-xs font-light">Available records are empty.</div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((o) => (
                      <div key={o.id} className="p-4 border rounded-2xl bg-white shadow-sm space-y-4 text-xs">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-3 gap-2">
                          <div className="text-left font-sans">
                            <span className="font-bold text-navy-950 text-sm">Order Number: {o.orderNumber}</span>
                            <p className="text-[10px] text-gray-400 mt-1">Purchased on {o.date} | Recipient: {o.customerInfo.name}</p>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-mono font-bold text-navy-950">Rs.{o.total}</span>
                            <select
                              value={o.status}
                              onChange={(e) => {
                                onUpdateOrderStatus(o.id, e.target.value as Order['status']);
                                onLogActivity('Update Order Status', `ID: ${o.orderNumber} status changed to ${e.target.value}`);
                              }}
                              className="px-2 py-1 bg-gray-50 border rounded-lg text-xs"
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                            <button
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to delete order ${o.orderNumber}?`)) {
                                  onDeleteOrder(o.id, o.orderNumber);
                                  onLogActivity('Delete Order Record', `Order [${o.orderNumber}] removed by ${role}`);
                                }
                              }}
                              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition cursor-pointer"
                              title="Delete Order"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* billing details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-500 font-light leading-relaxed">
                          <div>
                            <span className="text-[9px] font-mono text-gray-400 uppercase">Shipping Destination</span>
                            <p className="font-semibold text-navy-950 mt-1">{o.customerInfo.name}</p>
                            <p>{o.customerInfo.phone} | {o.customerInfo.email}</p>
                            <p>{o.customerInfo.address}</p>
                          </div>
                          <div>
                            <span className="text-[9px] font-mono text-gray-400 uppercase">Purchased Items</span>
                            <div className="space-y-1.5 mt-1">
                              {o.items.map(it => (
                                <p key={it.product.id} className="font-semibold text-gray-700">
                                  {it.product.name} <span className="font-mono text-gray-400 font-light">(x{it.quantity})</span>
                                </p>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Campaign coupons */}
            {activeTab === 'coupons' && (
              <motion.div
                key="coupons"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6 text-left"
              >
                <h3 className="font-display font-medium text-sm text-navy-900 uppercase tracking-widest pb-1 border-b border-gray-100">Discounts & Coupons Directory</h3>

                {/* Create form */}
                <form onSubmit={handlePublishCoupon} className="p-4 rounded-2xl bg-gray-50 border space-y-3.5 text-xs">
                  <span className="block text-[11px] font-semibold text-navy-900 font-display uppercase pb-1 border-b">Publish New Campaign Coupon</span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] text-gray-400 font-mono mb-1">Coupon Code</label>
                      <input
                        type="text"
                        required
                        value={newCouponCode}
                        onChange={(e) => setNewCouponCode(e.target.value)}
                        placeholder="e.g. MONSOON25"
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-400 font-mono mb-1">Discount Type</label>
                      <select
                        value={newCouponType}
                        onChange={(e) => setNewCouponType(e.target.value as 'percentage' | 'flat')}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl"
                      >
                        <option value="percentage">Percentage Off (%)</option>
                        <option value="flat">Flat Value Off (Rs.)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-400 font-mono mb-1">Discount value</label>
                      <input
                        type="number"
                        required
                        value={newCouponValue}
                        onChange={(e) => setNewCouponValue(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-gray-400 font-mono mb-1">Min Order Cart value</label>
                      <input
                        type="number"
                        required
                        value={newCouponMin}
                        onChange={(e) => setNewCouponMin(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-400 font-mono mb-1">Brief Description</label>
                      <input
                        type="text"
                        required
                        value={newCouponDesc}
                        onChange={(e) => setNewCouponDesc(e.target.value)}
                        placeholder="e.g. Save 10% on autumn block wooden stamps"
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-gold-500 to-gold-400 text-navy-950 font-display font-medium text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
                  >
                    Activate Promo Code
                  </button>
                </form>

                {/* table list */}
                <div className="overflow-x-auto rounded-xl border mt-4 text-xs">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="px-4 py-3 text-left font-display">Code</th>
                        <th className="px-4 py-3 text-left font-display">Discount Details</th>
                        <th className="px-4 py-3 text-right font-display">Min Cart Value</th>
                        <th className="px-4 py-3 text-center font-display font-medium">Remove</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coupons.map((c) => (
                        <tr key={c.code} className="border-b last:border-none">
                          <td className="px-4 py-3 font-mono font-bold text-navy-950 text-xs">{c.code}</td>
                          <td className="px-4 py-3">
                            <span className="font-semibold text-gray-700 block">{c.description}</span>
                            <span className="text-[10px] text-gray-400">Class: {c.type === 'percentage' ? `${c.value}% Off` : `Rs.${c.value} Flat`}</span>
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-gray-700">Rs.{c.minimumCartValue}</td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => {
                                onDeleteCoupon(c.code);
                                onLogActivity('Purge Discount Coupon', `Promo Code [${c.code}] deleted by ${role}`);
                              }}
                              className="p-1 text-gray-400 hover:text-red-500 rounded hover:bg-red-50 transition cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* Vendor Marketplace Dashboard */}
            {activeTab === 'vendors' && (
              <motion.div
                key="vendors"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6 text-left"
              >
                <VendorDashboard
                  vendors={[]}
                  products={products}
                  orders={orders}
                  bulkInquiries={[]}
                  onApproveVendor={() => {}}
                  onUpdateCommission={() => {}}
                  onUpdateVendorStatus={() => {}}
                  onResolveInquiry={() => {}}
                />
              </motion.div>
            )}

            {/* CMS homepage copy editor */}
            {activeTab === 'cms' && (
              <motion.div
                key="cms"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6 text-left animate-none"
              >
                <h3 className="font-display font-medium text-sm text-navy-900 uppercase tracking-widest pb-1 border-b border-gray-100">Content Management Editor</h3>

                <form onSubmit={handlePublishCMS} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[10px] text-gray-400 font-mono mb-1">Banner Headline</label>
                    <input
                      type="text"
                      required
                      value={cmsHeadline}
                      onChange={(e) => setCmsHeadline(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-gray-400 font-mono mb-1">Main Subheadline</label>
                    <input
                      type="text"
                      required
                      value={cmsSubheadline}
                      onChange={(e) => setCmsSubheadline(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-gray-400 font-mono mb-1">About US Storytelling Text</label>
                    <textarea
                      required
                      rows={4}
                      value={cmsAbout}
                      onChange={(e) => setCmsAbout(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-gold-500 to-gold-400 text-navy-950 font-display font-semibold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
                  >
                    Save CMS Headings Layout
                  </button>
                </form>
              </motion.div>
            )}

            {/* Testimonials and reviews moderation */}
            {activeTab === 'moderation' && (
              <motion.div
                key="moderation"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6 text-left"
              >
                <h3 className="font-display font-medium text-sm text-navy-900 uppercase tracking-widest pb-1 border-b border-gray-100">Client Reviews Moderation</h3>

                <div className="space-y-4 text-xs">
                  {products.flatMap(p => p.reviews.map(r => ({ product: p, review: r }))).length === 0 ? (
                    <p className="text-gray-400 font-mono text-center py-8">Moderation queue has 0 listings.</p>
                  ) : (
                    products.flatMap(p => p.reviews.map(r => ({ product: p, review: r }))).map(({ product, review }) => (
                      <div key={review.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-between text-left gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-navy-900">{review.author}</span>
                            <span className="text-[10px] text-gray-400 font-mono">Date: {review.date}</span>
                          </div>
                          <p className="text-[10px] text-gold-500 font-mono">On Catalog item: {product.name}</p>
                          <p className="text-xs text-gray-600 font-serif">"{review.comment}"</p>
                        </div>

                        <div className="flex flex-col gap-2 shrink-0">
                          {review.approved ? (
                            <span className="px-2 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-600 font-mono text-[9px] text-center uppercase tracking-wider font-semibold">
                              Approved
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded bg-amber-50 border border-amber-200 text-amber-600 font-mono text-[9px] text-center uppercase tracking-wider font-semibold">
                              Suspended
                            </span>
                          )}

                          <button
                            onClick={() => {
                              onApproveReview(product.id, review.id, !review.approved);
                              onLogActivity('Toggle Review Approval', `Toggled certification for review ID: ${review.id} by ${role}`);
                            }}
                            className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:border-gold-300 transition text-[10px] font-semibold cursor-pointer"
                          >
                            Toggle Approval
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* Security & Settings editor */}
            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6 text-left"
              >
                <h3 className="font-display font-medium text-sm text-navy-900 uppercase tracking-widest pb-1 border-b border-gray-100">Security Gate Settings</h3>

                <form onSubmit={handleUpdateAdminCredentials} className="space-y-4 max-w-md text-xs">
                  {settingsMessage && (
                    <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-150 font-medium">
                      {settingsMessage}
                    </div>
                  )}
                  {settingsError && (
                    <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-150 font-medium">
                      {settingsError}
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] text-gray-400 font-mono mb-1">New Administrative Username</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. admin"
                        value={newAdminUsername}
                        onChange={(e) => setNewAdminUsername(e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-gold-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-gray-400 font-mono mb-1">New Administrative Password</label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={newAdminPassword}
                        onChange={(e) => setNewAdminPassword(e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-gold-400"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-600 text-navy-950 font-display font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
                  >
                    Commit Security Changes
                  </button>
                </form>
              </motion.div>
            )}

            {/* Security activity logs */}
            {activeTab === 'logs' && (
              <motion.div
                key="logs"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6 text-left"
              >
                <div className="flex justify-between items-center pb-1 border-b border-gray-100">
                  <h3 className="font-display font-medium text-sm text-navy-900 uppercase tracking-widest">Security Audit Logs</h3>
                  {logs.length > 0 && (
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to clear all security logs?')) {
                          onClearLogs();
                          onLogActivity('Clear Audit Trail', `All security logs cleared by ${role}`);
                        }
                      }}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-[10px] font-semibold font-mono uppercase tracking-wide transition cursor-pointer"
                    >
                      Clear Audit Trail
                    </button>
                  )}
                </div>

                <div className="overflow-y-auto max-h-96 space-y-2 pb-4 pr-1 scroll-smooth">
                  {logs.length === 0 ? (
                    <p className="text-gray-400 font-mono text-center py-8 text-xs">Audit logs are empty.</p>
                  ) : (
                    logs.map((log) => (
                      <div key={log.id} className="p-3 bg-navy-950 font-mono text-[9px] sm:text-[10px] text-stone-200 rounded-xl flex justify-between items-center border border-gold-400/10 gap-2">
                        <div className="text-left flex-1">
                          <span className="text-gold-400 font-bold uppercase">[{log.action}]</span>
                          <p className="mt-1 font-light text-navy-100">{log.details}</p>
                          <span className="text-gray-500 text-[8px] mt-0.5 block">{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              onDeleteLog(log.id);
                              onLogActivity('Delete Audit Entry', `Single audit log entry deleted by ${role}`);
                            }}
                            className="p-1 text-red-400 hover:text-red-600 hover:bg-white/10 rounded transition cursor-pointer"
                            title="Delete log entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}


