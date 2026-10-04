import { jsPDF } from 'jspdf';
import { Order, formatSelectedVariation } from '../types';

/**
 * Radha Fashions invoice PDF.
 *
 * Palette is taken from the storefront itself (`--primary`, brand `#D4648A` and
 * the rose/pink ramp used across the UI) so a downloaded invoice looks like part
 * of the same shop as the page it was downloaded from. This previously used a
 * navy-and-gold scheme that matched nothing else in the product.
 */
const BRAND = {
  primary: [190, 24, 93],     // rose-700 #be185d — headings, bands
  primaryDeep: [157, 23, 77], // pink-800 #9d174d
  brand: [212, 100, 138],     // #D4648A — the storefront accent
  accent: [219, 39, 119],     // pink-600 #db2777
  soft: [253, 242, 248],      // pink-50  #fdf2f8
  softer: [252, 231, 243],    // pink-100 #fce7f3
  border: [251, 207, 232],    // pink-200 #fbcfe8
  textDark: [51, 17, 34],     // deep plum
  textMuted: [120, 88, 104],
  white: [255, 255, 255],
  success: [5, 150, 105],
  danger: [220, 38, 38],
  warn: [217, 119, 6],
};

const rupees = (n: number) => `INR ${(Number(n) || 0).toLocaleString('en-IN')}`;

const PAYMENT_BADGE: Record<string, { label: string; colour: number[] }> = {
  paid: { label: 'PAID', colour: BRAND.success },
  unpaid: { label: 'UNPAID', colour: BRAND.warn },
  pending: { label: 'PENDING VERIFICATION', colour: BRAND.warn },
  rejected: { label: 'REJECTED', colour: BRAND.danger },
  refunded: { label: 'REFUNDED', colour: BRAND.textMuted },
};

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending',
  processing: 'Processing',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  returned: 'Returned',
};

export function generateInvoicePDF(order: Order) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const left = 18;
  const right = 192;
  const width = right - left;
  const money = (n: number) => rupees(n);

  const orderRef = (order.orderNumber || order.id || 'UNKNOWN').toUpperCase();
  // "MR-217831-646" -> "217831"; anything else falls back to the full ref.
  const slugParts = orderRef.split('-');
  const slug = slugParts.length > 1 ? slugParts[1] : orderRef.replace(/[^A-Za-z0-9]/g, '');
  const invoiceNo = `INV-${slug}`;

  const customer = order.customerInfo || ({} as Order['customerInfo']);
  const items = Array.isArray(order.items) ? order.items : [];
  const payment = PAYMENT_BADGE[order.paymentStatus] || { label: (order.paymentStatus || 'unknown').toUpperCase(), colour: BRAND.textMuted };

  // ---------------------------------------------------------------- header band
  doc.setFillColor(BRAND.primaryDeep[0], BRAND.primaryDeep[1], BRAND.primaryDeep[2]);
  doc.roundedRect(left, 14, width, 32, 3, 3, 'F');

  // Decorative blush panel inside the header for depth.
  doc.setFillColor(BRAND.primary[0], BRAND.primary[1], BRAND.primary[2]);
  doc.roundedRect(left, 14, width * 0.42, 32, 3, 3, 'F');

  doc.setTextColor(BRAND.white[0], BRAND.white[1], BRAND.white[2]);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(21);
  doc.text('RADHA FASHIONS', left + 6, 27);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(249, 168, 212); // pink-300
  doc.text('BOUTIQUE  ·  CURATED ETHNIC WEAR', left + 6, 33);
  doc.setFontSize(7);
  doc.text('radhafashions.in', left + 6, 39);

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(BRAND.white[0], BRAND.white[1], BRAND.white[2]);
  doc.text('INVOICE', right - 6, 26, { align: 'right' });

  doc.setFont('courier', 'bold');
  doc.setFontSize(9);
  doc.text(invoiceNo, right - 6, 33, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(251, 207, 232);
  doc.text(`Order ${orderRef}`, right - 6, 39, { align: 'right' });

  let y = 54;

  // ------------------------------------------------------- status / meta strip
  // The old invoice hardcoded "PAID" for every order, which was simply wrong for
  // anything unpaid or awaiting verification.
  doc.setFillColor(BRAND.softer[0], BRAND.softer[1], BRAND.softer[2]);
  doc.roundedRect(left, y, width, 12, 2, 2, 'F');

  doc.setFillColor(payment.colour[0], payment.colour[1], payment.colour[2]);
  doc.roundedRect(left + 4, y + 3, 38, 6.5, 3, 3, 'F');
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text(payment.label, left + 23, y + 7.4, { align: 'center' });

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(BRAND.textDark[0], BRAND.textDark[1], BRAND.textDark[2]);
  doc.text(`Order status: ${STATUS_LABEL[order.status] || order.status || '—'}`, left + 48, y + 7.6);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(BRAND.textMuted[0], BRAND.textMuted[1], BRAND.textMuted[2]);
  doc.text(`Method: ${order.paymentMethod || '—'}`, left + 100, y + 7.6);
  doc.text(`Date: ${order.date || '—'}`, right - 4, y + 7.6, { align: 'right' });

  y += 20;

  // ------------------------------------------------------------ party addresses
  const colTwo = left + width / 2 + 4;

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(BRAND.primary[0], BRAND.primary[1], BRAND.primary[2]);
  doc.text('DELIVER TO', left, y);
  doc.text('SOLD BY', colTwo, y);

  doc.setDrawColor(BRAND.border[0], BRAND.border[1], BRAND.border[2]);
  doc.setLineWidth(0.4);
  doc.line(left, y + 1.6, left + width / 2 - 8, y + 1.6);
  doc.line(colTwo, y + 1.6, right, y + 1.6);

  y += 7;
  doc.setFontSize(8.5);
  doc.setTextColor(BRAND.textDark[0], BRAND.textDark[1], BRAND.textDark[2]);

  doc.setFont('Helvetica', 'bold');
  doc.text(customer.name || 'Customer', left, y);
  doc.setFont('Helvetica', 'normal');
  if (customer.phone) doc.text(customer.phone, left, y + 4.6);
  if (customer.email) doc.text(customer.email, left, y + 9.2);

  const addrLines = doc.splitTextToSize(customer.address || '', 82);
  doc.text(addrLines, left, y + 13.8);
  if (customer.pincode) {
    doc.text(`PIN ${customer.pincode}`, left, y + 13.8 + addrLines.length * 4.3);
  }

  doc.setFont('Helvetica', 'bold');
  doc.text('Radha Fashions Boutique', colTwo, y);
  doc.setFont('Helvetica', 'normal');
  doc.text('KSVK School Rd, Whitefield', colTwo, y + 4.6);
  doc.text('Bengaluru, Karnataka 560066', colTwo, y + 9.2);
  doc.text('admin@radhafashions.in', colTwo, y + 13.8);
  doc.text('radhafashions.in', colTwo, y + 18.4);

  y += 26 + addrLines.length * 4.3;

  // --------------------------------------------------------------- items table
  const headerTop = y;
  doc.setFillColor(BRAND.primary[0], BRAND.primary[1], BRAND.primary[2]);
  doc.roundedRect(left, headerTop, width, 8, 1.5, 1.5, 'F');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('ITEM', left + 4, headerTop + 5.3);
  doc.text('RATE', left + width - 62, headerTop + 5.3, { align: 'right' });
  doc.text('QTY', left + width - 42, headerTop + 5.3, { align: 'right' });
  doc.text('AMOUNT', right - 4, headerTop + 5.3, { align: 'right' });

  y = headerTop + 8;

  items.forEach((it, idx) => {
    const rowH = 9;
    if (idx % 2 === 0) {
      doc.setFillColor(BRAND.soft[0], BRAND.soft[1], BRAND.soft[2]);
      doc.rect(left, y, width, rowH, 'F');
    }
    doc.setDrawColor(BRAND.border[0], BRAND.border[1], BRAND.border[2]);
    doc.setLineWidth(0.25);
    doc.line(left, y + rowH, right, y + rowH);

    const product = it.product || ({} as CartItemLike);
    const rawName = `${product.name || 'Product'} ${formatSelectedVariation(it)}`.trim();
    const name = rawName.length > 60 ? `${rawName.slice(0, 57)}…` : rawName;

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(BRAND.textDark[0], BRAND.textDark[1], BRAND.textDark[2]);
    doc.text(name, left + 4, y + 5.6);

    const unit = product.discountPrice || product.price || 0;

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(BRAND.textMuted[0], BRAND.textMuted[1], BRAND.textMuted[2]);
    doc.text(money(unit), left + width - 62, y + 5.6, { align: 'right' });
    doc.text(String(it.quantity ?? 1), left + width - 42, y + 5.6, { align: 'right' });
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(BRAND.textDark[0], BRAND.textDark[1], BRAND.textDark[2]);
    doc.text(money(unit * (it.quantity ?? 1)), right - 4, y + 5.6, { align: 'right' });

    y += rowH;
  });

  if (!items.length) {
    doc.setFont('Helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(BRAND.textMuted[0], BRAND.textMuted[1], BRAND.textMuted[2]);
    doc.text('No items recorded on this order.', left + 4, y + 6);
    y += 9;
  }

  y += 6;

  // ------------------------------------------------------------- totals ledger
  const labelX = left + width - 62;
  const valueX = right - 4;

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(BRAND.textMuted[0], BRAND.textMuted[1], BRAND.textMuted[2]);

  doc.text('Subtotal', labelX, y, { align: 'right' });
  doc.text(money(order.subtotal), valueX, y, { align: 'right' });
  y += 5.4;

  doc.text(`Shipping (${(order.shippingMethod || 'standard').toUpperCase()})`, labelX, y, { align: 'right' });
  doc.text(money(order.shippingCost), valueX, y, { align: 'right' });
  y += 5.4;

  doc.text('GST (3%)', labelX, y, { align: 'right' });
  doc.text(money(order.tax), valueX, y, { align: 'right' });
  y += 5.4;

  if (Number(order.discount) > 0) {
    doc.setTextColor(BRAND.success[0], BRAND.success[1], BRAND.success[2]);
    doc.text(`Discount${order.couponCode ? ` (${order.couponCode})` : ''}`, labelX, y, { align: 'right' });
    doc.text(`-${money(order.discount)}`, valueX, y, { align: 'right' });
    doc.setTextColor(BRAND.textMuted[0], BRAND.textMuted[1], BRAND.textMuted[2]);
    y += 5.4;
  }

  // Grand total in a blush card so the number is the obvious focal point.
  doc.setFillColor(BRAND.softer[0], BRAND.softer[1], BRAND.softer[2]);
  doc.roundedRect(labelX - 54, y + 1, 62, 12, 2, 2, 'F');
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(BRAND.primaryDeep[0], BRAND.primaryDeep[1], BRAND.primaryDeep[2]);
  doc.text('TOTAL', labelX, y + 8.6, { align: 'right' });
  doc.setFontSize(12);
  doc.text(money(order.total), valueX, y + 8.8, { align: 'right' });

  y += 20;

  // ------------------------------------------------------------- gateway detail
  const txn = order.upiTxnId || order.payuTxnId || order.payuPaymentId;
  if (txn) {
    doc.setDrawColor(BRAND.border[0], BRAND.border[1], BRAND.border[2]);
    doc.setLineWidth(0.3);
    doc.line(left, y, right, y);
    y += 6;
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(BRAND.textMuted[0], BRAND.textMuted[1], BRAND.textMuted[2]);
    doc.text(
      (order.upiTxnId ? 'UPI TRANSACTION ID' : 'GATEWAY TRANSACTION ID'),
      left,
      y
    );
    doc.setFont('courier', 'normal');
    doc.setTextColor(BRAND.textDark[0], BRAND.textDark[1], BRAND.textDark[2]);
    doc.text(String(txn), right, y, { align: 'right' });
    y += 8;
  }

  // ---------------------------------------------------------------- gift block
  if (order.giftWrappingRequested || order.giftMessage) {
    doc.setFillColor(BRAND.soft[0], BRAND.soft[1], BRAND.soft[2]);
    doc.roundedRect(left, y, width, 18, 2, 2, 'F');
    doc.setDrawColor(BRAND.border[0], BRAND.border[1], BRAND.border[2]);
    doc.setLineWidth(0.3);
    doc.roundedRect(left, y, width, 18, 2, 2, 'S');

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(BRAND.primary[0], BRAND.primary[1], BRAND.primary[2]);
    doc.text('GIFT WRAP', left + 4, y + 6);

    doc.setFont('Helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(BRAND.textDark[0], BRAND.textDark[1], BRAND.textDark[2]);
    const giftLines = doc.splitTextToSize(
      order.giftMessage ? `“${order.giftMessage}”` : 'Wrapped with care by Radha Fashions.',
      width - 8
    );
    doc.text(giftLines, left + 4, y + 12);
    y += 24;
  }

  // ------------------------------------------------------------------- footer
  const footerY = Math.max(y + 8, 262);

  doc.setFillColor(BRAND.primaryDeep[0], BRAND.primaryDeep[1], BRAND.primaryDeep[2]);
  doc.roundedRect(left, footerY, width, 16, 2, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('Thank you for choosing Radha Fashions', 105, footerY + 6.5, { align: 'center' });

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(251, 207, 232);
  doc.text(
    `${invoiceNo} · generated ${new Date().toLocaleString('en-IN')} · radhafashions.in`,
    105,
    footerY + 12,
    { align: 'center' }
  );

  doc.save(`Radha-Fashions-${orderRef}.pdf`);
}

// Local alias so the item fallback above stays readable without importing the
// full CartItem type into scope.
type CartItemLike = { name?: string; price?: number; discountPrice?: number };