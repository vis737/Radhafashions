import test from 'node:test';
import assert from 'node:assert/strict';

import {
  derivePaymentStatus,
  isCodMethod,
  isRazorpayMethod,
  isUsableTwilioSid,
} from '../src/lib/orderPolicy';
import { missingColumnFromError } from '../src/lib/supabaseSchema';

test('derivePaymentStatus forces manual rails to pending', () => {
  // The regression: a client posting paymentStatus "paid" for a UPI order
  // auto-approved a payment no human ever verified.
  assert.equal(derivePaymentStatus('UPI', 'paid'), 'pending');
  assert.equal(derivePaymentStatus('UPI QR', 'paid'), 'pending');
  assert.equal(derivePaymentStatus('PayU', 'paid'), 'pending');
  assert.equal(derivePaymentStatus('Bank Transfer', 'paid'), 'pending');
  assert.equal(derivePaymentStatus('UPI', 'unpaid'), 'pending');
  assert.equal(derivePaymentStatus('UPI', undefined), 'pending');
});

test('derivePaymentStatus treats COD as unpaid, not pending', () => {
  assert.equal(derivePaymentStatus('Cash on Delivery', 'paid'), 'unpaid');
  assert.equal(derivePaymentStatus('COD', 'paid'), 'unpaid');
  assert.equal(derivePaymentStatus('cash on delivery', undefined), 'unpaid');
});

test('derivePaymentStatus leaves Razorpay to its own signature check', () => {
  // Razorpay is verified at /api/razorpay/verify-payment, so the order row may
  // legitimately carry the status the payment flow established.
  assert.equal(derivePaymentStatus('Razorpay Online Payment', 'paid'), 'paid');
  assert.equal(derivePaymentStatus('razorpay', 'paid'), 'paid');
  assert.equal(derivePaymentStatus('Razorpay', undefined), 'pending');
});

test('derivePaymentStatus copes with missing input', () => {
  assert.equal(derivePaymentStatus(undefined, 'paid'), 'pending');
  assert.equal(derivePaymentStatus('', 'paid'), 'pending');
  assert.equal(derivePaymentStatus(null, null), 'pending');
});

test('method predicates classify the payment rails', () => {
  assert.equal(isCodMethod('COD'), true);
  assert.equal(isCodMethod('Cash on Delivery'), true);
  assert.equal(isCodMethod('UPI'), false);
  assert.equal(isRazorpayMethod('Razorpay Online Payment'), true);
  assert.equal(isRazorpayMethod('razorpay'), true);
  assert.equal(isRazorpayMethod('UPI'), false);
  assert.equal(isRazorpayMethod(undefined), false);
});

test('isUsableTwilioSid rejects the placeholder that was configured', () => {
  // This exact failure shipped: a placeholder SID passed an "is it set?" check,
  // so every order fired a Twilio request that was rejected.
  assert.equal(isUsableTwilioSid('your_account_sid'), false);
  assert.equal(isUsableTwilioSid('ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'), false);
  assert.equal(isUsableTwilioSid(''), false);
  assert.equal(isUsableTwilioSid(undefined), false);
  assert.equal(isUsableTwilioSid(null), false);
  assert.equal(isUsableTwilioSid('   '), false);
});

test('isUsableTwilioSid accepts a well-formed SID', () => {
  const valid = `AC${'a'.repeat(32)}`;
  assert.equal(valid.length, 34);
  assert.equal(isUsableTwilioSid(valid), true);
  assert.equal(isUsableTwilioSid(`  ${valid}  `), true, 'surrounding whitespace is tolerated');
});

test('missingColumnFromError parses the PostgREST schema-cache error', () => {
  assert.equal(
    missingColumnFromError({
      code: 'PGRST204',
      message: "Could not find the 'cod_status' column of 'orders' in the schema cache",
    }),
    'cod_status',
  );
});

test('missingColumnFromError parses the Postgres undefined-column error', () => {
  assert.equal(
    missingColumnFromError({
      code: '42703',
      message: 'column orders.upi_txn_id does not exist',
    }),
    'upi_txn_id',
  );
});

test('missingColumnFromError returns null for unrelated failures', () => {
  // A false positive here makes every write silently drop a real column.
  assert.equal(missingColumnFromError({ message: 'connection refused' }), null);
  assert.equal(missingColumnFromError({ message: 'duplicate key value violates unique constraint' }), null);
  assert.equal(missingColumnFromError({}), null);
  assert.equal(missingColumnFromError(null), null);
  assert.equal(missingColumnFromError(undefined), null);
});