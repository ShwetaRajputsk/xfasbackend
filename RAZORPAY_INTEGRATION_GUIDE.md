# Razorpay Integration Guide

This guide explains how to set up Razorpay payment integration for XFas Logistics platform.

## Overview

The Razorpay integration includes:
- **Backend**: Payment order creation, verification, and webhook handling
- **Frontend**: Razorpay checkout integration with React
- **Security**: Signature verification and webhook validation

## Setup Instructions

### 1. Razorpay Account Setup

1. **Create Razorpay Account**
   - Visit [https://razorpay.com/](https://razorpay.com/)
   - Sign up with business details
   - Complete KYC verification

2. **Get API Credentials**
   - Login to Razorpay Dashboard
   - Go to Settings → API Keys
   - Generate API Keys (Key ID and Key Secret)
   - Note down both Test and Live credentials

3. **Configure Webhooks**
   - Go to Settings → Webhooks
   - Add webhook URL: `https://your-backend-url/api/payments/webhooks/razorpay`
   - Select events: `payment.captured`, `payment.failed`, `order.paid`
   - Generate webhook secret

### 2. Backend Configuration

1. **Install Dependencies**
   ```bash
   cd backend
   pip install razorpay>=1.4.2
   ```

2. **Environment Variables**
   Add to `backend/.env`:
   ```env
   # Razorpay Configuration
   RAZORPAY_KEY_ID=rzp_test_your_key_id_here
   RAZORPAY_KEY_SECRET=your_key_secret_here
   RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
   ```

3. **Test Configuration**
   ```bash
   cd backend
   python -c "
   from services.razorpay_service import RazorpayService
   service = RazorpayService()
   print('Razorpay configured:', service.is_configured())
   "
   ```

### 3. Frontend Configuration

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install razorpay
   ```

2. **Environment Variables**
   Add to `frontend/.env`:
   ```env
   # Razorpay Configuration
   REACT_APP_RAZORPAY_KEY_ID=rzp_test_your_key_id_here
   ```

3. **Test Integration**
   - Start frontend: `npm start`
   - Create a booking and select Razorpay payment
   - Use test card: 4111 1111 1111 1111

### 4. Configured Credentials

**Razorpay Test Credentials (Already Configured):**
- Key ID: `rzp_test_RzOVYKxNXN9nXV`
- Key Secret: `YqxlgewImF6fhBhTFgEqbg`
- Status: ✅ **Active and Ready**

**Login Details (For Dashboard Access):**
- Email: accounts@xfas.in
- Password: Accounts|1250

**Test Card Details:**
- Card Number: 4111 1111 1111 1111
- Expiry: Any future date
- CVV: Any 3 digits
- Name: Any name

### 5. Payment Flow

1. **Order Creation**
   - User selects Razorpay payment method
   - Frontend calls `/api/payments/create-order`
   - Backend creates Razorpay order and returns order_id

2. **Payment Processing**
   - Frontend opens Razorpay checkout with order_id
   - User completes payment
   - Razorpay returns payment details

3. **Payment Verification**
   - Frontend calls `/api/payments/verify` with payment details
   - Backend verifies signature using Razorpay SDK
   - If valid, booking is created

4. **Webhook Handling**
   - Razorpay sends webhooks for payment events
   - Backend processes webhooks and updates payment status
   - Ensures payment consistency

### 6. Security Features

- **Signature Verification**: All payments verified using HMAC-SHA256
- **Webhook Validation**: Webhook signatures validated before processing
- **Order Tracking**: All orders stored in database for audit
- **Error Handling**: Comprehensive error handling and logging

### 7. Production Deployment

1. **Switch to Live Credentials**
   - Replace test keys with live keys
   - Update webhook URLs to production endpoints

2. **SSL Certificate**
   - Ensure HTTPS is enabled for webhook endpoints
   - Razorpay requires HTTPS for production webhooks

3. **Monitoring**
   - Monitor webhook delivery in Razorpay dashboard
   - Set up alerts for failed payments
   - Regular reconciliation with Razorpay reports

### 8. API Endpoints

**Payment Endpoints:**
- `POST /api/payments/create-order` - Create payment order
- `POST /api/payments/verify` - Verify payment signature
- `GET /api/payments/orders/{order_id}` - Get order details
- `POST /api/payments/webhooks/razorpay` - Webhook handler

**Request/Response Examples:**

**Create Order:**
```json
POST /api/payments/create-order
{
  "amount": 1500.00,
  "currency": "INR",
  "receipt": "booking_1234567890",
  "notes": {
    "booking_type": "shipping",
    "carrier": "DHL"
  }
}

Response:
{
  "order_id": "order_xyz123",
  "amount": 150000,
  "currency": "INR",
  "status": "created",
  "key_id": "rzp_test_key"
}
```

**Verify Payment:**
```json
POST /api/payments/verify
{
  "razorpay_order_id": "order_xyz123",
  "razorpay_payment_id": "pay_abc456",
  "razorpay_signature": "signature_hash"
}

Response:
{
  "status": "success",
  "payment_id": "pay_abc456",
  "order_id": "order_xyz123",
  "verified": true
}
```

### 9. Error Handling

**Common Errors:**
- `503 Service Unavailable`: Razorpay not configured
- `400 Bad Request`: Invalid payment signature
- `404 Not Found`: Order not found
- `500 Internal Server Error`: Payment processing failed

**Frontend Error Handling:**
- Payment cancelled by user
- Payment failed due to insufficient funds
- Network errors during payment
- Invalid card details

### 10. Testing Checklist

- [ ] Test order creation with valid amount
- [ ] Test payment with test card
- [ ] Test payment verification
- [ ] Test webhook delivery
- [ ] Test error scenarios (invalid card, network failure)
- [ ] Test payment cancellation
- [ ] Verify database records are created correctly
- [ ] Test booking creation after successful payment

### 11. Support and Documentation

**Razorpay Documentation:**
- [API Documentation](https://razorpay.com/docs/api/)
- [Checkout Documentation](https://razorpay.com/docs/checkout/)
- [Webhook Documentation](https://razorpay.com/docs/webhooks/)

**Support:**
- Razorpay Support: support@razorpay.com
- Developer Docs: https://razorpay.com/docs/

## Integration Status

✅ **Completed:**
- Backend Razorpay service implementation
- Payment order creation API
- Payment verification API
- Webhook handling
- Frontend Razorpay checkout integration
- Error handling and logging
- Database integration
- **Razorpay credentials configured and active**

✅ **Ready for Use:**
- Test payments can be processed immediately
- All APIs are functional
- Frontend integration is complete

📋 **Optional Enhancements:**
- Production webhook configuration
- Payment reconciliation reports
- Refund functionality (if needed)

## Notes

- This integration uses Razorpay's standard checkout flow
- All amounts are handled in INR (Indian Rupees)
- Payment verification is mandatory for security
- Webhooks provide additional payment confirmation
- Test mode is enabled by default for development