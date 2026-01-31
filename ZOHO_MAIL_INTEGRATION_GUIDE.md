# Zoho Mail Integration Guide - XFas Logistics

## 📧 Complete Email Service Integration

This guide covers the integration of Zoho Mail for email notifications, OTP delivery, and customer communications in your XFas Logistics platform.

## 🔧 Configuration Details

### Zoho Mail Server Settings

Based on your provided configuration:

**SMTP (Outgoing Mail):**
- Server: `smtppro.zoho.com`
- Port: `587` (with TLS) or `465` (with SSL)
- Authentication: Required
- Username: `you@yourdomain.com`
- Password: Your Zoho Mail password

**IMAP (Incoming Mail):**
- Server: `imappro.zoho.com`
- Port: `993` (SSL)
- Authentication: Required

**POP3 (Incoming Mail):**
- Server: `poppro.zoho.com`
- Port: `995` (SSL)
- Authentication: Required

### MX Records for Domain Verification

Add these MX records to your domain DNS:

| Priority | Host | Value |
|----------|------|-------|
| 10 | @ or blank | mx.zoho.com |
| 20 | @ or blank | mx2.zoho.com |
| 50 | @ or blank | mx3.zoho.com |

### SPF Record for Email Validation

Add this TXT record to your domain:

**Record Type:** TXT  
**Host:** @ or blank  
**Value:** `v=spf1 include:zohomail.com ~all`

## 🚀 Backend Integration

### Environment Variables

Set these in your Render deployment:

```bash
# Zoho Mail Configuration
SMTP_HOST=smtppro.zoho.com
SMTP_PORT=587
SMTP_USER=contact@xfas.codezora.com
SMTP_PASSWORD=your_zoho_mail_password
FROM_EMAIL=XFas Logistics <contact@xfas.codezora.com>
SMTP_USE_TLS=True

# Additional Email Settings
IMAP_HOST=imappro.zoho.com
IMAP_PORT=993
POP_HOST=poppro.zoho.com
POP_PORT=995
REQUIRE_EMAIL_AUTH=True
```

### Features Implemented

✅ **OTP Email Service**
- Branded OTP emails with XFas Logistics styling
- Secure 6-digit OTP generation
- 10-minute expiry time
- Professional HTML templates

✅ **Booking Confirmation Emails**
- Detailed shipment information
- AWB and tracking numbers
- Carrier and service details
- Direct tracking links

✅ **Status Update Notifications**
- Real-time shipment status updates
- Location and timestamp information
- Color-coded status indicators
- Mobile-responsive design

✅ **Delivery Notifications**
- Out for delivery alerts
- Delivery confirmations
- Feedback collection links

## 🧪 Testing Your Email Integration

### 1. Test Email Connection

```bash
curl -X POST "https://xfasbackend-1.onrender.com/api/email-test/connection"
```

### 2. Test OTP Email

```bash
curl -X POST "https://xfasbackend-1.onrender.com/api/email-test/send-otp" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp_code": "123456",
    "purpose": "registration"
  }'
```

### 3. Test Booking Confirmation

```bash
curl -X POST "https://xfasbackend-1.onrender.com/api/email-test/send-booking-confirmation" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "shipment_number": "XF123456",
    "awb": "AWB987654321",
    "carrier": "DHL Express"
  }'
```

### 4. Test Status Update

```bash
curl -X POST "https://xfasbackend-1.onrender.com/api/email-test/send-status-update" \
  -H "Content-Type: application/json" \
  -d '{
    "to_email": "test@example.com",
    "test_type": "status"
  }'
```

## 📱 Email Templates

### OTP Email Features:
- 🎨 Professional XFas Logistics branding
- 📱 Mobile-responsive design
- 🔒 Security warnings and best practices
- ⏰ Clear expiry time indication
- 🎯 Purpose-specific messaging

### Booking Confirmation Features:
- 📦 Complete shipment details
- 🚚 Carrier and service information
- 📍 Tracking link integration
- 📅 Estimated delivery dates
- 👤 Sender and recipient information

### Status Update Features:
- 🚦 Color-coded status indicators
- 📍 Location tracking
- 🕐 Timestamp information
- 📱 Mobile-optimized layout
- 🔗 Direct tracking links

## 🔐 Security Best Practices

### Email Security:
- ✅ TLS encryption for SMTP
- ✅ SSL encryption for IMAP/POP
- ✅ SPF record validation
- ✅ Secure password storage
- ✅ Rate limiting for OTP emails

### OTP Security:
- ✅ 6-digit random generation
- ✅ 10-minute expiry time
- ✅ Maximum 3 attempts
- ✅ One-time use validation
- ✅ Secure database storage

## 🚀 Deployment Steps

### 1. Update Render Environment Variables

In your Render dashboard, add these environment variables:

```
SMTP_HOST=smtppro.zoho.com
SMTP_PORT=587
SMTP_USER=contact@xfas.codezora.com
SMTP_PASSWORD=[Your Zoho Mail Password]
FROM_EMAIL=XFas Logistics <contact@xfas.codezora.com>
SMTP_USE_TLS=True
```

### 2. Deploy Updated Backend

The backend code has been updated and pushed to GitHub. Render will automatically deploy the changes.

### 3. Test Email Functionality

Use the testing endpoints to verify email functionality:

- Connection test: `/api/email-test/connection`
- OTP test: `/api/email-test/send-otp`
- Booking test: `/api/email-test/send-booking-confirmation`
- Status test: `/api/email-test/send-status-update`

## 📊 Email Analytics

### Tracking Capabilities:
- ✅ Email delivery status
- ✅ Send/failure logging
- ✅ Error tracking and debugging
- ✅ Performance monitoring

### Logging Features:
- 📝 Detailed send logs
- ❌ Error reporting
- 📈 Success rate tracking
- 🔍 Debug information

## 🛠️ Troubleshooting

### Common Issues:

**1. Authentication Failed:**
- Verify Zoho Mail credentials
- Check username format (full email address)
- Ensure password is correct

**2. Connection Timeout:**
- Verify SMTP server settings
- Check firewall/network restrictions
- Confirm TLS/SSL settings

**3. Emails Not Delivered:**
- Check spam/junk folders
- Verify recipient email address
- Review email logs for errors

**4. SPF/DKIM Issues:**
- Verify DNS records are properly set
- Allow time for DNS propagation
- Test with email authentication tools

## 📞 Support

### Zoho Mail Support:
- Documentation: https://www.zoho.com/mail/help/
- Support: https://help.zoho.com/portal/en/home

### XFas Logistics Email Features:
- All email templates are customizable
- Branding can be updated in the email service
- Additional email types can be easily added

## 🎯 Next Steps

1. **Set up your Zoho Mail account** with your domain
2. **Configure DNS records** (MX, SPF)
3. **Update Render environment variables** with your credentials
4. **Test email functionality** using the provided endpoints
5. **Monitor email delivery** and performance

Your email integration is now ready for production use! 🚀

## 📋 Checklist

- [ ] Zoho Mail account created
- [ ] Domain configured with Zoho
- [ ] MX records added to DNS
- [ ] SPF record added to DNS
- [ ] Environment variables updated in Render
- [ ] Backend deployed with email service
- [ ] Email connection tested
- [ ] OTP emails tested
- [ ] Booking confirmation emails tested
- [ ] Status update emails tested
- [ ] Email templates reviewed and approved

Once all items are checked, your email system is fully operational! ✅