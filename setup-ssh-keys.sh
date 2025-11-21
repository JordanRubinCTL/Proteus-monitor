#!/bin/bash

# Setup script for SSH keys to enable host service monitoring from Docker container

echo "🔑 Setting up SSH keys for host service monitoring..."

# Create ssh-keys directory
mkdir -p ssh-keys

# Generate SSH key pair if it doesn't exist
if [ ! -f ssh-keys/id_rsa ]; then
    echo "📝 Generating new SSH key pair..."
    ssh-keygen -t rsa -b 4096 -f ./ssh-keys/id_rsa -N "" -C "proteus-monitor-container"
    echo "✅ SSH key pair generated"
else
    echo "ℹ️  SSH key pair already exists"
fi

# Display the public key
echo ""
echo "📋 Public key to add to host's ~/.ssh/authorized_keys:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat ssh-keys/id_rsa.pub
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Instructions
echo "📌 Next steps:"
echo "1. Copy the public key above"
echo "2. On the Docker host server, run:"
echo "   echo '<paste-public-key-here>' >> ~/.ssh/authorized_keys"
echo "   chmod 600 ~/.ssh/authorized_keys"
echo ""
echo "3. Update docker-compose.yml SSH_HOST with your actual host IP if needed"
echo ""
echo "4. Build and run the container:"
echo "   docker-compose up -d --build"
echo ""
echo "✨ Done! The container will be able to monitor services on the host."
