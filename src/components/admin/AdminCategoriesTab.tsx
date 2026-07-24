import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, Edit2, Trash2, X, Image as ImageIcon, BarChart2, Tag, CheckCircle } from 'lucide-react';
import { Product } from '../../types';

interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  enabled?: boolean;
}

interface AdminCategoriesTabProps {
  initialCategories: Category[];
  products: Product[];
  onLogActivity: (action: string, details: string) => void;
  addToast: (text: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export default function AdminCategoriesTab({
  initialCategories,
  products,
  onLogActivity,
  addToast,
}: AdminCategoriesTabProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form State
  const [newCatName, setNewCatName] = useState('');
  const [newCatImage, setNewCatImage] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  // Edit Form State
  const [editCatName, setEditCatName] = useState('');
  const [editCatImage, setEditCatImage] = useState('');
  const [editCatDesc, setEditCatDesc] = useState('');

  const getProductCountForCategory = (cat: Category) => {
    return products.filter(p => p.category === cat.name || p.category === cat.id).length;
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim() || !newCatImage.trim()) {
      addToast('Name and Image URL are required', 'warning');
      return;
    }

    const newCat: Category = {
      id: newCatName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: newCatName.trim(),
      description: newCatDesc.trim(),
      imageUrl: newCatImage.trim(),
      enabled: true,
    };

    setCategories([...categories, newCat]);
    addToast(`Category "${newCat.name}" created`, 'success');
    onLogActivity('CREATE_CATEGORY', `Created category ${newCat.name}`);
    
    setNewCatName('');
    setNewCatImage('');
    setNewCatDesc('');
  };

  const handleDeleteCategory = (cat: Category) => {
    const productCount = getProductCountForCategory(cat);
    if (productCount > 0) {
      addToast(`Cannot delete: ${productCount} products are in this category. Reassign them first.`, 'error');
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete the category "${cat.name}"?`)) {
      setCategories(categories.filter(c => c.id !== cat.id));
      addToast(`Category "${cat.name}" deleted`, 'info');
      onLogActivity('DELETE_CATEGORY', `Deleted category ${cat.name}`);
    }
  };

  const handleToggleCategory = (cat: Category) => {
    setCategories(categories.map(c => 
      c.id === cat.id ? { ...c, enabled: !c.enabled } : c
    ));
    const action = !cat.enabled ? 'Enabled' : 'Disabled';
    addToast(`${action} category "${cat.name}"`, 'success');
    onLogActivity('TOGGLE_CATEGORY', `${action} category ${cat.name}`);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setEditCatName(cat.name);
    setEditCatImage(cat.imageUrl);
    setEditCatDesc(cat.description);
    setIsEditModalOpen(true);
  };

  const handleUpdateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    if (!editCatName.trim() || !editCatImage.trim()) {
      addToast('Name and Image URL are required', 'warning');
      return;
    }

    setCategories(categories.map(c => 
      c.id === editingCategory.id 
        ? { ...c, name: editCatName.trim(), imageUrl: editCatImage.trim(), description: editCatDesc.trim() } 
        : c
    ));
    
    addToast(`Category "${editCatName}" updated`, 'success');
    onLogActivity('UPDATE_CATEGORY', `Updated category ${editCatName}`);
    setIsEditModalOpen(false);
  };

  const filteredCategories = useMemo(() => {
    return categories.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [categories, searchQuery]);

  const totalProductsMapped = categories.reduce((sum, cat) => sum + getProductCountForCategory(cat), 0);
  const enabledCount = categories.filter(c => c.enabled !== false).length;
  const disabledCount = categories.length - enabledCount;

  return (
    <div className="space-y-6 text-slate-200">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-[#C5A021] flex items-center gap-3">
          Category Shelves Manager
          <span className="bg-[#C5A021] text-slate-900 text-sm py-1 px-3 rounded-full font-semibold">
            {categories.length} Categories
          </span>
        </h2>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div whileHover={{ scale: 1.02 }} className="bg-slate-800 p-6 rounded-3xl border border-slate-700/50 shadow-xl flex items-center gap-4">
          <div className="p-4 bg-[#C5A021]/20 text-[#C5A021] rounded-2xl">
            <Tag size={28} />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium">Total Categories</p>
            <p className="text-3xl font-bold text-white">{categories.length}</p>
          </div>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} className="bg-slate-800 p-6 rounded-3xl border border-slate-700/50 shadow-xl flex items-center gap-4">
          <div className="p-4 bg-emerald-500/20 text-emerald-400 rounded-2xl">
            <BarChart2 size={28} />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium">Products in Categories</p>
            <p className="text-3xl font-bold text-white">{totalProductsMapped}</p>
          </div>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} className="bg-slate-800 p-6 rounded-3xl border border-slate-700/50 shadow-xl flex items-center gap-4">
          <div className="p-4 bg-blue-500/20 text-blue-400 rounded-2xl">
            <CheckCircle size={28} />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium">Enabled / Disabled</p>
            <p className="text-3xl font-bold text-white">{enabledCount} <span className="text-slate-500 text-lg">/ {disabledCount}</span></p>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Form */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700/50 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Plus className="text-[#C5A021]" /> Create Category
            </h3>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Category Name *</label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#C5A021] focus:ring-1 focus:ring-[#C5A021] transition-all"
                  placeholder="e.g. Vintage Watches"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Image URL *</label>
                <input
                  type="url"
                  value={newCatImage}
                  onChange={(e) => setNewCatImage(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#C5A021] focus:ring-1 focus:ring-[#C5A021] transition-all"
                  placeholder="https://..."
                  required
                />
                {newCatImage && (
                  <div className="mt-3 relative h-32 rounded-xl overflow-hidden border border-slate-700 group">
                    <img src={newCatImage} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs font-semibold">Image Preview</span>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                <textarea
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#C5A021] focus:ring-1 focus:ring-[#C5A021] transition-all resize-none h-24"
                  placeholder="Brief description of the category..."
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#C5A021] hover:bg-[#b08d1a] text-slate-900 font-bold py-3 rounded-xl transition-colors mt-2"
              >
                Publish Category
              </button>
            </form>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="lg:col-span-8 space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-[#C5A021] focus:ring-1 focus:ring-[#C5A021] transition-all shadow-lg"
            />
          </div>

          {filteredCategories.length === 0 ? (
            <div className="bg-slate-800 rounded-3xl p-12 text-center border border-slate-700/50">
              <ImageIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Categories Found</h3>
              <p className="text-slate-400">Try adjusting your search or create a new category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredCategories.map(cat => {
                  const pCount = getProductCountForCategory(cat);
                  const isEnabled = cat.enabled !== false;

                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      key={cat.id}
                      className="bg-slate-800 rounded-3xl border border-slate-700/50 overflow-hidden shadow-xl flex flex-col group"
                    >
                      <div className="h-28 relative overflow-hidden bg-slate-900">
                        <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300 group-hover:scale-105" />
                        <div className="absolute top-3 right-3">
                          <button
                            onClick={() => handleToggleCategory(cat)}
                            className={`w-12 h-6 rounded-full p-1 transition-colors ${isEnabled ? 'bg-emerald-500' : 'bg-slate-600'}`}
                          >
                            <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${isEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                          </button>
                        </div>
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                        <h4 className="text-lg font-bold text-white mb-1">{cat.name}</h4>
                        <p className="text-xs font-mono text-[#C5A021] mb-3">/{cat.id}</p>
                        <p className="text-sm text-slate-400 line-clamp-2 mb-4 flex-1">
                          {cat.description || <span className="italic opacity-50">No description</span>}
                        </p>
                        
                        <div className="flex items-center justify-between mt-auto">
                          <span className="text-xs font-medium bg-slate-900 text-slate-300 px-3 py-1 rounded-full border border-slate-700">
                            {pCount} products
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditModal(cat)}
                              className="p-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors"
                              title="Edit Category"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(cat)}
                              className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded-xl transition-colors"
                              title="Delete Category"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && editingCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
              onClick={() => setIsEditModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="relative bg-slate-800 rounded-3xl p-6 md:p-8 w-full max-w-lg border border-slate-700 shadow-2xl"
            >
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-white"
              >
                <X size={24} />
              </button>
              
              <h3 className="text-2xl font-bold text-white mb-6">Edit Category</h3>
              
              <form onSubmit={handleUpdateCategory} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Category Name *</label>
                  <input
                    type="text"
                    value={editCatName}
                    onChange={(e) => setEditCatName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#C5A021] focus:ring-1 focus:ring-[#C5A021] transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Image URL *</label>
                  <input
                    type="url"
                    value={editCatImage}
                    onChange={(e) => setEditCatImage(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#C5A021] focus:ring-1 focus:ring-[#C5A021] transition-all"
                    required
                  />
                  {editCatImage && (
                    <div className="mt-3 relative h-32 rounded-xl overflow-hidden border border-slate-700">
                      <img src={editCatImage} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                  <textarea
                    value={editCatDesc}
                    onChange={(e) => setEditCatDesc(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#C5A021] focus:ring-1 focus:ring-[#C5A021] transition-all resize-none h-24"
                  />
                </div>
                <div className="pt-4 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#C5A021] hover:bg-[#b08d1a] text-slate-900 font-bold py-3 rounded-xl transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
