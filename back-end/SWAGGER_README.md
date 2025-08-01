# Swagger/OpenAPI Documentation

## Overview

The Nobat Backend API is fully documented using Swagger/OpenAPI 3.0. The documentation provides interactive API testing, comprehensive endpoint descriptions, and detailed request/response schemas.

## Accessing the Documentation

### Swagger UI

- **URL**: `http://localhost:3000/api/docs`
- **Description**: Interactive API documentation with testing capabilities
- **Features**:
  - Try out endpoints directly from the browser
  - View request/response schemas
  - Authenticate with JWT tokens
  - Download OpenAPI specification

### OpenAPI JSON

- **URL**: `http://localhost:3000/api/docs-json`
- **Description**: Raw OpenAPI 3.0 specification in JSON format
- **Use Cases**:
  - Integration with other tools
  - Code generation
  - API client generation

## API Structure

### 🔐 Authentication (`auth` tag)

All authentication endpoints for user login, OTP verification, and token management.

**Endpoints:**

- `POST /api/v1/auth/send-otp` - Send OTP to phone number
- `POST /api/v1/auth/verify-otp` - Verify OTP code
- `POST /api/v1/auth/login` - User login (password or OTP)
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/me` - Get current user profile

### 👥 Users (`users` tag)

User profile management and account operations.

**Endpoints:**

- `POST /api/v1/users/complete-profile` - Complete user profile
- `POST /api/v1/users/set-password` - Set user password
- `GET /api/v1/users/profile` - Get user profile

### 💇‍♀️ Stylists (`stylists` tag)

Stylist profile management, availability settings, and booking management.

**Endpoints:**

- **Profile Management:**
  - `POST /api/v1/stylists/profile` - Create stylist profile
  - `GET /api/v1/stylists/profile` - Get own stylist profile
  - `PUT /api/v1/stylists/profile` - Update stylist profile
  - `DELETE /api/v1/stylists/profile` - Delete stylist profile
  - `POST /api/v1/stylists/profile/photo` - Upload profile photo
  - `POST /api/v1/stylists/profile/regenerate-link` - Regenerate booking link
  - `POST /api/v1/stylists/profile/submit` - Submit profile for approval

- **Availability Management:**
  - `POST /api/v1/stylists/availability` - Set availability schedule
  - `GET /api/v1/stylists/availability` - Get availability schedule
  - `GET /api/v1/stylists/availability/slots` - Get available slots for date
  - `POST /api/v1/stylists/exceptions` - Create availability exception
  - `GET /api/v1/stylists/exceptions` - Get availability exceptions
  - `DELETE /api/v1/stylists/exceptions/:id` - Delete availability exception

- **Booking Management:**
  - `GET /api/v1/stylists/bookings` - Get stylist bookings
  - `GET /api/v1/stylists/bookings/:id` - Get specific booking
  - `PUT /api/v1/stylists/bookings/:id` - Update booking
  - `DELETE /api/v1/stylists/bookings/:id` - Cancel booking

### 📅 Bookings (`bookings` tag)

Customer booking management and operations.

**Endpoints:**

- `POST /api/v1/bookings` - Create booking
- `GET /api/v1/bookings` - Get user bookings
- `GET /api/v1/bookings/:id` - Get booking details
- `PUT /api/v1/bookings/:id` - Update booking
- `DELETE /api/v1/bookings/:id` - Cancel booking
- `POST /api/v1/bookings/:id/reschedule` - Reschedule booking

### 🌐 Public (`public` tag)

Public endpoints for unauthenticated booking access.

**Endpoints:**

- `GET /api/v1/public/stylists/:stylistId/availability` - Get stylist availability
- `POST /api/v1/public/stylists/:stylistId/book` - Create public booking
- `GET /api/v1/public/bookings/:id` - Get public booking info

## Authentication

### JWT Bearer Token

Most endpoints require JWT authentication. To authenticate:

1. **Login** using `/api/v1/auth/login` endpoint
2. **Copy the access token** from the response
3. **Click "Authorize"** in Swagger UI
4. **Enter the token** in the format: `Bearer YOUR_TOKEN_HERE`
5. **Click "Authorize"** to save

### Public Endpoints

The following endpoints don't require authentication:

- `POST /api/v1/auth/send-otp`
- `POST /api/v1/auth/verify-otp`
- `POST /api/v1/auth/login`
- All endpoints under the `public` tag

## Data Models

### Common DTOs

#### SendOtpDto

```json
{
  "phoneNumber": "09123456789",
  "type": "phone_verification"
}
```

#### VerifyOtpDto

```json
{
  "phoneNumber": "09123456789",
  "code": "123456",
  "type": "phone_verification"
}
```

#### LoginDto

```json
{
  "phoneNumber": "09123456789",
  "password": "MyPassword123",
  "otpCode": "123456"
}
```

#### CreateBookingDto

```json
{
  "bookingDate": "2024-12-26",
  "startTime": "14:30",
  "endTime": "15:30",
  "customerNotes": "First time visit",
  "depositAmount": 50000,
  "totalAmount": 100000,
  "customerName": "سارا احمدی",
  "customerPhone": "09123456789"
}
```

#### SetAvailabilityDto

```json
{
  "mondayStart": "09:00",
  "mondayEnd": "17:00",
  "tuesdayStart": "09:00",
  "tuesdayEnd": "17:00",
  "slotDurationMinutes": 60,
  "bufferTimeMinutes": 15,
  "minimumNoticeMinutes": 120,
  "maxAdvanceDays": 90,
  "allowMultipleClients": true
}
```

## Response Examples

### Successful Login Response

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "phoneNumber": "09123456789",
    "firstName": "سارا",
    "lastName": "احمدی",
    "role": "user",
    "status": "active"
  }
}
```

### Booking Response

```json
{
  "id": "booking-uuid",
  "stylistId": "stylist-uuid",
  "customerId": "customer-uuid",
  "bookingDate": "2024-12-26",
  "startTime": "14:30",
  "endTime": "15:30",
  "status": "pending",
  "depositAmount": 50000,
  "totalAmount": 100000,
  "customerNotes": "First time visit",
  "createdAt": "2024-12-25T10:00:00Z"
}
```

### Error Response

```json
{
  "statusCode": 400,
  "message": "Invalid phone number format",
  "error": "Bad Request"
}
```

## Testing with Swagger UI

### Step-by-Step Testing

1. **Start the server**:

   ```bash
   npm run start:dev
   ```

2. **Open Swagger UI**:

   ```
   http://localhost:3000/api/docs
   ```

3. **Test Authentication**:
   - Expand the `auth` section
   - Try `POST /api/v1/auth/send-otp`
   - Use the example request body
   - Click "Try it out" and "Execute"

4. **Test Booking Flow**:
   - First authenticate using the login endpoint
   - Copy the access token
   - Click "Authorize" and enter the token
   - Test booking endpoints

### Interactive Features

- **Try it out**: Test endpoints directly from the UI
- **Request/Response**: View detailed schemas
- **Authentication**: JWT token management
- **Examples**: Pre-filled request bodies
- **Responses**: View all possible response codes

## Code Generation

### Generate Client Code

Using the OpenAPI specification, you can generate client code for various languages:

```bash
# Using OpenAPI Generator
openapi-generator-cli generate \
  -i http://localhost:3000/api/docs-json \
  -g typescript-axios \
  -o ./generated-client

# Using Swagger Codegen
swagger-codegen generate \
  -i http://localhost:3000/api/docs-json \
  -l typescript-axios \
  -o ./generated-client
```

### Supported Languages

- TypeScript/JavaScript
- Python
- Java
- C#
- Go
- PHP
- Ruby
- And many more...

## Configuration

### Swagger Setup

The Swagger configuration is in `src/main.ts`:

```typescript
const config = new DocumentBuilder()
  .setTitle('Nobat API')
  .setDescription('Nobat Backend API for booking management system')
  .setVersion('1.2.0')
  .addTag('auth', 'Authentication endpoints')
  .addTag('users', 'User management endpoints')
  .addTag('stylists', 'Stylist profile management endpoints')
  .addTag('bookings', 'Booking management endpoints')
  .addTag('public', 'Public booking endpoints')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Enter JWT token',
      in: 'header',
    },
    'JWT-auth',
  )
  .build();
```

### Environment Variables

No additional environment variables are required for Swagger. The documentation is automatically generated from the code.

## Best Practices

### Adding New Endpoints

1. **Add ApiTags decorator** to controllers
2. **Add ApiOperation decorator** to describe the endpoint
3. **Add ApiResponse decorators** for all possible responses
4. **Add ApiProperty decorators** to DTOs
5. **Add ApiBearerAuth** for protected endpoints
6. **Add ApiQuery** for query parameters

### Example

```typescript
@ApiTags('bookings')
@Controller('api/v1/bookings')
export class BookingsController {
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiResponse({ status: 201, description: 'Booking created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid booking data' })
  @ApiBearerAuth('JWT-auth')
  @Post()
  async createBooking(@Body() createBookingDto: CreateBookingDto) {
    // Implementation
  }
}
```

## Troubleshooting

### Common Issues

1. **Swagger UI not loading**:
   - Check if the server is running
   - Verify the URL: `http://localhost:3000/api/docs`
   - Check browser console for errors

2. **Authentication not working**:
   - Ensure token format: `Bearer YOUR_TOKEN`
   - Check if token is expired
   - Verify token is copied correctly

3. **Endpoints not showing**:
   - Check if controllers have `@ApiTags` decorator
   - Verify DTOs have `@ApiProperty` decorators
   - Restart the server after adding new decorators

4. **Validation errors**:
   - Check DTO validation decorators
   - Verify request body format
   - Check required fields

### Debug Mode

Enable debug logging to see detailed information:

```typescript
// In main.ts
const app = await NestFactory.create(AppModule, {
  logger: ['error', 'warn', 'debug', 'log', 'verbose'],
});
```

## Security Considerations

1. **Production Deployment**:
   - Disable Swagger UI in production
   - Use environment variables to control access
   - Implement rate limiting

2. **Sensitive Information**:
   - Don't include sensitive data in examples
   - Use placeholder values in documentation
   - Sanitize response examples

3. **Access Control**:
   - Limit Swagger UI access to authorized users
   - Implement IP whitelisting if needed
   - Use authentication for documentation access

---

**Note**: This Swagger documentation is automatically generated from the code and stays in sync with the actual API implementation. Any changes to the API will be reflected in the documentation.
