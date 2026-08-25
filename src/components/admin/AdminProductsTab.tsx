import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Plus, Edit2, Trash2, Copy, AlertTriangle, 
  Package, AlertCircle, XCircle, UploadCloud, 
  Link as LinkIcon, ChevronLeft, ChevronRight, X,
  Check, CheckCircle
} from 'lucide-react';
import { Product } from '../../types';
import { getProductWeightKg } from '../../utils/premiumData';

export interface AdminProductsTabProps {
  products: Product[];
  categories: Array<{id: string; name: string; description: string; imageUrl: string}>;
  onAddProduct: (product: Product) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onLogActivity: (action: string, details: string) => void;
  addToast: (text: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

const INITIAL_PRODUCT_STATE: Partial<Product> = {
  name: '',
  sku: '',
  brand: '',
  price: 0,
  stock: 0,
  weightKg: 0.5,
  category: '',
  availability: 'in-stock',
  images: [],
  description: '',
  isNew: false,
  isBestseller: false,
  isFlashSale: false,
};

export default function AdminProductsTab({
  products,
  categories,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onLogActivity,
  addToast
}: AdminProductsTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name-asc');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  
  const [bulkPricePercent, setBulkPricePercent] = useState('');
  const [bulkStockAdjust, setBulkStockAdjust] = useState('');

  // Stats
  const totalProducts = products.length;
  const inStockCount = products.filter(p => p.stock > 5).length;
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 5).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;

  // Filtering & Sorting
  const filteredProducts = useMemo(() => {
    let result = [...products];
    
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(lowerTerm) || 
        p.sku?.toLowerCase().includes(lowerTerm) ||
        p.category?.toLowerCase().includes(lowerTerm)
      );
    }
    
    if (categoryFilter !== 'all') {
      result = result.filter(p => p.category === categoryFilter);
    }
    
    if (availabilityFilter !== 'all') {
      if (availabilityFilter === 'in-stock') result = result.filter(p => p.stock > 5);
      if (availabilityFilter === 'low-stock') result = result.filter(p => p.stock > 0 && p.stock <= 5);
      if (availabilityFilter === 'out-of-stock') result = result.filter(p => p.stock === 0);
    }
    
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc': return a.name.localeCompare(b.name);
        case 'name-desc': return b.name.localeCompare(a.name);
        case 'price-asc': return (a.price || 0) - (b.price || 0);
        case 'price-desc': return (b.price || 0) - (a.price || 0);
        case 'stock-asc': return (a.stock || 0) - (b.stock || 0);
        case 'stock-desc': return (b.stock || 0) - (a.stock || 0);
        default: return 0;
      }
    });
    
    return result;
  }, [products, searchTerm, categoryFilter, availabilityFilter, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(currentProducts.map(p => p.id as string));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const openAddModal = () => {
    const safeId = 'prod_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    setEditingProduct({ ...INITIAL_PRODUCT_STATE, id: safeId });
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct({ ...product });
    setIsModalOpen(true);
  };

  const handleDuplicate = (product: Product) => {
    const safeId = 'prod_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    const duplicated = { ...product, id: safeId, name: `${product.name} (Copy)`, sku: `${product.sku}-COPY` };
    onAddProduct(duplicated as Product);
    onLogActivity('Duplicate Product', `Duplicated ${product.name}`);
    addToast('Product duplicated successfully', 'success');
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      onDeleteProduct(id);
      onLogActivity('Delete Product', `Deleted ${name}`);
      addToast('Product deleted', 'success');
    }
  };

  const handleBulkPriceUpdate = () => {
    const percent = parseFloat(bulkPricePercent);
    if (isNaN(percent)) return;
    
    selectedIds.forEach(id => {
      const product = products.find(p => p.id === id);
      if (product) {
        const newPrice = product.price * (1 + percent / 100);
        onEditProduct({ ...product, price: newPrice });
      }
    });
    
    onLogActivity('Bulk Price Update', `Updated prices for ${selectedIds.length} products by ${percent}%`);
    addToast(`Prices updated for ${selectedIds.length} products`, 'success');
    setBulkPricePercent('');
    setSelectedIds([]);
  };

  const handleBulkStockUpdate = () => {
    const adjust = parseInt(bulkStockAdjust, 10);
    if (isNaN(adjust)) return;
    
    selectedIds.forEach(id => {
      const product = products.find(p => p.id === id);
      if (product) {
        const newStock = Math.max(0, product.stock + adjust);
        onEditProduct({ ...product, stock: newStock });
      }
    });
    
    onLogActivity('Bulk Stock Update', `Adjusted stock for ${selectedIds.length} products by ${adjust}`);
    addToast(`Stock updated for ${selectedIds.length} products`, 'success');
    setBulkStockAdjust('');
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} selected products?`)) {
      selectedIds.forEach(id => onDeleteProduct(id));
      onLogActivity('Bulk Delete', `Deleted ${selectedIds.length} products`);
      addToast(`${selectedIds.length} products deleted`, 'success');
      setSelectedIds([]);
    }
  };

  return (
    <div className="space-y-6 text-gray-800 dark:text-gray-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-pink-500 flex items-center gap-2">
          <Package className="w-6 h-6" />
          Inventory Catalog Workspace
        </h2>
        <button
          onClick={openAddModal}
          className="bg-pink-500 hover:bg-pink-600 text-gray-900 font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Products', value: totalProducts, icon: Package, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: 'In Stock', value: inStockCount, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10' },
          { label: 'Low Stock (<= 5)', value: lowStockCount, icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-400/10' },
          { label: 'Out of Stock', value: outOfStockCount, icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10' },
        ].map((stat, i) => (
          <div key={i} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-pink-200/50 dark:border-pink-900/30 flex items-center gap-4">
            <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-pink-200/50 dark:border-pink-900/30 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
          <input
            type="text"
            placeholder="Search name, SKU, category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-gray-900 border border-pink-200/50 dark:border-pink-900/30 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:border-pink-500 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-white dark:bg-gray-900 border border-pink-200/50 dark:border-pink-900/30 rounded-lg py-2 px-4 focus:outline-none focus:border-pink-500 text-gray-800 dark:text-gray-200 min-w-[150px]"
        >
          <option value="all">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={availabilityFilter}
          onChange={(e) => setAvailabilityFilter(e.target.value)}
          className="bg-white dark:bg-gray-900 border border-pink-200/50 dark:border-pink-900/30 rounded-lg py-2 px-4 focus:outline-none focus:border-pink-500 text-gray-800 dark:text-gray-200 min-w-[150px]"
        >
          <option value="all">All Availability</option>
          <option value="in-stock">In Stock (5+)</option>
          <option value="low-stock">Low Stock (1-5)</option>
          <option value="out-of-stock">Out of Stock (0)</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-white dark:bg-gray-900 border border-pink-200/50 dark:border-pink-900/30 rounded-lg py-2 px-4 focus:outline-none focus:border-pink-500 text-gray-800 dark:text-gray-200 min-w-[150px]"
        >
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
          <option value="price-asc">Price (Low-High)</option>
          <option value="price-desc">Price (High-Low)</option>
          <option value="stock-asc">Stock (Low-High)</option>
          <option value="stock-desc">Stock (High-Low)</option>
        </select>
      </div>

      {/* Bulk Actions */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-pink-500/10 border border-pink-500/50 rounded-xl p-4 flex flex-wrap items-center gap-4"
          >
            <span className="font-semibold text-pink-500">{selectedIds.length} selected</span>
            <div className="flex items-center gap-2 border-l border-pink-500/30 pl-4">
              <input
                type="number"
                placeholder="% +/-"
                value={bulkPricePercent}
                onChange={(e) => setBulkPricePercent(e.target.value)}
                className="bg-white dark:bg-gray-900 border border-pink-200/50 dark:border-pink-900/30 rounded-lg py-1 px-3 w-24 text-sm"
              />
              <button onClick={handleBulkPriceUpdate} className="bg-gray-50 dark:bg-gray-800 hover:bg-gray-700 text-xs py-1 px-3 rounded-lg border border-gray-300 dark:border-gray-800 transition-colors">
                Update Prices
              </button>
            </div>
            <div className="flex items-center gap-2 border-l border-pink-500/30 pl-4">
              <input
                type="number"
                placeholder="Qty +/-"
                value={bulkStockAdjust}
                onChange={(e) => setBulkStockAdjust(e.target.value)}
                className="bg-white dark:bg-gray-900 border border-pink-200/50 dark:border-pink-900/30 rounded-lg py-1 px-3 w-24 text-sm"
              />
              <button onClick={handleBulkStockUpdate} className="bg-gray-50 dark:bg-gray-800 hover:bg-gray-700 text-xs py-1 px-3 rounded-lg border border-gray-300 dark:border-gray-800 transition-colors">
                Update Stock
              </button>
            </div>
            <div className="flex items-center gap-2 border-l border-pink-500/30 pl-4">
              <button onClick={handleBulkDelete} className="bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs py-1.5 px-3 rounded-lg border border-red-500/50 transition-colors flex items-center gap-1">
                <Trash2 className="w-3 h-3" />
                Delete Selected
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-pink-200/50 dark:border-pink-900/30 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-pink-200/50 dark:border-pink-900/30 text-gray-500 dark:text-gray-400 text-sm">
              <th className="py-3 px-4 font-medium w-12">
                <input
                  type="checkbox"
                  checked={selectedIds.length === currentProducts.length && currentProducts.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900 text-pink-500 focus:ring-pink-500"
                />
              </th>
              <th className="py-3 px-4 font-medium">Product</th>
              <th className="py-3 px-4 font-medium">SKU</th>
              <th className="py-3 px-4 font-medium">Price</th>
              <th className="py-3 px-4 font-medium">Stock</th>
              <th className="py-3 px-4 font-medium">Weight</th>
              <th className="py-3 px-4 font-medium">Status</th>
              <th className="py-3 px-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-pink-200/50 dark:divide-pink-900/30">
            {currentProducts.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-gray-400 dark:text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  No products found.
                </td>
              </tr>
            ) : (
              currentProducts.map(product => {
                const isSelected = selectedIds.includes(product.id as string);
                const isLowStock = product.stock > 0 && product.stock <= 5;
                const isOutOfStock = product.stock === 0;
                const productWeightKg = getProductWeightKg(product);

                return (
                  <tr key={product.id} className={`hover:bg-gray-700/30 transition-colors ${isSelected ? 'bg-pink-500/5' : ''}`}>
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectOne(product.id as string)}
                        className="rounded border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900 text-pink-500 focus:ring-pink-500"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-white dark:bg-gray-900 border border-pink-200/50 dark:border-pink-900/30 flex-shrink-0 overflow-hidden flex items-center justify-center">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt={product.name} onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=120&auto=format&fit=crop&q=60'; }} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-5 h-5 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-gray-200">{product.name}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">{categories.find(c => c.id === product.category)?.name || product.category}</p>
                          {product.variation?.values?.length ? (
                            <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-pink-600">
                              {product.variation.type}: {product.variation.values.join(', ')}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs bg-white dark:bg-gray-900 px-2 py-1 rounded text-gray-500 dark:text-gray-400">
                        {product.sku}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="text-gray-800 dark:text-gray-200 font-medium">Rs. {product.price}</span>
                        {product.discountPrice ? (
                          <span className="text-xs text-pink-500 line-through opacity-70">Rs. {product.discountPrice}</span>
                        ) : null}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{product.stock}</span>
                        {isOutOfStock && <span className="w-2 h-2 rounded-full bg-red-500"></span>}
                        {isLowStock && (
                          <motion.span 
                            animate={{ opacity: [1, 0.5, 1] }} 
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="w-2 h-2 rounded-full bg-orange-500"
                          ></motion.span>
                        )}
                        {!isOutOfStock && !isLowStock && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs text-gray-700 dark:text-gray-300">{productWeightKg.toFixed(2)} kg</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.availability === 'in-stock' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                        product.availability === 'out-of-stock' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        'bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}>
                        {product.availability || 'Unknown'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEditModal(product)} className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-pink-500 hover:bg-gray-700 rounded transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDuplicate(product)} className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded transition-colors" title="Duplicate">
                          <Copy className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(product.id as string, product.name)} className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} entries
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-pink-200/50 dark:border-pink-900/30 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-4 text-sm font-medium">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-pink-200/50 dark:border-pink-900/30 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Product Modal */}
      <AnimatePresence>
        {isModalOpen && editingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-900 border border-pink-200/50 dark:border-pink-900/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-pink-100 dark:border-pink-900/20">
                <h3 className="text-xl font-bold text-pink-500 flex items-center gap-2">
                  {editingProduct.name ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  {editingProduct.name ? 'Edit Product' : 'Add New Product'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 dark:text-gray-400 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                <ProductForm
                  product={editingProduct as Product}
                  categories={categories}
                  onChange={(updated) => setEditingProduct(updated)}
                  addToast={addToast}
                />
              </div>
              
              <div className="p-6 border-t border-pink-100 dark:border-pink-900/20 bg-white/50 dark:bg-gray-900/50 flex justify-end gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 rounded-lg border border-pink-200/50 dark:border-pink-900/30 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!editingProduct?.name || !editingProduct?.sku || editingProduct?.price === undefined) {
                      addToast('Please fill all required fields (Name, SKU, Price)', 'error');
                      return;
                    }
                    const targetId = editingProduct.id || ('prod_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9));
                    const targetCategorySlug = editingProduct.categorySlug || editingProduct.category?.toLowerCase().replace(/\s+/g, '-') || 'luxury-goods';
                    const targetImages = Array.isArray(editingProduct.images) && editingProduct.images.length > 0
                      ? editingProduct.images
                      : ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop'];

                    const fullProduct: Product = {
                      id: String(targetId),
                      sku: String(editingProduct.sku || `SKU-${Date.now()}`),
                      name: String(editingProduct.name || 'New Product'),
                      category: String(editingProduct.category || 'Luxury Goods'),
                      categorySlug: String(targetCategorySlug),
                      price: Number(editingProduct.price) || 0,
                      discountPrice: editingProduct.discountPrice ? Number(editingProduct.discountPrice) : null,
                      stock: Number(editingProduct.stock) || 0,
                      rating: editingProduct.rating || 5,
                      ratingCount: editingProduct.ratingCount || 1,
                      images: targetImages,
                      shortDescription: String(editingProduct.shortDescription || editingProduct.name || ''),
                      description: String(editingProduct.description || editingProduct.name || ''),
                      specifications: editingProduct.specifications || {},
                      reviews: editingProduct.reviews || [],
                      variation: editingProduct.variation?.values
                        ?.map(value => value.trim())
                        .filter((value, index, values) => value && values.indexOf(value) === index)
                        .length
                        ? {
                            type: editingProduct.variation.type,
                            values: editingProduct.variation.values
                              .map(value => value.trim())
                              .filter((value, index, values) => value && values.indexOf(value) === index)
                          }
                        : undefined,
                      isNew: Boolean(editingProduct.isNew),
                      isBestseller: Boolean(editingProduct.isBestseller),
                      brand: String(editingProduct.brand || 'Radha Fashions'),
                      availability: editingProduct.availability || 'in-stock',
                      weightKg: editingProduct.weightKg || 0.5
                    };

                    const exists = products.some(p => p.id === fullProduct.id);
                    if (exists) {
                      onEditProduct(fullProduct);
                      onLogActivity('Edit Product', `Updated product ${fullProduct.name}`);
                      addToast('Product updated successfully', 'success');
                    } else {
                      onAddProduct(fullProduct);
                      onLogActivity('Add Product', `Added product ${fullProduct.name}`);
                      addToast('Product added successfully', 'success');
                    }
                    setIsModalOpen(false);
                  }}
                  className="px-6 py-2 rounded-lg bg-pink-500 hover:bg-pink-600 text-gray-900 font-bold transition-colors"
                >
                  Save Product
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ----------------------------------------------------------------------
// PRODUCT FORM SUB-COMPONENT
// ----------------------------------------------------------------------
function ProductForm({ product, categories, onChange, addToast }: { 
  product: Product, 
  categories: AdminProductsTabProps['categories'],
  onChange: (p: Partial<Product>) => void,
  addToast: AdminProductsTabProps['addToast']
}) {
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDraggingImages, setIsDraggingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateField = (field: keyof Product, value: any) => {
    onChange({ ...product, [field]: value });
  };

  const updateToyParam = (field: string, value: any) => {
    onChange({
      ...product,
      toyParameters: {
        ...(product.toyParameters || {}),
        [field]: value
      }
    });
  };

  const fileToDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error || new Error('Unable to read image file.'));
    reader.readAsDataURL(file);
  });

  const uploadImageFiles = async (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      addToast('Please drop or select image files only.', 'error');
      return;
    }

    setIsUploading(true);
    try {
      const uploadedUrls: string[] = [];

      for (const file of imageFiles) {
        let res: Response;
        try {
          const formData = new FormData();
          formData.append('image', file);
          
          res = await fetch('/api/upload-image', { 
            method: 'POST', 
            body: formData, 
            credentials: 'include' 
          });
        } catch {
          const base64Url = await fileToDataUrl(file);
          uploadedUrls.push(base64Url);
          continue;
        }

        if (res.ok) {
          const data = await res.json();
          if (data.url) {
            uploadedUrls.push(data.url);
            continue;
          }
        }

        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Image upload failed on the server.');
      }

      if (uploadedUrls.length > 0) {
        updateField('images', [...(product.images || []), ...uploadedUrls]);
        addToast(`${uploadedUrls.length} image${uploadedUrls.length > 1 ? 's' : ''} uploaded successfully`, 'success');
      }
    } catch (error) {
      console.error('Upload error:', error);
      addToast(error instanceof Error ? error.message : 'Failed to upload image', 'error');
    } finally {
      setIsUploading(false);
      setIsDraggingImages(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      await uploadImageFiles(files);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingImages(false);
    if (isUploading) return;
    uploadImageFiles(Array.from(e.dataTransfer.files || []));
  };

  const handleAddUrl = () => {
    if (urlInput.trim()) {
      updateField('images', [...(product.images || []), urlInput.trim()]);
      setUrlInput('');
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...(product.images || [])];
    newImages.splice(index, 1);
    updateField('images', newImages);
  };

  return (
    <div className="space-y-8">
      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4 md:col-span-2">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-pink-100 dark:border-pink-900/20 pb-2">Basic Info</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Product Name *</label>
              <input
                type="text"
                value={product.name || ''}
                onChange={e => updateField('name', e.target.value)}
                className="w-full bg-white dark:bg-gray-950 border border-pink-200/50 dark:border-pink-900/30 rounded-lg py-2 px-3 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-pink-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">SKU *</label>
              <input
                type="text"
                value={product.sku || ''}
                onChange={e => updateField('sku', e.target.value)}
                className="w-full bg-white dark:bg-gray-950 border border-pink-200/50 dark:border-pink-900/30 rounded-lg py-2 px-3 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-pink-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Brand</label>
              <input
                type="text"
                value={product.brand || ''}
                onChange={e => updateField('brand', e.target.value)}
                className="w-full bg-white dark:bg-gray-950 border border-pink-200/50 dark:border-pink-900/30 rounded-lg py-2 px-3 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-pink-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Category</label>
              <select
                value={product.category || ''}
                onChange={e => updateField('category', e.target.value)}
                className="w-full bg-white dark:bg-gray-950 border border-pink-200/50 dark:border-pink-900/30 rounded-lg py-2 px-3 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-pink-500"
              >
                <option value="">Select Category...</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-pink-100 dark:border-pink-900/20 pb-2">Pricing & Inventory</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Discount Price (Rs.)</label>
              <input
                type="number"
                value={product.price || 0}
                onChange={e => updateField('price', parseFloat(e.target.value) || 0)}
                className="w-full bg-white dark:bg-gray-950 border border-pink-200/50 dark:border-pink-900/30 rounded-lg py-2 px-3 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-pink-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Price (Rs.) *</label>
              <input
                type="number"
                value={product.discountPrice || ''}
                onChange={e => updateField('discountPrice', parseFloat(e.target.value) || undefined)}
                className="w-full bg-white dark:bg-gray-950 border border-pink-200/50 dark:border-pink-900/30 rounded-lg py-2 px-3 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-pink-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Stock Level *</label>
              <input
                type="number"
                value={product.stock || 0}
                onChange={e => updateField('stock', parseInt(e.target.value, 10) || 0)}
                className="w-full bg-white dark:bg-gray-950 border border-pink-200/50 dark:border-pink-900/30 rounded-lg py-2 px-3 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-pink-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Product Weight (kg) *</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={product.weightKg ?? getProductWeightKg(product)}
                onChange={e => updateField('weightKg', parseFloat(e.target.value) || 0)}
                className="w-full bg-white dark:bg-gray-950 border border-pink-200/50 dark:border-pink-900/30 rounded-lg py-2 px-3 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-pink-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Availability</label>
              <select
                value={product.availability || 'in-stock'}
                onChange={e => updateField('availability', e.target.value)}
                className="w-full bg-white dark:bg-gray-950 border border-pink-200/50 dark:border-pink-900/30 rounded-lg py-2 px-3 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-pink-500"
              >
                <option value="in-stock">In Stock</option>
                <option value="out-of-stock">Out of Stock</option>
                <option value="pre-order">Pre-order</option>
              </select>
            </div>
          </div>
        </div>

        {/* Customer variations */}
        <div className="space-y-4 md:col-span-2">
          <h4 className="font-display text-xl font-semibold tracking-wide text-gray-900 dark:text-gray-100 border-b border-amber-200/70 dark:border-amber-200/20 pb-2">Product Variations</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl border border-amber-200/70 dark:border-amber-200/20 bg-gradient-to-br from-amber-50/70 via-white to-pink-50/50 dark:from-amber-950/20 dark:via-gray-950/40 dark:to-pink-950/20 p-4 shadow-sm">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Variation type</label>
              <select
                value={product.variation?.type || 'none'}
                onChange={e => {
                  const type = e.target.value;
                  updateField('variation', type === 'none'
                    ? undefined
                    : {
                        type: type as 'color' | 'size',
                        values: product.variation?.type === type ? product.variation.values : []
                      });
                }}
                className="w-full bg-white dark:bg-gray-950 border border-pink-200/50 dark:border-pink-900/30 rounded-lg py-2 px-3 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-pink-500"
              >
                <option value="none">No variations</option>
                <option value="color">Color</option>
                <option value="size">Size</option>
              </select>
            </div>

            {product.variation && (
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {product.variation.type === 'color' ? 'Colors' : 'Sizes'}
                </label>
                <input
                  type="text"
                  value={product.variation.values.join(', ')}
                  onChange={e => updateField('variation', {
                    ...product.variation!,
                    values: e.target.value.split(/[\n,]/).map(value => value.trim()).filter(Boolean)
                  })}
                  placeholder={product.variation.type === 'color' ? 'Lightblue, Pink, White' : '2/4, 2/6, 2/8, 2/10'}
                  className="w-full bg-white dark:bg-gray-950 border border-pink-200/50 dark:border-pink-900/30 rounded-lg py-2 px-3 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-pink-500"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {product.variation.type === 'size'
                    ? 'For bangles, enter size codes exactly as 2/4, 2/6, 2/8, etc. Separate each value with a comma.'
                    : 'Enter each color separated by a comma.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Images */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-pink-100 dark:border-pink-900/20 pb-2">Images</h4>
          
          <div className="flex bg-white dark:bg-gray-950 rounded-lg p-1 border border-pink-200/50 dark:border-pink-900/30 mb-4">
            <button
              type="button"
              onClick={() => setImageMode('upload')}
              className={`flex-1 py-1.5 text-sm rounded-md transition-colors flex justify-center items-center gap-2 ${imageMode === 'upload' ? 'bg-gray-50 dark:bg-gray-800 text-pink-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              <UploadCloud className="w-4 h-4" /> Upload
            </button>
            <button
              type="button"
              onClick={() => setImageMode('url')}
              className={`flex-1 py-1.5 text-sm rounded-md transition-colors flex justify-center items-center gap-2 ${imageMode === 'url' ? 'bg-gray-50 dark:bg-gray-800 text-pink-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              <LinkIcon className="w-4 h-4" /> URL
            </button>
          </div>

          {imageMode === 'upload' ? (
            <div className="border-2 border-dashed border-pink-200/50 dark:border-pink-900/30 rounded-xl p-6 text-center hover:border-pink-500/50 transition-colors bg-white/50 dark:bg-gray-950/50 relative">
              <input 
                type="file" 
                accept="image/*" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileUpload}
                disabled={isUploading}
                ref={fileInputRef}
              />
              {isUploading ? (
                <div className="flex flex-col items-center gap-2 text-gray-500 dark:text-gray-400">
                  <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm">Uploading...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-500 dark:text-gray-400 pointer-events-none">
                  <UploadCloud className="w-8 h-8 text-pink-500/80" />
                  <p className="text-sm font-medium">Click or drag image to upload</p>
                  <p className="text-xs opacity-60">PNG, JPG up to 5MB</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                className="flex-1 bg-white dark:bg-gray-950 border border-pink-200/50 dark:border-pink-900/30 rounded-lg py-2 px-3 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-pink-500"
              />
              <button 
                onClick={handleAddUrl}
                disabled={!urlInput.trim()}
                className="bg-gray-50 dark:bg-gray-800 hover:bg-gray-700 text-pink-500 px-4 rounded-lg border border-pink-200/50 dark:border-pink-900/30 transition-colors disabled:opacity-50"
              >
                Add
              </button>
            </div>
          )}

          {/* Image Previews */}
          {product.images && product.images.length > 0 && (
            <div className="flex gap-3 overflow-x-auto py-2 custom-scrollbar">
              {product.images.map((img, idx) => (
                <div key={idx} className="relative w-20 h-20 rounded-lg border border-pink-200/50 dark:border-pink-900/30 overflow-hidden flex-shrink-0 group bg-white dark:bg-gray-950">
                  <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(idx)}
                    className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-0 left-0 right-0 bg-pink-500 text-gray-900 text-[10px] font-bold text-center py-0.5">
                      Main
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Short & Detailed Description */}
        <div className="space-y-4 md:col-span-2">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-pink-100 dark:border-pink-900/20 pb-2">Short Description</h4>
          <input
            type="text"
            value={product.shortDescription || ''}
            onChange={e => updateField('shortDescription', e.target.value)}
            placeholder="Brief tagline for product cards (e.g., Handcrafted solid teak wood jewelry box)"
            className="w-full bg-white dark:bg-gray-950 border border-pink-200/50 dark:border-pink-900/30 rounded-lg py-2 px-3 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-pink-500"
          />

          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-pink-100 dark:border-pink-900/20 pb-2 pt-2">Full Description *</h4>
          <textarea
            value={product.description || ''}
            onChange={e => updateField('description', e.target.value)}
            rows={4}
            placeholder="Detailed description of materials, artisan history, usage, and dimensions..."
            className="w-full bg-white dark:bg-gray-950 border border-pink-200/50 dark:border-pink-900/30 rounded-lg py-2 px-3 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-pink-500 custom-scrollbar"
            required
          ></textarea>
        </div>

        {/* Dynamic Product Specifications */}
        <div className="space-y-4 md:col-span-2 bg-white/60 dark:bg-gray-950/60 p-4 rounded-xl border border-pink-100 dark:border-pink-900/20">
          <div className="flex justify-between items-center border-b border-pink-100 dark:border-pink-900/20 pb-2">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Product Specifications</h4>
            <span className="text-xs text-gray-500 dark:text-gray-400">Custom key-value parameters</span>
          </div>

          {/* Quick Presets */}
          <div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-2">Quick Add Preset Keys:</span>
            <div className="flex flex-wrap gap-2">
              {['Material', 'Dimensions', 'Weight', 'Age Group', 'Warranty', 'Battery Required', 'Country of Origin', 'Care Instructions'].map(preset => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    const current = { ...(product.specifications || {}) };
                    if (!current[preset]) {
                      current[preset] = '';
                      updateField('specifications', current);
                    }
                  }}
                  className="text-xs px-2.5 py-1 rounded-md bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-pink-400 border border-pink-200/50 dark:border-pink-900/30 transition"
                >
                  + {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Specification Key-Value Rows */}
          <div className="space-y-3">
            {Object.entries(product.specifications || {}).map(([key, val], idx) => (
              <div key={idx} className="flex items-center gap-3">
                <input
                  type="text"
                  value={key}
                  onChange={e => {
                    const newKey = e.target.value;
                    const current = { ...(product.specifications || {}) };
                    delete current[key];
                    if (newKey.trim()) current[newKey] = val;
                    updateField('specifications', current);
                  }}
                  placeholder="Specification Key (e.g. Material)"
                  className="w-1/3 bg-white dark:bg-gray-900 border border-pink-200/50 dark:border-pink-900/30 rounded-lg py-1.5 px-3 text-sm text-gray-800 dark:text-gray-200 focus:border-pink-500"
                />
                <input
                  type="text"
                  value={val}
                  onChange={e => {
                    const current = { ...(product.specifications || {}) };
                    current[key] = e.target.value;
                    updateField('specifications', current);
                  }}
                  placeholder="Specification Value (e.g. Solid Teak Wood)"
                  className="flex-1 bg-white dark:bg-gray-900 border border-pink-200/50 dark:border-pink-900/30 rounded-lg py-1.5 px-3 text-sm text-gray-800 dark:text-gray-200 focus:border-pink-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    const current = { ...(product.specifications || {}) };
                    delete current[key];
                    updateField('specifications', current);
                  }}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-lg border border-red-900/40 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => {
                const current = { ...(product.specifications || {}) };
                const newKeyName = `Spec ${Object.keys(current).length + 1}`;
                current[newKeyName] = '';
                updateField('specifications', current);
              }}
              className="mt-2 text-xs font-semibold text-pink-400 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 py-2 px-4 rounded-lg flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" /> Add Custom Specification
            </button>
          </div>
        </div>

        {/* Flags */}
        <div className="space-y-4 md:col-span-2">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-pink-100 dark:border-pink-900/20 pb-2">Product Flags</h4>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={product.isNew || false}
                onChange={e => updateField('isNew', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-950 text-pink-500 focus:ring-pink-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">New Arrival</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={product.isBestseller || false}
                onChange={e => updateField('isBestseller', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-950 text-pink-500 focus:ring-pink-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Bestseller</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={product.isFlashSale || false}
                onChange={e => updateField('isFlashSale', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-950 text-pink-500 focus:ring-pink-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Flash Sale</span>
            </label>
          </div>
        </div>

        {/* Toy Parameters (Conditional) */}
        {categories.find(c => c.id === product.category)?.name.toLowerCase().includes('toy') && (
          <div className="space-y-4 md:col-span-2 p-4 bg-blue-500/5 rounded-xl border border-blue-500/20">
            <h4 className="text-lg font-semibold text-blue-400 border-b border-blue-500/20 pb-2 flex items-center gap-2">
              <Package className="w-5 h-5" /> Toy Specific Parameters
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Min Age</label>
                <input
                  type="number"
                  value={product.toyParameters?.minAge || ''}
                  onChange={e => updateToyParam('minAge', parseInt(e.target.value, 10))}
                  className="w-full bg-white dark:bg-gray-950 border border-pink-200/50 dark:border-pink-900/30 rounded-lg py-1.5 px-3 text-sm text-gray-800 dark:text-gray-200"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Max Age</label>
                <input
                  type="number"
                  value={product.toyParameters?.maxAge || ''}
                  onChange={e => updateToyParam('maxAge', parseInt(e.target.value, 10))}
                  className="w-full bg-white dark:bg-gray-950 border border-pink-200/50 dark:border-pink-900/30 rounded-lg py-1.5 px-3 text-sm text-gray-800 dark:text-gray-200"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Skill Type</label>
                <input
                  type="text"
                  value={product.toyParameters?.skillType || ''}
                  onChange={e => updateToyParam('skillType', e.target.value)}
                  className="w-full bg-white dark:bg-gray-950 border border-pink-200/50 dark:border-pink-900/30 rounded-lg py-1.5 px-3 text-sm text-gray-800 dark:text-gray-200"
                  placeholder="e.g. Motor Skills"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Educational Type</label>
                <input
                  type="text"
                  value={product.toyParameters?.educationalType || ''}
                  onChange={e => updateToyParam('educationalType', e.target.value)}
                  className="w-full bg-white dark:bg-gray-950 border border-pink-200/50 dark:border-pink-900/30 rounded-lg py-1.5 px-3 text-sm text-gray-800 dark:text-gray-200"
                  placeholder="e.g. STEM"
                />
              </div>
            </div>
          </div>
        )}

        {/* SEO */}
        <div className="space-y-4 md:col-span-2 border-t border-pink-100 dark:border-pink-900/20 pt-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">SEO Settings</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">SEO Title</label>
              <input
                type="text"
                value={product.seoTitle || ''}
                onChange={e => updateField('seoTitle', e.target.value)}
                className="w-full bg-white dark:bg-gray-950 border border-pink-200/50 dark:border-pink-900/30 rounded-lg py-2 px-3 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-pink-500"
                placeholder="Leave blank to use product name"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">SEO Description</label>
              <textarea
                value={product.seoDescription || ''}
                onChange={e => updateField('seoDescription', e.target.value)}
                rows={2}
                className="w-full bg-white dark:bg-gray-950 border border-pink-200/50 dark:border-pink-900/30 rounded-lg py-2 px-3 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-pink-500 custom-scrollbar"
                placeholder="Meta description for search engines"
              ></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
