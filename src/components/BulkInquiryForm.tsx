import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, CheckCircle, Package, Calendar, Award } from 'lucide-react';
import { BulkOrderInquiry, Product } from '../types';

interface BulkInquiryFormProps {
  products: Product[];
  onSubmitInquiry: (inquiry: BulkOrderInquiry) => void;
  onClose: () => void;
}

export default function BulkInquiryForm({ products, onSubmitInquiry, onClose }: BulkInquiryFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [eventType, setEventType] = useState<'birthday' | 'school' | 'corporate' | 'festival'>('festival');
  const [pName, setPName] = useState(products[0]?.name || '');
  const [quantity, setQuantity] = useState(50);
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Volume pricing calculator
  const getDiscountRate = (qty: number) => {
    if (qty >= 100) return 25;
    if (qty >= 50) return 18;
    if (qty >= 20) return 12;
    return 0;
  };

  const currentRate = getDiscountRate(quantity);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !pName) return;

    const newInquiry: BulkOrderInquiry = {
      id: `inq-${Date.now()}`,
      name,
      email,
      phone,
      companyName: company || undefined,
      eventType,
      productName: pName,
      quantity,
      notes: notes || undefined,
      date: new Date().toLocaleDateString('en-IN'),
      status: 'pending'
    };

    onSubmitInquiry(newInquiry);
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="relative max-w-2xl w-full bg-white dark:bg-gray-950 rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-900 p-6 md:p-8 text-left font-sans"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-400 dark:text-gray-500 hover:text-gray-800 dark:hover:text-pink-400 transition cursor-pointer"
        >
          x
        </button>

        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-pink-500 font-bold block mb-1">
                  Artisanal Sourcing Portal
                </span>
                <h3 className="font-display font-black text-2xl uppercase tracking-tight text-gray-950 dark:text-white">
                  Bulk Return Gift Inquiry
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mt-1">
                  Plan celebrations or corporate conferences with unique, hand-carved heritage craft pieces. Enter your desired quantities to initiate volume artisan slots.
                </p>
              </div>

              {/* Volume Discount Indicator bar */}
              <div className="p-4 rounded-2xl bg-pink-50/50 dark:bg-gray-900/60 border border-pink-200 dark:border-pink-950 flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-pink-700 dark:text-pink-400 font-bold uppercase block">
                    Current Tier Volume Reward
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-display font-extrabold text-2xl text-gray-950 dark:text-white">
                      {currentRate}% OFF
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      for order of {quantity} units
                    </span>
                  </div>
                </div>

                {/* Milestones */}
                <div className="grid grid-cols-4 gap-2 text-center text-[9px] font-mono">
                  <div className={`p-1.5 rounded-lg border ${quantity >= 50 ? 'bg-pink-100 border-pink-300 dark:bg-pink-500/10 text-pink-700 dark:text-pink-400' : 'bg-transparent border-gray-100 dark:border-gray-900 text-gray-400'}`}>
                    <span>Qty 50+</span>
                    <span className="block font-bold">10% Off</span>
                  </div>
                  <div className={`p-1.5 rounded-lg border ${quantity >= 100 ? 'bg-pink-100 border-pink-300 dark:bg-pink-500/10 text-pink-700 dark:text-pink-400' : 'bg-transparent border-gray-100 dark:border-gray-900 text-gray-400'}`}>
                    <span>Qty 100+</span>
                    <span className="block font-bold">15% Off</span>
                  </div>
                  <div className={`p-1.5 rounded-lg border ${quantity >= 200 ? 'bg-pink-100 border-pink-300 dark:bg-pink-500/10 text-pink-700 dark:text-pink-400' : 'bg-transparent border-gray-100 dark:border-gray-900 text-gray-400'}`}>
                    <span>Qty 200+</span>
                    <span className="block font-bold">20% Off</span>
                  </div>
                  <div className={`p-1.5 rounded-lg border ${quantity >= 500 ? 'bg-pink-100 border-pink-300 dark:bg-pink-500/10 text-pink-700 dark:text-pink-400' : 'bg-transparent border-gray-100 dark:border-gray-900 text-gray-400'}`}>
                    <span>Qty 500+</span>
                    <span className="block font-bold">25% Off</span>
                  </div>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-gray-400 dark:text-gray-500 uppercase font-semibold">Contact Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Arjun Sharma"
                    className="w-full px-4 py-2.5 rounded-xl border text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-gray-400 dark:text-gray-500 uppercase font-semibold">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="arjun@galaevents.com"
                    className="w-full px-4 py-2.5 rounded-xl border text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-gray-400 dark:text-gray-500 uppercase font-semibold">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+91 98455 10223"
                    className="w-full px-4 py-2.5 rounded-xl border text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-gray-400 dark:text-gray-500 uppercase font-semibold">Organization (Optional)</label>
                  <input
                    type="text"
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                    placeholder="Gala Corporate Events Ltd"
                    className="w-full px-4 py-2.5 rounded-xl border text-sm"
                  />
                </div>
              </div>

              {/* Sourcing Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-mono text-gray-400 dark:text-gray-500 uppercase font-semibold">Select Craft Piece *</label>
                  <select
                    value={pName}
                    onChange={e => setPName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border text-sm bg-white text-gray-800"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.name}>
                        {p.name} (Retail: Rs.{p.price})
                      </option>
                    ))}
                    <option value="Other / Customized Design">Customized Handicraft Motif Request</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-gray-400 dark:text-gray-500 uppercase font-semibold">Est. Quantity *</label>
                  <input
                    type="number"
                    required
                    min={15}
                    value={quantity}
                    onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full px-4 py-2.5 rounded-xl border text-sm"
                  />
                </div>
              </div>

              {/* Event Type selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-gray-400 dark:text-gray-500 uppercase font-semibold">Celebration Event context</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {(['festival', 'corporate', 'birthday', 'school'] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setEventType(type)}
                      className={`py-2 px-3 rounded-lg border text-xs font-bold uppercase tracking-wider transition ${
                        eventType === type
                          ? 'bg-gray-950 dark:bg-pink-500 border-gray-950 dark:border-pink-500 text-white dark:text-gray-950'
                          : 'bg-transparent border-gray-250 dark:border-gray-900 text-gray-400 hover:text-gray-950 dark:hover:text-white'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-gray-400 dark:text-gray-500 uppercase font-semibold">Design Engravings or Packing Instructions</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={2}
                  placeholder="E.g., custom initials engraved on bottom of rings or red velvet ribbons for birthday setup..."
                  className="w-full px-4 py-2.5 rounded-xl border text-sm resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/3 py-3 border border-gray-200 dark:border-gray-800 rounded-xl font-display font-bold text-xs uppercase tracking-wider text-gray-400 dark:text-gray-500 hover:text-gray-800 dark:hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-3 bg-gray-950 dark:bg-pink-400 hover:bg-gray-900 text-white dark:text-gray-950 font-display font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer active:scale-95 shadow-md flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4 shrink-0" />
                  <span>SubmitSourcing Request</span>
                </button>
              </div>
            </motion.form>
          ) : (
            <motion.div
              key="success"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-10 space-y-6"
            >
              <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle className="w-10 h-10 text-emerald-500" />
              </div>

              <div className="space-y-2">
                <h4 className="font-display font-black text-xl uppercase tracking-wider text-gray-900 dark:text-white">
                  Bulk Inquiry Lodged Successfully
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
                  Our guild master has logged your interest in <span className="font-semibold text-gray-950 dark:text-pink-400">{quantity}x {pName}</span> with a <span className="text-emerald-500 font-bold">{currentRate}% bulk discount</span> applied. We will contact you at <span className="font-semibold">{email}</span> within 4 business hours.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/65 max-w-sm mx-auto text-left space-y-2 text-[10px] font-mono">
                <div className="flex justify-between text-gray-400">
                  <span>INQUIRY TICKET</span>
                  <span className="text-gray-950 dark:text-white">#INQ-{Math.floor(Math.random() * 90000 + 10000)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>PRODUCT CODE</span>
                  <span className="text-gray-950 dark:text-white">{pName.substring(0, 20)}...</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>ESTIMATED LEADTIME</span>
                  <span className="text-pink-600 dark:text-pink-400 font-bold">14 Working Days</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="px-8 py-3 bg-gray-950 dark:bg-pink-400 hover:bg-gray-900 text-white dark:text-gray-950 font-display font-bold text-xs uppercase tracking-widest rounded-xl transition cursor-pointer"
              >
                Return to Gallery
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}


