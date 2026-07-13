# Razorpay Payment Integration — Setup Guide

## What was changed

| File | Change |
|---|---|
| `server.ts` | Added `razorpay` + `crypto` imports; added `/api/razorpay/create-order` and `/api/razorpay/verify-payment` routes |
| `src/components/CheckoutPanel.tsx` | Replaced simulated `setTimeout` payment with real Razorpay SDK flow |
| `index.html` | Added `<script src="https://checkout.razorpay.com/v1/checkout.js">` |
| `package.json` | Added `razorpay` dependency and `@types/razorpay` devDependency |
| `.env.example` | Added `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `VITE_RAZORPAY_KEY_ID` |

---

## Step 1 — Get your Razorpay keys

1. Sign up at https://razorpay.com
2. Go to **Dashboard → Settings → API Keys**
3. Click **Generate Key**
4. Copy your **Key ID** and **Key Secret**

---

## Step 2 — Configure your `.env` file

Copy `.env.example` to `.env` and fill in:

```env
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=your_secret_key_here
VITE_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX
```

> ⚠️ Never commit your `.env` file or expose `RAZORPAY_KEY_SECRET` to the frontend.

---

## Step 3 — Install dependencies

```bash
npm install
```

---

## Step 4 — Run the app

```bash
npm run dev
```

---

## Payment Flow

```
User clicks "Authorize Secured Payment"
  → POST /api/razorpay/create-order     (your Express backend)
  → Razorpay popup opens                (Razorpay's hosted UI handles card/UPI/netbanking/wallets)
  → User completes payment
  → POST /api/razorpay/verify-payment   (HMAC-SHA256 signature check on your backend)
  → onPlaceOrder() fires → order saved to DB → confirmation email sent
```

---

## Test Cards (Test Mode only)

| Type | Details |
|---|---|
| Success card | `4111 1111 1111 1111` — any future expiry, any CVV |
| Failure card | `4000 0000 0000 0002` |
| UPI success | `success@razorpay` |
| UPI failure | `failure@razorpay` |

---

## Going Live

1. Complete Razorpay KYC (business registration + bank account)
2. Replace `rzp_test_` keys with `rzp_live_` keys in your `.env`
3. Ensure your server runs on **HTTPS** (required for live mode)
4. Test with a small real transaction before launch
