# Use Node.js official image
FROM node:18-alpine

# Install nginx and supervisor
RUN apk add --no-cache nginx supervisor

# Set working directory for the app
WORKDIR /app

# Copy package files first (for better layer caching)
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Create nginx configuration
RUN mkdir -p /etc/nginx/conf.d
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create supervisor configuration
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Create nginx directories and set permissions
RUN mkdir -p /var/log/nginx /var/lib/nginx/tmp /run/nginx && \
    chown -R nginx:nginx /var/log/nginx /var/lib/nginx /run/nginx

# Create non-root user for Node.js app
RUN addgroup -g 1001 -S nodejs && \
    adduser -S proteus -u 1001 -G nodejs

# Change ownership of the app directory
RUN chown -R proteus:nodejs /app

# Create startup script
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Expose HTTP port (nginx will serve on 80, Node.js on 3000 internally)
EXPOSE 80

# Health check through nginx
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/api/dashboard/stats || exit 1

# Start both nginx and Node.js using supervisor
CMD ["/start.sh"]