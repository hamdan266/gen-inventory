#!/bin/bash
set -e

# Set proper permissions
chmod -R 775 /app/backend/storage /app/backend/bootstrap/cache 2>/dev/null || true

# Install PHP dependencies
if [ ! -d "/app/backend/vendor" ]; then
  cd /app/backend && composer install --no-dev --optimize-autoloader 2>&1 || true
fi

# Copy .env if needed
if [ ! -f "/app/backend/.env" ]; then
  cp /app/backend/.env.example /app/backend/.env || true
fi

# Generate app key if needed
if [ -z "$(grep 'APP_KEY=' /app/backend/.env | cut -d= -f2)" ]; then
  cd /app/backend && php artisan key:generate 2>&1 || true
fi

# Run migrations
cd /app/backend && php artisan migrate --force 2>&1 || true

# Seed categories
cd /app/backend && php artisan tinker --execute="
App\Models\Category::firstOrCreate(['slug'=>'electronics'],['name'=>'Electronics','description'=>'Gadgets & devices']);
App\Models\Category::firstOrCreate(['slug'=>'clothing'],['name'=>'Clothing','description'=>'Apparel & fashion']);
App\Models\Category::firstOrCreate(['slug'=>'food'],['name'=>'Food & Beverage','description'=>'Consumables']);
App\Models\Category::firstOrCreate(['slug'=>'home'],['name'=>'Home & Living','description'=>'Household items']);
" 2>&1 || true

# Start PHP-FPM
php-fpm -D

# Start nginx in foreground
nginx -g 'daemon off;'
