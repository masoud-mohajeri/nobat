#!/bin/bash

# Docker Production Script for Nobat Backend
# This script manages the production Docker environment

set -e

COMPOSE_FILE="docker-compose.yml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Function to check if containers are running
check_containers() {
    if docker-compose -f $COMPOSE_FILE ps | grep -q "Up"; then
        return 0
    else
        return 1
    fi
}

# Function to show usage
show_usage() {
    echo "Usage: $0 {start|stop|restart|logs|shell|build|deploy|backup|status|help}"
    echo ""
    echo "Commands:"
    echo "  start   - Start the production environment"
    echo "  stop    - Stop the production environment"
    echo "  restart - Restart the production environment"
    echo "  logs    - Show logs from all containers"
    echo "  shell   - Open shell in the app container"
    echo "  build   - Build the production containers"
    echo "  deploy  - Deploy with zero downtime"
    echo "  backup  - Create database backup"
    echo "  status  - Show status of all containers"
    echo "  help    - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start"
    echo "  $0 logs -f"
    echo "  $0 deploy"
}

# Function to start production environment
start_prod() {
    print_header "Starting Production Environment"
    
    # Check if SSL certificates exist
    if [ ! -f nginx/ssl/cert.pem ] || [ ! -f nginx/ssl/key.pem ]; then
        print_error "SSL certificates not found in nginx/ssl/"
        print_warning "Please add your SSL certificates:"
        echo "  - nginx/ssl/cert.pem"
        echo "  - nginx/ssl/key.pem"
        exit 1
    fi
    
    print_status "Starting production containers..."
    docker-compose -f $COMPOSE_FILE up -d
    
    print_status "Waiting for services to be ready..."
    sleep 15
    
    if check_containers; then
        print_status "Production environment started successfully!"
        echo ""
        echo "🌐 Access URLs:"
        echo "  - API: https://localhost"
        echo "  - Swagger: https://localhost/api/docs"
        echo ""
        echo "📋 Useful commands:"
        echo "  - View logs: $0 logs"
        echo "  - Open shell: $0 shell"
        echo "  - Stop services: $0 stop"
    else
        print_error "Failed to start production environment"
        exit 1
    fi
}

# Function to stop production environment
stop_prod() {
    print_header "Stopping Production Environment"
    print_status "Stopping containers..."
    docker-compose -f $COMPOSE_FILE down
    print_status "Production environment stopped"
}

# Function to restart production environment
restart_prod() {
    print_header "Restarting Production Environment"
    stop_prod
    sleep 5
    start_prod
}

# Function to show logs
show_logs() {
    print_header "Container Logs"
    docker-compose -f $COMPOSE_FILE logs "$@"
}

# Function to open shell in app container
open_shell() {
    print_header "Opening Shell in App Container"
    if check_containers; then
        print_status "Opening shell in nobat-backend container..."
        docker-compose -f $COMPOSE_FILE exec app sh
    else
        print_error "Containers are not running. Start them first with: $0 start"
        exit 1
    fi
}

# Function to build containers
build_containers() {
    print_header "Building Production Containers"
    print_status "Building containers..."
    docker-compose -f $COMPOSE_FILE build --no-cache
    print_status "Containers built successfully"
}

# Function to deploy with zero downtime
deploy() {
    print_header "Deploying with Zero Downtime"
    
    print_status "Building new image..."
    docker-compose -f $COMPOSE_FILE build app
    
    print_status "Deploying new version..."
    docker-compose -f $COMPOSE_FILE up -d --no-deps app
    
    print_status "Waiting for new container to be healthy..."
    sleep 10
    
    if check_containers; then
        print_status "Deployment completed successfully!"
    else
        print_error "Deployment failed"
        exit 1
    fi
}

# Function to create database backup
backup_database() {
    print_header "Creating Database Backup"
    
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    BACKUP_FILE="backup_${TIMESTAMP}.sql"
    
    print_status "Creating backup: $BACKUP_FILE"
    
    if check_containers; then
        docker-compose -f $COMPOSE_FILE exec -T postgres pg_dump -U nobat_user nobat_db > "backups/$BACKUP_FILE"
        print_status "Backup created successfully: backups/$BACKUP_FILE"
    else
        print_error "Containers are not running. Start them first with: $0 start"
        exit 1
    fi
}

# Function to show status
show_status() {
    print_header "Container Status"
    docker-compose -f $COMPOSE_FILE ps
}

# Function to check health
check_health() {
    print_header "Health Check"
    
    if check_containers; then
        print_status "Checking application health..."
        
        # Check API health
        if curl -f -s http://localhost:3000/ > /dev/null; then
            print_status "✅ API is healthy"
        else
            print_error "❌ API is not responding"
        fi
        
        # Check database health
        if docker-compose -f $COMPOSE_FILE exec -T postgres pg_isready -U nobat_user -d nobat_db > /dev/null; then
            print_status "✅ Database is healthy"
        else
            print_error "❌ Database is not responding"
        fi
        
        # Check Redis health
        if docker-compose -f $COMPOSE_FILE exec -T redis redis-cli ping > /dev/null; then
            print_status "✅ Redis is healthy"
        else
            print_error "❌ Redis is not responding"
        fi
    else
        print_error "Containers are not running"
        exit 1
    fi
}

# Main script logic
case "$1" in
    start)
        start_prod
        ;;
    stop)
        stop_prod
        ;;
    restart)
        restart_prod
        ;;
    logs)
        show_logs "${@:2}"
        ;;
    shell)
        open_shell
        ;;
    build)
        build_containers
        ;;
    deploy)
        deploy
        ;;
    backup)
        backup_database
        ;;
    health)
        check_health
        ;;
    status)
        show_status
        ;;
    help|--help|-h)
        show_usage
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_usage
        exit 1
        ;;
esac 