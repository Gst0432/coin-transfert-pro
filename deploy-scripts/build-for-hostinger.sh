#!/bin/bash

# Build script for Hostinger deployment with Laravel backend
# This script builds both frontend and backend for shared hosting

echo "🚀 Building Exchange Pro for Hostinger deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_BUILD_DIR="dist"
BACKEND_DIR="laravel-backend"
DEPLOY_DIR="hostinger-deploy"

# Create deployment directory
echo -e "${YELLOW}📁 Creating deployment directory...${NC}"
rm -rf $DEPLOY_DIR
mkdir -p $DEPLOY_DIR
mkdir -p $DEPLOY_DIR/api

# Build frontend for Laravel backend
echo -e "${YELLOW}🔧 Configuring frontend for Laravel backend...${NC}"
export VITE_BACKEND_TYPE=laravel
export VITE_LARAVEL_API_URL=https://your-domain.com/api
export NODE_ENV=production

# Build React frontend
echo -e "${YELLOW}⚛️ Building React frontend...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Frontend build failed${NC}"
    exit 1
fi

# Copy frontend build to deployment directory
echo -e "${YELLOW}📦 Copying frontend build...${NC}"
cp -r $FRONTEND_BUILD_DIR/* $DEPLOY_DIR/
cp hostinger-deploy/.htaccess $DEPLOY_DIR/

# Prepare Laravel backend
echo -e "${YELLOW}🐘 Preparing Laravel backend...${NC}"
cd $BACKEND_DIR

# Install dependencies (production only)
composer install --no-dev --optimize-autoloader

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Composer install failed${NC}"
    exit 1
fi

# Copy Laravel files to deployment directory
cd ..
cp -r $BACKEND_DIR/* $DEPLOY_DIR/api/

# Create Laravel .env file for production
echo -e "${YELLOW}⚙️ Creating Laravel production environment...${NC}"
cat > $DEPLOY_DIR/api/.env << EOL
APP_NAME="Exchange Pro API"
APP_ENV=production
APP_KEY=base64:$(openssl rand -base64 32)
APP_DEBUG=false
APP_URL=https://your-domain.com

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_database_user
DB_PASSWORD=your_database_password

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120

MEMCACHED_HOST=127.0.0.1

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="\${APP_NAME}"

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false

PUSHER_APP_ID=
PUSHER_APP_KEY=
PUSHER_APP_SECRET=
PUSHER_HOST=
PUSHER_PORT=443
PUSHER_SCHEME=https
PUSHER_APP_CLUSTER=mt1

VITE_PUSHER_APP_KEY="\${PUSHER_APP_KEY}"
VITE_PUSHER_HOST="\${PUSHER_HOST}"
VITE_PUSHER_PORT="\${PUSHER_PORT}"
VITE_PUSHER_SCHEME="\${PUSHER_SCHEME}"
VITE_PUSHER_APP_CLUSTER="\${PUSHER_APP_CLUSTER}"

# Payment Gateway Keys
MONEROO_API_KEY=your_moneroo_api_key
MONEROO_SECRET_KEY=your_moneroo_secret_key
NOWPAYMENTS_API_KEY=your_nowpayments_api_key

# CORS Configuration
SANCTUM_STATEFUL_DOMAINS=your-domain.com,www.your-domain.com
SESSION_DOMAIN=.your-domain.com
EOL

# Optimize Laravel for production
echo -e "${YELLOW}⚡ Optimizing Laravel for production...${NC}"
cd $DEPLOY_DIR/api
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Set proper permissions
echo -e "${YELLOW}🔒 Setting proper permissions...${NC}"
chmod -R 755 storage
chmod -R 755 bootstrap/cache

cd ../..

# Create database migration script
echo -e "${YELLOW}📊 Creating database setup script...${NC}"
cat > $DEPLOY_DIR/setup-database.sql << EOL
-- Exchange Pro Database Setup for MySQL
-- Run this script in your Hostinger MySQL database

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) NOT NULL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id CHAR(36) NOT NULL PRIMARY KEY,
    display_name VARCHAR(255) NULL,
    phone_number VARCHAR(20) NULL,
    avatar_url VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
    id CHAR(36) NOT NULL PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    role ENUM('admin', 'moderator', 'user') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_role (user_id, role),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id CHAR(36) NOT NULL PRIMARY KEY,
    user_id CHAR(36) NULL,
    transaction_type ENUM('fcfa_to_usdt', 'usdt_to_fcfa') NOT NULL,
    amount_fcfa DECIMAL(15,2) NOT NULL,
    amount_usdt DECIMAL(15,8) NOT NULL,
    exchange_rate DECIMAL(10,2) NOT NULL,
    fees_fcfa DECIMAL(15,2) DEFAULT 0,
    fees_usdt DECIMAL(15,8) DEFAULT 0,
    final_amount_fcfa DECIMAL(15,2) NULL,
    final_amount_usdt DECIMAL(15,8) NULL,
    source_wallet JSON NULL,
    destination_wallet JSON NULL,
    status ENUM('pending', 'processing', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
    moneroo_payment_id VARCHAR(255) NULL,
    moneroo_checkout_url TEXT NULL,
    nowpayments_payment_id VARCHAR(255) NULL,
    nowpayments_checkout_url TEXT NULL,
    processed_by CHAR(36) NULL,
    processed_at TIMESTAMP NULL,
    admin_notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_status (user_id, status),
    INDEX idx_created_at (created_at)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id CHAR(36) NOT NULL PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
    category VARCHAR(50) DEFAULT 'system',
    data JSON NULL,
    \`read\` BOOLEAN DEFAULT FALSE,
    important BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_read (user_id, \`read\`),
    INDEX idx_created_at (created_at)
);

-- Create personal_access_tokens table for Laravel Sanctum
CREATE TABLE IF NOT EXISTS personal_access_tokens (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tokenable_type VARCHAR(255) NOT NULL,
    tokenable_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    token VARCHAR(64) NOT NULL UNIQUE,
    abilities TEXT NULL,
    last_used_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tokenable (tokenable_type, tokenable_id)
);

-- Insert default admin user (password: admin123)
INSERT IGNORE INTO users (id, email, password, email_verified_at) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'admin@exchange.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NOW());

INSERT IGNORE INTO user_roles (id, user_id, role) VALUES 
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'admin');

-- Create app_settings table
CREATE TABLE IF NOT EXISTS app_settings (
    id CHAR(36) NOT NULL PRIMARY KEY,
    setting_key VARCHAR(255) NOT NULL UNIQUE,
    setting_value JSON NOT NULL,
    description TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

EOL

# Create deployment instructions
echo -e "${YELLOW}📝 Creating deployment instructions...${NC}"
cat > $DEPLOY_DIR/DEPLOYMENT_INSTRUCTIONS.md << EOL
# Hostinger Deployment Instructions

## Files Overview
- **Frontend**: All React build files in root directory
- **Backend**: Laravel API in \`api/\` directory
- **Database**: MySQL setup script in \`setup-database.sql\`
- **.htaccess**: Apache configuration for routing

## Deployment Steps

### 1. Upload Files
Upload all files from this directory to your Hostinger public_html folder:
\`\`\`
public_html/
├── index.html          (React app)
├── assets/             (React assets)
├── api/                (Laravel backend)
├── .htaccess           (Apache config)
└── setup-database.sql  (Database setup)
\`\`\`

### 2. Database Setup
1. Go to Hostinger control panel → Databases
2. Create a new MySQL database
3. Import \`setup-database.sql\` into your database
4. Note down database credentials

### 3. Configure Backend
1. Edit \`api/.env\` file with your actual values:
   - Database credentials
   - Domain name
   - API keys (Moneroo, NOWPayments)
   - App URL

### 4. Set Permissions
Set proper permissions via File Manager:
\`\`\`
chmod 755 api/storage/ -R
chmod 755 api/bootstrap/cache/ -R
\`\`\`

### 5. Test Installation
1. Visit your domain - should show React app
2. Test API endpoint: yoursite.com/api/health
3. Try registration/login functionality

## Configuration Files to Update

### api/.env
Update these values:
\`\`\`
APP_URL=https://your-domain.com
DB_DATABASE=your_database_name
DB_USERNAME=your_database_user
DB_PASSWORD=your_database_password
MONEROO_API_KEY=your_key
NOWPAYMENTS_API_KEY=your_key
\`\`\`

### Frontend Environment (if needed)
The React app is built with Laravel backend configuration.
To rebuild for different API URL, change VITE_LARAVEL_API_URL and rebuild.

## Troubleshooting

### 404 Errors
- Check .htaccess file is uploaded
- Verify mod_rewrite is enabled

### API Errors
- Check api/.env configuration
- Verify database connection
- Check error logs in api/storage/logs/

### Permission Errors
- Ensure proper file permissions
- Check directory ownership

## Support
For issues, check:
1. Error logs in api/storage/logs/
2. Browser console for frontend errors
3. Network tab for API call failures

EOL

echo -e "${GREEN}✅ Build completed successfully!${NC}"
echo -e "${YELLOW}📦 Deployment files are ready in: $DEPLOY_DIR/${NC}"
echo -e "${YELLOW}📖 Read DEPLOYMENT_INSTRUCTIONS.md for setup steps${NC}"

# Create zip file for easy upload
echo -e "${YELLOW}📦 Creating deployment archive...${NC}"
cd $DEPLOY_DIR
zip -r ../exchange-pro-hostinger-deploy.zip . -x "*.DS_Store" "*.git/*"
cd ..

echo -e "${GREEN}🎉 Deployment package created: exchange-pro-hostinger-deploy.zip${NC}"
echo -e "${YELLOW}Ready to upload to Hostinger! 🚀${NC}"