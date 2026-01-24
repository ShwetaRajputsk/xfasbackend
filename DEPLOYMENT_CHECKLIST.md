# 🚀 Hostinger Deployment Checklist - XFas Logistics

## Pre-Deployment Preparation ✅

### 1. Domain & Hosting Setup
- [ ] Purchase Hostinger VPS plan (recommended: VPS 2 - $8/month)
- [ ] Configure domain DNS to point to VPS IP
- [ ] Set up subdomains:
  - [ ] `yourdomain.com` → Frontend
  - [ ] `api.yourdomain.com` → Backend API

### 2. Database Setup
- [ ] Create MongoDB Atlas account (free tier)
- [ ] Create cluster and database `xfas_logistics`
- [ ] Get connection string
- [ ] Whitelist VPS IP address

### 3. Payment Gateway
- [ ] Get Razorpay LIVE keys (not test keys)
- [ ] Update webhook URLs in Razorpay dashboard
- [ ] Test payment flow in staging

## Backend Deployment Steps 🔧

### 1. VPS Initial Setup
```bash
# Connect to VPS
ssh root@your-vps-ip

# Update system
apt update && apt upgrade -y

# Install required packages
apt install -y python3 python3-pip python3-venv nginx supervisor git curl
```

### 2. Upload Backend Code
```bash
# Option A: Using Git (recommended)
git clone https://github.com/yourusername/xfas-logistics.git /var/www/
cd /var/www/backend

# Option B: Using SCP
scp -r backend/ root@your-vps-ip:/var/www/
```

### 3. Python Environment Setup
```bash
cd /var/www/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 4. Environment Configuration
```bash
# Copy production environment file
cp deployment/backend/.env.production .env

# Edit with your actual values
nano .env
```

**Update these values in .env:**
```env
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
RAZORPAY_KEY_ID=rzp_live_your_live_key
RAZORPAY_KEY_SECRET=your_live_secret
JWT_SECRET_KEY=your-super-secure-production-key
```

### 5. Logo Assets Setup
```bash
mkdir -p /var/www/backend/assets/images
mkdir -p /var/www/backend/static/images
cp frontend/public/assets/images/xfas-logo.png /var/www/backend/assets/images/
cp frontend/public/assets/images/xfas-logo.png /var/www/backend/static/images/
```

### 6. Nginx Configuration
```bash
# Copy nginx config
cp deployment/backend/nginx.conf /etc/nginx/sites-available/xfas-backend

# Update domain name in config
sed -i 's/api.yourdomain.com/api.youractualdomainname.com/g' /etc/nginx/sites-available/xfas-backend

# Enable site
ln -s /etc/nginx/sites-available/xfas-backend /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and reload
nginx -t
systemctl reload nginx
```

### 7. Supervisor Configuration
```bash
# Copy supervisor config
cp deployment/backend/supervisor.conf /etc/supervisor/conf.d/xfas-backend.conf

# Update and start
supervisorctl reread
supervisorctl update
supervisorctl start xfas-backend
```

### 8. SSL Certificate Setup
```bash
# Install Certbot
apt install certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d yourdomain.com -d api.yourdomain.com

# Verify auto-renewal
certbot renew --dry-run
```

## Frontend Deployment Steps 🎨

### 1. Build Production Frontend
```bash
# On your local machine
cd frontend

# Create production environment file
cp deployment/frontend/.env.production .env.production

# Update API URL
sed -i 's/api.yourdomain.com/api.youractualdomainname.com/g' .env.production

# Build for production
npm run build
```

### 2. Upload Frontend Files
```bash
# Upload build files to VPS
scp -r build/* root@your-vps-ip:/var/www/html/

# Or use Hostinger File Manager
# Upload contents of build/ folder to public_html/
```

### 3. Configure Frontend
```bash
# Copy .htaccess for React Router
cp deployment/frontend/.htaccess /var/www/html/

# Set permissions
chown -R www-data:www-data /var/www/html
chmod -R 755 /var/www/html
```

## Post-Deployment Testing 🧪

### 1. Backend Health Check
- [ ] Visit `https://api.yourdomain.com/docs`
- [ ] Check API documentation loads
- [ ] Test `/health` endpoint

### 2. Frontend Testing
- [ ] Visit `https://yourdomain.com`
- [ ] Check all pages load correctly
- [ ] Test responsive design
- [ ] Verify React Router works

### 3. Integration Testing
- [ ] Test user registration/login
- [ ] Create a test quote
- [ ] Complete a test booking
- [ ] Verify payment processing
- [ ] Check PDF generation (invoice/label)
- [ ] Test tracking functionality

### 4. Performance Testing
- [ ] Check page load speeds
- [ ] Test API response times
- [ ] Verify SSL certificate
- [ ] Test mobile responsiveness

## Production Configuration Updates 🔧

### 1. Update Payment Gateway
```bash
# In Razorpay Dashboard:
# 1. Switch to Live mode
# 2. Update webhook URL to: https://api.yourdomain.com/payments/webhooks/razorpay
# 3. Copy live keys to .env file
```

### 2. Update CORS Settings
```bash
# In backend .env
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### 3. Disable Debug Mode
```bash
# In backend .env
DEBUG=false
ENVIRONMENT=production

# In frontend .env.production
REACT_APP_ENABLE_DEBUG_LOGS=false
```

## Monitoring & Maintenance 📊

### 1. Set Up Monitoring
```bash
# Check service status
supervisorctl status xfas-backend
systemctl status nginx

# Monitor logs
tail -f /var/log/xfas-backend.log
tail -f /var/log/nginx/access.log
```

### 2. Set Up Backups
```bash
# Database backup (daily)
crontab -e
# Add: 0 2 * * * mongodump --uri="your-mongodb-url" --out=/backups/$(date +\%Y\%m\%d)

# Code backup (weekly)
# Add: 0 3 * * 0 tar -czf /backups/xfas-$(date +\%Y\%m\%d).tar.gz /var/www/backend
```

### 3. Security Updates
```bash
# Set up automatic security updates
apt install unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades
```

## Troubleshooting 🔍

### Common Issues:

1. **502 Bad Gateway**
   ```bash
   # Check backend service
   supervisorctl status xfas-backend
   supervisorctl restart xfas-backend
   ```

2. **CORS Errors**
   ```bash
   # Update CORS_ORIGINS in .env
   nano /var/www/backend/.env
   supervisorctl restart xfas-backend
   ```

3. **Database Connection**
   ```bash
   # Check MongoDB Atlas IP whitelist
   # Verify connection string in .env
   ```

4. **SSL Issues**
   ```bash
   # Renew certificate
   certbot renew
   systemctl reload nginx
   ```

## Final Checklist ✅

- [ ] Backend API responding at `https://api.yourdomain.com`
- [ ] Frontend loading at `https://yourdomain.com`
- [ ] SSL certificates installed and working
- [ ] Payment gateway configured with live keys
- [ ] Database connected and working
- [ ] Logo showing in generated PDFs
- [ ] All API endpoints tested
- [ ] Monitoring and backups configured
- [ ] DNS propagated globally

## Cost Summary 💰

- **Hostinger VPS:** $8/month
- **Domain:** $10/year
- **MongoDB Atlas:** Free (512MB)
- **SSL Certificate:** Free (Let's Encrypt)
- **Total:** ~$8-10/month

## Support Resources 📞

- **Hostinger Support:** 24/7 live chat
- **MongoDB Atlas:** Documentation + Support
- **Let's Encrypt:** Community forums
- **Your Development Team:** For application-specific issues

---

🎉 **Congratulations!** Your XFas Logistics platform is now live and ready for customers!