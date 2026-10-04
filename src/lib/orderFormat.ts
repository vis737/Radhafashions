import { Order } from '../types';

/**
 * Presentation helpers for the payment verification queue.
 *
 * These were component-local functions inside `AdminPaymentsTab`, which made
 * them impossible to test: the only way to exercise them was to mount the tab
 * with a live admin session. The logic decides whether a human sees a real
 * order number or an internal id, and whether a payment is queued for checking
 * at all — both are worth pinning down with tests.
 */

/**
 * The order number the customer actually quotes.
 *
 * `id` is an internal key like `ord-1787917146602` and means nothing to a human
 * reading the queue. It stays as a fallback so a row that never received an
 * `orderNumber` still renders something addressable rather than blank.
 */
export function displayOrderRef(order: Partial<Order>): string {
  return String(order.orderNumber || order.id || 'UNKNOWN').toUpperCase();
}

/**
 * Parses an order's `date` field.
 *
 * `date` is stored as a bare `YYYY-MM-DD` string. `new Date('2026-08-28')` is
 * interpreted as UTC midnight, which renders as the *previous* day for anyone
 * west of Greenwich — so "today's approvals" was quietly wrong for most of the
 * world. Bare dates are therefore read as local calendar days.
 */
export function parseOrderDate(value: string | undefined | null): Date {
  if (!value) return new Date();
  const ymd = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value).trim());
  if (ymd) return new Date(Number(ymd[1]), Number(ymd[2]) - 1, Number(ymd[3]));
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

/**
 * Whether an order's payment has to be confirmed by a human.
 *
 * Every manual rail we support qualifies. Filtering on 'upi' alone silently hid
 * PayU submissions from the queue, so they could sit unapproved forever.
 * Razorpay and Cash on Delivery are excluded because neither relies on this
 * queue: Razorpay is settled by its own signature check and COD has nothing to
 * verify until delivery.
 */
export function needsManualVerification(order: Partial<Order>): boolean {
  const method = String(order.paymentMethod || '').toLowerCase();
  return method.includes('upi') || method.includes('payu');
}