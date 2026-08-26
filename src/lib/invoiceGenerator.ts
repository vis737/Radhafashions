import { jsPDF } from 'jspdf';
import { Order, formatSelectedVariation } from '../types';

export function generateInvoicePDF(order: Order) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Color Palette Constants for Premium Brand Aesthetic (Navy and Gold)
  const colors = {
    primary: [15, 23, 42],      // Slate / Deep Navy #0f172a
    secondary: [202, 138, 4],   // Gold #ca8a04
    textDark: [51, 65, 85],     // Slate Grey #334155
    textLight: [148, 163, 184], // Light Slate Grey #94a3b8
    bgLight: [248, 250, 252],   // Light Off-White #f8fafc
    border: [226, 232, 240],    // Cool border grey #e2e8f0
  };

  // Helper page sizing coordinates
  const marginX = 20;
  let currentY = 20;

  // Draw Header decorative golden accent line
  doc.setDrawColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
  doc.setLineWidth(1.5);
  doc.line(marginX, currentY, 190, currentY);
  currentY += 10;

  // BRAND HEADER
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('RADHA FASHIONS', marginX, currentY);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
  doc.text('BOUTIQUE & ETHNIC WEAR', marginX, currentY + 4);

  // INVOICE METADATA (Right-aligned in header block)
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  const orderSlug = order.orderNumber.split('-')[1] || order.id.substring(0, 8);
  doc.text(`INVOICE: INV-${orderSlug}`, 190, currentY, { align: 'right' });

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  doc.text(`Date: ${order.date}`, 190, currentY + 5, { align: 'right' });
  doc.text(`Status: PAID (${order.paymentMethod.toUpperCase()})`, 190, currentY + 10, { align: 'right' });

  currentY += 18;

  // horizontal line separating header
  doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
  doc.setLineWidth(0.5);
  doc.line(marginX, currentY, 190, currentY);
  currentY += 8;

  // BILLING & SHIPPING DETAILS BLOCK
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text('RECIPIENT DETAILS', marginX, currentY);
  doc.text('SHIPPED FROM', 115, currentY);

  currentY += 6;
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);

  // Customer
  doc.text(order.customerInfo.name, marginX, currentY);
  doc.text(`Phone: ${order.customerInfo.phone}`, marginX, currentY + 5);
  doc.text(`Email: ${order.customerInfo.email}`, marginX, currentY + 10);
  
  // Custom wrapping address block
  const wrappingAddress = doc.splitTextToSize(order.customerInfo.address, 75);
  doc.text(wrappingAddress, marginX, currentY + 15);
  doc.text(`Postal PIN: ${order.customerInfo.pincode}`, marginX, currentY + 15 + (wrappingAddress.length * 4.5));

  // Shop Seller details
  doc.text('Radha Fashions Boutique', 115, currentY);
  doc.text('KSVK School Rd, Hagadur', 115, currentY + 5);
  doc.text('Vinayakanagar, Whitefield', 115, currentY + 10);
  doc.text('Bengaluru, Karnataka 560066', 115, currentY + 15);
  doc.text('admin@radhafashions.in', 115, currentY + 20);

  // Increment Y past coordinates info
  const addressBlockHeight = 15 + (wrappingAddress.length * 4.5);
  currentY += Math.max(addressBlockHeight + 10, 30);

  // TABLE HEADER FOR ITEMS
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.rect(marginX, currentY, 170, 7, 'F');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('ITEM DESCRIPTION', marginX + 3, currentY + 4.8);
  doc.text('RATE (INR)', 115, currentY + 4.8, { align: 'right' });
  doc.text('QTY', 140, currentY + 4.8, { align: 'right' });
  doc.text('TOTAL (INR)', 185, currentY + 4.8, { align: 'right' });

  currentY += 7;

  // TABLE ROWS
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);

  order.items.forEach((it, idx) => {
    // Alternating background color row
    if (idx % 2 === 0) {
      doc.setFillColor(colors.bgLight[0], colors.bgLight[1], colors.bgLight[2]);
      doc.rect(marginX, currentY, 170, 8, 'F');
    }

    doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
    doc.setLineWidth(0.3);
    doc.line(marginX, currentY + 8, 190, currentY + 8);

    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.setFont('Helvetica', 'bold');
    
    // Clean name truncating if too long
    const fullName = `${it.product.name} ${formatSelectedVariation(it)}`.trim();
    const cleanName = fullName.length > 52 
      ? `${fullName.slice(0, 49)}...` 
      : fullName;
    doc.text(cleanName, marginX + 3, currentY + 5.2);

    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);

    const unitPrice = it.product.discountPrice || it.product.price;
    doc.text(`INR ${unitPrice.toLocaleString('en-IN')}`, 115, currentY + 5.2, { align: 'right' });
    doc.text(`${it.quantity}`, 140, currentY + 5.2, { align: 'right' });
    doc.text(`INR ${(unitPrice * it.quantity).toLocaleString('en-IN')}`, 185, currentY + 5.2, { align: 'right' });

    currentY += 8;
  });

  currentY += 8;

  // LEDGER SUMMARY CALCULATIONS (Right-Aligned Column)
  const calcLabelX = 135;
  const calcValueX = 185;

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);

  // Subtotal
  doc.text('Subtotal:', calcLabelX, currentY, { align: 'right' });
  doc.text(`INR ${order.subtotal.toLocaleString('en-IN')}`, calcValueX, currentY, { align: 'right' });
  currentY += 5.5;

  // Tax
  doc.text('Estimated CGST & SGST (18%):', calcLabelX, currentY, { align: 'right' });
  doc.text(`INR ${order.tax.toLocaleString('en-IN')}`, calcValueX, currentY, { align: 'right' });
  currentY += 5.5;

  // Shipping
  doc.text(`Shipping (${order.shippingMethod.toUpperCase()}):`, calcLabelX, currentY, { align: 'right' });
  doc.text(`INR ${order.shippingCost.toLocaleString('en-IN')}`, calcValueX, currentY, { align: 'right' });
  currentY += 5.5;

  // Discount
  if (order.discount > 0) {
    doc.setTextColor(220, 38, 38); // red color for savings
    doc.text('Discount / Coupon Deduction:', calcLabelX, currentY, { align: 'right' });
    doc.text(`-INR ${order.discount.toLocaleString('en-IN')}`, calcValueX, currentY, { align: 'right' });
    doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
    currentY += 5.5;
  }

  // Divider
  doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.setLineWidth(0.5);
  doc.line(110, currentY, 190, currentY);
  currentY += 6;

  // Grand Total
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text('GRAND TOTAL DUE:', calcLabelX, currentY, { align: 'right' });
  doc.text(`INR ${order.total.toLocaleString('en-IN')}`, calcValueX, currentY, { align: 'right' });

  // Dynamic Gift Message Card inside Invoice
  if (order.giftWrappingRequested || order.giftMessage) {
    currentY += 10;
    doc.setFillColor(255, 247, 237); // light orange background
    doc.rect(marginX, currentY, 170, 20, 'F');
    doc.setDrawColor(249, 115, 22); // orange border
    doc.setLineWidth(0.3);
    doc.line(marginX, currentY, 190, currentY);
    doc.line(marginX, currentY + 20, 190, currentY + 20);
    
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(234, 88, 12);
    doc.text('PREMIUM GIFT WRAP', marginX + 4, currentY + 5.5);
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    const scrollText = order.giftMessage 
      ? `Gift message: "${order.giftMessage}"`
      : "Premium gift wrapping with love.";
    const wrappedLines = doc.splitTextToSize(scrollText, 162);
    doc.text(wrappedLines, marginX + 4, currentY + 11.5);
    currentY += 16;
  }

  // BRAND THANK-YOU SIGN-OFF WATERMARK
  currentY = Math.max(currentY + 20, 245); // push it towards the bottom boundary

  // Draw full footer outline
  doc.setFillColor(colors.bgLight[0], colors.bgLight[1], colors.bgLight[2]);
  doc.rect(marginX, currentY, 170, 20, 'F');
  
  doc.setDrawColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
  doc.setLineWidth(0.3);
  doc.line(marginX, currentY, 190, currentY);

  doc.setFont('Helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
  doc.text('Thank you for choosing Radha Fashions — your trusted boutique for curated ethnic fashion.', 105, currentY + 7, { align: 'center' });
  
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(colors.textLight[0], colors.textLight[1], colors.textLight[2]);
  doc.text('This is a digitally certified invoice for your Radha Fashions order.', 105, currentY + 13, { align: 'center' });

  // Save the PDF
  doc.save(`Invoice-RADHA-INV-${orderSlug}.pdf`);
}


