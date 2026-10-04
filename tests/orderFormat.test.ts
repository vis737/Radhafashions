import test from 'node:test';
import assert from 'node:assert/strict';

import {
  displayOrderRef,
  needsManualVerification,
  parseOrderDate,
} from '../src/lib/orderFormat';

test('displayOrderRef shows the real order number, never the internal id', () => {
  // The regression: the queue showed "ORD-1791" because it fell back to the
  // internal key, which means nothing to a customer reading it.
  assert.equal(
    displayOrderRef({ orderNumber: 'MR-217831-646', id: 'ord-1787562178315' }),
    'MR-217831-646',
  );
});

test('displayOrderRef falls back sensibly when data is missing', () => {
  assert.equal(displayOrderRef({ id: 'ord-1787562178315' }), 'ORD-1787562178315');
  assert.equal(displayOrderRef({}), 'UNKNOWN');
  assert.equal(displayOrderRef({ orderNumber: '', id: '' }), 'UNKNOWN');
});

test('displayOrderRef normalises case', () => {
  assert.equal(displayOrderRef({ orderNumber: 'mr-217831-646', id: 'ord-1' }), 'MR-217831-646');
  assert.equal(displayOrderRef({ orderNumber: 'Mr-217831-646' }), 'MR-217831-646');
});

test('parseOrderDate reads bare dates as local calendar days', () => {
  // The regression: new Date('2026-08-28') is UTC midnight, which renders as
  // the previous day for anyone west of Greenwich.
  const parsed = parseOrderDate('2026-08-28');
  assert.equal(parsed.getFullYear(), 2026);
  assert.equal(parsed.getMonth(), 7);
  assert.equal(parsed.getDate(), 28);
});

test('parseOrderDate does not drift by a day near month boundaries', () => {
  for (const value of ['2026-01-01', '2026-03-31', '2026-12-31', '2024-02-29']) {
    const parsed = parseOrderDate(value);
    assert.equal(parsed.getDate(), Number(value.slice(8)), `day drifted for ${value}`);
  }
});

test('parseOrderDate accepts full timestamps and whitespace', () => {
  const parsed = parseOrderDate('2026-08-28T14:30:00.000Z');
  assert.equal(Number.isNaN(parsed.getTime()), false);
  assert.equal(parseOrderDate('  2026-08-28  ').getDate(), 28);
});

test('parseOrderDate degrades to now rather than an Invalid Date', () => {
  const before = Date.now();
  const parsed = parseOrderDate('not-a-date');
  assert.equal(Number.isNaN(parsed.getTime()), false, 'must not return Invalid Date');
  assert.ok(parsed.getTime() >= before - 1000);
  assert.equal(Number.isNaN(parseOrderDate(undefined).getTime()), false);
  assert.equal(Number.isNaN(parseOrderDate(null).getTime()), false);
});

test('needsManualVerification covers every manual rail', () => {
  // Filtering on 'upi' alone hid PayU submissions from the queue entirely, so
  // they sat unapproved forever.
  assert.equal(needsManualVerification({ paymentMethod: 'UPI' }), true);
  assert.equal(needsManualVerification({ paymentMethod: 'UPI QR' }), true);
  assert.equal(needsManualVerification({ paymentMethod: 'PayU' }), true);
  assert.equal(needsManualVerification({ paymentMethod: 'payu wallet' }), true);
});

test('needsManualVerification excludes rails settled elsewhere', () => {
  assert.equal(needsManualVerification({ paymentMethod: 'Razorpay Online Payment' }), false);
  assert.equal(needsManualVerification({ paymentMethod: 'Cash on Delivery' }), false);
  assert.equal(needsManualVerification({}), false);
  assert.equal(needsManualVerification({ paymentMethod: undefined }), false);
});