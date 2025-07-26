#!/bin/bash

# Test API endpoints
BASE_URL="http://localhost:3000/api/v1"

echo "Testing Nobat Backend API"
echo "=========================="

# Test 1: Send OTP
echo "1. Testing Send OTP..."
curl -X POST "$BASE_URL/auth/send-otp" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "09123456789",
    "type": "phone_verification"
  }' | jq '.'

echo -e "\n"

# Test 2: Verify OTP (you'll need to get the actual OTP from logs)
echo "2. Testing Verify OTP..."
curl -X POST "$BASE_URL/auth/verify-otp" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "09123456789",
    "code": "123456",
    "type": "phone_verification"
  }' | jq '.'

echo -e "\n"

# Test 3: Login with OTP
echo "3. Testing Login with OTP..."
curl -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "09123456789",
    "otpCode": "123456"
  }' | jq '.'

echo -e "\n"

echo "Note: Check the server logs for OTP codes in development mode"
echo "You may need to adjust the OTP codes based on what's generated" 