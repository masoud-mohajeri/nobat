#!/bin/bash

# Test SMS Service for Booking Notifications
# Make sure the server is running before executing this script

BASE_URL="http://localhost:3000/api/v1"
echo "Testing SMS Service for Booking Notifications"
echo "============================================="

# Test 1: Create a booking to trigger SMS notifications
echo "1. Creating a booking to test SMS notifications..."
curl -X POST "$BASE_URL/public/stylists/STYLIST_ID/book" \
  -H "Content-Type: application/json" \
  -d '{
    "bookingDate": "2024-12-26",
    "startTime": "14:00",
    "endTime": "15:00",
    "customerName": "سارا احمدی",
    "customerPhone": "09123456789",
    "customerNotes": "اولین مراجعه"
  }'
echo -e "\n"

# Test 2: Update booking status to confirmed
echo "2. Confirming booking to test stylist notification..."
curl -X PUT "$BASE_URL/stylists/bookings/BOOKING_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "status": "confirmed",
    "stylistNotes": "تایید شد"
  }'
echo -e "\n"

# Test 3: Cancel booking to test cancellation SMS
echo "3. Cancelling booking to test cancellation SMS..."
curl -X DELETE "$BASE_URL/stylists/bookings/BOOKING_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "reason": "آرایشگر در دسترس نیست"
  }'
echo -e "\n"

# Test 4: Reschedule booking to test reschedule SMS
echo "4. Rescheduling booking to test reschedule SMS..."
curl -X POST "$BASE_URL/bookings/BOOKING_ID/reschedule" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "newDate": "2024-12-27",
    "newStartTime": "15:00",
    "newEndTime": "16:00"
  }'
echo -e "\n"

# Test 5: Manual reminder test (if reminder service is exposed)
echo "5. Testing manual reminder (if endpoint exists)..."
curl -X POST "$BASE_URL/stylists/bookings/BOOKING_ID/remind" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
echo -e "\n"

echo "SMS Service Tests Completed!"
echo "Check the server logs for SMS notification messages."
echo "Note: Replace YOUR_JWT_TOKEN, STYLIST_ID, and BOOKING_ID with actual values" 