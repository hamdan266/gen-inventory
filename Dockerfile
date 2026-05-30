# Stage 1: Build Next.js frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build PHP backend dependencies
FROM composer:latest AS php-deps
WORKDIR /app/backend
COPY backend/composer.json ./
RUN composer install --no-dev --optimize-autoloader --ignore-platform-reqs

# Stage 3: Final runtime
FROM php:8.2-fpm-alpine

# Install dependencies
RUN apk add --no-cache \
    nginx \
    supervisor \
    libpng-dev \
    libzip-dev \
    zip \
    unzip \
    postgresql-dev \
    mysql-client \
    && docker-php-ext-install pdo pdo_mysql pdo_pgsql zip gd

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Setup PHP-FPM
RUN sed -i 's/listen = 127.0.0.1:9000/listen = 9000/' /usr/local/etc/php-fpm.d/www.conf
RUN sed -i 's/;daemonize = yes/daemonize = no/' /usr/local/etc/php-fpm.conf

# Setup nginx
COPY nginx.conf /etc/nginx/http.d/default.conf

# Copy frontend build
COPY --from=frontend-build /app/frontend/dist /app/frontend/dist

# Copy backend
COPY backend /app/backend
COPY --from=php-deps /app/backend/vendor /app/backend/vendor

# Copy entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Laravel permissions
RUN mkdir -p /app/backend/storage/framework/cache/data \
    /app/backend/storage/framework/sessions \
    /app/backend/storage/framework/views \
    /app/backend/storage/logs \
    /app/backend/bootstrap/cache \
    /run/nginx \
    /var/log/nginx \
    && chmod -R 777 /app/backend/storage /app/backend/bootstrap/cache

# Supervisord config
RUN mkdir -p /etc/supervisor.d
RUN echo "[supervisord]" > /etc/supervisor.d/supervisord.ini && \
    echo "nodaemon=true" >> /etc/supervisor.d/supervisord.ini && \
    echo "" >> /etc/supervisor.d/supervisord.ini && \
    echo "[program:php-fpm]" >> /etc/supervisor.d/supervisord.ini && \
    echo "command=/usr/local/sbin/php-fpm -F" >> /etc/supervisor.d/supervisord.ini && \
    echo "autostart=true" >> /etc/supervisor.d/supervisord.ini && \
    echo "autorestart=true" >> /etc/supervisor.d/supervisord.ini && \
    echo "" >> /etc/supervisor.d/supervisord.ini && \
    echo "[program:nginx]" >> /etc/supervisor.d/supervisord.ini && \
    echo "command=/usr/sbin/nginx -g 'daemon off;'" >> /etc/supervisor.d/supervisord.ini && \
    echo "autostart=true" >> /etc/supervisor.d/supervisord.ini && \
    echo "autorestart=true" >> /etc/supervisor.d/supervisord.ini

EXPOSE 80

CMD ["/entrypoint.sh"]
