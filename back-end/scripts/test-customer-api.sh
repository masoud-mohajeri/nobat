#!/bin/bash

# Test Customer Profile API Endpoints
# Make sure the server is running on localhost:3000

BASE_URL="http://localhost:3000"
API_VERSION="v1"

echo "🧪 Testing Customer Profile API Endpoints"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

# Test 1: Create Customer Profile
echo -e "\n${YELLOW}Test 1: Create Customer Profile${NC}"
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/$API_VERSION/customers/profile" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "birthDate": "1990-01-01"
  }')

echo "Response: $CREATE_RESPONSE"
print_status $? "Create Customer Profile"

# Test 2: Get Customer Profile
echo -e "\n${YELLOW}Test 2: Get Customer Profile${NC}"
GET_RESPONSE=$(curl -s -X GET "$BASE_URL/api/$API_VERSION/customers/profile" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE")

echo "Response: $GET_RESPONSE"
print_status $? "Get Customer Profile"

# Test 3: Update Customer Profile
echo -e "\n${YELLOW}Test 3: Update Customer Profile${NC}"
UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/api/$API_VERSION/customers/profile" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{
    "firstName": "John Updated",
    "lastName": "Doe Updated"
  }')

echo "Response: $UPDATE_RESPONSE"
print_status $? "Update Customer Profile"

# Test 4: Change Phone Number
echo -e "\n${YELLOW}Test 4: Change Phone Number${NC}"
CHANGE_PHONE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/$API_VERSION/customers/profile/change-phone" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{
    "newPhoneNumber": "09123456789"
  }')

echo "Response: $CHANGE_PHONE_RESPONSE"
print_status $? "Change Phone Number"

# Test 5: Get Customer Info (for stylists)
echo -e "\n${YELLOW}Test 5: Get Customer Info (for stylists)${NC}"
CUSTOMER_INFO_RESPONSE=$(curl -s -X GET "$BASE_URL/api/$API_VERSION/customers/CUSTOMER_ID_HERE/info" \
  -H "Authorization: Bearer STYLIST_ACCESS_TOKEN_HERE")

echo "Response: $CUSTOMER_INFO_RESPONSE"
print_status $? "Get Customer Info for Stylists"

echo -e "\n${YELLOW}Test Instructions:${NC}"
echo "1. Replace 'YOUR_ACCESS_TOKEN_HERE' with a valid customer JWT token"
echo "2. Replace 'STYLIST_ACCESS_TOKEN_HERE' with a valid stylist JWT token"
echo "3. Replace 'CUSTOMER_ID_HERE' with an actual customer ID"
echo "4. Run the tests after starting the server with: yarn start:dev"

echo -e "\n${GREEN}Customer Profile API Testing Complete!${NC}" 