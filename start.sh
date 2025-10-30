#!/bin/sh

# Create log directories
mkdir -p /var/log/supervisor
mkdir -p /var/log/nginx

# Test nginx configuration
nginx -t

# Start supervisor which will manage both nginx and nodejs
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf