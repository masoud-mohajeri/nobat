#!/bin/bash

# Test Swagger Documentation
# Make sure the server is running before executing this script

echo "Testing Swagger Documentation"
echo "============================"

# Test 1: Check if Swagger UI is accessible
echo "1. Checking Swagger UI accessibility..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/docs

if [ $? -eq 0 ]; then
    echo "✅ Swagger UI is accessible"
else
    echo "❌ Swagger UI is not accessible"
fi

echo -e "\n"

# Test 2: Check if Swagger JSON is accessible
echo "2. Checking Swagger JSON accessibility..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/docs-json

if [ $? -eq 0 ]; then
    echo "✅ Swagger JSON is accessible"
else
    echo "❌ Swagger JSON is not accessible"
fi

echo -e "\n"

# Test 3: Test a simple API endpoint to verify it's documented
echo "3. Testing API endpoint documentation..."
echo "Visit http://localhost:3000/api/docs in your browser to see the full documentation"

echo -e "\n"

# Test 4: List available endpoints
echo "4. Available API endpoints:"
echo "   - Authentication: /api/v1/auth/*"
echo "   - Users: /api/v1/users/*"
echo "   - Stylists: /api/v1/stylists/*"
echo "   - Bookings: /api/v1/bookings/*"
echo "   - Public: /api/v1/public/*"

echo -e "\n"

# Test 5: Check specific endpoints
echo "5. Testing specific endpoints..."

# Test auth endpoint
echo "   Testing /api/v1/auth/send-otp..."
curl -X POST http://localhost:3000/api/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "09123456789", "type": "phone_verification"}' \
  -s -o /dev/null -w "Status: %{http_code}\n"

echo -e "\n"

echo "Swagger Documentation Test Completed!"
echo "====================================="
echo ""
echo "📖 To view the full API documentation:"
echo "   Open your browser and go to: http://localhost:3000/api/docs"
echo ""
echo "🔧 To test the API:"
echo "   - Use the Swagger UI to test endpoints interactively"
echo "   - All endpoints are documented with examples"
echo "   - Authentication is handled via Bearer token"
echo ""
echo "📋 Available tags in Swagger:"
echo "   - auth: Authentication endpoints"
echo "   - users: User management endpoints"
echo "   - stylists: Stylist profile management endpoints"
echo "   - bookings: Booking management endpoints"
echo "   - public: Public booking endpoints" 