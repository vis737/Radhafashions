import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Heart, Download, ShoppingCart } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { getQrCodeUrl } from '../../utils/qrCodeGenerator';
import toast from 'react-hot-toast';

export default function WishlistTab({ wishlistProducts, onSelectProduct, onMoveToCart, onRemoveFromWishlist }: any) {
  const [wishlistPrivacy, setWishlistPrivacy] = useState<'Public' | 'Private' | 'Friends'>('Public');
  const [copiedLink, setCopiedLink] = useState(false);

  const wishlistProductIds = wishlistProducts.map((p: any) => p.id).join(',');
  const shareUrl = `${window.location.origin}/?wishlist=${encodeURIComponent(wishlistProductIds)}`;
  const shareText = `Check out my wishlist on Radha Fashions! 🌟 ${shareUrl}`;

  const downloadWishlistPdf = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('RADHA FASHIONS', 20, 20);
    doc.setFontSize(10);
    doc.setTextColor(202, 138, 4);
    doc.text('MY WISHLIST COLLECTION', 20, 25);
    doc.setDrawColor(226, 232, 240);
    doc.line(20, 28, 190, 28);

    let currentY = 38;
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);

    wishlistProducts.forEach((p: any, index: number) => {
      if (currentY > 260) {
        doc.addPage();
        currentY = 20;
      }
      doc.setFont('Helvetica', 'bold');
      doc.text(`${index + 1}. ${p.name}`, 20, currentY);
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`Category: ${p.category} | Price: Rs. ${p.discountPrice || p.price}`, 20, currentY + 5);
      doc.text(p.shortDescription || '', 20, currentY + 10);
      currentY += 20;
    });

    doc.save('radha_my_wishlist.pdf');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    toast.success("Link copied!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <motion.div
      key="wishlist"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className="space-y-6 text-left"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-gray-100">
        <h3 className="font-display font-medium text-sm text-gray-900 uppercase tracking-widest">Saved Wishlist Items</h3>
        {wishlistProducts.length > 0 && (
          <button
            onClick={downloadWishlistPdf}
            className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border cursor-pointer animate-fade-in"
          >
            <Download className="w-3.5 h-3.5" /> Download PDF
          </button>
        )}
      </div>

      {wishlistProducts.length === 0 ? (
        <div className="text-center py-10 space-y-2">
          <Heart className="w-8 h-8 text-gray-300 mx-auto" />
          <p className="text-xs text-gray-500">Your wishlist is currently clear.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-4 rounded-3xl bg-gray-50 dark:bg-gray-950 border border-gray-150 dark:border-gray-800 text-xs font-sans space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <span className="font-bold text-gray-950 dark:text-white block">Share My Collection</span>
                <span className="text-[10px] text-gray-400">Share your favourite picks with friends or public visitors.</span>
              </div>
              <div className="flex bg-white dark:bg-gray-900 p-0.5 rounded-lg border border-gray-250 dark:border-gray-800 text-[10px]">
                {['Public', 'Friends', 'Private'].map(priv => (
                  <button
                    key={priv}
                    onClick={() => setWishlistPrivacy(priv as any)}
                    className={`px-2.5 py-1 rounded-md font-bold uppercase transition cursor-pointer ${
                      wishlistPrivacy === priv ? 'bg-gray-950 dark:bg-gray-800 text-white' : 'text-gray-400'
                    }`}
                  >
                    {priv}
                  </button>
                ))}
              </div>
            </div>

            {wishlistPrivacy !== 'Private' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div className="flex items-center gap-3 bg-white dark:bg-gray-900 p-3 rounded-2xl border border-gray-200 dark:border-gray-800">
                  <img
                    src={getQrCodeUrl(shareUrl)}
                    alt="Wishlist QR Code"
                    className="w-16 h-16 rounded border bg-white shrink-0"
                  />
                  <div className="space-y-0.5 text-left">
                    <span className="font-semibold text-[10px] text-gray-950 dark:text-white block">Scan to Share</span>
                    <span className="text-[9px] text-gray-400 leading-normal block">Scan QR Code with any camera to instantly load this wishlist.</span>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer" className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold text-[10px] transition">WhatsApp</a>
                    <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer" className="px-3 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-semibold text-[10px] transition">Twitter (X)</a>
                    <a href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer" className="px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-semibold text-[10px] transition">Telegram</a>
                    <button onClick={handleCopyLink} className="px-3 py-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 text-gray-700 dark:text-gray-400 rounded-xl font-semibold text-[10px] transition cursor-pointer">
                      {copiedLink ? 'Copied!' : 'Copy Link'}
                    </button>
                  </div>
                  <span className="font-mono text-[9px] text-gray-400 dark:text-gray-500 truncate block bg-white dark:bg-gray-900 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800">
                    {shareUrl}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {wishlistProducts.map((prod: any) => (
              <div key={prod.id} className="p-3.5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm flex items-center gap-3 justify-between">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectProduct(prod.id)}>
                  <img src={prod.images[0]} alt="" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=120&auto=format&fit=crop&q=60'; }} className="w-14 h-14 rounded-xl object-cover bg-gray-50 shrink-0" />
                  <div className="text-left font-sans space-y-0.5">
                    <h5 className="text-xs font-semibold text-gray-900 dark:text-gray-50 line-clamp-1">{prod.name}</h5>
                    <span className="text-[10px] text-gray-400 font-mono block">{prod.category}</span>
                    <span className="text-xs font-bold text-gray-900 dark:text-gray-50 block mt-0.5">Rs.{prod.discountPrice || prod.price}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 shrink-0 select-none">
                  <button
                    onClick={() => onMoveToCart(prod)}
                    className="p-2 border border-pink-300 bg-pink-400 hover:bg-pink-500 rounded-lg text-gray-950 hover:text-gray-950 flex items-center justify-center gap-1 text-[11px] font-bold cursor-pointer transition active:scale-95"
                  >
                    <ShoppingCart className="w-3 h-3" />
                    <span>Add Bag</span>
                  </button>
                  <button
                    onClick={() => {
                      onRemoveFromWishlist(prod.id);
                      toast.success("Removed from wishlist");
                    }}
                    className="text-gray-400 hover:text-red-500 text-[10px] font-mono cursor-pointer underline text-center"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
