# Razorpay Setup Guide

## Getting Real Razorpay Credentials

The current credentials in your system are not valid. You need to get real credentials from Razorpay:

### Step 1: Create Razorpay Account
1. Go to https://razorpay.com/
2. Sign up for a free account
3. Complete the verification process

### Step 2: Get Test Credentials
1. Login to your Razorpay Dashboard
2. Go to **Settings** → **API Keys**
3. In the **Test Mode** section, click **Generate Test Key**
4. Copy the **Key ID** (starts with `rzp_test_`)
5. Copy the **Key Secret** (long alphanumeric string)

### Step 3: Update Environment Variables
Update your `backend/.env` file:

```env
# Replace with your actual credentials
RAZORPAY_KEY_ID=rzp_test_YOUR_ACTUAL_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_ACTUAL_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

### Step 4: Update Frontend Environment
Create/update `frontend/.env`:

```env
REACT_APP_RAZORPAY_KEY_ID=rzp_test_YOUR_ACTUAL_KEY_ID
```

## Alternative: Mock Payment for Development

If you don't want to set up Razorpay right now, I can create a mock payment system for development:

### Mock Payment Features:
- ✅ Simulates successful payments
- ✅ Generates fake payment IDs
- ✅ Works without real Razorpay account
- ✅ Perfect for development/testing
- ❌ Won't work in production

Would you like me to:
1. **Set up mock payments** for development (quick solution)
2. **Wait for you to get real Razorpay credentials** (production-ready solution)

## Current Status
- ❌ Invalid Razorpay credentials
- ❌ Payments failing with "Authentication failed"
- ✅ All other payment code is working correctly

## Next Steps
Choose one:
1. Get real Razorpay credentials and update the .env files
2. Let me implement mock payments for development