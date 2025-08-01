# Application Flows Documentation

This document outlines all the flows in the Nobat booking system application for integration testing purposes.

## Table of Contents

1. [Registration Flows](#registration-flows)
2. [Booking Flows](#booking-flows)
3. [User Management Flows](#user-management-flows)
4. [Stylist Management Flows](#stylist-management-flows)

---

## Registration Flows

### 1. Phone Number Registration Flow

**Flow Description**: New user registration starts with phone number verification via OTP.

**Steps**:

1. **Send OTP** - `POST /api/v1/auth/send-otp`
   - **Request Body**:
     ```json
     {
       "phoneNumber": "09123456789",
       "type": "phone_verification"
     }
     ```
   - **Response**: `{ "message": "OTP sent successfully" }`

2. **Verify OTP** - `POST /api/v1/auth/verify-otp`
   - **Request Body**:
     ```json
     {
       "phoneNumber": "09123456789",
       "code": "123456",
       "type": "phone_verification"
     }
     ```
   - **Response**: `{ "message": "Phone number verified successfully", "user": {...} }`

**User State After Flow**:

- User created with `phoneNumber`, `isPhoneVerified: true`, `phoneVerifiedAt: timestamp`
- User status: `PENDING`
- User role: `USER`

### 2. Complete Profile Flow

**Flow Description**: After phone verification, user completes their profile information.

**Steps**:

1. **Complete Profile** - `POST /api/v1/users/complete-profile`
   - **Headers**: `Authorization: Bearer <access_token>`
   - **Request Body**:
     ```json
     {
       "firstName": "John",
       "lastName": "Doe",
       "birthDate": "1990-01-01",
       "role": "provider"
     }
     ```
   - **Response**: `{ "message": "Profile completed successfully" }`

**User State After Flow**:

- User status: `ACTIVE`
- User role: Updated to specified role (`USER`, `PROVIDER`, or `ADMIN`)

### 3. Set Password Flow

**Flow Description**: User sets a password for future logins.

**Steps**:

1. **Set Password** - `POST /api/v1/users/set-password`
   - **Headers**: `Authorization: Bearer <access_token>`
   - **Request Body**:
     ```json
     {
       "password": "MyPassword123"
     }
     ```
   - **Response**: `{ "message": "Password set successfully" }`

**User State After Flow**:

- User can now login with password

### 4. Login Flow

**Flow Description**: User authentication via password or OTP.

**Steps**:

1. **Login with Password** - `POST /api/v1/auth/login`
   - **Request Body**:
     ```json
     {
       "phoneNumber": "09123456789",
       "password": "MyPassword123"
     }
     ```
   - **Response**:
     ```json
     {
       "accessToken": "jwt_token",
       "refreshToken": "refresh_token",
       "user": {...}
     }
     ```

**Alternative Login with OTP**:

1. **Send Login OTP** - `POST /api/v1/auth/send-otp`
   - **Request Body**:
     ```json
     {
       "phoneNumber": "09123456789",
       "type": "login"
     }
     ```

2. **Login with OTP** - `POST /api/v1/auth/login`
   - **Request Body**:
     ```json
     {
       "phoneNumber": "09123456789",
       "otpCode": "123456"
     }
     ```

### 5. Account Unlock Flow

**Flow Description**: Unlock account after multiple failed login attempts.

**Steps**:

1. **Send Unlock OTP** - `POST /api/v1/auth/send-otp`
   - **Request Body**:
     ```json
     {
       "phoneNumber": "09123456789",
       "type": "account_unlock"
     }
     ```

2. **Verify Unlock OTP** - `POST /api/v1/auth/verify-otp`
   - **Request Body**:
     ```json
     {
       "phoneNumber": "09123456789",
       "code": "123456",
       "type": "account_unlock"
     }
     ```

**User State After Flow**:

- User status: `ACTIVE`
- `failedLoginAttempts`: 0

---

## Booking Flows

### 1. Stylist Profile Creation Flow

**Flow Description**: Provider creates their stylist profile for accepting bookings.

**Steps**:

1. **Create Stylist Profile** - `POST /api/v1/stylists/profile`
   - **Headers**: `Authorization: Bearer <access_token>`
   - **Request Body**:
     ```json
     {
       "salonAddress": "123 Main St, Tehran",
       "latitude": 35.6892,
       "longitude": 51.389,
       "instagramUsername": "stylist_john"
     }
     ```
   - **Response**: `{ "message": "Profile created successfully" }`

2. **Submit for Approval** - `POST /api/v1/stylists/profile/submit`
   - **Headers**: `Authorization: Bearer <access_token>`
   - **Response**: `{ "message": "Profile submitted for approval" }`

**Stylist State After Flow**:

- Profile status: `PENDING_APPROVAL`

### 2. Admin Approval Flow

**Flow Description**: Admin approves or rejects stylist profiles.

**Steps**:

1. **Get Pending Profiles** - `GET /api/v1/stylists/admin/profiles/status/pending_approval`
   - **Headers**: `Authorization: Bearer <admin_token>`

2. **Approve Profile** - `POST /api/v1/stylists/admin/profiles/{stylistId}/approve`
   - **Headers**: `Authorization: Bearer <admin_token>`
   - **Request Body**:
     ```json
     {
       "approved": true,
       "notes": "Profile looks good"
     }
     ```

**Stylist State After Flow**:

- Profile status: `APPROVED` or `REJECTED`

### 3. Stylist Availability Setup Flow

**Flow Description**: Approved stylist sets their availability schedule.

**Steps**:

1. **Set Availability** - `POST /api/v1/stylists/availability`
   - **Headers**: `Authorization: Bearer <access_token>`
   - **Request Body**:
     ```json
     {
       "schedule": [
         {
           "dayOfWeek": 1,
           "startTime": "09:00",
           "endTime": "17:00",
           "isAvailable": true
         }
       ]
     }
     ```

2. **Get Available Slots** - `GET /api/v1/stylists/availability/slots?date=2024-12-26`
   - **Headers**: `Authorization: Bearer <access_token>`

### 4. Customer Profile Creation Flow

**Flow Description**: Customer creates their profile for booking services.

**Steps**:

1. **Create Customer Profile** - `POST /api/v1/customers/profile`
   - **Headers**: `Authorization: Bearer <access_token>`
   - **Request Body**:
     ```json
     {
       "firstName": "Jane",
       "lastName": "Smith",
       "birthDate": "1995-05-15"
     }
     ```

### 5. Public Booking Flow

**Flow Description**: Public booking without authentication.

**Steps**:

1. **Get Stylist Availability** - `GET /api/v1/public/stylists/{stylistId}/availability?date=2024-12-26`

2. **Create Public Booking** - `POST /api/v1/public/stylists/{stylistId}/book`
   - **Request Body**:
     ```json
     {
       "customerName": "Jane Smith",
       "customerPhone": "09123456789",
       "date": "2024-12-26",
       "startTime": "10:00",
       "endTime": "11:00",
       "serviceType": "haircut"
     }
     ```

3. **Get Booking Info** - `GET /api/v1/public/bookings/{bookingId}`

### 6. Authenticated Booking Flow

**Flow Description**: Authenticated customer creates booking.

**Steps**:

1. **Create Booking** - `POST /api/v1/bookings?stylistId={stylistId}`
   - **Headers**: `Authorization: Bearer <access_token>`
   - **Request Body**:
     ```json
     {
       "date": "2024-12-26",
       "startTime": "10:00",
       "endTime": "11:00",
       "serviceType": "haircut",
       "notes": "Short haircut please"
     }
     ```

2. **Get My Bookings** - `GET /api/v1/bookings?status=pending`

3. **Get Specific Booking** - `GET /api/v1/bookings/{bookingId}`

### 7. Booking Management Flow

**Flow Description**: Managing existing bookings.

**Steps**:

1. **Update Booking** - `PUT /api/v1/bookings/{bookingId}`
   - **Headers**: `Authorization: Bearer <access_token>`
   - **Request Body**:
     ```json
     {
       "notes": "Updated notes"
     }
     ```

2. **Reschedule Booking** - `POST /api/v1/bookings/{bookingId}/reschedule`
   - **Headers**: `Authorization: Bearer <access_token>`
   - **Request Body**:
     ```json
     {
       "newDate": "2024-12-27",
       "newStartTime": "14:00",
       "newEndTime": "15:00"
     }
     ```

3. **Cancel Booking** - `DELETE /api/v1/bookings/{bookingId}`
   - **Headers**: `Authorization: Bearer <access_token>`
   - **Request Body**:
     ```json
     {
       "reason": "Emergency came up"
     }
     ```

### 8. Stylist Booking Management Flow

**Flow Description**: Stylist manages their bookings.

**Steps**:

1. **Get Stylist Bookings** - `GET /api/v1/stylists/bookings?status=pending`
   - **Headers**: `Authorization: Bearer <access_token>`

2. **Update Stylist Booking** - `PUT /api/v1/stylists/bookings/{bookingId}`
   - **Headers**: `Authorization: Bearer <access_token>`

3. **Cancel Stylist Booking** - `DELETE /api/v1/stylists/bookings/{bookingId}`
   - **Headers**: `Authorization: Bearer <access_token>`

### 9. Availability Exception Flow

**Flow Description**: Stylist creates exceptions to their regular schedule.

**Steps**:

1. **Create Exception** - `POST /api/v1/stylists/exceptions`
   - **Headers**: `Authorization: Bearer <access_token>`
   - **Request Body**:
     ```json
     {
       "date": "2024-12-25",
       "startTime": "09:00",
       "endTime": "17:00",
       "isAvailable": false,
       "reason": "Christmas holiday"
     }
     ```

2. **Get Exceptions** - `GET /api/v1/stylists/exceptions?startDate=2024-12-01&endDate=2024-12-31`

3. **Delete Exception** - `DELETE /api/v1/stylists/exceptions/{exceptionId}`

---

## User Management Flows

### 1. Profile Management Flow

**Steps**:

1. **Get Profile** - `GET /api/v1/users/profile`
2. **Update Customer Profile** - `PUT /api/v1/customers/profile`
3. **Change Phone** - `POST /api/v1/customers/profile/change-phone`

### 2. Token Management Flow

**Steps**:

1. **Refresh Token** - `POST /api/v1/auth/refresh`
2. **Logout** - `POST /api/v1/auth/logout`

---

## Stylist Management Flows

### 1. Profile Management Flow

**Steps**:

1. **Get Own Profile** - `GET /api/v1/stylists/profile`
2. **Update Profile** - `PUT /api/v1/stylists/profile`
3. **Delete Profile** - `DELETE /api/v1/stylists/profile`

### 2. Admin Management Flow

**Steps**:

1. **Get All Profiles** - `GET /api/v1/stylists/admin/profiles`
2. **Suspend Profile** - `POST /api/v1/stylists/admin/profiles/{stylistId}/suspend`

### 3. Booking Link Management Flow

**Steps**:

1. **Regenerate Booking Link** - `POST /api/v1/stylists/profile/regenerate-link`

---

## Booking Status Flow

The booking goes through the following statuses:

1. **PENDING** - Initial status when booking is created
2. **CONFIRMED** - Stylist confirms the booking
3. **COMPLETED** - Service has been provided
4. **CANCELLED** - Booking was cancelled
5. **RESCHEDULED** - Booking was rescheduled

---

## User Status Flow

The user goes through the following statuses:

1. **PENDING** - Phone verified but profile not completed
2. **ACTIVE** - Profile completed and account active
3. **LOCKED** - Account locked due to failed login attempts
4. **INACTIVE** - Account deactivated

---

## Stylist Profile Status Flow

The stylist profile goes through the following statuses:

1. **DRAFT** - Profile created but not submitted
2. **PENDING_APPROVAL** - Submitted for admin approval
3. **APPROVED** - Approved by admin
4. **REJECTED** - Rejected by admin
5. **SUSPENDED** - Suspended by admin

---

## Integration Test Scenarios

### Registration Test Scenarios

1. Complete phone registration flow
2. Complete profile setup flow
3. Password setup flow
4. Login with password flow
5. Login with OTP flow
6. Account unlock flow
7. Token refresh flow

### Booking Test Scenarios

1. Stylist profile creation and approval flow
2. Availability setup flow
3. Customer profile creation flow
4. Public booking flow
5. Authenticated booking flow
6. Booking management flow (update, reschedule, cancel)
7. Stylist booking management flow
8. Availability exception flow

### Error Test Scenarios

1. Invalid OTP attempts
2. Failed login attempts leading to account lock
3. Booking conflicts
4. Unavailable time slots
5. Invalid profile data
6. Unauthorized access attempts
