import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Printer, HeartHandshake, Eye, Download, CheckCircle, Smartphone } from 'lucide-react';
import { Order } from '../types';

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
        <div className="bg-gradient-to-br from-navy-900 via-navy-950 to-black text-white p-8 md:p-12 text-center space-y-4 relative overflow-hidden">
          {/* Shimmer golden light */}
          <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_50%_0%,rgba(212,175,55,0.20),transparent_65%)] blur-3xl" />
          
          <div className="w-16 h-16 bg-gradient-to-tr from-gold-600 via-gold-400 to-gold-300 text-navy-950 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-gold-500/20 border border-gold-300">
            <HeartHandshake className="w-8 h-8" />
          </div>

          <div className="space-y-1.5 relative z-10">
            <h1 className="font-display font-medium text-xl sm:text-2xl text-gold-300 uppercase tracking-widest">Order Securely Confirmed</h1>
            <p className="text-xs text-gray-300 font-mono tracking-wider">ORDER NUMBER: <span className="text-white font-bold">{order.orderNumber}</span></p>
          </div>

          <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
            Congratulations, your order is being custom hand-oiled and packaged. Thank you for supporting indigenous, ethical craftsmanship.
          </p>
        </div>

        {/* AI-powered confirmation statement */}
        <div className="p-6 md:p-8 bg-gold-50/50 border-b border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 text-left">
            <div className="flex items-center gap-2 text-[10px] font-mono tracking-wider font-semibold text-gold-600 uppercase">
              <Sparkles className="w-4 h-4 text-gold-500" />
              Founders Archival Appreciation Note
            </div>
            {aiLoading ? (
              <p className="text-xs text-gray-500 font-mono animate-pulse">AI Concierge is penning your customized thank-you letter...</p>
            ) : (
              <p className="text-xs sm:text-sm text-gray-700 font-sans leading-relaxed italic font-light">
                "{invoiceResponse?.greetingText || `Dear ${order.customerInfo.name}, thank you for supporting India's craftspersons! Our team is preparing your parcel with complete hand-finished checks.`}"
              </p>
            )}
          </div>

          {/* Quick tracker coordinates view */}
          <div className="bg-white border border-gold-400/20 rounded-2xl p-4 shrink-0 text-left space-y-2.5 w-full md:w-auto shadow-sm">
            <div>
              <p className="text-[9px] text-gray-400 font-mono tracking-wide uppercase leading-none">Security Hash</p>
              <span className="text-xs font-bold text-navy-900 font-mono mt-1 block">
                {invoiceResponse?.invoiceVerificationCode || `MERIS-HSH-${order.orderNumber.split('-')[1]}`}
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
              <span className="font-display font-bold text-lg tracking-wider text-navy-900">MERIS <span className="text-gold-400">E-SHOP</span></span>
              <p className="text-[10px] text-gray-400 leading-relaxed font-light">
                5/339, Fathima Road, nager, Azhagappapuram, Tamil Nadu 629401<br />
                support@meris.com | +91 93842 92229
              </p>
            </div>
            <div className="sm:text-right text-xs text-gray-500 space-y-0.5">
              <p><span className="font-semibold text-navy-900">Invoice Serial:</span> INV-{order.orderNumber.split('-')[1]}</p>
              <p><span className="font-semibold text-navy-900">Receipt Date:</span> {order.date}</p>
              <p><span className="font-semibold text-navy-900">Payment Status:</span> PAID ({order.paymentMethod})</p>
            </div>
          </div>

          {/* Customer shipment values */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-gray-500">
            <div className="space-y-1">
              <h4 className="font-mono text-[9px] text-gray-400 uppercase tracking-widest leading-none">Recipient Coordinates</h4>
              <p className="font-semibold text-navy-900 text-sm mt-1">{order.customerInfo.name}</p>
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
                  <th className="px-4 py-2.5 text-left font-display font-medium text-navy-900 w-1/2">Product Description</th>
                  <th className="px-4 py-2.5 text-center font-display font-medium text-navy-900 w-1/6">Qty</th>
                  <th className="px-4 py-2.5 text-right font-display font-medium text-navy-900 w-1/6">Rate</th>
                  <th className="px-4 py-2.5 text-right font-display font-medium text-navy-900 w-1/6">Amount</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => {
                  const rate = item.product.discountPrice || item.product.price;
                  return (
                    <tr key={item.product.id} className="border-b border-gray-100">
                      <td className="px-4 py-3">
                        <span className="font-semibold text-navy-950 font-display block">{item.product.name}</span>
                        <span className="text-[9px] text-gray-400 font-mono mt-0.5">{item.product.sku}</span>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600 font-mono font-medium">{item.quantity}</td>
                      <td className="px-4 py-3 text-right text-gray-600 font-mono">Rs.{rate}</td>
                      <td className="px-4 py-3 text-right font-semibold text-navy-950 font-mono">Rs.{rate * item.quantity}</td>
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
              <div className="flex justify-between text-sm font-bold text-navy-950 border-t border-gray-200 pt-2.5">
                <span className="font-display uppercase tracking-widest text-gold-500">Net Charged</span>
                <span className="font-mono text-base text-navy-900">Rs.{order.total}</span>
              </div>
            </div>
          </div>
        </div>

        {/* confirmation messaging indicators and printer controls */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-xs text-gray-500 text-left">
            <Smartphone className="w-5 h-5 text-gold-500 shrink-0" />
            <div>
              <h5 className="font-bold text-navy-900">Invoices details sent</h5>
              <span>Simulated confirmation dispatched to {order.customerInfo.phone}.</span>
            </div>
          </div>
          
          <div className="flex gap-3 select-none">
            <button
              onClick={handlePrint}
              className="py-2.5 px-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-100 font-display font-medium text-xs text-gray-700 hover:text-navy-900 uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer active:scale-95 shadow-sm"
              title="Print standard physical receipt or Save to PDF"
            >
              <Printer className="w-4 h-4 text-gold-500" />
              <span>Print Order Details</span>
            </button>
            
            <button
              onClick={onClose}
              className="py-2.5 px-6 rounded-xl bg-navy-900 border border-navy-950 hover:bg-gold-500 hover:text-navy-950 text-white font-display font-medium text-xs uppercase tracking-widest transition cursor-pointer active:scale-95 shadow-md"
            >
              Back To Storefront
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}


