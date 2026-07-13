<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/788f1ad2-4042-4d49-8ed5-11c198962539

## Run Locally

**Prerequisites:** Node.js

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

## OTP Login & SMS Setup (Production)

The site supports **SMS OTP login** and **order confirmation SMS** via [Twilio](https://www.twilio.com/).

### How it works

1. User opens **Account → SMS OTP Safe**, enters a 10-digit Indian mobile number.
2. Backend generates a 4-digit code, stores it in `otp_db.json`, and sends SMS via Twilio.
3. User enters the code; backend verifies and logs them in.

Order placement also sends an SMS confirmation when Twilio is configured.

### Step 1: Create a Twilio account

1. Sign up at [twilio.com](https://www.twilio.com/try-twilio).
2. From the [Twilio Console](https://console.twilio.com), copy:
   - **Account SID**
   - **Auth Token**
3. Buy or use a trial **phone number** that supports SMS.

### Step 2: Configure environment variables

Add these to your `.env` (local) or your hosting platform's secrets (production):

```env
ENABLE_REAL_NOTIFICATIONS="true"
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your_auth_token"
TWILIO_SMS_NUMBER="+1XXXXXXXXXX"
APP_URL="https://your-deployed-domain.com"
```

| Variable | Purpose |
|----------|---------|
| `ENABLE_REAL_NOTIFICATIONS` | Must be `"true"` for real SMS |
| `TWILIO_ACCOUNT_SID` | Twilio account identifier |
| `TWILIO_AUTH_TOKEN` | Twilio secret |
| `TWILIO_SMS_NUMBER` | Sender number in E.164 format (`+91...` or Twilio number) |
| `APP_URL` | Public site URL (used in order tracking SMS links) |

### Step 3: Deploy

```bash
npm run build
npm start
```

For **Google Cloud Run / AI Studio**, set the same environment variables in the **Secrets** or **Environment variables** panel before deploying.

### Step 4: Test OTP login

1. Open your deployed site → **Account** → **SMS OTP Safe**.
2. Enter a valid mobile number (trial accounts may only send to verified numbers).
3. You should receive an SMS within a few seconds.
4. Enter the 4-digit code to sign in.

### Sandbox vs production mode

| Mode | When | Behavior |
|------|------|----------|
| **Sandbox** | `ENABLE_REAL_NOTIFICATIONS=false` or Twilio not configured | OTP is generated and returned in the API as `mockOtp` for testing |
| **Live** | All Twilio vars set + `ENABLE_REAL_NOTIFICATIONS=true` | Real SMS sent to the user's phone |

### Rate limits (built-in)

- **60 seconds** between OTP resend requests per number
- **5 OTP sends** per hour per number
- **5 failed verify attempts** before the OTP is invalidated
- OTP expires after **5 minutes**

### India SMS notes

- Twilio trial accounts can only SMS **verified** phone numbers. Add your number under Twilio → Phone Numbers → Verified Caller IDs.
- For production traffic to Indian numbers, you may need a Twilio number with India SMS capability or an approved sender ID per TRAI regulations.
- Order confirmation SMS uses the same `TWILIO_SMS_NUMBER` and `ENABLE_REAL_NOTIFICATIONS` flag.

### API endpoints

| Method | Endpoint | Body |
|--------|----------|------|
| `POST` | `/api/send-otp` | `{ "phoneNumber": "+919876543210" }` |
| `POST` | `/api/verify-otp` | `{ "phoneNumber": "+919876543210", "code": "1234" }` |

### Troubleshooting

| Issue | Fix |
|-------|-----|
| No SMS received | Confirm `ENABLE_REAL_NOTIFICATIONS=true` and Twilio credentials are set on the **deployed** server |
| Twilio trial error | Verify the recipient number in Twilio Console |
| OTP expired | Request a new code (valid 5 minutes) |
| 429 Too many requests | Wait for cooldown or hourly limit to reset |
| Works locally, not after deploy | Ensure env vars are set in Cloud Run/hosting secrets, not only in local `.env` |
