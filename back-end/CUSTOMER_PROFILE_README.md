# Customer Profile System - Implementation Guide

## Overview

The Customer Profile System has been successfully implemented as part of the Nobat Backend. This system provides complete customer profile management functionality while leveraging the existing User entity structure.

## Architecture

### Design Decisions

- **No Separate Entity**: Customer profiles use the existing `User` entity with role-based validation
- **Role-Based Access**: Different endpoints for customers vs stylists
- **Security First**: Phone number changes require OTP re-verification
- **Integration Ready**: Designed to work seamlessly with the upcoming booking system

### Key Components

1. **CustomerRoleGuard**: Protects customer-only endpoints
2. **Customer DTOs**: Input validation for customer operations
3. **Customer Controller**: API endpoints for customer profile management
4. **Enhanced User Service**: Customer-specific business logic

## API Endpoints

### Customer Profile Management

#### Create Customer Profile

```http
POST /api/v1/customers/profile
Authorization: Bearer <customer-jwt-token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "birthDate": "1990-01-01"
}
```

#### Get Customer Profile

```http
GET /api/v1/customers/profile
Authorization: Bearer <customer-jwt-token>
```

#### Update Customer Profile

```http
PUT /api/v1/customers/profile
Authorization: Bearer <customer-jwt-token>
Content-Type: application/json

{
  "firstName": "John Updated",
  "lastName": "Doe Updated"
}
```

#### Change Phone Number

```http
POST /api/v1/customers/profile/change-phone
Authorization: Bearer <customer-jwt-token>
Content-Type: application/json

{
  "newPhoneNumber": "09123456789"
}
```

### Stylist Access to Customer Information

#### Get Customer Info (Stylists Only)

```http
GET /api/v1/customers/{customerId}/info
Authorization: Bearer <stylist-jwt-token>
```

**Response:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "09123456789"
}
```

## Security Features

### Role-Based Access Control

- **CustomerRoleGuard**: Ensures only customers (USER role) and admins can access customer endpoints
- **StylistRoleGuard**: Allows stylists to access limited customer information
- **JWT Authentication**: All endpoints require valid JWT tokens

### Phone Number Security

- **Uniqueness Validation**: Prevents duplicate phone numbers
- **OTP Re-verification**: Phone number changes require new OTP verification
- **Status Reset**: Phone verification status is reset on change

### Input Validation

- **DTO Validation**: All inputs validated using class-validator
- **Phone Number Format**: Enforces 11-digit format (09XXXXXXXXX)
- **Date Validation**: Birth date validation with proper format

## Database Design

### User Entity Fields Used

- `firstName`: Customer first name
- `lastName`: Customer last name
- `birthDate`: Customer birth date (optional)
- `phoneNumber`: Contact phone number
- `role`: Set to 'user' for customers
- `status`: Tracks profile completion status
- `isPhoneVerified`: Phone verification status

### No Additional Fields Required

The implementation leverages existing User entity fields, eliminating the need for:

- Separate CustomerProfile entity
- Additional database migrations
- Complex entity relationships

## Business Logic

### Profile Creation Flow

1. User registers with phone number (existing auth flow)
2. User completes basic profile (existing flow)
3. User creates customer profile (new customer-specific flow)
4. Profile status updated to ACTIVE

### Phone Number Change Flow

1. Customer requests phone number change
2. System validates new phone number uniqueness
3. Phone number updated in database
4. Verification status reset to false
5. Customer must verify new phone with OTP

### Stylist Access Flow

1. Stylist requests customer information
2. System validates stylist permissions
3. Returns only name and phone number
4. No sensitive information exposed

## Error Handling

### Common Error Responses

```json
{
  "statusCode": 400,
  "message": "Only customers can create customer profiles",
  "error": "Bad Request"
}
```

```json
{
  "statusCode": 400,
  "message": "Phone number already in use",
  "error": "Bad Request"
}
```

```json
{
  "statusCode": 400,
  "message": "Customer profile already exists",
  "error": "Bad Request"
}
```

## Testing

### Manual Testing

Use the provided test script:

```bash
./scripts/test-customer-api.sh
```

### Test Scenarios

1. **Customer Profile Creation**: Verify profile creation with valid data
2. **Profile Updates**: Test partial and full profile updates
3. **Phone Number Change**: Verify phone change with OTP requirement
4. **Stylist Access**: Test stylist access to customer information
5. **Role Validation**: Ensure proper role-based access control
6. **Error Handling**: Test various error scenarios

## Integration Points

### Booking System Integration

The customer profile system is designed to integrate seamlessly with the upcoming booking system:

- Customer information available for booking context
- No additional data fetching required
- Consistent user identification across systems

### Authentication Integration

- Phone number changes affect authentication status
- OTP verification required for phone changes
- JWT tokens remain valid during profile updates

## Future Enhancements

### Potential Additions

1. **Customer Preferences**: Add preference fields for booking customization
2. **Profile Picture**: Add avatar/photo upload capability
3. **Address Information**: Add location data for service delivery
4. **Emergency Contact**: Add emergency contact information
5. **Booking History**: Link to customer booking history

### Performance Optimizations

1. **Caching**: Cache frequently accessed customer data
2. **Indexing**: Add database indexes for customer queries
3. **Pagination**: Implement pagination for customer lists

## Deployment Notes

### Database Setup

No additional database setup required. The system uses existing User entity fields.

### Environment Variables

No new environment variables required. Uses existing JWT and database configuration.

### Dependencies

No additional dependencies required. Uses existing NestJS and TypeORM setup.

## Support

For questions or issues with the customer profile system:

1. Check the API documentation above
2. Review the test script for usage examples
3. Examine the error handling section for common issues
4. Refer to the PROJECT_FEATURES.md for implementation details

---

**Implementation Status**: ✅ Complete  
**Last Updated**: December 2024  
**Version**: 1.0.0
