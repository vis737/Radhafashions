import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, Edit2, Trash2, X, Image as ImageIcon, BarChart2, Tag, CheckCircle, UploadCloud } from 'lucide-react';
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
  onUpdateCategories?: (categories: Category[]) => void;
}

export default function AdminCategoriesTab({
  initialCategories,
  products,
  onLogActivity,
  addToast,
  onUpdateCategories,
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

  // Image upload state
  const [isDraggingNew, setIsDraggingNew] = useState(false);
  const [isDraggingEdit, setIsDraggingEdit] = useState(false);
  const [isUploadingNew, setIsUploadingNew] = useState(false);
  const [isUploadingEdit, setIsUploadingEdit] = useState(false);
  const newFileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const uploadCategoryImage = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch('/api/upload-image', { method: 'POST', body: formData, credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.url) return data.url;
      }
    } catch {}
    // Fallback to base64
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  const handleFileDrop = async (files: File[], target: 'new' | 'edit') => {
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      addToast('Please drop image files only.', 'error');
      return;
    }
    if (target === 'new') {
      setIsUploadingNew(true);
      const url = await uploadCategoryImage(imageFiles[0]);
      if (url) setNewCatImage(url);
      setIsUploadingNew(false);
      setIsDraggingNew(false);
    } else {
      setIsUploadingEdit(true);
      const url = await uploadCategoryImage(imageFiles[0]);
      if (url) setEditCatImage(url);
      setIsUploadingEdit(false);
      setIsDraggingEdit(false);
    }
  };

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

    const updated = [...categories, newCat];
    setCategories(updated);
    onUpdateCategories?.(updated);
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
      const updated = categories.filter(c => c.id !== cat.id);
      setCategories(updated);
      onUpdateCategories?.(updated);
      addToast(`Category "${cat.name}" deleted`, 'info');
      onLogActivity('DELETE_CATEGORY', `Deleted category ${cat.name}`);
    }
  };

  const handleToggleCategory = (cat: Category) => {
    const updated = categories.map(c => 
      c.id === cat.id ? { ...c, enabled: !c.enabled } : c
    );
    setCategories(updated);
    onUpdateCategories?.(updated);
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

    const updated = categories.map(c => 
      c.id === editingCategory.id 
        ? { ...c, name: editCatName.trim(), imageUrl: editCatImage.trim(), description: editCatDesc.trim() } 
        : c
    );
    setCategories(updated);
    onUpdateCategories?.(updated);
    
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
    <div className="space-y-6 text-gray-800 dark:text-gray-200">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-[#D4648A] flex items-center gap-3">
          Category Shelves Manager
          <span className="bg-[#D4648A] text-gray-900 text-sm py-1 px-3 rounded-full font-semibold">
            {categories.length} Categories
          </span>
        </h2>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div whileHover={{ scale: 1.02 }} className="bg-gray-50 dark:bg-gray-800 p-6 rounded-3xl border border-pink-200/50 dark:border-pink-900/30 shadow-xl flex items-center gap-4">
          <div className="p-4 bg-[#D4648A]/20 text-[#D4648A] rounded-2xl">
            <Tag size={28} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Categories</p>
            <p className="text-3xl font-bold text-white">{categories.length}</p>
          </div>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} className="bg-gray-50 dark:bg-gray-800 p-6 rounded-3xl border border-pink-200/50 dark:border-pink-900/30 shadow-xl flex items-center gap-4">
          <div className="p-4 bg-emerald-500/20 text-emerald-400 rounded-2xl">
            <BarChart2 size={28} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Products in Categories</p>
            <p className="text-3xl font-bold text-white">{totalProductsMapped}</p>
          </div>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} className="bg-gray-50 dark:bg-gray-800 p-6 rounded-3xl border border-pink-200/50 dark:border-pink-900/30 shadow-xl flex items-center gap-4">
          <div className="p-4 bg-blue-500/20 text-blue-400 rounded-2xl">
            <CheckCircle size={28} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Enabled / Disabled</p>
            <p className="text-3xl font-bold text-white">{enabledCount} <span className="text-gray-400 dark:text-gray-500 text-lg">/ {disabledCount}</span></p>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Form */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-3xl p-6 border border-pink-200/50 dark:border-pink-900/30 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Plus className="text-[#D4648A]" /> Create Category
            </h3>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Category Name *</label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full bg-white dark:bg-gray-900 border border-pink-200/50 dark:border-pink-900/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4648A] focus:ring-1 focus:ring-[#D4648A] transition-all"
                  placeholder="e.g. Vintage Watches"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Category Image *</label>
                <div
                  className={`border-2 border-dashed rounded-xl p-4 text-center transition-all relative ${
                    isDraggingNew ? 'border-[#D4648A] bg-pink-50/50 dark:bg-pink-950/20' : 'border-pink-200/50 dark:border-pink-900/30 hover:border-pink-400/60'
                  }`}
                  onDragEnter={(e) => { e.preventDefault(); if (!isUploadingNew) setIsDraggingNew(true); }}
                  onDragOver={(e) => e.preventDefault()}
                  onDragLeave={(e) => { e.preventDefault(); setIsDraggingNew(false); }}
                  onDrop={(e) => { e.preventDefault(); handleFileDrop(Array.from(e.dataTransfer.files), 'new'); }}
                >
                  <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={(e) => { if (e.target.files) handleFileDrop(Array.from(e.target.files), 'new'); e.target.value = ''; }}
                    disabled={isUploadingNew} ref={newFileInputRef} />
                  {isUploadingNew ? (
                    <div className="flex flex-col items-center gap-2 py-2">
                      <div className="w-6 h-6 border-2 border-[#D4648A] border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs text-gray-500">Uploading...</span>
                    </div>
                  ) : isDraggingNew ? (
                    <div className="flex flex-col items-center gap-2 py-2 text-[#D4648A]">
                      <UploadCloud className="w-6 h-6 animate-bounce" />
                      <span className="text-xs font-bold">Drop here</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-2 pointer-events-none">
                      <UploadCloud className="w-6 h-6 text-[#D4648A]/60" />
                      <p className="text-xs font-medium text-gray-500">Drag & drop or <span className="text-[#D4648A] font-bold">Browse</span></p>
                    </div>
                  )}
                </div>
                {/* URL fallback input */}
                <input type="url" value={newCatImage} onChange={(e) => setNewCatImage(e.target.value)}
                  className="w-full bg-white dark:bg-gray-900 border border-pink-200/50 dark:border-pink-900/30 rounded-xl px-3 py-2 text-xs text-gray-600 dark:text-gray-400 focus:outline-none focus:border-[#D4648A] mt-2"
                  placeholder="Or paste image URL here..." />
                {newCatImage && (
                  <div className="mt-3 relative h-32 rounded-xl overflow-hidden border border-pink-200/50 dark:border-pink-900/30 group">
                    <img src={newCatImage} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Description</label>
                <textarea
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="w-full bg-white dark:bg-gray-900 border border-pink-200/50 dark:border-pink-900/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4648A] focus:ring-1 focus:ring-[#D4648A] transition-all resize-none h-24"
                  placeholder="Brief description of the category..."
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#D4648A] hover:bg-[#b08d1a] text-gray-900 font-bold py-3 rounded-xl transition-colors mt-2"
              >
                Publish Category
              </button>
            </form>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="lg:col-span-8 space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-pink-200/50 dark:border-pink-900/30 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-[#D4648A] focus:ring-1 focus:ring-[#D4648A] transition-all shadow-lg"
            />
          </div>

          {filteredCategories.length === 0 ? (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-3xl p-12 text-center border border-pink-200/50 dark:border-pink-900/30">
              <ImageIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Categories Found</h3>
              <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or create a new category.</p>
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
                      className="bg-gray-50 dark:bg-gray-800 rounded-3xl border border-pink-200/50 dark:border-pink-900/30 overflow-hidden shadow-xl flex flex-col group"
                    >
                      <div className="h-28 relative overflow-hidden bg-white dark:bg-gray-900">
                        <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300 group-hover:scale-105" />
                        <div className="absolute top-3 right-3">
                          <button
                            onClick={() => handleToggleCategory(cat)}
                            className={`w-12 h-6 rounded-full p-1 transition-colors ${isEnabled ? 'bg-emerald-500' : 'bg-gray-600'}`}
                          >
                            <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${isEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                          </button>
                        </div>
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                        <h4 className="text-lg font-bold text-white mb-1">{cat.name}</h4>
                        <p className="text-xs font-mono text-[#D4648A] mb-3">/{cat.id}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-1">
                          {cat.description || <span className="italic opacity-50">No description</span>}
                        </p>
                        
                        <div className="flex items-center justify-between mt-auto">
                          <span className="text-xs font-medium bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full border border-pink-200/50 dark:border-pink-900/30">
                            {pCount} products
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditModal(cat)}
                              className="p-2 bg-gray-700/50 hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:text-white rounded-xl transition-colors"
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
              className="absolute inset-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm"
              onClick={() => setIsEditModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="relative bg-gray-50 dark:bg-gray-800 rounded-3xl p-6 md:p-8 w-full max-w-lg border border-pink-200/50 dark:border-pink-900/30 shadow-2xl"
            >
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="absolute top-6 right-6 text-gray-500 dark:text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
              
              <h3 className="text-2xl font-bold text-white mb-6">Edit Category</h3>
              
              <form onSubmit={handleUpdateCategory} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Category Name *</label>
                  <input
                    type="text"
                    value={editCatName}
                    onChange={(e) => setEditCatName(e.target.value)}
                    className="w-full bg-white dark:bg-gray-900 border border-pink-200/50 dark:border-pink-900/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4648A] focus:ring-1 focus:ring-[#D4648A] transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Category Image *</label>
                  <div
                    className={`border-2 border-dashed rounded-xl p-4 text-center transition-all relative ${
                      isDraggingEdit ? 'border-[#D4648A] bg-pink-50/50 dark:bg-pink-950/20' : 'border-pink-200/50 dark:border-pink-900/30 hover:border-pink-400/60'
                    }`}
                    onDragEnter={(e) => { e.preventDefault(); if (!isUploadingEdit) setIsDraggingEdit(true); }}
                    onDragOver={(e) => e.preventDefault()}
                    onDragLeave={(e) => { e.preventDefault(); setIsDraggingEdit(false); }}
                    onDrop={(e) => { e.preventDefault(); handleFileDrop(Array.from(e.dataTransfer.files), 'edit'); }}
                  >
                    <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      onChange={(e) => { if (e.target.files) handleFileDrop(Array.from(e.target.files), 'edit'); e.target.value = ''; }}
                      disabled={isUploadingEdit} ref={editFileInputRef} />
                    {isUploadingEdit ? (
                      <div className="flex flex-col items-center gap-2 py-2">
                        <div className="w-6 h-6 border-2 border-[#D4648A] border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs text-gray-500">Uploading...</span>
                      </div>
                    ) : isDraggingEdit ? (
                      <div className="flex flex-col items-center gap-2 py-2 text-[#D4648A]">
                        <UploadCloud className="w-6 h-6 animate-bounce" />
                        <span className="text-xs font-bold">Drop here</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 py-2 pointer-events-none">
                        <UploadCloud className="w-6 h-6 text-[#D4648A]/60" />
                        <p className="text-xs font-medium text-gray-500">Drag & drop or <span className="text-[#D4648A] font-bold">Browse</span></p>
                      </div>
                    )}
                  </div>
                  <input type="url" value={editCatImage} onChange={(e) => setEditCatImage(e.target.value)}
                    className="w-full bg-white dark:bg-gray-900 border border-pink-200/50 dark:border-pink-900/30 rounded-xl px-3 py-2 text-xs text-gray-600 dark:text-gray-400 focus:outline-none focus:border-[#D4648A] mt-2"
                    placeholder="Or paste image URL here..." />
                  {editCatImage && (
                    <div className="mt-3 relative h-32 rounded-xl overflow-hidden border border-pink-200/50 dark:border-pink-900/30">
                      <img src={editCatImage} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Description</label>
                  <textarea
                    value={editCatDesc}
                    onChange={(e) => setEditCatDesc(e.target.value)}
                    className="w-full bg-white dark:bg-gray-900 border border-pink-200/50 dark:border-pink-900/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4648A] focus:ring-1 focus:ring-[#D4648A] transition-all resize-none h-24"
                  />
                </div>
                <div className="pt-4 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#D4648A] hover:bg-[#b08d1a] text-gray-900 font-bold py-3 rounded-xl transition-colors"
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
