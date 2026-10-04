/**
 * Pure order and credential rules shared by the API and its tests.
 *
 * These lived as module-local functions inside `server.ts`, which cannot be
 * imported by a test without booting an Express listener. Both encode decisions
 * that have caused real incidents: the payment-status rule decides whether an
 * order is auto-approved, and the SID check decides whether Twilio is called at
 * all.
 */

/**
 * A real Twilio Account SID is 34 characters starting with `AC`.
 *
 * Checking only that the variable was non-empty let a placeholder through, so
 * every order fired a request that Twilio rejected with
 * `accountSid must start with AC` — an error per order for a feature that was
 * never configured.
 */
export function isUsableTwilioSid(sid: string | undefined | null): boolean {
  return typeof sid === 'string' && /^AC[a-fA-F0-9]{32}$/.test(sid.trim());
}

/**
 * Decides the payment status an order should be stored with.
 *
 * A client-supplied status is never trusted for the manual rails. A stale or
 * buggy bundle could post `paid` for a UPI or PayU order, which auto-approves a
 * payment nobody ever verified — exactly what happened to a real order here.
 *
 * Razorpay is the one method left alone, because it is settled by its own
 * signature check at `/api/razorpay/verify-payment`.
 */
export function derivePaymentStatus(
  paymentMethod: string | undefined | null,
  claimedStatus: string | undefined | null,
): string {
  const method = String(paymentMethod || '');
  const lower = method.toLowerCase();

  if (lower.includes('cash on delivery') || method.toUpperCase() === 'COD') {
    return 'unpaid';
  }
  if (lower.includes('razorpay')) {
    return String(claimedStatus || 'pending');
  }
  return 'pending';
}

/**
 * Whether this method is settled by Razorpay's own verification rather than
 * the manual queue.
 */
export function isRazorpayMethod(paymentMethod: string | undefined | null): boolean {
  return String(paymentMethod || '').toLowerCase().includes('razorpay');
}

/**
 * Whether this method is settled by Razorpay's own verification rather than
 * the manual queue.
 */
export function isCodMethod(paymentMethod: string | undefined | null): boolean {
  const method = String(paymentMethod || '');
  return method.toLowerCase().includes('cash on delivery') || method.toUpperCase() === 'COD';
}