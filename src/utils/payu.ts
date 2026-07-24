/**
 * PayU Payment Gateway Integration Helper
 *
 * Builds browser-safe PayU request payload fields. Secret salt handling stays on
 * the server, where request and response hashes are generated and verified.
 */

export interface PayUPaymentParams {
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  phone?: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
}

export function preparePayUPaymentPayload(
  orderNumber: string,
  amount: number,
  customerName: string,
  customerEmail: string,
  customerPhone: string,
  customerPincode: string
): PayUPaymentParams {
  return {
    txnid: orderNumber,
    amount: amount.toFixed(2),
    productinfo: `MERIS Order ${orderNumber}`,
    firstname: customerName.trim().split(/\s+/)[0] || 'Customer',
    email: customerEmail,
    phone: customerPhone,
    udf1: orderNumber,
    udf2: customerPincode,
  };
}
