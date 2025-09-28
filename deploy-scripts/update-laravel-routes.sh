#!/bin/bash

# Script to update Laravel routes configuration for Hostinger deployment
# This script should be run after the Laravel backend is uploaded to Hostinger

echo "🔧 Updating Laravel routes for Hostinger deployment..."

# Navigate to Laravel backend directory
cd laravel-backend || exit 1

# Clear all Laravel caches
echo "📦 Clearing Laravel caches..."
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
php artisan event:clear

# Install/update Composer dependencies for production
echo "📥 Installing Composer dependencies..."
composer install --optimize-autoloader --no-dev

# Generate Laravel application key if not exists
if [ ! -f .env ]; then
    echo "⚙️ Creating .env file..."
    cp .env.example .env
fi

echo "🔑 Generating application key..."
php artisan key:generate --force

# Create symbolic link for storage (if not exists)
echo "🔗 Creating storage link..."
php artisan storage:link

# Set proper permissions for Laravel directories
echo "🔐 Setting permissions..."
chmod -R 755 storage/
chmod -R 755 bootstrap/cache/
chmod 644 .env

# Cache configuration for production
echo "⚡ Caching configuration for production..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "✅ Laravel backend updated successfully!"
echo ""
echo "🚀 Next steps:"
echo "1. Update your .env file with your database credentials"
echo "2. Run: php artisan migrate --force"
echo "3. Access /install to complete the setup"
echo ""
echo "📝 Make sure your web server is configured to serve from the 'public' directory"