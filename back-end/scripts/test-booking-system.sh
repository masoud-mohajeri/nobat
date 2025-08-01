#!/bin/bash

# Test Booking System API Endpoints
# Make sure the server is running before executing this script

BASE_URL="http://localhost:3000/api/v1"
echo "Testing Booking System API Endpoints"
echo "====================================="

# Test 1: Set stylist availability
echo "1. Setting stylist availability..."
curl -X POST "$BASE_URL/stylists/availability" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "mondayStart": "09:00",
    "mondayEnd": "17:00",
    "tuesdayStart": "09:00",
    "tuesdayEnd": "17:00",
    "wednesdayStart": "09:00",
    "wednesdayEnd": "17:00",
    "thursdayStart": "09:00",
    "thursdayEnd": "17:00",
    "fridayStart": "09:00",
    "fridayEnd": "17:00",
    "saturdayStart": "10:00",
    "saturdayEnd": "16:00",
    "slotDurationMinutes": 60,
    "bufferTimeMinutes": 15,
    "minimumNoticeMinutes": 120,
    "maxAdvanceDays": 90,
    "allowMultipleClients": true
  }'
echo -e "\n"

# Test 2: Get stylist availability
echo "2. Getting stylist availability..."
curl -X GET "$BASE_URL/stylists/availability" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
echo -e "\n"

# Test 3: Create stylist exception
echo "3. Creating stylist exception..."
curl -X POST "$BASE_URL/stylists/exceptions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "date": "2024-12-25",
    "reason": "Christmas Day"
  }'
echo -e "\n"

# Test 4: Get available slots
echo "4. Getting available slots..."
curl -X GET "$BASE_URL/stylists/availability/slots?date=2024-12-26" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
echo -e "\n"

# Test 5: Public booking - Get stylist availability
echo "5. Public - Getting stylist availability..."
curl -X GET "$BASE_URL/public/stylists/STYLIST_ID/availability?date=2024-12-26"
echo -e "\n"

# Test 6: Public booking - Create booking
echo "6. Public - Creating booking..."
curl -X POST "$BASE_URL/public/stylists/STYLIST_ID/book" \
  -H "Content-Type: application/json" \
  -d '{
    "bookingDate": "2024-12-26",
    "startTime": "14:00",
    "endTime": "15:00",
    "customerName": "John Doe",
    "customerPhone": "09123456789",
    "customerNotes": "First time visit"
  }'
echo -e "\n"

# Test 7: Get stylist bookings
echo "7. Getting stylist bookings..."
curl -X GET "$BASE_URL/stylists/bookings" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
echo -e "\n"

# Test 8: Update booking status
echo "8. Updating booking status..."
curl -X PUT "$BASE_URL/stylists/bookings/BOOKING_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "status": "confirmed",
    "stylistNotes": "Confirmed appointment"
  }'
echo -e "\n"

# Test 9: Get public booking info
echo "9. Getting public booking info..."
curl -X GET "$BASE_URL/public/bookings/BOOKING_ID"
echo -e "\n"

# Test 10: Cancel booking
echo "10. Cancelling booking..."
curl -X DELETE "$BASE_URL/stylists/bookings/BOOKING_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "reason": "Stylist unavailable"
  }'
echo -e "\n"

echo "Booking System Tests Completed!"
echo "Note: Replace YOUR_JWT_TOKEN, STYLIST_ID, and BOOKING_ID with actual values" 