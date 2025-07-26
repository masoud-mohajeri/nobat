# Nobat Backend

A clean and forward-compatible user authentication and management system built with NestJS.

## Features

- **User Authentication**: Phone number-based authentication with OTP
- **JWT Tokens**: Access tokens (30min) and refresh tokens (30 days) with rotation
- **User Roles**: User, Provider, and Admin roles
- **Security**: Account locking after failed attempts, password complexity requirements
- **Rate Limiting**: Built-in rate limiting for API endpoints
- **Caching**: Redis-based caching
- **Database**: PostgreSQL with TypeORM
- **API Versioning**: Versioned API endpoints (v1)

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL
- Redis
- Yarn or npm

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd back-end
```

2. Install dependencies:

```bash
yarn install
```

3. Copy environment file:

```bash
cp env.example .env
```

4. Update the `.env` file with your configuration:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=nobat_db

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_ACCESS_TOKEN_EXPIRES_IN=30m
JWT_REFRESH_TOKEN_EXPIRES_IN=30d

# OTP Configuration
OTP_EXPIRES_IN=5m
OTP_LENGTH=6
OTP_MAX_ATTEMPTS=3

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=10

# App Configuration
NODE_ENV=development
PORT=3000
```

5. Create the database:

```sql
CREATE DATABASE nobat_db;
```

6. Start the development server:

```bash
yarn start:dev
```

## API Documentation

### Authentication Endpoints

#### Send OTP

```http
POST /api/v1/auth/send-otp
Content-Type: application/json

{
  "phoneNumber": "09123456789",
  "type": "phone_verification"
}
```

#### Verify OTP

```http
POST /api/v1/auth/verify-otp
Content-Type: application/json

{
  "phoneNumber": "09123456789",
  "code": "123456",
  "type": "phone_verification"
}
```

#### Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "phoneNumber": "09123456789",
  "password": "MyPassword123"
}
```

Or with OTP:

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "phoneNumber": "09123456789",
  "otpCode": "123456"
}
```

#### Refresh Token

```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

#### Logout

```http
POST /api/v1/auth/logout
Authorization: Bearer your-access-token
```

### User Management Endpoints

#### Complete Profile

```http
POST /api/v1/users/complete-profile
Authorization: Bearer your-access-token
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "birthDate": "1990-01-01",
  "role": "user"
}
```

#### Set Password

```http
POST /api/v1/users/set-password
Authorization: Bearer your-access-token
Content-Type: application/json

{
  "password": "MyPassword123"
}
```

#### Get Profile

```http
GET /api/v1/users/profile
Authorization: Bearer your-access-token
```

## User Flow

1. **Registration**:
   - User enters phone number
   - System sends OTP
   - User verifies OTP
   - Account created with PENDING status

2. **Profile Completion**:
   - User completes profile (required)
   - Account status changes to ACTIVE

3. **Password Setup** (Optional):
   - User can set password for future logins
   - Password must meet complexity requirements

4. **Login**:
   - User can login with password or OTP
   - Failed attempts lock account after 3 tries
   - Locked accounts require OTP to unlock

## Security Features

- **Password Requirements**: Minimum 8 characters, at least one uppercase and one lowercase letter
- **Account Locking**: Accounts locked after 3 failed password attempts
- **Token Rotation**: Refresh tokens rotated on each use
- **Rate Limiting**: API endpoints protected with rate limiting
- **Input Validation**: All inputs validated with class-validator

## Database Schema

### Users Table

- `id`: UUID (Primary Key)
- `phoneNumber`: String (Unique, 11 digits)
- `password`: String (Hashed, optional)
- `firstName`: String (optional)
- `lastName`: String (optional)
- `birthDate`: Date (optional)
- `role`: Enum (user, provider, admin)
- `status`: Enum (pending, active, locked, inactive)
- `failedLoginAttempts`: Number
- `lastFailedLoginAt`: Date
- `lastLoginAt`: Date
- `isPhoneVerified`: Boolean
- `phoneVerifiedAt`: Date
- `createdAt`: Date
- `updatedAt`: Date

### Refresh Tokens Table

- `id`: UUID (Primary Key)
- `token`: String
- `userId`: UUID (Foreign Key)
- `replacedByToken`: String (optional)
- `reasonRevoked`: String (optional)
- `isRevoked`: Boolean
- `expiresAt`: Date
- `createdAt`: Date

### OTPs Table

- `id`: UUID (Primary Key)
- `phoneNumber`: String (11 digits)
- `code`: String
- `type`: Enum (phone_verification, password_reset, account_unlock, login)
- `isUsed`: Boolean
- `attempts`: Number
- `expiresAt`: Date
- `createdAt`: Date

## Development

### Running Tests

```bash
yarn test
```

### Building for Production

```bash
yarn build
```

### Running in Production

```bash
yarn start:prod
```

## OTP Service Integration

The system includes a mock OTP service for development. To integrate with a real SMS service:

1. Create a new service implementing `OtpServiceInterface`
2. Update the provider in `auth.module.ts`
3. Configure your SMS service credentials in environment variables

Example SMS service integration:

```typescript
@Injectable()
export class TwilioOtpService implements OtpServiceInterface {
  async sendOtp(phoneNumber: string, code: string): Promise<boolean> {
    // Implement Twilio SMS sending logic
    return true;
  }
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.
