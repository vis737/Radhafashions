<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Meris E-Shop

This contains everything needed to run the Meris storefront locally or deploy it on Render.

View your app in AI Studio: https://ai.studio/apps/788f1ad2-4042-4d49-8ed5-11c198962539

## Run Locally

**Prerequisites:** Node.js 20+

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and set your keys:
   ```bash
   cp .env.example .env
   ```
3. Run the app:
   ```bash
   npm run dev
   ```

## Render Payments And Email OTP

The storefront uses PayU for online checkout and email OTP for account login.

### Required Render Variables

Set these in Render after the first deploy:

```env
NODE_ENV="production"
APP_URL="https://your-app.onrender.com"
ENABLE_REAL_NOTIFICATIONS="true"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-16-character-gmail-app-password"
SMTP_FROM_NAME="Meris E-Shop"
SMTP_FROM_EMAIL="your-email@gmail.com"
PAYU_MERCHANT_KEY="your-payu-key"
PAYU_MERCHANT_SALT="your-payu-salt"
PAYU_ENV="production"
```

PayU callback URLs default from `APP_URL`:

```text
https://your-app.onrender.com/api/payu/success
https://your-app.onrender.com/api/payu/failure
https://your-app.onrender.com/api/payu/webhook
```

### How To Verify

1. Open the deployed Render URL and request an email OTP from the login page.
2. Confirm the OTP email arrives, then sign in with the code.
3. Place a PayU test order and confirm the browser redirects to PayU.
4. After PayU redirects back, check the order payment status in the admin panel.

In production, OTP simulation is disabled. If SMTP is missing or Gmail rejects the app password, `/api/send-otp` returns an error instead of pretending the email was sent.

## Useful Commands

```bash
npm run lint
npm run build
npm start
```
