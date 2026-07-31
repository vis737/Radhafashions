import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Search, Check, X, Trash2, Plus, MessageSquare, Filter, AlertCircle, Pencil } from 'lucide-react';
import { Product, Review } from '../../types';

interface AdminReviewsTabProps {
  products: Product[];
  onApproveReview: (productId: string, reviewId: string, approve: boolean) => void;
  onDeleteReview?: (productId: string, reviewId: string) => void;
  onAddReview?: (productId: string, review: Omit<Review, 'id'>) => void;
  onEditReview?: (productId: string, reviewId: string, updated: Partial<Review>) => void;
  onLogActivity: (action: string, details: string) => void;
  addToast: (text: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export default function AdminReviewsTab({
  products,
  onApproveReview,
  onDeleteReview,
  onAddReview,
  onEditReview,
  onLogActivity,
  addToast
}: AdminReviewsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    productId: '',
    userName: '',
    rating: 5,
    date: new Date().toISOString().split('T')[0],
    comment: ''
  });

  const [editingReview, setEditingReview] = useState<{ productId: string; reviewId: string; author: string; rating: number; comment: string; approved: boolean } | null>(null);
  const [reviewToDelete, setReviewToDelete] = useState<{ productId: string, reviewId: string } | null>(null);

  // Flatten and sort reviews
  const allReviews = useMemo(() => {
    const flattened = products.flatMap(p => 
      (p.reviews || []).map(r => ({
        ...r,
        productId: p.id,
        productName: p.name,
        productImage: p.images?.[0] || '',
      }))
    );
    return flattened.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [products]);

  // Derived stats
  const totalReviews = allReviews.length;
  const approvedReviews = allReviews.filter(r => r.approved).length;
  const pendingReviews = totalReviews - approvedReviews;
  const averageRating = totalReviews > 0 
    ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : '0.0';

  // Filtering
  const filteredReviews = useMemo(() => {
    return allReviews.filter(review => {
      const matchesSearch = 
        (review.author || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.comment.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRating = ratingFilter === 'all' || review.rating.toString() === ratingFilter;
      
      const matchesStatus = statusFilter === 'all' 
        ? true 
        : statusFilter === 'approved' ? review.approved : !review.approved;

      return matchesSearch && matchesRating && matchesStatus;
    });
  }, [allReviews, searchQuery, ratingFilter, statusFilter]);

  const handleApproveToggle = (productId: string, reviewId: string, currentStatus: boolean) => {
    onApproveReview(productId, reviewId, !currentStatus);
    onLogActivity(
      !currentStatus ? 'Approved Review' : 'Unapproved Review',
      `Review ID: ${reviewId} for Product ID: ${productId}`
    );
    addToast(!currentStatus ? 'Review approved successfully' : 'Review unapproved', !currentStatus ? 'success' : 'info');
  };

  const handleDeleteConfirm = () => {
    if (reviewToDelete && onDeleteReview) {
      onDeleteReview(reviewToDelete.productId, reviewToDelete.reviewId);
      onLogActivity('Deleted Review', `Review ID: ${reviewToDelete.reviewId} for Product ID: ${reviewToDelete.productId}`);
      addToast('Review deleted', 'success');
      setReviewToDelete(null);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.productId || !addForm.userName.trim() || !addForm.comment.trim()) {
      addToast('Please fill all fields', 'error');
      return;
    }
    
    if (onAddReview) {
      const newReview: Omit<Review, 'id'> = {
        author: addForm.userName,
        rating: addForm.rating,
        date: addForm.date,
        comment: addForm.comment,
        approved: true
      };
      
      onAddReview(addForm.productId, newReview);
      onLogActivity('Added Review', `New review by ${addForm.userName} for Product ID: ${addForm.productId}`);
      addToast('Review added successfully', 'success');
      
      setIsAddModalOpen(false);
      setAddForm({
        productId: '',
        userName: '',
        rating: 5,
        date: new Date().toISOString().split('T')[0],
        comment: ''
      });
    }
  };

  const renderStars = (rating: number, interactive = false, onRate?: (r: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => onRate && onRate(star)}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''} text-gold-400`}
            style={{ color: '#D4AF37' }}
          >
            {star <= rating ? (
              <Star className={`w-5 h-5 fill-current`} />
            ) : (
              <Star className="w-5 h-5" />
            )}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Client Reviews Moderation Queue</h2>
          <p className="text-slate-400 text-sm">Manage and moderate product reviews from clients.</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#B5952F] text-slate-900 px-4 py-2 rounded-xl font-semibold transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Review</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Reviews', value: totalReviews, icon: MessageSquare, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: 'Approved', value: approvedReviews, icon: Check, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
          { label: 'Pending Approval', value: pendingReviews, icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-400/10' },
          { label: 'Average Rating', value: `${averageRating} ★`, icon: Star, color: 'text-[#D4AF37]', bg: 'bg-[#D4AF37]/10' },
        ].map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label}
            className="bg-slate-800 rounded-3xl p-6 border border-slate-700/50 flex items-center gap-4"
          >
            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">{stat.label}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-slate-800 rounded-3xl p-4 border border-slate-700/50 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by product or reviewer name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all"
          />
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="pl-9 pr-8 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:border-[#D4AF37] outline-none appearance-none"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:border-[#D4AF37] outline-none"
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="bg-slate-800 rounded-3xl border border-slate-700/50 p-12 text-center">
            <MessageSquare className="w-12 h-12 text-slate-500 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-white mb-2">No reviews found</h3>
            <p className="text-slate-400">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={`${review.productId}-${review.id}`}
              className="bg-slate-800 rounded-3xl p-6 border border-slate-700/50 flex flex-col sm:flex-row gap-6"
            >
              {/* Product Info */}
              <div className="flex-shrink-0 flex sm:flex-col items-center sm:items-start gap-4 sm:w-48">
                {review.productImage ? (
                  <img src={review.productImage} alt={review.productName} className="w-12 h-12 sm:w-full sm:h-32 object-cover rounded-xl" />
                ) : (
                  <div className="w-12 h-12 sm:w-full sm:h-32 bg-slate-700 rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-slate-500" />
                  </div>
                )}
                <div>
                  <h4 className="text-[#D4AF37] font-medium line-clamp-2">{review.productName}</h4>
                </div>
              </div>

              {/* Review Content */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-white font-medium">{review.author}</span>
                      <span className="text-slate-400 text-sm ml-3">{new Date(review.date).toLocaleDateString()}</span>
                    </div>
                    {review.approved ? (
                      <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded-full border border-emerald-500/20">
                        Approved
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-amber-500/10 text-amber-400 text-xs font-medium rounded-full border border-amber-500/20">
                        Pending
                      </span>
                    )}
                  </div>
                  <div className="mb-3">
                    {renderStars(review.rating)}
                  </div>
                  <p className="text-slate-300 italic">"{review.comment}"</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-700/50">
                  <button
                    onClick={() => handleApproveToggle(review.productId, review.id, !!review.approved)}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer
                      ${review.approved 
                        ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                        : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30'}`}
                  >
                    {review.approved ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                    {review.approved ? 'Unapprove' : 'Approve'}
                  </button>

                  <button
                    onClick={() => setEditingReview({
                      productId: review.productId,
                      reviewId: review.id,
                      author: review.author,
                      rating: review.rating,
                      comment: review.comment,
                      approved: !!review.approved
                    })}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm font-medium transition-colors border border-slate-600 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Pencil className="w-4 h-4 text-gold-400" />
                    <span>Edit</span>
                  </button>

                  {onDeleteReview && (
                    <button
                      onClick={() => setReviewToDelete({ productId: review.productId, reviewId: review.id })}
                      className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-sm font-medium transition-colors border border-red-500/20 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Add Review Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-800 border border-slate-700/50 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-slate-700/50 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Add Review</h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-700 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Product</label>
                  <select
                    required
                    value={addForm.productId}
                    onChange={(e) => setAddForm({ ...addForm, productId: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all"
                  >
                    <option value="" disabled>Select a product...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Reviewer Name</label>
                  <input
                    type="text"
                    required
                    value={addForm.userName}
                    onChange={(e) => setAddForm({ ...addForm, userName: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all"
                    placeholder="Enter reviewer name"
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Rating</label>
                    <div className="pt-2">
                      {renderStars(addForm.rating, true, (r) => setAddForm({ ...addForm, rating: r }))}
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Date</label>
                    <input
                      type="date"
                      required
                      value={addForm.date}
                      onChange={(e) => setAddForm({ ...addForm, date: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Comment</label>
                  <textarea
                    required
                    value={addForm.comment}
                    onChange={(e) => setAddForm({ ...addForm, comment: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all resize-none"
                    placeholder="Write the review comment..."
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-6 py-2.5 rounded-xl font-medium text-slate-300 hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl font-bold bg-[#D4AF37] hover:bg-[#B5952F] text-slate-900 transition-colors"
                  >
                    Add Review
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Review Modal */}
      <AnimatePresence>
        {editingReview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm text-left"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-800 border border-slate-700/50 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-slate-700/50 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Edit Customer Review</h3>
                <button
                  onClick={() => setEditingReview(null)}
                  className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-700 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (onEditReview && editingReview) {
                    onEditReview(editingReview.productId, editingReview.reviewId, {
                      author: editingReview.author,
                      rating: editingReview.rating,
                      comment: editingReview.comment,
                      approved: editingReview.approved
                    });
                    onLogActivity('Edited Review', `Updated review ID: ${editingReview.reviewId}`);
                    addToast('Review updated successfully', 'success');
                    setEditingReview(null);
                  }
                }}
                className="p-6 space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Reviewer Name</label>
                  <input
                    type="text"
                    required
                    value={editingReview.author}
                    onChange={(e) => setEditingReview({ ...editingReview, author: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Rating</label>
                  <div className="pt-2">
                    {renderStars(editingReview.rating, true, (r) => setEditingReview({ ...editingReview, rating: r }))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Comment Text</label>
                  <textarea
                    required
                    value={editingReview.comment}
                    onChange={(e) => setEditingReview({ ...editingReview, comment: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all resize-none"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingReview(null)}
                    className="px-6 py-2.5 rounded-xl font-medium text-slate-300 hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl font-bold bg-[#D4AF37] hover:bg-[#B5952F] text-slate-900 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {reviewToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-800 border border-slate-700/50 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6"
            >
              <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mb-4 mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-2">Delete Review?</h3>
              <p className="text-slate-400 text-center mb-6">
                Are you sure you want to delete this review? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setReviewToDelete(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl font-medium bg-slate-700 hover:bg-slate-600 text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-red-500 hover:bg-red-600 text-white transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
