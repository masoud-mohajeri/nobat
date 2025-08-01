#!/bin/bash

# Docker Setup Script for Nobat Backend
# This script sets up the Docker environment and creates necessary directories

set -e

echo "🐳 Setting up Docker environment for Nobat Backend..."
echo "=================================================="

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p uploads
mkdir -p logs
mkdir -p logs/nginx
mkdir -p nginx/ssl

# Set proper permissions
echo "🔐 Setting permissions..."
chmod 755 uploads
chmod 755 logs
chmod 755 logs/nginx
chmod 755 nginx/ssl

# Create SSL certificates for development (self-signed)
echo "🔒 Creating self-signed SSL certificates for development..."
if [ ! -f nginx/ssl/cert.pem ] || [ ! -f nginx/ssl/key.pem ]; then
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout nginx/ssl/key.pem \
        -out nginx/ssl/cert.pem \
        -subj "/C=IR/ST=Tehran/L=Tehran/O=Nobat/OU=Development/CN=localhost"
    echo "✅ SSL certificates created"
else
    echo "ℹ️  SSL certificates already exist"
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "✅ .env file created"
else
    echo "ℹ️  .env file already exists"
fi

# Check if Docker and Docker Compose are installed
echo "🔍 Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Make scripts executable
echo "🔧 Making scripts executable..."
chmod +x scripts/*.sh

echo ""
echo "🎉 Docker environment setup complete!"
echo "====================================="
echo ""
echo "📋 Next steps:"
echo "1. Start development environment:"
echo "   docker-compose -f docker-compose.dev.yml up -d"
echo ""
echo "2. Start production environment:"
echo "   docker-compose up -d"
echo ""
echo "3. View logs:"
echo "   docker-compose logs -f app"
echo ""
echo "4. Access services:"
echo "   - API: http://localhost:3000"
echo "   - Swagger: http://localhost:3000/api/docs"
echo "   - pgAdmin: http://localhost:5050"
echo "   - Redis Commander: http://localhost:8081"
echo ""
echo "5. Stop services:"
echo "   docker-compose down"
echo "" 