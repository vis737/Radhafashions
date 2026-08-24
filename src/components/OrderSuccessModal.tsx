import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Printer, HeartHandshake, Eye, Download, CheckCircle, Smartphone } from 'lucide-react';
import { Order, formatSelectedVariation, getCartItemKey } from '../types';

interface OrderSuccessModalProps {
  order: Order;
  onClose: () => void;
}

export default function OrderSuccessModal({ order, onClose }: OrderSuccessModalProps) {
  const [invoiceResponse, setInvoiceResponse] = useState<{
    greetingText: string;
    invoiceVerificationCode: string;
    estimatedDeliveryDate: string;
  } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const fetchAiInvoice = async () => {
      setAiLoading(true);
      try {
        const response = await fetch('/api/gemini/invoice', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ order })
        });
        
        if (response.ok) {
          const data = await response.json();
          setInvoiceResponse(data);
        }
      } catch (err) {
        console.error('Error fetching AI invoice details:', err);
      } finally {
        setAiLoading(false);
      }
    };

    fetchAiInvoice();
  }, [order]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      {/* Dynamic print-override styles to ensure only the invoice section is rendered during browser print / PDF download */}
      <style>{`
        @media print {
          /* Hide all general containers and external widgets */
          body * {
            visibility: hidden !important;
          }
          #invoice-printable-section, #invoice-printable-section * {
            visibility: visible !important;
          }
          #invoice-printable-section {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
          }
          /* Prevent unnecessary blank pages */
          html, body {
            height: auto !important;
            background: white !important;
          }
        }
      `}</style>
      
      {/* Centered post-purchase card */}
      <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col">
        
        {/* Upper congratulations cover */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white p-8 md:p-12 text-center space-y-4 relative overflow-hidden">
          {/* Shimmer golden light */}
          <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_50%_0%,rgba(212,175,55,0.20),transparent_65%)] blur-3xl" />
          
          <div className="w-16 h-16 bg-gradient-to-tr from-pink-600 via-pink-400 to-pink-300 text-gray-950 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-pink-500/20 border border-pink-300">
            <HeartHandshake className="w-8 h-8" />
          </div>

          <div className="space-y-1.5 relative z-10">
            <h1 className="font-display font-medium text-xl sm:text-2xl text-pink-300 uppercase tracking-widest">Order Securely Confirmed</h1>
            <p className="text-xs text-gray-300 font-mono tracking-wider">ORDER NUMBER: <span className="text-white font-bold">{order.orderNumber}</span></p>
          </div>

          <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
            Congratulations! Your order has been placed successfully. Thank you for choosing Radha Fashions — your trusted boutique for curated ethnic fashion.
          </p>
        </div>

        {/* AI-powered confirmation statement */}
        <div className="p-6 md:p-8 bg-pink-50/50 border-b border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 text-left">
            <div className="flex items-center gap-2 text-[10px] font-mono tracking-wider font-semibold text-pink-600 uppercase">
              <Sparkles className="w-4 h-4 text-pink-500" />
              Founders Archival Appreciation Note
            </div>
            {aiLoading ? (
              <p className="text-xs text-gray-500 font-mono animate-pulse">AI Concierge is penning your customized thank-you letter...</p>
            ) : (
              <p className="text-xs sm:text-sm text-gray-700 font-sans leading-relaxed italic font-light">
                "{invoiceResponse?.greetingText || `Dear ${order.customerInfo.name}, thank you for choosing Radha Fashions! Our team is carefully packing your ethnic wear with love and attention to detail.`}"
              </p>
            )}
          </div>

          {/* Quick tracker coordinates view */}
          <div className="bg-white border border-pink-400/20 rounded-2xl p-4 shrink-0 text-left space-y-2.5 w-full md:w-auto shadow-sm">
            <div>
              <p className="text-[9px] text-gray-400 font-mono tracking-wide uppercase leading-none">Security Hash</p>
              <span className="text-xs font-bold text-gray-900 font-mono mt-1 block">
                {invoiceResponse?.invoiceVerificationCode || `RADHA-HSH-${order.orderNumber.split('-')[1]}`}
              </span>
            </div>
            <div>
              <p className="text-[9px] text-gray-400 font-mono tracking-wide uppercase leading-none">Approx. Arrival Mode</p>
              <span className="text-xs font-bold text-emerald-600 mt-1 block">
                {invoiceResponse?.estimatedDeliveryDate || (order.shippingMethod === 'express' ? '3 Days (BlueDart Express)' : '5-7 Business Days (Air India post)')}
              </span>
            </div>
          </div>
        </div>

        {/* --- Digital Printable Invoice HTML/CSS Section --- */}
        <div id="invoice-printable-section" className="p-6 md:p-8 text-left bg-white font-sans space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-gray-100">
            <div className="space-y-1">
              <span className="font-display font-bold text-lg tracking-wider text-gray-900">Radha Fashions <span className="text-pink-400">Boutique</span></span>
              <p className="text-[10px] text-gray-500 leading-relaxed font-light">
                KSVK School Rd, Hagadur, Vinayakanagar,<br />
                Whitefield, Bengaluru, Karnataka 560066<br />
                admin@radhafashions.com | +91 97311 53609
              </p>
            </div>
            <div className="sm:text-right text-xs text-gray-500 space-y-0.5">
              <p><span className="font-semibold text-gray-900">Invoice Serial:</span> INV-{order.orderNumber.includes('-') ? order.orderNumber.split('-')[1] : order.orderNumber}</p>
              <p><span className="font-semibold text-gray-900">Receipt Date:</span> {order.date}</p>
              <p><span className="font-semibold text-gray-900">Payment Method:</span> {order.paymentMethod}</p>
              <p><span className="font-semibold text-gray-900">Payment Status:</span> <span className="uppercase text-emerald-600 font-bold">{order.paymentStatus}</span></p>
              {order.codStatus && (
                <p><span className="font-semibold text-gray-900">COD Status:</span> <span className="uppercase text-amber-600 font-bold">{order.codStatus}</span></p>
              )}
              {order.payuPaymentId && (
                <p><span className="font-semibold text-gray-900">PayU Ref:</span> {order.payuPaymentId}</p>
              )}
            </div>
          </div>

          {/* Customer shipment values */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-gray-500">
            <div className="space-y-1">
              <h4 className="font-mono text-[9px] text-gray-400 uppercase tracking-widest leading-none">Recipient Coordinates</h4>
              <p className="font-semibold text-gray-900 text-sm mt-1">{order.customerInfo.name}</p>
              <p className="font-light">{order.customerInfo.phone}</p>
              <p className="font-light">{order.customerInfo.email}</p>
            </div>
            <div className="space-y-1">
              <h4 className="font-mono text-[9px] text-gray-400 uppercase tracking-widest leading-none">Shipment Destination</h4>
              <p className="font-light mt-1.5 leading-relaxed">
                {order.customerInfo.address}<br />
                PINCODE: {order.customerInfo.pincode}
              </p>
            </div>
          </div>

          {/* Purchased Items Table */}
          <div className="pt-4 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-2.5 text-left font-display font-medium text-gray-900 w-1/2">Product Description</th>
                  <th className="px-4 py-2.5 text-center font-display font-medium text-gray-900 w-1/6">Qty</th>
                  <th className="px-4 py-2.5 text-right font-display font-medium text-gray-900 w-1/6">Rate</th>
                  <th className="px-4 py-2.5 text-right font-display font-medium text-gray-900 w-1/6">Amount</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => {
                  const rate = item.product.discountPrice || item.product.price;
                  return (
                    <tr key={getCartItemKey(item)} className="border-b border-gray-100">
                      <td className="px-4 py-3">
                        <span className="font-semibold text-gray-950 font-display block">{item.product.name} {formatSelectedVariation(item)}</span>
                        <span className="text-[9px] text-gray-400 font-mono mt-0.5">{item.product.sku}</span>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600 font-mono font-medium">{item.quantity}</td>
                      <td className="px-4 py-3 text-right text-gray-600 font-mono">Rs.{rate}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-950 font-mono">Rs.{rate * item.quantity}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Invoice pricing totals */}
          <div className="flex justify-end pt-4">
            <div className="w-full sm:w-64 text-xs space-y-2 border-t border-gray-100 pt-4">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span className="font-mono">Rs.{order.subtotal}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Coupon Deduction</span>
                  <span className="font-mono">-Rs.{order.discount}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-500">
                <span>GST Tax (18% rules)</span>
                <span className="font-mono">Rs.{order.tax}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Shipping charges</span>
                <span className="font-mono">{order.shippingCost === 0 ? 'FREE' : `Rs.${order.shippingCost}`}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-gray-950 border-t border-gray-200 pt-2.5">
                <span className="font-display uppercase tracking-widest text-pink-500">Net Charged</span>
                <span className="font-mono text-base text-gray-900">Rs.{order.total}</span>
              </div>
            </div>
          </div>
        </div>

        {/* confirmation messaging indicators and printer controls */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-xs text-gray-500 text-left">
            <Smartphone className="w-5 h-5 text-pink-500 shrink-0" />
            <div>
              <h5 className="font-bold text-gray-900">Invoices details sent</h5>
              <span>Order confirmation dispatched to {order.customerInfo.phone}.</span>
            </div>
          </div>
          
          <div className="flex gap-3 select-none">
            <button
              onClick={handlePrint}
              className="py-2.5 px-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-100 font-display font-medium text-xs text-gray-700 hover:text-gray-900 uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer active:scale-95 shadow-sm"
              title="Print standard physical receipt or Save to PDF"
            >
              <Printer className="w-4 h-4 text-pink-500" />
              <span>Print Order Details</span>
            </button>
            
            <button
              onClick={onClose}
              className="py-2.5 px-6 rounded-xl bg-gray-900 border border-gray-950 hover:bg-pink-500 hover:text-gray-950 text-white font-display font-medium text-xs uppercase tracking-widest transition cursor-pointer active:scale-95 shadow-md"
            >
              Back To Storefront
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}


