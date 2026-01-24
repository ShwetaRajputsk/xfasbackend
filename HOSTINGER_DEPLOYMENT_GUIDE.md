# Hostinger Deployment Guide - XFas Logistics

## Overview
This guide will help you deploy your React frontend and Python backend on Hostinger hosting.

## Prerequisites
- Hostinger hosting account with Python support
- Domain name configured
- FTP/SFTP access credentials
- Database access (if using Hostinger's database)

## Deployment Architecture

```
Frontend (React) → Hostinger Web Hosting
Backend (Python/FastAPI) → Hostinger Python Hosting or VPS
Database (MongoDB) → MongoDB Atlas (recommended) or Hostinger VPS
```

## Step 1: Prepare Your Application

### 1.1 Frontend Preparation

1. **Update API URLs in frontend:**
   ```bash
   # Edit frontend/src/services/api.js
   # Change localhost URLs to your production backend URL
   ```

2. **Build the React app:**
   ```bash
   cd frontend
   npm run build
   ```

3. **The build folder contains your deployable frontend**

### 1.2 Backend Preparation

1. **Create production requirements:**
   ```bash
   cd backend
   pip freeze > requirements.txt
   ```

2. **Update environment variables:**
   ```bash
   # Create production .env file
   cp .env.example .env.production
   # Update with production values
   ```

3. **Create startup script:**
   ```bash
   # Create start.sh
   #!/bin/bash
   uvicorn server:app --host 0.0.0.0 --port 8000
   ```

## Step 2: Choose Hostinger Hosting Plan

### Option A: Shared Hosting (Frontend Only)
- **Best for:** Static frontend with external backend
- **Limitations:** No Python backend support
- **Cost:** $2-10/month

### Option B: VPS Hosting (Recommended)
- **Best for:** Full-stack application
- **Features:** Python support, full control
- **Cost:** $4-20/month

### Option C: Cloud Hosting
- **Best for:** Scalable applications
- **Features:** Auto-scaling, managed services
- **Cost:** $9-30/month

## Step 3: Frontend Deployment (All Plans)

### 3.1 Upload Frontend Files

1. **Access File Manager or FTP:**
   - Login to Hostinger control panel
   - Go to File Manager or use FTP client

2. **Upload build files:**
   ```
   Upload contents of frontend/build/ to:
   - public_html/ (for main domain)
   - public_html/subdomain/ (for subdomain)
   ```

3. **Set up redirects:**
   Create `.htaccess` file in public_html:
   ```apache
   RewriteEngine On
   RewriteBase /
   
   # Handle React Router
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule . /index.html [L]
   
   # Security headers
   Header always set X-Content-Type-Options nosniff
   Header always set X-Frame-Options DENY
   Header always set X-XSS-Protection "1; mode=block"
   ```

## Step 4: Backend Deployment (VPS/Cloud Only)

### 4.1 VPS Setup

1. **Connect to VPS:**
   ```bash
   ssh root@your-vps-ip
   ```

2. **Install Python and dependencies:**
   ```bash
   apt update
   apt install python3 python3-pip nginx supervisor
   ```

3. **Upload backend code:**
   ```bash
   # Using SCP or Git
   scp -r backend/ root@your-vps-ip:/var/www/
   # OR
   git clone your-repo-url /var/www/backend
   ```

4. **Install Python dependencies:**
   ```bash
   cd /var/www/backend
   pip3 install -r requirements.txt
   ```

### 4.2 Configure Environment

1. **Set up environment variables:**
   ```bash
   nano /var/www/backend/.env
   ```
   
   ```env
   # Production environment
   MONGO_URL=your-mongodb-atlas-url
   DB_NAME=xfas_logistics
   JWT_SECRET_KEY=your-production-jwt-secret
   CORS_ORIGINS=https://yourdomain.com
   ENVIRONMENT=production
   DEBUG=false
   
   # Razorpay (use production keys)
   RAZORPAY_KEY_ID=rzp_live_your_live_key
   RAZORPAY_KEY_SECRET=your_live_secret
   USE_MOCK_PAYMENTS=false
   ```

### 4.3 Configure Nginx

1. **Create Nginx config:**
   ```bash
   nano /etc/nginx/sites-available/xfas-backend
   ```
   
   ```nginx
   server {
       listen 80;
       server_name api.yourdomain.com;
       
       location / {
           proxy_pass http://127.0.0.1:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

2. **Enable site:**
   ```bash
   ln -s /etc/nginx/sites-available/xfas-backend /etc/nginx/sites-enabled/
   nginx -t
   systemctl reload nginx
   ```

### 4.4 Configure Supervisor

1. **Create supervisor config:**
   ```bash
   nano /etc/supervisor/conf.d/xfas-backend.conf
   ```
   
   ```ini
   [program:xfas-backend]
   command=/usr/bin/python3 -m uvicorn server:app --host 127.0.0.1 --port 8000
   directory=/var/www/backend
   user=www-data
   autostart=true
   autorestart=true
   redirect_stderr=true
   stdout_logfile=/var/log/xfas-backend.log
   ```

2. **Start the service:**
   ```bash
   supervisorctl reread
   supervisorctl update
   supervisorctl start xfas-backend
   ```

## Step 5: Database Setup

### Option A: MongoDB Atlas (Recommended)

1. **Create MongoDB Atlas account**
2. **Create cluster and database**
3. **Get connection string**
4. **Update MONGO_URL in backend .env**

### Option B: Hostinger VPS MongoDB

1. **Install MongoDB:**
   ```bash
   apt install mongodb
   systemctl start mongodb
   systemctl enable mongodb
   ```

2. **Configure MongoDB:**
   ```bash
   mongo
   use xfas_logistics
   db.createUser({
     user: "xfas_user",
     pwd: "secure_password",
     roles: ["readWrite"]
   })
   ```

## Step 6: SSL Certificate

### Using Let's Encrypt (Free)

1. **Install Certbot:**
   ```bash
   apt install certbot python3-certbot-nginx
   ```

2. **Get certificates:**
   ```bash
   certbot --nginx -d yourdomain.com -d api.yourdomain.com
   ```

3. **Auto-renewal:**
   ```bash
   crontab -e
   # Add: 0 12 * * * /usr/bin/certbot renew --quiet
   ```

## Step 7: Update Frontend Configuration

1. **Update API URLs:**
   ```javascript
   // frontend/src/services/api.js
   const API_BASE_URL = process.env.NODE_ENV === 'production' 
     ? 'https://api.yourdomain.com/api'
     : 'http://localhost:8000/api';
   ```

2. **Update environment variables:**
   ```bash
   # frontend/.env.production
   REACT_APP_API_URL=https://api.yourdomain.com/api
   REACT_APP_RAZORPAY_KEY_ID=rzp_live_your_live_key
   ```

3. **Rebuild and redeploy:**
   ```bash
   npm run build
   # Upload new build files
   ```

## Step 8: Testing Deployment

### 8.1 Frontend Testing
- Visit https://yourdomain.com
- Check all pages load correctly
- Test responsive design
- Verify all links work

### 8.2 Backend Testing
- Visit https://api.yourdomain.com/docs
- Test API endpoints
- Check database connections
- Verify file uploads work

### 8.3 Integration Testing
- Test complete booking flow
- Verify payment processing
- Check PDF generation
- Test email notifications

## Step 9: Monitoring and Maintenance

### 9.1 Log Monitoring
```bash
# Backend logs
tail -f /var/log/xfas-backend.log

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### 9.2 Backup Strategy
```bash
# Database backup
mongodump --uri="your-mongodb-url" --out=/backups/$(date +%Y%m%d)

# Code backup
tar -czf /backups/xfas-$(date +%Y%m%d).tar.gz /var/www/backend
```

## Troubleshooting

### Common Issues:

1. **CORS Errors:**
   - Update CORS_ORIGINS in backend .env
   - Check Nginx proxy headers

2. **Database Connection:**
   - Verify MongoDB Atlas IP whitelist
   - Check connection string format

3. **File Permissions:**
   ```bash
   chown -R www-data:www-data /var/www/backend
   chmod -R 755 /var/www/backend
   ```

4. **Python Dependencies:**
   ```bash
   pip3 install --upgrade -r requirements.txt
   ```

## Cost Estimation

### Hostinger VPS (Recommended)
- **VPS 1:** $4/month - 1 vCPU, 1GB RAM
- **VPS 2:** $8/month - 2 vCPU, 2GB RAM
- **Domain:** $10/year
- **SSL:** Free (Let's Encrypt)
- **Total:** ~$5-10/month

### Additional Services
- **MongoDB Atlas:** Free tier (512MB)
- **Email Service:** $5-20/month (optional)
- **CDN:** $5-15/month (optional)

## Next Steps

1. **Purchase Hostinger VPS plan**
2. **Configure domain DNS**
3. **Follow deployment steps above**
4. **Set up monitoring and backups**
5. **Configure production payment gateway**

Your XFas Logistics platform will be live and ready for customers! 🚀