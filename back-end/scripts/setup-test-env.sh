#!/bin/bash

# Setup script for integration test environment

echo "Setting up test environment for Nobat booking system..."

# Check if PostgreSQL is running
echo "Checking PostgreSQL connection..."
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "❌ PostgreSQL is not running. Please start PostgreSQL first."
    exit 1
fi
echo "✅ PostgreSQL is running"

# Create test database if it doesn't exist
echo "Setting up test database..."
psql -h localhost -U nobat_user -d postgres -c "SELECT 1 FROM pg_database WHERE datname = 'nobat_db_test'" | grep -q 1
if [ $? -ne 0 ]; then
    echo "Creating test database 'nobat_db_test'..."
    psql -h localhost -U nobat_user -d postgres -c "CREATE DATABASE nobat_db_test;"
    if [ $? -eq 0 ]; then
        echo "✅ Test database created successfully"
    else
        echo "❌ Failed to create test database"
        exit 1
    fi
else
    echo "✅ Test database already exists"
fi

# Check if Redis is running
echo "Checking Redis connection..."
if ! redis-cli ping > /dev/null 2>&1; then
    echo "❌ Redis is not running. Please start Redis first."
    exit 1
fi
echo "✅ Redis is running"

# Create test directories
echo "Creating test directories..."
mkdir -p test-uploads
mkdir -p test-logs
echo "✅ Test directories created"

# Create .env.test file if it doesn't exist
if [ ! -f .env.test ]; then
    echo "Creating .env.test file..."
    cat > .env.test << EOF
# Test Environment Configuration
NODE_ENV=test
PORT=3001

# Test Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=nobat_user
DB_PASSWORD=nobat_password
DB_DATABASE=nobat_db_test

# Test Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=nobat_redis_password
REDIS_DB=1

# Test JWT Configuration
JWT_SECRET=test_jwt_secret_key_2024
JWT_REFRESH_SECRET=test_refresh_secret_key_2024
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Test OTP Configuration
OTP_EXPIRES_IN=300

# Test Rate Limiting
THROTTLE_TTL=60000
THROTTLE_LIMIT=10

# Test File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./test-uploads

# Test SMS Service (mock for testing)
SMS_PROVIDER=mock
SMS_API_KEY=test_sms_api_key
SMS_API_SECRET=test_sms_api_secret

# Test Logging
LOG_LEVEL=error
LOG_FILE=./test-logs/app.log

# Test Security
CORS_ORIGIN=http://localhost:3001
EOF
    echo "✅ .env.test file created"
else
    echo "✅ .env.test file already exists"
fi

# Install dependencies if needed
echo "Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "🎉 Test environment setup complete!"
echo ""
echo "To run the integration tests:"
echo "  npm run test:e2e"
echo ""
echo "To run specific test files:"
echo "  npm run test:e2e -- --testNamePattern=\"Registration Flows\""
echo ""
echo "To run tests in watch mode:"
echo "  npm run test:e2e -- --watch" 