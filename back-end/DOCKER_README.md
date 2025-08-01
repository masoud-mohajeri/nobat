# Docker Setup for Nobat Backend

This document provides comprehensive instructions for setting up and running the Nobat Backend application using Docker and Docker Compose.

## 🐳 Overview

The Docker setup includes:

- **NestJS Application** - Main backend API
- **PostgreSQL Database** - Primary database
- **Redis Cache** - Session and cache storage
- **Nginx Reverse Proxy** - Production load balancer and SSL termination
- **pgAdmin** - Database management interface (development)
- **Redis Commander** - Redis management interface (development)

## 📋 Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)
- OpenSSL (for SSL certificate generation)

### Installation

#### macOS

```bash
# Install Docker Desktop
brew install --cask docker

# Or download from https://www.docker.com/products/docker-desktop
```

#### Ubuntu/Debian

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

## 🚀 Quick Start

### 1. Initial Setup

```bash
# Clone the repository
git clone <repository-url>
cd nobat-backend

# Run the setup script
chmod +x scripts/docker-setup.sh
./scripts/docker-setup.sh
```

### 2. Development Environment

```bash
# Start development environment
./scripts/docker-dev.sh start

# Or manually
docker-compose -f docker-compose.dev.yml up -d
```

### 3. Production Environment

```bash
# Start production environment
./scripts/docker-prod.sh start

# Or manually
docker-compose up -d
```

## 🛠️ Development Environment

### Features

- **Hot Reloading** - Code changes automatically restart the application
- **Volume Mounting** - Source code is mounted for live development
- **Development Tools** - pgAdmin and Redis Commander included
- **Debugging** - Full source maps and debugging capabilities

### Access URLs

- **API**: http://localhost:3000
- **Swagger Documentation**: http://localhost:3000/api/docs
- **pgAdmin**: http://localhost:5050
- **Redis Commander**: http://localhost:8081

### Development Scripts

```bash
# Start development environment
./scripts/docker-dev.sh start

# Stop development environment
./scripts/docker-dev.sh stop

# Restart development environment
./scripts/docker-dev.sh restart

# View logs
./scripts/docker-dev.sh logs -f

# Open shell in app container
./scripts/docker-dev.sh shell

# Build containers
./scripts/docker-dev.sh build

# Clean up everything
./scripts/docker-dev.sh clean

# Check status
./scripts/docker-dev.sh status
```

### Environment Variables (Development)

The development environment uses these default values:

```env
NODE_ENV=development
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=nobat_user
DB_PASSWORD=nobat_password
DB_DATABASE=nobat_db_dev
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=nobat_redis_password
```

## 🚀 Production Environment

### Features

- **Multi-stage Build** - Optimized production images
- **SSL/TLS Support** - HTTPS with Nginx reverse proxy
- **Health Checks** - Automatic health monitoring
- **Rate Limiting** - API protection
- **Security Headers** - Enhanced security
- **Load Balancing** - Nginx upstream configuration

### Access URLs

- **API**: https://localhost
- **Swagger Documentation**: https://localhost/api/docs

### Production Scripts

```bash
# Start production environment
./scripts/docker-prod.sh start

# Stop production environment
./scripts/docker-prod.sh stop

# Restart production environment
./scripts/docker-prod.sh restart

# Deploy with zero downtime
./scripts/docker-prod.sh deploy

# Create database backup
./scripts/docker-prod.sh backup

# Check health
./scripts/docker-prod.sh health

# View logs
./scripts/docker-prod.sh logs -f

# Open shell in app container
./scripts/docker-prod.sh shell
```

### SSL Certificates

For production, you need to add your SSL certificates:

```bash
# Create SSL directory
mkdir -p nginx/ssl

# Add your certificates
cp your-certificate.pem nginx/ssl/cert.pem
cp your-private-key.pem nginx/ssl/key.pem
```

### Environment Variables (Production)

The production environment uses these default values:

```env
NODE_ENV=production
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=nobat_user
DB_PASSWORD=nobat_password
DB_DATABASE=nobat_db
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=nobat_redis_password
JWT_SECRET=nobat_jwt_secret_key_2024
JWT_REFRESH_SECRET=nobat_refresh_secret_key_2024
```

## 📁 Directory Structure

```
nobat-backend/
├── docker-compose.yml              # Production compose file
├── docker-compose.dev.yml          # Development compose file
├── Dockerfile                      # Production Dockerfile
├── Dockerfile.dev                  # Development Dockerfile
├── .dockerignore                   # Docker ignore file
├── nginx/
│   ├── nginx.conf                  # Nginx configuration
│   └── ssl/                        # SSL certificates
├── scripts/
│   ├── docker-setup.sh            # Initial setup script
│   ├── docker-dev.sh              # Development management
│   ├── docker-prod.sh             # Production management
│   └── *.sql                      # Database initialization scripts
├── uploads/                        # File uploads (mounted volume)
├── logs/                          # Application logs (mounted volume)
└── backups/                       # Database backups
```

## 🔧 Configuration

### Database Configuration

The PostgreSQL database is configured with:

- **Database**: `nobat_db` (production) / `nobat_db_dev` (development)
- **User**: `nobat_user`
- **Password**: `nobat_password`
- **Port**: `5432`

### Redis Configuration

Redis is configured with:

- **Password**: `nobat_redis_password`
- **Port**: `6379`
- **Persistence**: AOF (Append Only File)

### Nginx Configuration

Nginx provides:

- **SSL Termination** - HTTPS support
- **Rate Limiting** - API protection
- **Gzip Compression** - Performance optimization
- **Security Headers** - Enhanced security
- **Load Balancing** - Upstream configuration

## 🔍 Monitoring and Logs

### View Logs

```bash
# All containers
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f postgres
docker-compose logs -f redis

# Using scripts
./scripts/docker-dev.sh logs -f
./scripts/docker-prod.sh logs -f
```

### Health Checks

```bash
# Check container health
docker-compose ps

# Production health check
./scripts/docker-prod.sh health
```

### Database Management

```bash
# Access pgAdmin (development)
# Open http://localhost:5050
# Email: admin@nobat.com
# Password: admin_password

# Direct database access
docker-compose exec postgres psql -U nobat_user -d nobat_db
```

### Redis Management

```bash
# Access Redis Commander (development)
# Open http://localhost:8081

# Direct Redis access
docker-compose exec redis redis-cli -a nobat_redis_password
```

## 🔒 Security

### Environment Variables

Never commit sensitive information to version control:

- Use `.env` files for local development
- Use Docker secrets or environment variables in production
- Rotate JWT secrets regularly

### SSL/TLS

- Use valid SSL certificates in production
- Configure proper SSL protocols and ciphers
- Enable HSTS headers

### Network Security

- Use Docker networks for service isolation
- Expose only necessary ports
- Implement proper firewall rules

## 📊 Performance

### Optimization Tips

1. **Database Optimization**
   - Use connection pooling
   - Implement proper indexing
   - Regular maintenance

2. **Redis Optimization**
   - Configure appropriate memory limits
   - Use Redis clustering for high availability

3. **Application Optimization**
   - Enable gzip compression
   - Use CDN for static assets
   - Implement caching strategies

### Scaling

```bash
# Scale application instances
docker-compose up -d --scale app=3

# Use Docker Swarm for orchestration
docker stack deploy -c docker-compose.yml nobat
```

## 🛠️ Troubleshooting

### Common Issues

1. **Port Conflicts**

   ```bash
   # Check port usage
   lsof -i :3000
   lsof -i :5432
   lsof -i :6379
   ```

2. **Container Won't Start**

   ```bash
   # Check logs
   docker-compose logs app

   # Check container status
   docker-compose ps
   ```

3. **Database Connection Issues**

   ```bash
   # Check database health
   docker-compose exec postgres pg_isready -U nobat_user -d nobat_db

   # Check database logs
   docker-compose logs postgres
   ```

4. **Redis Connection Issues**

   ```bash
   # Check Redis health
   docker-compose exec redis redis-cli ping

   # Check Redis logs
   docker-compose logs redis
   ```

### Debugging

```bash
# Enter container shell
docker-compose exec app sh

# Check environment variables
docker-compose exec app env

# Check network connectivity
docker-compose exec app ping postgres
docker-compose exec app ping redis
```

## 🔄 Backup and Recovery

### Database Backup

```bash
# Create backup
./scripts/docker-prod.sh backup

# Manual backup
docker-compose exec -T postgres pg_dump -U nobat_user nobat_db > backup.sql
```

### Database Restore

```bash
# Restore from backup
docker-compose exec -T postgres psql -U nobat_user -d nobat_db < backup.sql
```

### Volume Backup

```bash
# Backup volumes
docker run --rm -v nobat_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .

# Restore volumes
docker run --rm -v nobat_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres_backup.tar.gz -C /data
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)

## 🤝 Contributing

When contributing to the Docker setup:

1. Test changes in development environment
2. Update documentation
3. Follow security best practices
4. Test in production-like environment

## 📄 License

This Docker setup is part of the Nobat Backend project and follows the same license terms.
