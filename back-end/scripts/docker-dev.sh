#!/bin/bash

# Docker Development Script for Nobat Backend
# This script manages the development Docker environment

set -e

COMPOSE_FILE="docker-compose.dev.yml"

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
    echo "Usage: $0 {start|stop|restart|logs|shell|build|clean|status|help}"
    echo ""
    echo "Commands:"
    echo "  start   - Start the development environment"
    echo "  stop    - Stop the development environment"
    echo "  restart - Restart the development environment"
    echo "  logs    - Show logs from all containers"
    echo "  shell   - Open shell in the app container"
    echo "  build   - Build the development containers"
    echo "  clean   - Clean up containers, networks, and volumes"
    echo "  status  - Show status of all containers"
    echo "  help    - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start"
    echo "  $0 logs -f"
    echo "  $0 shell"
}

# Function to start development environment
start_dev() {
    print_header "Starting Development Environment"
    
    print_status "Building and starting containers..."
    docker-compose -f $COMPOSE_FILE up -d --build
    
    print_status "Waiting for services to be ready..."
    sleep 10
    
    if check_containers; then
        print_status "Development environment started successfully!"
        echo ""
        echo "🌐 Access URLs:"
        echo "  - API: http://localhost:3000"
        echo "  - Swagger: http://localhost:3000/api/docs"
        echo "  - pgAdmin: http://localhost:5050"
        echo "  - Redis Commander: http://localhost:8081"
        echo ""
        echo "📋 Useful commands:"
        echo "  - View logs: $0 logs"
        echo "  - Open shell: $0 shell"
        echo "  - Stop services: $0 stop"
    else
        print_error "Failed to start development environment"
        exit 1
    fi
}

# Function to stop development environment
stop_dev() {
    print_header "Stopping Development Environment"
    print_status "Stopping containers..."
    docker-compose -f $COMPOSE_FILE down
    print_status "Development environment stopped"
}

# Function to restart development environment
restart_dev() {
    print_header "Restarting Development Environment"
    stop_dev
    sleep 2
    start_dev
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
        print_status "Opening shell in nobat-backend-dev container..."
        docker-compose -f $COMPOSE_FILE exec app sh
    else
        print_error "Containers are not running. Start them first with: $0 start"
        exit 1
    fi
}

# Function to build containers
build_containers() {
    print_header "Building Development Containers"
    print_status "Building containers..."
    docker-compose -f $COMPOSE_FILE build --no-cache
    print_status "Containers built successfully"
}

# Function to clean up
clean_up() {
    print_header "Cleaning Up Development Environment"
    print_warning "This will remove all containers, networks, and volumes!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Stopping and removing containers..."
        docker-compose -f $COMPOSE_FILE down -v --remove-orphans
        
        print_status "Removing development volumes..."
        docker volume rm $(docker volume ls -q | grep nobat) 2>/dev/null || true
        
        print_status "Removing development networks..."
        docker network rm $(docker network ls -q | grep nobat) 2>/dev/null || true
        
        print_status "Cleanup completed"
    else
        print_status "Cleanup cancelled"
    fi
}

# Function to show status
show_status() {
    print_header "Container Status"
    docker-compose -f $COMPOSE_FILE ps
}

# Main script logic
case "$1" in
    start)
        start_dev
        ;;
    stop)
        stop_dev
        ;;
    restart)
        restart_dev
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
    clean)
        clean_up
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