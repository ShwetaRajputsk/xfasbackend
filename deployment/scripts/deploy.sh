#!/bin/bash

# XFas Logistics Deployment Script for Hostinger VPS
# Run this script on your VPS after uploading the code

set -e  # Exit on any error

echo "🚀 Starting XFas Logistics deployment..."

# Configuration
APP_DIR="/var/www/backend"
FRONTEND_DIR="/var/www/html"
BACKUP_DIR="/var/backups/xfas"
LOG_FILE="/var/log/xfas-deployment.log"

# Create directories
echo "📁 Creating directories..."
mkdir -p $APP_DIR
mkdir -p $FRONTEND_DIR
mkdir -p $BACKUP_DIR
mkdir -p /var/log

# Update system
echo "🔄 Updating system packages..."
apt update && apt upgrade -y

# Install required packages
echo "📦 Installing required packages..."
apt install -y python3 python3-pip python3-venv nginx supervisor certbot python3-certbot-nginx git curl

# Install Node.js (for frontend building if needed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Create Python virtual environment
echo "🐍 Setting up Python environment..."
cd $APP_DIR
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
echo "📚 Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Set up environment variables
echo "⚙️ Setting up environment variables..."
cp .env.production .env
echo "Please edit $APP_DIR/.env with your actual production values"

# Set up file permissions
echo "🔐 Setting up file permissions..."
chown -R www-data:www-data $APP_DIR
chmod -R 755 $APP_DIR
chmod 600 $APP_DIR/.env

# Copy logo assets
echo "🖼️ Setting up logo assets..."
mkdir -p $APP_DIR/assets/images
mkdir -p $APP_DIR/static/images
if [ -f "../frontend/public/assets/images/xfas-logo.png" ]; then
    cp ../frontend/public/assets/images/xfas-logo.png $APP_DIR/assets/images/
    cp ../frontend/public/assets/images/xfas-logo.png $APP_DIR/static/images/
    echo "✅ Logo copied successfully"
else
    echo "⚠️ Logo file not found, PDFs will use text fallback"
fi

# Set up Nginx
echo "🌐 Configuring Nginx..."
cp deployment/backend/nginx.conf /etc/nginx/sites-available/xfas-backend
ln -sf /etc/nginx/sites-available/xfas-backend /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t
if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration is valid"
else
    echo "❌ Nginx configuration error"
    exit 1
fi

# Set up Supervisor
echo "👮 Configuring Supervisor..."
cp deployment/backend/supervisor.conf /etc/supervisor/conf.d/xfas-backend.conf
supervisorctl reread
supervisorctl update

# Start services
echo "🚀 Starting services..."
systemctl enable nginx
systemctl restart nginx
supervisorctl start xfas-backend

# Check service status
echo "🔍 Checking service status..."
if supervisorctl status xfas-backend | grep -q "RUNNING"; then
    echo "✅ Backend service is running"
else
    echo "❌ Backend service failed to start"
    supervisorctl tail xfas-backend
    exit 1
fi

if systemctl is-active --quiet nginx; then
    echo "✅ Nginx is running"
else
    echo "❌ Nginx failed to start"
    systemctl status nginx
    exit 1
fi

# Set up SSL (Let's Encrypt)
echo "🔒 Setting up SSL certificate..."
echo "Please run the following command manually after updating DNS:"
echo "certbot --nginx -d yourdomain.com -d api.yourdomain.com"

# Set up log rotation
echo "📝 Setting up log rotation..."
cat > /etc/logrotate.d/xfas-backend << EOF
/var/log/xfas-backend.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        supervisorctl restart xfas-backend
    endscript
}
EOF

# Create backup script
echo "💾 Creating backup script..."
cat > /usr/local/bin/xfas-backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/xfas"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup code
tar -czf $BACKUP_DIR/xfas-code-$DATE.tar.gz /var/www/backend

# Backup database (if using local MongoDB)
if command -v mongodump &> /dev/null; then
    mongodump --out $BACKUP_DIR/db-$DATE
fi

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "db-*" -mtime +7 -exec rm -rf {} \;

echo "Backup completed: $DATE"
EOF

chmod +x /usr/local/bin/xfas-backup.sh

# Set up cron jobs
echo "⏰ Setting up cron jobs..."
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/xfas-backup.sh >> /var/log/xfas-backup.log 2>&1") | crontab -
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

# Final status check
echo "🏁 Deployment completed!"
echo "=================================="
echo "Backend URL: http://your-server-ip:8000"
echo "API Docs: http://your-server-ip:8000/docs"
echo "Logs: tail -f /var/log/xfas-backend.log"
echo "=================================="
echo ""
echo "Next steps:"
echo "1. Update DNS to point to this server"
echo "2. Edit $APP_DIR/.env with production values"
echo "3. Run: supervisorctl restart xfas-backend"
echo "4. Set up SSL: certbot --nginx -d yourdomain.com -d api.yourdomain.com"
echo "5. Upload frontend build files to $FRONTEND_DIR"
echo ""
echo "🎉 Your XFas Logistics backend is now deployed!"